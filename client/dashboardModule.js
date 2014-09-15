'use strict';

require('angular/angular');
require('angular-route/angular-route');
require('angular-resource/angular-resource');
var testProjects = require('../tests/testData.js').getTestProjects();

var agent = require('superagent');
var Q = require('q');
var dashboardModule = angular.module('dashboardModule', ['ngRoute','ngResource']);


//projectModule.config(['$resourceProvider', function ($resourceProvider) {
   // Don't strip trailing slashes from calculated URLs
//   $resourceProvider.defaults.stripTrailingSlashes = false;
 //}]);

dashboardModule.factory('Projects', function($resource){
    return $resource('/projects/', {})
});




dashboardModule.controller('listController', ['$scope', 'Projects', function($scope, Projects) {
    $scope.projects = testProjects;
   
    //Projects.query(function(response) {
    //  $scope.projects = response;
    //});
}]);    

dashboardModule.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/listProjects', {
        templateUrl: 'partials/listProjects',
        controller: 'listController'
      }).
      otherwise({
        redirectTo: '/listProjects'
      });
  }]);