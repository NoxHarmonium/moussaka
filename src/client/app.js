'use strict';

//// ## Dashboard Module ##

var dashboardModule = angular.module(
  'dashboardModule', [
    'ngCookies',
    'ui.router',
    'ncy-angular-breadcrumb',
    'angularSpectrumColorpicker'
    ]
);

// Config

dashboardModule.config(require('./config/breadcrumbConfig.js'));

// Directives

dashboardModule.directive('ngEnter',
  require('./directives/ngEnter.js'));

dashboardModule.directive('staticInclude',
  require('./directives/staticInclude.js'));

dashboardModule.directive('slider',
  require('./directives/slider.js'));

// Resources

dashboardModule.factory('User',
  require('./resources/userResource.js'));

dashboardModule.factory('Project',
  require('./resources/projectResource.js'));

dashboardModule.factory('Device',
  require('./resources/deviceResource.js'));

dashboardModule.factory('Profile',
  require('./resources/profileResource.js'));

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

dashboardModule.controller('deviceSessionController',
  require('./controllers/deviceSessionController.js')
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

var authModule = angular.module('authModule', ['ui.router']);

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
