/*
 * Profile Business Logic
 */

(function (require, module) {

  'use strict';

  var Project = require('../schemas/project.js');
  var Profile = require('../schemas/profile.js');
  var Device = require('../schemas/device.js');
  var User = require('../schemas/user.js');
  var moment = require('moment');
  var passport = require('passport');
  var testData = require('../tests/testData.js');
  var config = require('../include/config.js');
  var mongoose = require('mongoose-q')();
  var Q = require('q');
  var utils = require('../include/utils.js');
  var _ = require('lodash');

  module.exports = {

    //
    // Parameters
    //

    pProfileId: function (req, res, next, profileId) {
      if (!req.user) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      // Check for valid object ID
      // Thanks: http://stackoverflow.com/a/14942113/1153203
      if (!profileId.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
      }

      Profile.findOneQ({
        '_id': profileId
      })
        .then(function (data) {
          req.profile = data;
          next();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    //
    // API Methods
    //

    getProfile: function (req, res, next) {
      var profile = req.profile;
      var project = req.project;
      var loggedInUser = req.user;
      var projectVersion = req.query.projectVersion;

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

      if (!profile) {
        return res.send(404, {
          detail: 'Profile doesn\'t exist'
        });
      }

      if (!(_.contains(project.admins, loggedInUser._id) ||
        _.contains(project.users, loggedInUser._id))) {
        return res.send(401, {
          detail: 'Only authorised project members can ' +
            'see the project\'s profiles.'
        });
      }

      res.send(200, {
        projectId: profile.projectId,
        projectVersion: profile.projectVersion,
        profileName: profile.profileName,
        profileData: profile.profileData,
        timestamp: profile.timestamp
      });
    },

    getProfiles: function (req, res, next) {
      var project = req.project;
      var loggedInUser = req.user;
      var projectVersion = req.query.projectVersion;

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

      if (!(_.contains(project.admins, loggedInUser._id) ||
        _.contains(project.users, loggedInUser._id))) {
        return res.send(401, {
          detail: 'Only authorised project members can ' +
            'see the project\'s profiles.'
        });
      }

      var query = Profile.find();

      query.select('_id projectId projectVersion profileName ' +
        'profileData timestamp');

      query.where('projectId')
        .equals(project._id);

      if (utils.exists(projectVersion)) {
        query.where('projectVersion')
          .equals(projectVersion);
      }

      query.execQ()
        .then(function (data) {
          res.send(200, data);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    saveProfile: function (req, res, next) {
      var project = req.project;
      var loggedInUser = req.user;
      var data = req.body;
      var deviceId = req.query.deviceId;

      if (!deviceId) {
        return res.send(409, {
          detail: 'No device ID specified in query string. ' +
            '(eg. .../profiles/?deviceId=xxx)'
        });
      }

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

      var getDevice = Device.findOne({
        '_id': deviceId
      });

      var createProfile = function (device) {
        var p = new Profile({
          projectId: project._id,
          projectVersion: device.projectVersion,
          profileName: data.profileName,
          profileData: device.currentState
        });
        return p.saveQ();
      };

      var returnId = function (savedProfile) {
        res.send(201, {
          _id: savedProfile._id
        });
      };

      getDevice.execQ()
        .then(createProfile)
        .then(returnId)
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    //TODO: Delete profile

    //
    // Test extensions
    //
    resetTests: function (req, res, next) {
      Profile.find(function (err, data) {
        if (err) {
          return next(err);
        }

        for (var i = 0; i < data.length; i++) {
          data[i].remove();
        }

        return res.send(200);
      });
    }


  };

})(require, module);
