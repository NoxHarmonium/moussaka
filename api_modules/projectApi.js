(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var moment = require('moment');
  var passport = require('passport');
  var testData = require('../tests/testData.js');
  var config = require('../include/config.js');

  // Private functions
  var _validateProject = function validateProjects(projects) {
    return projects && Array.isArray(projects) && projects.length === 1;
  };

  // Public functions
  module.exports = {

    listProjects: function (req, res, next) {
      Project.aggregate({
          $group: {
            '_id': {
              name: '$name',
              users: '$users',
              description: '$description'
            },
            'version': {
              $max: '$version'
            }
          }
        }, {
          $sort: {
            'max': 1
          }
        }, {
          // NB: aggregate project not API project
          $project: {
            _id: 0,
            name: '$_id.name',
            users: '$_id.users',
            description: '$_id.description',
            version: 1
          }
        },

        function (err, data) {
          if (err) {
            next(err);
          }
          //console.log('Sending: ' + JSON.stringify(data));
          res.send(data);
        }

      );
    },

    pProjectName: function (req, res, next, projectName) {
      var version = req.params.projectVersion;

      var query = Project.find({
        'name': projectName
      })
        .sort({
          'version': -1
        });

      if (version) {
        query = query.where('version')
          .equals(version);
      }

      query.exec(function (err, projects) {
        if (err) {
          return next(err);
        }
        req.projects = projects;
        next();
      });

    },

    addProject: function (req, res, next) {
      var projects = req.projects;
      if (_validateProject(projects)) {
        return res.send(409, {
          detail: 'Project already exists'
        });
      }

      //console.log('Attempting to save: ' + JSON.stringify(req.body));
      var p = new Project(req.body);
      p.save(function (err) {
        if (err) {
          return next(err);
        }
        res.send(200);
      });
    },

    getProject: function (req, res, next) {
      var projects = req.projects;
      if (_validateProject(projects)) {
        var project = req.projects[0];
        return res.send({
          name: project.name,
          version: project.version,
          users: project.users,
          description: project.description
        });
      } else {
        return res.send(404, {
          detail: 'Project doesn\'t exist'
        });
      }

    },

    //
    // Test extensions
    //

    resetTests: function (req, res, next) {
      var testProjects = testData.testProjects,
        projects = [],
        i;

      for (i = 0; i < testProjects.length; i++) {
        projects.push(testProjects[i].name);
      }

      //console.log(emails);

      var query = Project.find({
        'name': {
          $in: projects
        }
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
