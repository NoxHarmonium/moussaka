'use strict';

require('angular/angular');
require('angular-route/angular-route');

var agent = require('superagent');
var Q = require('q');
var authModule = angular.module('authModule', ['ngRoute']);

var performLogin = function (data) {
  var deferred = Q.defer();
  agent.post('/login/')
    .timeout(5000)
    .send(data)
    .end(function (e, res) {
      if (e) {
        deferred.reject(e);
      } else {
        var success = res.ok;
        var detail = null;
        if (res.body) {
          detail = res.body.detail;
        }
        deferred.resolve({
          success: success,
          detail: detail
        });
      }
    });
  return deferred.promise;
};

var performCreateAccount = function (data) {
  var deferred = Q.defer();
  agent.put('/users/' + data.username + '/')
    .timeout(5000)
    .send(data)
    .end(function (e, res) {
      if (e) {
        deferred.reject(e);
      } else {
        var success = res.ok;
        var detail = null;
        if (res.body) {
          detail = res.body.detail;
        }
        deferred.resolve({
          success: success,
          detail: detail
        });
      }
    });
  return deferred.promise;
};


authModule.controller('loginController', function ($scope) {
  $scope.username = '';
  $scope.password = '';
  $scope.loading = false;
  $scope.hideError = true;
  $scope.errorMessage = '';

  $scope.formLogin = function () {
    $scope.loading = true;
    performLogin({
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
});

authModule.controller('createAccountController', function ($scope) {
  $scope.username = '';
  $scope.password = '';
  $scope.loading = false;
  $scope.hideError = true;
  $scope.errorMessage = '';

  $scope.formCreateAccount = function () {
    $scope.loading = true;
    performCreateAccount({
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
});

authModule.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
    when('/login', {
      templateUrl: 'partials/login',
      controller: 'loginController'
    })
      .
    when('/createAccount', {
      templateUrl: 'partials/createAccount',
      controller: 'createAccountController'
    })
      .
    otherwise({
      redirectTo: '/login'
    });
  }
]);
