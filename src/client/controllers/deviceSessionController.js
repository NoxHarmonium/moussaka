(function (module, require) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');
  var _ = require('lodash');
  var $ = window.$;
  var controls = require('../../shared/controls.js');
  var Utils = require('../../shared/utils.js');
  // TODO: tinycolor is duplicated. It is also embedded in spectrum
  var tinycolor = require('tinycolor2');


  // Public functions

  module.exports = ['$scope', 'Project', 'Device',
    'Profile', '$stateParams', '$state', '$q',
    function projectEditController($scope, Project,
      Device, Profile, $stateParams, $state, $q) {
      //
      // Setup
      //

      $scope.projectId = $stateParams.projectId;
      $scope.deviceId = $stateParams.deviceId;

      $scope.loading = true;
      $scope.validationSuccess = {};
      $scope.validationMessages = {};
      $scope.pendingUpdates = {};
      $scope.debounceTime = 500; //ms
      $scope.maxProfileCount = 10;
      $scope.device = null;
      $scope.project = null;
      $scope.profiles = [];

      $scope.profileQueryVars = {
        sortField: 'createdAt',
        sortDir: 'desc',
        minRecord: 0,
        maxRecord: $scope.maxProfileCount
      };

      $q.all([
        Device.get($scope.projectId, $scope.deviceId),
        Project.get($scope.projectId)
      ])
        .then(function (results) {
          var device = results[0];
          var project = results[1];
          $scope.device = device;
          $scope.project = project;
          return device.startSession();
        })
        .then(function (result) {
          $scope.dataSchema = result.dataSchema;
          $scope.currentState = result.currentState;
        })
        .catch(function (err) {
          $scope.handleError(err);
        })
        .finally(function () {
          $scope.loading = false;
        });

      Profile.getAll($scope.projectId, $scope.profileQueryVars)
        .then(function (response) {
          $scope.profiles = response.profiles;
        });

      //
      // Actions
      //

      $scope.getControlUrl = function (schemaValues) {
        return '/views/controls/' + schemaValues.type;
      };

      $scope.getLockedValues = function (schemaName) {
        var lockedValues = this.dataSchema[schemaName].lockedValues;
        return lockedValues || {};
      };

      $scope.getLockValuesText = function(schemaName) {
        var lockedValues = $scope.getLockedValues(schemaName);
        var descriptionText = '';
        for (var key in lockedValues) {
          var value = lockedValues[key];
          if (value) {
            descriptionText += '\'' + key + '\', ';
          }
        }
        if (descriptionText.length > 0) {
          descriptionText = descriptionText.slice(0, -2); // Trim off last comma
        }
        return descriptionText;
      };

      $scope.getLockedValueCount = function(schemaName) {
        return Object.keys($scope.getLockedValues(schemaName)).length;
      };

      $scope.getSetColorAsInteger = function(colorObj, schemaName) {
        // Return a function used by angular to get and set the color
        // object values
        // Warning: This is a bit hacky to interop with color picker
        return function(newValue) {
          if (Utils.exists(newValue)) {

            // Get the color values from the color picker
            // hex string output
            var parsedColor =
              tinycolor(newValue)
              .toRgb();

            // Set the color values to the object
            // captured by the closure
            var lockedValues = $scope.getLockedValues(schemaName);

            colorObj.values.r =
              lockedValues.r ? colorObj.values.r : parsedColor.r;
            colorObj.values.g =
              lockedValues.g ? colorObj.values.g : parsedColor.g;
            colorObj.values.b =
              lockedValues.b ? colorObj.values.b : parsedColor.b;
            colorObj.values.a =
              lockedValues.a ? colorObj.values.a : parsedColor.a * 255.0;
          }

          // Convert the color object into hex string
          // for the color picker
          return tinycolor({
            r: colorObj.values.r,
            g: colorObj.values.g,
            b: colorObj.values.b,
            a: colorObj.values.a / 255.0
          }).toString('hex8');
        };
      };

      $scope.getModel = function (paramName, schemaName) {
        return function(newValue) {
          var currentState = $scope.currentState[schemaName];

          if (Utils.exists(newValue)) {
            if (!$scope.getLocked(paramName, schemaName)) {
              currentState.values[paramName] = newValue;
              $scope.doValidation(schemaName, currentState);
            }
          }
          return currentState.values[paramName];
        };
      };

      $scope.getSchema = function (schemaName) {
        return $scope.dataSchema[schemaName];
      };

      $scope.calculateStep = function(schemaName) {
        var schema = $scope.dataSchema[schemaName];
        var difference = schema.max - schema.min;
        return schema.step || difference / 50.0;
      };

      $scope.schemaHasBounds = function(schemaName) {
        var schema =  $scope.dataSchema[schemaName];
        return Utils.exists(schema) &&
          Utils.exists(schema.min) &&
          Utils.exists(schema.max);
      };

      $scope.sendPendingUpdates = function () {
        $scope.device.sendUpdates($scope.pendingUpdates);
        $scope.pendingUpdates = {};
      };

      $scope.sendPendingUpdatesDebounced =
        _.debounce($scope.sendPendingUpdates, $scope.debounceTime);

      $scope.notifyPendingUpdate = function (schemaName) {

        var update = $scope.currentState[schemaName];
        var success = $scope.doValidation(schemaName, update);

        if (success) {
          $scope.pendingUpdates[schemaName] = update;
          $scope.sendPendingUpdatesDebounced();
        } else {
          // Make sure that an invalid object is not sent
          delete $scope.pendingUpdates[schemaName];
        }
      };

      $scope.getLocked = function (paramName, schemaName) {
        var lockedValues = $scope.getLockedValues(schemaName);
        return !!lockedValues[paramName];
      };

      $scope.doValidation = function(schemaName, state) {
        var schema = $scope.dataSchema[schemaName];
        var control = controls[schema.type];

        var validationResult =
          control.validate(schema, state);

        $scope.validationSuccess[schemaName] = validationResult.success;
        $scope.validationMessages[schemaName] = validationResult.reason;

        return validationResult.success;
      };

      $scope.isValid = function(schemaName) {
          var valid = $scope.validationSuccess[schemaName];

          if (Utils.exists(valid)) {
            return valid;
          } else {
            return true;
          }
      };

      $scope.getValidationMessage = function(schemaName) {
        var message = $scope.validationMessages[schemaName];
        return message;
      };

      $scope.handleError = function (error) {
        var detail;
        if (error instanceof ApiError) {
          // ApiError messages come from the server so they
          // are use friendly (i.e. user exists)
          detail = error.message;
        } else {
          // Don't tell the user a generic error
          // They wont know what it means
          // TODO: i18n (generic error)
          detail = 'There was an error processing your request.';
        }

        // TODO: Handle the error!
        // $scope.hideError = false;
        // $scope.errorMessage = detail;
      };

      $scope.switchProfile = function (profileIndex) {
        var profile = $scope.profiles[profileIndex];
        var profileData = profile.profileData || {};
        for (var schemaName in profileData) {
          var schema = $scope.dataSchema[schemaName];
          var control = controls[schema.type];
          var profileValue = profileData[schemaName];
          var currentValue = $scope.currentState[schemaName];

          // Apply the data stored in the profile to the current state
          // Run it through the control to validate the data
          control.apply(schema, currentValue, profileValue);
          $scope.notifyPendingUpdate(schemaName);
        }
      };

      $scope.saveProfile = function () {
        var newProfile = new Profile({
          projectId: $scope.projectId,
          profileName: 'profile!'
        });

        $scope.loading = true;

        newProfile.create($scope.deviceId)
          .then(function () {
              return Profile.getAll($scope.projectId, $scope.profileQueryVars);
            })
          .then(function (response) {
            $scope.profiles = response.profiles;
            })
          .catch(function (err) {
              $scope.handleError(err);
            })
          .finally(function () {
              $scope.loading = false;
            });
      };
    }
  ];

})(module, require);
