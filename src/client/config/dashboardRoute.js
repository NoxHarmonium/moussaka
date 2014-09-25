(function (module, require) {
  'use strict';
  module.exports = ['$routeProvider',
    function ($routeProvider) {
      $routeProvider.
      when('/listProjects', {
        templateUrl: '/views/partials/listProjects',
        controller: 'projectsListController'
      })
        .
      when('/editProject', {
        templateUrl: '/views/partials/editProject',
        controller: 'editProjectController'
      })
        .otherwise({
          redirectTo: '/listProjects'
        });
    }
  ];
})(module, require);
