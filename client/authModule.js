'use strict';

require('angular/angular');
var authModule = angular.module('authModule', []);

authModule.controller('loginController', function($scope) {
  $scope.username = '';
  $scope.password = '';
});

console.log('test test test');


