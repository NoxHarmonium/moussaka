(function (module, require) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');
  var _ = require('lodash');
  var $ = require('jquery');

  // Public functions

  module.exports = ['$scope', 'Project', 'Device',
    '$stateParams', '$state', '$cookies', '$q',
    function projectEditController($scope, Project,
      Device, $stateParams, $state, $cookies, $q) {
      //
      // Setup
      //

      // Make sure tab control is correct
      $('.tabs')
        .tabslet({
          mouseevent: 'click',
          attribute: 'data-target',
        });

      var projectId = $stateParams.projectId;
      $scope.loading = true;

      if (projectId) {
        // Get an existing project and then devices

        $q.all([
          Project.get(projectId),
          Device.getAll(projectId)
        ])
          .then(function (results) {
            var project = results[0];
            var deviceResponse = results[1];
            var devices = deviceResponse.devices;

            if (!project) {
              // TODO: Error handler page
              throw new Error('Project doesnt exist!');
            } else {
              $scope.project = project;
            }

            $scope.devices = devices;
          })
          .catch(function (err) {
            $scope.handleError(err);
          })
          .finally(function () {
            $scope.loading = false;
          });
      } else {
        // TODO: Error handler page
        throw new Error('Project doesnt exist!');
      }

      //
      // Actions
      //

      $scope.getTotalContributors = function () {
        if (!$scope.project) {
          return 0;
        }
        return $scope.project.users.length +
          $scope.project.admins.length;
      };

      $scope.openDevice = function (device) {
        $state.go('deviceSession', {
          projectId: $scope.project._id,
          deviceId: device._id
        });
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

        // TODO: HANDLE ERRORS
        // Maybe make a global one
        // $scope.hideError = false;
        // $scope.errorMessage = detail;
      };
    }
  ];

})(module, require);
