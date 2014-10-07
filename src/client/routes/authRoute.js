(function (module, require) {
  'use strict';
  module.exports = ['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/login');

      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: '/views/partials/login',
          controller: 'loginController'
        })
        .state('createAccount', {
          url: '/createAccount',
          templateUrl: '/views/partials/createAccount',
          controller: 'createAccountController'
        });
    }
  ];
})(module, require);
