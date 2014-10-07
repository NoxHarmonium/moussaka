(function (module, require, window) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');

  // createAccountController
  module.exports = ['$scope', '$http', 'User', '$location',
    function createAccountController($scope, $http, User, $location) {
      $scope.firstName = '';
      $scope.lastName = '';
      $scope.password = '';
      $scope.email = '';
      $scope.loading = false;
      $scope.hideError = true;
      $scope.errorMessage = '';

      $scope.formCreateAccount = function () {
        $scope.submitted = true;
        $scope.hideError = true;

        if ($scope.createAccountForm.$invalid) {
          return;
        }

        $scope.loading = true;
        var user = new User({
          username: $scope.email,
          firstName: $scope.firstName,
          lastName: $scope.lastName,
          password: $scope.password
        });

        var result = user.create()
          .then(function (response) {
            return $http.post('/login/', {
              username: $scope.email,
              password: $scope.password
            });
          })
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

      $scope.firstNameFieldRequired = function () {
        return ($scope.submitted) &&
          $scope.createAccountForm.firstName.$error.required;
      };

      $scope.lastNameFieldRequired = function () {
        return ($scope.submitted) &&
          $scope.createAccountForm.lastName.$error.required;
      };

      $scope.emailFieldRequired = function () {
        return ($scope.submitted) &&
          $scope.createAccountForm.email.$error.required;
      };

      $scope.emailFieldFormat = function () {
        return ($scope.submitted) &&
          $scope.createAccountForm.email.$error.email;
      };

      $scope.passwordFieldInvalid = function () {
        return ($scope.submitted) &&
          $scope.createAccountForm.password.$error.required;
      };

      $scope.firstNameFieldWrongSize = function () {
        return ($scope.submitted) &&
          (
            $scope.createAccountForm.firstName.$error.minlength ||
            $scope.createAccountForm.firstName.$error.maxlength
          );
      };

      $scope.lastNameFieldWrongSize = function () {
        return ($scope.submitted) &&
          (
            $scope.createAccountForm.lastName.$error.minlength ||
            $scope.createAccountForm.lastName.$error.maxlength
          );
      };

      $scope.emailFieldWrongSize = function () {
        return ($scope.submitted) &&
          (
            $scope.createAccountForm.email.$error.minlength ||
            $scope.createAccountForm.email.$error.maxlength
          );
      };

      $scope.passwordFieldWrongSize = function () {
        return ($scope.submitted) &&
          (
            $scope.createAccountForm.password.$error.minlength ||
            $scope.createAccountForm.password.$error.maxlength
          );
      };

      $scope.back = function () {
        $location.path('/login');
      };

    }
  ];

})(module, require, window);
