(function (module, require) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');
  var _ = require('lodash');
  var $ = require('jquery');

  // Public functions

  module.exports = ['$scope', 'Project',
    '$stateParams', '$state', '$cookies',
    function projectEditController($scope, Project,
      $stateParams, $state, $cookies) {
      // 
      // Setup
      //

      var projectId = $stateParams.projectId;
      $scope.loading = true;

      if (projectId) {
        // Get an existing project
        Project.get(projectId)
          .then(function (project) {
            if (!project) {
              // TODO: Error handler page
              throw new Error('Project doesnt exist!');
            } else {
              $scope.project = project;
            }
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
    }
  ];

})(module, require);
