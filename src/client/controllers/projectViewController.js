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
      $('.tabs').tabslet({
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
          ]).then(function (results) {
            var project = results[0];
            var deviceResponse = results[1];
            var devices = deviceResponse.devices;

            console.log(JSON.stringify(devices));

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
          deviceId: device._id
        });
      };
    }
  ];

})(module, require);
