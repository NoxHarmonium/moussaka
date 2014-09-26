'use strict';
var angular = require('./libs/angular.js');
var kube = require('./libs/kube.js');

//// ## Dashboard Module ##

var dashboardModule = angular.module('dashboardModule', ['ngRoute']);

// Resources

dashboardModule.factory('User',
  require('./resources/userResource.js'));

dashboardModule.factory('Projects',
  require('./resources/projectResource.js'));

// Controllers

dashboardModule.controller('navigationController', ['$scope', 'User',
  require('./controllers/navigationController.js')
]);

dashboardModule.controller('projectsListController', ['$scope', 'Projects',
  require('./controllers/projectsListController.js')
]);

dashboardModule.controller('projectEditController', ['$scope', 'Projects',
  require('./controllers/projectEditController.js')
]);

// Routes

dashboardModule.config(require('./config/dashboardRoute.js'));

// Interceptors

dashboardModule.factory('authIntercept', ['$q', require(
  './config/authIntercept.js')]);
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

authModule.controller('loginController', ['$scope', '$http', 'User',
  require('./controllers/loginController.js')
]);

authModule.controller('createAccountController', ['$scope', '$http', 'User',
  require('./controllers/createAccountController.js')
]);

// Routes
authModule.config(require('./config/authRoute.js'));
