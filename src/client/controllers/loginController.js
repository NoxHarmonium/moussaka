(function (module, require, window) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');

  // loginController
  module.exports = function loginController($scope, $http, User) {
    $scope.username = '';
    $scope.password = '';
    $scope.loading = false;
    $scope.hideError = true;
    $scope.errorMessage = '';

    $scope.formLogin = function () {
      $scope.submitted = true;

      if ($scope.loginForm.$invalid) {
        return;
      }

      $scope.loading = true;


      User.login($scope.email, $scope.password)
        .then(function (response) {
          window.location = '/views/dashboard/';
          return response;
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

    $scope.fieldHasChanged = function () {
      $scope.submitted = false;
      $scope.hideError = true;
    };

    $scope.emailFieldRequired = function () {
      return ($scope.submitted) &&
        $scope.loginForm.email.$error.required;
    };

    $scope.emailFieldFormat = function () {
      return ($scope.submitted) &&
        $scope.loginForm.email.$error.email;
    };

    $scope.passwordFieldInvalid = function () {
      return ($scope.submitted) &&
        $scope.loginForm.password.$error.required;
    };

  };

})(module, require, window);
