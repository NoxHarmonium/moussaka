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
            _id: null,
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
        req.projectQuery = query;
        next();
      });
    },

    pProjectVersion: function (req, res, next, projectVersion) {
      var query = req.projectQuery;
      if (!query) {
        next(new Error(
          'The projectVersion param can only be used with the projectName param'
        ));
      }

      query.where('version')
        .equals(projectVersion);

      query.exec(function (err, projects) {
        if (err) {
          return next(err);
        }
        req.project = projects;
        next();
      });
    },

    addProject: function (req, res, next) {
      var p = new Project(req.body);
      p.save(function (err) {
        if (err) {
          return next(err);
        }


      });





    }

  };


})(require, module);
