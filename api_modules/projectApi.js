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
            _id: '$name',
            'version': {
              $max: '$version'
            }
          }
        },

        function (err, data) {
          if (err) {
            next(err);
          }
          res.send(data);
        }

      );


      //var query = Project.find();
      //query.select('name owner users');
      //query.populate('owner users');

      //query.exec(function (err, user) {
      //  if (err) {
      //    return next(err);
      // }
      // return res.send(user);
      //});
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

      var p = new Project(req.body);
      p.save(function (err) {
        if (err) {
          return next(err);
        }
      });

      res.send(200);
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
