'use strict';
var angular = require('./libs/angular.js');
var kube = require('./libs/kube.js');
var jQueryPlugins = require('./libs/jQueryPlugins.js');

//// ## Dashboard Module ##

var dashboardModule = angular.module(
  'dashboardModule', ['ngRoute', 'ngCookies']
);

// Config

dashboardModule.factory('locationPatched', require('./config/locationFix.js'));

// Directives

dashboardModule.directive('ngEnter', require('./directives/ngEnter.js'));

// Resources

dashboardModule.factory('User',
  require('./resources/userResource.js'));

dashboardModule.factory('Project',
  require('./resources/projectResource.js'));

// Controllers

dashboardModule.controller('navigationController',
  require('./controllers/navigationController.js')
);

dashboardModule.controller('projectsListController',
  require('./controllers/projectsListController.js')
);

dashboardModule.controller('projectEditController',
  require('./controllers/projectEditController.js')
);

dashboardModule.controller('projectViewController',
  require('./controllers/projectViewController.js')
);

// Routes

dashboardModule.config(require('./routes/dashboardRoute.js'));

// Interceptors

dashboardModule.factory('authIntercept', require(
  './config/authIntercept.js'));
dashboardModule.config(['$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push('authIntercept');
  }
]);

//// ## Auth Module ##

var authModule = angular.module('authModule', ['ngRoute']);

// Directives

authModule.directive('watchChange', require('./directives/watchChange.js'));

// Resources

authModule.factory('User',
  require('./resources/userResource.js'));

// Controllers

authModule.controller('loginController',
  require('./controllers/loginController.js')
);

authModule.controller('createAccountController',
  require('./controllers/createAccountController.js')
);

// Routes
authModule.config(require('./routes/authRoute.js'));
