/*
 * Profile Business Logic
 */

(function (require, module) {

  'use strict';

  var Project = require('../schemas/project.js');
  var Profile = require('../schemas/profile.js');
  var User = require('../schemas/user.js');
  var moment = require('moment');
  var passport = require('passport');
  var testData = require('../tests/testData.js');
  var config = require('../include/config.js');
  var mongoose = require('mongoose');
  var Q = require('q');

  // Private functions
  var _validateProject = function _validateProject(projects) {
    return projects && Array.isArray(projects) && projects.length === 1;
  };

  module.exports = {

    pProfile: function (req, res, next, profileId) {
      if (_validateProject(req.projects)) {
        return res.send(404, {
          detail: 'Project doesn\'t exist'
        });
      }

      var profile = Profile.findOne({
        '_id': profileId,
        'project': req.projects[0]._id
      }, function (err, data) {
        if (err) {
          return next(err);
        }
        req.profile = data;
      });
    },

    getProfile: function (req, res, next) {
      var profile = req.profile;

      if (!profile || profile.length === 0) {
        return res.send(404, {
          detail: 'Profile doesn\'t exist'
        });
      }

      res.send(200, profile);
    },

    getProfiles: function (req, res, next) {
      if (_validateProject(req.projects)) {
        return res.send(404, {
          detail: 'Project doesn\'t exist'
        });
      }

      Profile.find({
          'project': req.projects[0]._id
        },
        function (err, data) {
          if (err) {
            next(err);
          }

          res.send(200, data);

        }
      );


    },

    addProfile: function (req, res, next) {
      var r = req.body;
      var deps = [];

      //console.log('data: ' + JSON.stringify(r));

      if (r.owner) {
        var checkOwner = Q.defer();
        deps.push(checkOwner.promise);

        User.findOne({
          '_id': r.owner
        }, function (err, data) {
          if (err) {
            return next(err);
          }
          if (!data) {
            res.send(400, {
              'detail': 'Owner doesn\'t exist'
            });
            checkOwner.reject();
          }
          checkOwner.resolve();
        });
      } else {
        return res.send(400, {
          detail: 'Owner is a required field'
        });
      }

      if (r.parentProfile) {
        //console.log('ParentProfile: ' + r.parentProfile);
        var checkProfile = Q.defer();
        deps.push(checkProfile.promise);

        var profileId;
        try {
          profileId = mongoose.Types.ObjectId(r.parentProfile);
        } catch (e) {
          res.send(400, {
            'detail': 'Parent profile ID is in an invalid format'
          });
          return checkProfile.reject();
        }

        Profile.findOne({
          '_id': profileId
        }, function (err, data) {
          if (err) {
            return next(err);
          }
          if (!data) {
            res.send(400, {
              'detail': 'Parent profile doesn\'t exist'
            });
            return checkProfile.reject();
          }
          checkProfile.resolve();
        });
      }

      if (r.project) {
        var checkProject = Q.defer();
        deps.push(checkProject.promise);

        Project.findOne({
          '_id': r.project
        }, function (err, data) {
          if (err) {
            return next(err);
          }
          if (!data) {
            return res.send(400, {
              'detail': 'Project doesn\'t exist'
            });
          }
          checkProject.resolve();
        });
      } else {
        return res.send(400, {
          detail: 'Project is a required field'
        });
      }


      Q.all(deps)
        .then(function () {
          var p = new Profile(r);
          p.save(function (err, profile) {
            if (err) {
              return next(err);
            }

            //console.log('data: ' + body);

            res.send(200, {
              '_id': profile._id
            });
          });
        });

    },

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
