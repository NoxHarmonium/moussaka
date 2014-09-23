'use strict';

var angular = require('angular');
require('angular-route');
require('angular-resource');

var testProjects = require('../../tests/testData')
  .getTestProjects();

// Dashboard Module

var dashboardModule = angular.module('dashboardModule', 
  ['ngRoute','ngResource']
);



dashboardModule.config(['$resourceProvider', function ($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  //$resourceProvider.defaults.stripTrailingSlashes = false;
}]); 

dashboardModule.factory('Projects', function ($resource) {
  return $resource('/projects/', {});
});

dashboardModule.controller('listController', ['$scope', 'Projects',
  require('./controllers/projectsListController.js')
]);

dashboardModule.config(require('./config/dashboardRoute.js'));

dashboardModule.factory('authIntercept', require('./config/authIntercept.js'));
dashboardModule.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('authIntercept');
}]);

// Auth Module

var authModule = angular.module('authModule', ['ngRoute']);
authModule.controller('loginController', ['$scope', '$http',
  require('./controllers/loginController.js')]);
authModule.controller('createAccountController',
  require('./controllers/createAccountController.js'));
authModule.config(require('./config/authRoute.js')); 
