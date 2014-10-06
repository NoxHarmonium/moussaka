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
  var testData = require('../../../tests/testData.js');
  var config = require('../../shared/config.js');
  var mongoose = require('mongoose-q')();
  var Q = require('q');
  var utils = require('../../shared/utils.js');
  var _ = require('lodash');
  var queryFilters = require('../include/queryFilters.js');

  module.exports = {

    //
    // Parameters
    //

    pProfileId: function (req, res, next, profileId) {
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

      res.send(200, {
        projectId: profile.projectId,
        projectVersion: profile.projectVersion,
        profileName: profile.profileName,
        profileData: profile.profileData,
        owner: profile.owner,
        timestamp: profile.timestamp
      });
    },

    getProfiles: function (req, res, next) {
      var project = req.project;
      var loggedInUser = req.user;
      var projectVersion = req.query.projectVersion;

      if (!project) {
        return res.send(404, {
          detail: 'Specified project doesn\'t exist'
        });
      }

      var query = Profile.find();

      query.select('_id projectId projectVersion profileName ' +
        'profileData timestamp owner');

      query.where('projectId')
        .equals(project._id);

      if (utils.exists(projectVersion)) {
        query.where('projectVersion')
          .equals(projectVersion);
      }

      try {
        queryFilters.paginate(req.query, query);
        queryFilters.sort(req.query, query, {
          'profileName': 'asc'
        });
      } catch (ex) {
        return res.send(400, ex.message);
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
      var profileName = data.profileName;

      if (!deviceId) {
        return res.send(409, {
          detail: 'No device ID specified in query string. ' +
            '(eg. .../profiles/?deviceId=xxx)'
        });
      }

      if (!project) {
        return res.send(404, {
          detail: 'Specified project doesn\'t exist'
        });
      }

      if (!utils.isNonEmptyString(profileName)) {
        return res.send(409, {
          detail: 'A projectName field is required'
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
          profileData: device.currentState,
          owner: loggedInUser._id
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

    deleteProfile: function (req, res, next) {
      var profile = req.profile;
      var project = req.project;
      var loggedInUser = req.user;

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
        (profile.owner === loggedInUser._id))) {
        return res.send(401, {
          detail: 'Only authorised profile owner or a project' +
            'admin can delete a profile.'
        });
      }

      profile.removeQ()
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
      Profile.removeQ({})
        .then(function () {
          res.send(200);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    }


  };

})(require, module);