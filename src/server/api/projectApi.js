(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var moment = require('moment');
  var passport = require('passport');
  var testData = require('../../../tests/testData.js');
  var config = require('../../shared/config.js');
  var _ = require('lodash');
  var utils = require('../../shared/utils.js');
  var extend = require('extend');
  var queryFilters = require('../include/queryFilters.js');

  // Public functions
  module.exports = {

    //
    // Parameters
    //

    pProjectId: function (req, res, next, projectId) {
      var loggedInUser = req.user;

      if (!loggedInUser) {
        return res.status(401)
          .send({
            detail: 'Not logged in'
          });
      }

      if (!utils.exists(projectId)) {
        return next();
      }

      // Check for valid object ID
      // Thanks: http://stackoverflow.com/a/14942113/1153203
      if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
      }

      var findProject = Project.findOne({
        '_id': projectId
      });

      findProject.execQ()
        .then(function (project) {
          req.project = project;
          if (project && !(_.contains(project.admins, loggedInUser._id) ||
            _.contains(project.users, loggedInUser._id))) {
            // Need to be a user of the project to see it
            res.status(401)
              .send({
                detail: 'You do not have permission to access ' +
                  'this project.'
              });
          } else {
            next();
          }
        })
        .catch(function (err) {
          next(err);
        })
        .done();

    },

    //
    // API Methods
    //

    listProjects: function (req, res, next) {
      if (!req.user) {
        return res.status(401)
          .send({
            detail: 'Not logged in'
          });
      }

      var query = Project.find({
        $or: [{
          'admins': req.user._id
        }, {
          'users': req.user._id
        }]
      });

      // Project correct fields
      query.select('_id name version admins users description');

      try {
        queryFilters.paginate(req.query, query);
        queryFilters.sort(req.query, query, {
          'name': 'asc'
        });
      } catch (ex) {
        return res.status(400)
          .send(ex.message);
      }

      query.execQ()
        .then(function (projects) {
          res.status(200)
            .send(projects);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    addProject: function (req, res, next) {
      var name = req.body.name;

      if (!req.user) {
        return res.status(401)
          .send({
            detail: 'Not logged in'
          });
      }

      if (!utils.isNonEmptyString(name)) {
        return res.status(409)
          .send({
            detail: 'A name field is required'
          });
      }

      var newProject = new Project({
        name: req.body.name,
        description: req.body.description,
        admins: [req.user._id]
      });

      newProject.saveQ()
        .then(function (data) {
          res.status(201)
            .send({
              '_id': data._id,
              admins: data.admins
            });
        })
        .catch(function (err) {
          // Duplicate check
          if (err.code === 11000) {
            res.status(409)
              .send({
                'detail': 'A project with this name already exists.'
              });
          } else {
            next(err);
          }
        })
        .done();
    },

    updateProject: function (req, res, next) {
      var project = req.project;
      var loggedInUser = req.user;
      if (project) {
        var query = {
          '_id': project._id
        };

        if (!_.contains(project.admins, loggedInUser._id)) {
          return res.status(401).send({
            detail: 'Only project admins can edit projects.'
          });
        }

        if (req.body.name) {
          project.name = req.body.name;
        }
        if (req.body.description) {
          project.description = req.body.description;
        }

        project.saveQ()
          .then(function () {
            res.status(200).send();
          })
          .catch(function (err) {
            next(err);
          })
          .done();

      } else {
        return res.status(404)
          .send({
            detail: 'Project doesn\'t exist'
          });
      }

    },

    getProject: function (req, res, next) {
      var project = req.project;
      if (project) {
        return res.status(200)
          .send({
            _id: project._id,
            name: project.name,
            version: project.version,
            admins: project.admins,
            users: project.users,
            description: project.description
          });
      } else {
        return res.status(404)
          .send({
            detail: 'Project doesn\'t exist'
          });
      }
    },

    addProjectUser: function (req, res, next) {
      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Specified project doesn\'t exist'
          });
      }

      if (!selectedUser) {
        return res.status(404)
          .send({
            detail: 'Specified user doesn\'t exist'
          });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.status(401)
          .send({
            detail: 'Only admins can change a project user list'
          });
      }

      if (_.contains(project.admins, selectedUser._id)) {
        return res.status(409)
          .send({
            detail: 'Specified user is already an admin of this project.'
          });
      }

      if (_.contains(project.users, selectedUser._id)) {
        return res.status(409)
          .send({
            detail: 'Specified user already added to project users'
          });
      }

      // Add user to users array
      project.users.push(selectedUser._id);

      project.saveQ()
        .then(function () {
          res.status(200).send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    removeProjectUser: function (req, res, next) {
      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Specified project doesn\'t exist'
          });
      }

      if (!selectedUser) {
        return res.status(404)
          .send({
            detail: 'Specified user doesn\'t exist'
          });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.status(401)
          .send({
            detail: 'Only admins can change a project user list'
          });
      }

      if (!_.contains(req.project.users, selectedUser._id)) {
        return res.status(404)
          .send({
            detail: 'User is not a member of this project'
          });
      }

      // Remove user from users array
      _.pull(project.users, selectedUser._id);
      project.markModified('users');

      project.saveQ()
        .then(function () {
          res.status(200).send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    addProjectAdmin: function (req, res, next) {
      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Specified project doesn\'t exist'
          });
      }

      if (!selectedUser) {
        return res.status(404)
          .send({
            detail: 'Specified user doesn\'t exist'
          });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.status(401)
          .send({
            detail: 'Only admins can change a project admin list'
          });
      }

      if (_.contains(project.users, selectedUser._id)) {
        // Promote user to admin
        _.pull(project.users, selectedUser._id);
        project.markModified('users');
      }

      if (_.contains(project.admins, selectedUser._id)) {
        return res.status(409)
          .send({
            detail: 'Specified user already added to project admins'
          });
      }

      // Add user to admins array
      project.admins.push(selectedUser._id);

      project.saveQ()
        .then(function () {
          res.status(200).send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    removeProjectAdmin: function (req, res, next) {
      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Specified project doesn\'t exist'
          });
      }

      if (!selectedUser) {
        return res.status(404)
          .send({
            detail: 'Specified user doesn\'t exist'
          });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.status(401)
          .send({
            detail: 'Only admins can change a project user list'
          });
      }

      if (!_.contains(req.project.admins, selectedUser._id)) {
        return res.status(404)
          .send({
            detail: 'User is not an admin of this project'
          });
      }

      if (project.admins.length === 1) {
        return res.status(401)
          .send({
            detail: 'A project must have at least one admin'
          });
      }

      // Remove user from admins array
      _.pull(project.admins, selectedUser._id);
      project.markModified('admins');

      project.saveQ()
        .then(function () {
          res.status(200).send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    removeProject: function (req, res, next) {
      var project = req.project;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Specified project doesn\'t exist'
          });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.status(401)
          .send({
            detail: 'Only admins can delete a project'
          });
      }

      project.removeQ()
        .then(function () {
          res.status(200).send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    //
    // Test extensions
    //

    resetTests: function (req, res, next) {
      var testProjects = testData.getTestProjects(),
        projects = [],
        i;

      for (i = 0; i < testProjects.length; i++) {
        projects.push(testProjects[i].name);
      }

      var query = Project.find({
        $or: [{
          'name': {
            $in: projects
          }
        }, {
          'name': /TEST_DATA_DELETE*/
        }]
      });
      query.exec(function (err, projects) {
        if (err) {
          return next(err);
        }
        for (i = 0; i < projects.length; i++) {
          projects[i].remove();
        }
        return res.status(200).send();
      });
    }

  };

})(require, module);
