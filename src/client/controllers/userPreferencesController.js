(function (module, require, window) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');
  var _ = require('lodash');

  // createAccountController
  module.exports = ['$scope', '$http', 'User', '$cookies', '$location',
    function userPreferencesController($scope, $http, User, $cookies,
      $location) {
        $scope.firstName = '';
        $scope.lastName = '';
        $scope.password = '';
        $scope.email = $cookies.userEmail;
        $scope.loading = false;
        $scope.hideError = true;
        $scope.errorMessage = '';

        $scope.loading = true;
        $scope.user = null;

         User.get($scope.email)
            .then(function (user) {
                $scope.user = user;
                // Pull user variables into scope
                $scope = _.extend($scope, user);
                $scope.loading = false;
            })
            .catch(function (err) {
                $scope.handleError(err);
            })
            .finally(function () {
                $scope.loading = false;
            });

        $scope.handleError = function(error) {
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

        $scope.saveUserPrefs = function () {
            $scope.submitted = true;
            $scope.hideError = true;

            if ($scope.loading || $scope.userPreferencesForm.$invalid) {
              return;
            }

            $scope.user.firstName = $scope.firstName;
            $scope.user.lastName = $scope.lastName;

            // TODO: Change email (need to update associated references)
            // TODO: Change password (seperate API call)
            //$scope.user.password = $scope.password;
            //$scope.user.email = $scope.email;

            $scope.loading = true;

            var result = $scope.user.update()
              .then(function (response) {
                window.location = '/views/dashboard/';
                return response;
              })
              .catch(function (err) {
                $scope.handleError(err);
              })
              .finally(function () {
                $scope.loading = false;
              });
        };

        $scope.fieldHasChanged = function () {
            $scope.submitted = false;
            $scope.hideError = true;
        };

        $scope.firstNameFieldRequired = function () {
            return ($scope.submitted) &&
                $scope.userPreferencesForm.firstName.$error.required;
        };

        $scope.lastNameFieldRequired = function () {
            return ($scope.submitted) &&
                $scope.userPreferencesForm.lastName.$error.required;
        };

        $scope.emailFieldRequired = function () {
            return ($scope.submitted) &&
                $scope.userPreferencesForm.email.$error.required;
        };

        $scope.emailFieldFormat = function () {
            return ($scope.submitted) &&
                $scope.userPreferencesForm.email.$error.email;
        };

        $scope.passwordFieldInvalid = function () {
            return ($scope.submitted) &&
                $scope.userPreferencesForm.password.$error.required;
        };

        $scope.firstNameFieldWrongSize = function () {
            return ($scope.submitted) &&
              (
                $scope.userPreferencesForm.firstName.$error.minlength ||
                $scope.userPreferencesForm.firstName.$error.maxlength
              );
        };

        $scope.lastNameFieldWrongSize = function () {
            return ($scope.submitted) &&
              (
                $scope.userPreferencesForm.lastName.$error.minlength ||
                $scope.userPreferencesForm.lastName.$error.maxlength
              );
        };

        $scope.emailFieldWrongSize = function () {
            return ($scope.submitted) &&
              (
                $scope.userPreferencesForm.email.$error.minlength ||
                $scope.userPreferencesForm.email.$error.maxlength
              );
        };

        $scope.passwordFieldWrongSize = function () {
            return ($scope.submitted) &&
              (
                $scope.userPreferencesForm.password.$error.minlength ||
                $scope.userPreferencesForm.password.$error.maxlength
              );
        };
    }
  ];

})(module, require, window);
