(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var moment = require('moment');
  var passport = require('passport');
  var testData = require('../tests/testData.js');
  var config = require('../include/config.js');
  var _ = require('lodash');

  // Public functions
  module.exports = {

    listProjects: function (req, res, next) {
      var minRecord = req.query.minRecord;
      var maxRecord = req.query.maxRecord;

      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      // TODO: Pagination and limits and security 
      // (only see what proj you are part of)
      var query = Project.find({
        $or: [{
          'admins': req.user._id
        }, {
          'users': req.user._id
        }]
      });

      // Project correct fields
      query.select('_id name version admins users description');

      query.sort({
        'name': 'asc'
      });

      var maxRecordCount = config.max_records_per_query;
      // Pagination
      if (minRecord) {
        query.skip(minRecord);
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

      query.limit(maxRecordCount);

      query.exec(function (err, projects) {
        if (err) {
          return next(err);
        }
        res.send(200, projects);
      });
    },

    pProjectId: function (req, res, next, projectId) {
      // TODO: Universal undefined check fn?
      if (!projectId || projectId === 'undefined') {
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

      var p = new Project({
        name: req.body.name,
        description: req.body.description,
        admins: [req.user._id]
      });

      p.save(function (err, data) {
        if (err) {
          return next(err);
        }
        res.send(200, {
          '_id': data._id
        });
      });
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

      project.save(function (err) {
        if (err) {
          return next(err);
        }
        res.send(200);
      });

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

      project.save(function (err) {
        if (err) {
          return next(err);
        }
        res.send(200);
      });

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

      project.save(function (err) {
        if (err) {
          return next(err);
        }
        res.send(200);
      });

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

      project.save(function (err) {
        if (err) {
          return next(err);
        }
        res.send(200);
      });

    },

    // TODO: Remove project

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
