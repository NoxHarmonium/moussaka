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
      var query = Project.find();
      query.select('name owner users')
      query.populate('owner users')

      query.exec(function (err, user) {
        if (err) {
          return next(err);
        }
        return res.send(user);
      });
    },

    pProject: function (req, res, next, name) {
      var query = Project.findOne({
        'name': name
      });
      query.exec(function (err, project) {
        if (err) {
          return next(err);
        }
        req.selectedProject = project;
        next();
      });
    }

  };


})(require, module);
