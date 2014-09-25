'use strict';

var angular = require('angular');
var angularRoute = require('angular-route');

var testProjects = require('../../tests/testData')
  .getTestProjects();

// Dashboard Module

var dashboardModule = angular.module('dashboardModule', ['ngRoute']);

dashboardModule.factory('Projects',
  require('./resources/projectResource.js'));

dashboardModule.controller('listController', ['$scope', 'Projects',
  require('./controllers/projectsListController.js')
]);

dashboardModule.config(require('./config/dashboardRoute.js'));

dashboardModule.factory('authIntercept', require('./config/authIntercept.js'));
dashboardModule.config(['$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push('authIntercept');
  }
]);

// Auth Module

var authModule = angular.module('authModule', ['ngRoute']);
authModule.directive('watchChange', require('./directives/watchChange.js'));
authModule.factory('User',
  require('./resources/userResource.js'));

authModule.controller('loginController', ['$scope', '$http', 'User',
  require('./controllers/loginController.js')
]);
authModule.controller('createAccountController', ['$scope', '$http', 'User',
  require('./controllers/createAccountController.js')
]);
authModule.config(require('./config/authRoute.js'));
