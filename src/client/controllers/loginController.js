(function (module, require, window) {
  'use strict';
  // loginController

  module.exports = function loginController($scope, $http) {
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
      $http.post('/login/', {
        username: $scope.email,
        password: $scope.password
      })
      .success(function(data, status) {
        var success = (status === 200);
        $scope.hideError = success;
        if (!success) {
          $scope.errorMessage = 'There was a problem logging you in: ' +
            data.detail + '.';
        } else {
          window.location = '/views/dashboard/';
        }
        $scope.loading = false;
        $scope.$apply();
      })
      .error(function(data, status) {
        $scope.hideError = false;
        $scope.errorMessage = 'There was an error contacting the server.';
        $scope.loading = false;
        $scope.$apply();
      });
    };

    $scope.emailFieldRequired = function() {
      return ($scope.submitted) && 
        $scope.loginForm.email.$error.required;
    };

    $scope.emailFieldFormat = function() {
      return ($scope.submitted) && 
        $scope.loginForm.email.$error.email;
    };

    $scope.passwordFieldInvalid = function() {
      return ($scope.submitted) && 
        $scope.loginForm.password.$error.required;
    };

  };

})(module, require, window);
