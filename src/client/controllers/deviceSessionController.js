(function (module, require) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');
  var _ = require('lodash');
  var $ = require('jquery');
  var controls = require('../../shared/controls.js');
  var Utils = require('../../shared/utils.js');
  var tinycolor = require('tinycolor2');

  // Public functions

  module.exports = ['$scope', 'Project', 'Device',
    '$stateParams', '$state', '$q',
    function projectEditController($scope, Project,
      Device, $stateParams, $state, $q) {
      //
      // Setup
      //

      var projectId = $stateParams.projectId;
      var deviceId = $stateParams.deviceId;
      $scope.loading = true;

      $q.all([
        Device.get(projectId, deviceId),
        Project.get(projectId)
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

      //
      // Actions
      //

      $scope.getControlUrl = function (schemaValues) {
        return '/views/controls/' + schemaValues.type;
      };

      $scope.getSetColorAsInteger = function(colorObj) {
        // Return a function used by angular to get and set the color
        // object valus
        return function(newValue) {
          if (Utils.exists(newValue)) {

            // Get the color values from the color picker
            // hex string output
            var parsedColor =
              tinycolor(newValue)
              .toRgb();

            // Set the color values to the object
            // captured by the closure
            colorObj.values.r = parsedColor.r;
            colorObj.values.g = parsedColor.g;
            colorObj.values.b = parsedColor.b;
            colorObj.values.a = parsedColor.a;

            // Return it here to skip an unnessesary parse below
            return newValue;
          }

          // Convert the color object into hex string
          // for the color picker
          return tinycolor.
            fromRatio(colorObj.values)
            .toHexString();
        };
      };

      $scope.sendUpdate = function (schemaName) {
        // TODO: Collect updates over a period of time (1s) and send
        // in batch to prevent server spamming
        var updates = {};
        updates[schemaName] = $scope.currentState[schemaName];
        $scope.device.sendUpdates(updates);
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

    }
  ];

})(module, require);
