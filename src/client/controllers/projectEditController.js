(function (module, require) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');

  module.exports = ['$scope', 'Project', '$routeParams',
    function projectEditController($scope, Project, $routeParams) {
      var projectId = $routeParams.projectId;
      $scope.loading = true;
      $scope.hideError = true;
      $scope.project = new Project();


      if (projectId) {
        $scope.newProject = false;
        // Get an existing project
        Project.get(projectId)
          .then(function (project) {
            $scope.project = project;
          })
          .catch(function (err) {
            // TODO: Error
          })
          .finally(function () {
            $scope.loading = false;
          });
      } else {
        // Create a new one, no loading required
        $scope.newProject = true;
        $scope.loading = false;
      }

      $scope.saveProject = function () {
        $scope.submitted = true;
        $scope.hideError = true;

        if ($scope.projectEditForm.$invalid) {
          return;
        }

        $scope.loading = true;

        var result;
        if ($scope.newProject) {
          result = $scope.project.create();
        } else {
          result = $scope.project.update();
        }

        result
          .then(function (response) {
            if ($scope.newProject) {
              // Reload in edit mode
              window.location = '#editProject/' + $scope.project._id;
            }
          })
          .catch(function (error) {
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

            $scope.hideError = false;
            $scope.errorMessage = detail;

          })
          .finally(function () {
            $scope.loading = false;
          });

      };

      $scope.projectNameFieldRequired = function () {
        return ($scope.submitted) &&
          $scope.projectEditForm.projectName.$error.required;
      };

    }
  ];

})(module, require);
