(function (module, require) {
  'use strict';
  // loginController
  var userApi = require('../api/userApi.js');

  module.module = function ($scope) {
    $scope.username = '';
    $scope.password = '';
    $scope.loading = false;
    $scope.hideError = true;
    $scope.errorMessage = '';

    $scope.formLogin = function () {
      $scope.loading = true;
      userApi.login({
        username: $scope.username,
        password: $scope.password
      })
        .then(function (result) {
          $scope.hideError = result.success;
          if (!result.success) {
            $scope.errorMessage = 'There was a problem logging you in: ' +
              result.detail + '.';
          } else {
            console.log('Redirect to login success.');
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