(function (module, require) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');
  var _ = require('lodash');
  var $ = require('jquery');

  // Private functions

  var generateTableData = function (project) {
    var members = [];
    _.each(project.admins, function (admin) {
      members.push({
        email: admin,
        // TODO: i18n
        type: 'Admin'
      });
    });
    _.each(project.users, function (user) {
      members.push({
        email: user,
        // TODO: i18n
        type: 'User'
      });
    });
    return members;
  };

  // Public functions

  module.exports = ['$scope', 'Project', '$routeParams',
    'locationPatched', '$cookies',
    function projectEditController($scope, Project,
      $routeParams, locationPatched, $cookies) {
      // 
      // Setup
      //

      var projectId = $routeParams.projectId;
      $scope.submitted = false;
      $scope.hideSuccess = true;
      $scope.newProjMembSubmitted = false;
      $scope.loading = true;
      $scope.hideError = true;
      $scope.project = new Project();
      $scope.currentUser = $cookies.userEmail;
      $scope.showAdmin = false;
      $scope.newProjMemb = {
        email: '',
        type: 'user'
      };


      if (projectId) {
        $scope.newProject = false;
        // Get an existing project
        Project.get(projectId)
          .then(function (project) {
            if (!project) {
              $scope.newProject = true;
            } else {
              $scope.project = project;
              $scope.projectMembers = generateTableData(project);
              $scope.updateShowAdmin();
            }
          })
          .catch(function (err) {
            $scope.handleError(err);
          })
          .finally(function () {
            $scope.loading = false;
          });
      } else {
        // Create a new one, no loading required
        $scope.newProject = true;
        $scope.loading = false;
      }

      // Scroll to messages when shown
      // TODO: This isn't working
      $('.highlight-on-show')
        .on('show', function () {
          console.log('show!');
          $('body, html')
            .animate({
              scrollTop: this.offset()
                .top
            }, 300);
        });

      //
      // Actions
      //

      $scope.saveProject = function () {
        $scope.submitted = true;
        $scope.hideError = true;
        $scope.hideSuccess = true;

        if ($scope.projectNameFieldRequired()) {
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
          .then(function (project) {
            $scope.hideSuccess = false;
            $scope.project = project;
            $scope.projectMembers = generateTableData(project);

            if ($scope.newProject) {
              $scope.newProject = false;
              var url = '/editProject/' +
                project._id;
              locationPatched.skipReload()
                .path(url)
                .replace();
            }
          })
          .catch(function (err) {
            $scope.handleError(err);
          })
          .finally(function () {
            $scope.loading = false;
          });

      };

      $scope.addNewProjectMember = function () {
        $scope.hideSuccess = true;
        $scope.hideError = true;
        $scope.newProjMembSubmitted = true;

        if ($scope.newProjEmailRequired() ||
          $scope.newProjEmailWrongFormat()) {
          return;
        }

        $scope.loading = true;

        var newProj = $scope.newProjMemb;

        var result;
        if (newProj.type === 'admin') {
          result = $scope.project.addAdmin(newProj.email);
        } else if (newProj.type === 'user') {
          result = $scope.project.addUser(newProj.email);
        } else {
          throw new Error('Invalid project type.');
        }

        result
          .then(function (project) {
            $scope.project = project;
            $scope.projectMembers = generateTableData(project);
            // Reset the text box
            newProj.email = '';
            // Turn off error messages
            $scope.newProjMembSubmitted = false;

            // Return focus
            // TODO: This isn't working 
            $('form input[name=newProjMembEmail]')
              .focus();
          })
          .catch(function (err) {
            $scope.handleError(err);
          })
          .finally(function () {
            $scope.loading = false;
          });

      };

      $scope.removeProjMemb = function (projectMember) {
        $scope.hideSuccess = true;
        $scope.loading = true;

        var result;
        var type = projectMember.type.toLowerCase();
        if (type === 'admin') {
          result = $scope.project.removeAdmin(projectMember.email);
        } else if (type === 'user') {
          result = $scope.project.removeUser(projectMember.email);
        } else {
          throw new Error('Invalid project type.');
        }

        result
          .then(function (project) {
            $scope.project = project;
            $scope.projectMembers = generateTableData(project);
          })
          .catch(function (err) {
            $scope.handleError(err);
          })
          .finally(function () {
            $scope.loading = false;
          });
      };

      //
      // Validation Methods
      //

      $scope.projectNameFieldRequired = function () {
        return ($scope.submitted) &&
          $scope.projectEditForm.projectName.$error.required;
      };

      $scope.newProjEmailRequired = function () {
        return ($scope.newProjMembSubmitted) &&
          $scope.projectEditForm.newProjMembEmail.$error.required;
      };

      $scope.newProjEmailWrongFormat = function () {
        return ($scope.newProjMembSubmitted) &&
          !$scope.newProjEmailRequired() &&
          $scope.projectEditForm.newProjMembEmail.$error.email;
      };

      $scope.fieldHasChanged = function () {
        $scope.submitted = false;
        $scope.hideError = true;
        $scope.hideSuccess = true;
      };

      $scope.projMembFieldHasChanged = function () {
        $scope.newProjMembSubmitted = false;
        $scope.hideError = true;
      };

      // Helper Functions

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

        $scope.hideError = false;
        $scope.errorMessage = detail;
      };

      $scope.updateShowAdmin = function () {
        console.log('Current user: ', $scope.currentUser);
        $scope.showAdmin =
          $scope.newProject ||
          _.contains($scope.project.admins, $scope.currentUser);
      };
    }
  ];

})(module, require);
