(function (module, require) {
  'use strict';
  var userApi = require('../api/userApi.js');

  // createAccountController.js
  module.exports = function ($scope) {
    $scope.username = '';
    $scope.password = '';
    $scope.loading = false;
    $scope.hideError = true;
    $scope.errorMessage = '';

    $scope.formCreateAccount = function () {
      $scope.loading = true;
      userApi.putUser({
        username: $scope.username,
        password: $scope.password
      })
        .then(function (result) {
          $scope.hideError = result.success;
          if (!result.success) {
            $scope.errorMessage =
              'There was a problem creating your account: ' + result.detail +
              '.';
          } else {
            console.log('Redirect to create success.');
          }
        })
        .catch(function (err) {
          $scope.hideError = false;
          $scope.errorMessage = 'There was an error contacting the server.';
        })
        .finally(function () {
          $scope.loading = false;
          $scope.$apply();
        })
        .done();
    };
  };
})(module, require);
