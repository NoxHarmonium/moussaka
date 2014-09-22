(function (module, require) {
  'use strict';
  module.exports = ['$routeProvider',
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
  ];
})(module, require);
