(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var moment = require('moment');
  var passport = require('passport');
  var testData = require('../tests/testData.js');
  var config = require('../include/config.js');

  module.exports = {

    listProjects: function (req, res, next) {
      Project.aggregate({
          $group: {
            '_id': '$name',
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
            name: '$_id',
            version: 1
          }
        },

        function (err, data) {
          if (err) {
            next(err);
          }
          console.log('Sending: ' + JSON.stringify(data));
          res.send(data);
        }

      );
    },

    pProjectName: function (req, res, next, projectName) {
      var query = Project.find({
        'name': projectName
      });
      query.exec(function (err, projects) {
        if (err) {
          return next(err);
        }
        req.projects = projects;
        next();
      });
    },

    pProjectVersion: function (req, res, next, projectVersion) {
      var projectName = req.params.projectName;

      if (!projectName) {
        next(new Error(
          'The projectVersion param can only be used with the projectName param'
        ));
      }

      var query = Project.findOne({
        'name': projectName
      });

      query.where('version')
        .equals(projectVersion);

      query.exec(function (err, project) {
        if (err) {
          return next(err);
        }
        req.project = project;
        next();
      });
    },

    addProject: function (req, res, next) {
      if (req.project) {
        return res.send(409, {
          detail: 'Project already exists'
        });
      }

      console.log('Attempting to save: ' + JSON.stringify(req.body));
      var p = new Project(req.body);
      p.save(function (err) {
        if (err) {
          return next(err);
        }
        res.send(200);
      });
    },

    getProject: function (req, res, next) {
      if (req.project) {
        return res.send(
          { 
            name: req.project.name,
            version: req.project.version,
            users : req.project.users
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
