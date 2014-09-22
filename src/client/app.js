'use strict';

var angular = require('angular');
require('angular-route');
require('angular-resource');

var testProjects = require('../../tests/testData').getTestProjects();

// Dashboard Module

var dashboardModule = angular.module('dashboardModule', 
  ['ngRoute', 'ngResource']);

dashboardModule.factory('Projects', function ($resource) {
  return $resource('/projects/', {});
});

dashboardModule.controller('listController', ['$scope', 'Projects',
 require('./controllers/projectsListController.js')
]);

dashboardModule.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
    when('/listProjects', {
      templateUrl: 'partials/listProjects',
      controller: 'listController'
    })
      .
    otherwise({
      redirectTo: '/listProjects'
    });
  }
]);

// Auth Module

var authModule = angular.module('authModule', ['ngRoute']);
authModule.controller('loginController', 
  require('./controllers/loginController.js'));
authModule.controller('createAccountController',
  require('./controllers/createAccountController.js'));

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