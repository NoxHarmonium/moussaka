(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var moment = require('moment');
  var passport = require('passport');
  var testData = require('../tests/testData.js');
  var config = require('../include/config.js');
  var _ = require('lodash');
  var utils = require('../include/utils.js');

  // Public functions
  module.exports = {

    //
    // Parameters
    //

    pProjectId: function (req, res, next, projectId) {
      if (!utils.exists(projectId)) {
        return next();
      }

      // Check for valid object ID
      // Thanks: http://stackoverflow.com/a/14942113/1153203
      if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
      }

      var query = Project.findOne({
        '_id': projectId
      });

      query.exec(function (err, project) {
        if (err) {
          return next(err);
        }
        req.project = project;
        next();
      });

    },

    //
    // API Methods
    //

    listProjects: function (req, res, next) {
      var minRecord = req.query.minRecord;
      var maxRecord = req.query.maxRecord;

      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      var getProjects = Project.find({
        $or: [{
          'admins': req.user._id
        }, {
          'users': req.user._id
        }]
      });

      // Project correct fields
      getProjects.select('_id name version admins users description');

      getProjects.sort({
        'name': 'asc'
      });

      var maxRecordCount = config.max_records_per_query;

      // Pagination
      if (minRecord) {
        getProjects.skip(minRecord);
      }
      if (minRecord && maxRecord) {
        if (maxRecord < minRecord) {
          return res.send(400, {
            detail: 'Invalid pagination range'
          });
        }

        maxRecordCount = Math.min(
          maxRecordCount, (maxRecord - minRecord) + 1
        );
      }

      getProjects.limit(maxRecordCount);

      getProjects.execQ()
        .then(function (projects) {
          res.send(200, projects);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    addProject: function (req, res, next) {
      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      var project = req.project;
      if (project) {
        return res.send(409, {
          detail: 'Project already exists'
        });
      }

      var newProject = new Project({
        name: req.body.name,
        description: req.body.description,
        admins: [req.user._id]
      });

      newProject.saveQ()
        .then(function (data) {
          res.send(201, {
            '_id': data._id
          });
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    getProject: function (req, res, next) {
      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      var project = req.project;
      if (project) {
        return res.send({
          _id: project._id,
          name: project.name,
          version: project.version,
          admins: project.admins,
          users: project.users,
          description: project.description
        });
      } else {
        return res.send(404, {
          detail: 'Project doesn\'t exist'
        });
      }
    },

    addProjectUser: function (req, res, next) {
      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.send(404, {
          detail: 'Specified project doesn\'t exist'
        });
      }

      if (!selectedUser) {
        return res.send(404, {
          detail: 'Specified user doesn\'t exist'
        });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.send(401, {
          detail: 'Only admins can change a project user list'
        });
      }

      if (_.contains(project.admins, selectedUser._id)) {
        return res.send(409, {
          detail: 'Specified user is already an admin of this project.'
        });
      }

      if (_.contains(project.users, selectedUser._id)) {
        return res.send(409, {
          detail: 'Specified user already added to project users'
        });
      }

      // Add user to users array
      project.users.push(selectedUser._id);

      project.saveQ()
        .then(function () {
          res.send(200);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    removeProjectUser: function (req, res, next) {
      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.send(404, {
          detail: 'Specified project doesn\'t exist'
        });
      }

      if (!selectedUser) {
        return res.send(404, {
          detail: 'Specified user doesn\'t exist'
        });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.send(401, {
          detail: 'Only admins can change a project user list'
        });
      }

      if (!_.contains(req.project.users, selectedUser._id)) {
        return res.send(404, {
          detail: 'User is not a member of this project'
        });
      }

      // Remove user from users array
      _.pull(project.users, selectedUser._id);
      project.markModified('users');

      project.saveQ()
        .then(function () {
          res.send(200);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    addProjectAdmin: function (req, res, next) {
      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.send(404, {
          detail: 'Specified project doesn\'t exist'
        });
      }

      if (!selectedUser) {
        return res.send(404, {
          detail: 'Specified user doesn\'t exist'
        });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.send(401, {
          detail: 'Only admins can change a project admin list'
        });
      }

      if (_.contains(project.users, selectedUser._id)) {
        // Promote user to admin
        _.pull(project.users, selectedUser._id);
        project.markModified('users');
      }

      if (_.contains(project.admins, selectedUser._id)) {
        return res.send(409, {
          detail: 'Specified user already added to project admins'
        });
      }

      // Add user to admins array
      project.admins.push(selectedUser._id);

      project.saveQ()
        .then(function () {
          res.send(200);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    removeProjectAdmin: function (req, res, next) {
      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      var project = req.project;
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;

      if (!project) {
        return res.send(404, {
          detail: 'Specified project doesn\'t exist'
        });
      }

      if (!selectedUser) {
        return res.send(404, {
          detail: 'Specified user doesn\'t exist'
        });
      }

      if (project.admins.length === 1) {
        return res.send(401, {
          detail: 'A project must have at least one admin'
        });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.send(401, {
          detail: 'Only admins can change a project user list'
        });
      }

      if (!_.contains(req.project.admins, selectedUser._id)) {
        return res.send(404, {
          detail: 'User is not an admin of this project'
        });
      }

      // Remove user from admins array
      _.pull(project.admins, selectedUser._id);
      project.markModified('admins');

      project.saveQ()
        .then(function () {
          res.send(200);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    removeProject: function (req, res, next) {
      var project = req.project;
      var loggedInUser = req.user;

      if (!loggedInUser) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      if (!project) {
        return res.send(404, {
          detail: 'Specified project doesn\'t exist'
        });
      }

      if (!_.contains(project.admins, loggedInUser._id)) {
        return res.send(401, {
          detail: 'Only admins can delete a project'
        });
      }

      project.removeQ()
        .then(function () {
          res.send(200);
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
        return res.send(200);
      });
    }

  };

})(require, module);
