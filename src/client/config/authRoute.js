(function (module, require) {
  'use strict';
  module.exports = ['$routeProvider',
    function ($routeProvider) {
      $routeProvider.
      when('/login', {
        templateUrl: '/views/partials/login',
        controller: 'loginController'
      })
        .
      when('/createAccount', {
        templateUrl: '/views/partials/createAccount',
        controller: 'createAccountController'
      })
        .
      otherwise({
        redirectTo: '/login'
      });
    }
  ];
})(module, require);
