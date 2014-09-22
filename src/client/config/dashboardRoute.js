(function (module, require) {
  'use strict';
  module.exports = ['$routeProvider',
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
  ];
})(module, require);
