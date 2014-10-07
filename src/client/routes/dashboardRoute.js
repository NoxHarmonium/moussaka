(function (module, require) {
  'use strict';
  module.exports = ['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/listProjects');

      $stateProvider.
      state('listProjects', {
        url: '/listProjects',
        templateUrl: '/views/partials/listProjects',
        controller: 'projectsListController'
      })
      .state('createProject', {
        url: '/editProject/',
        templateUrl: '/views/partials/editProject',
        controller: 'projectEditController'
      })
      .state('editProject', {
        url: '/editProject/:projectId',
        templateUrl: '/views/partials/editProject',
        controller: 'projectEditController'
      })
      .state('viewProject', {
        url: '/viewProject/:projectId',
        templateUrl: '/views/partials/viewProject',
        controller: 'projectViewController'
      });
    }
  ];
})(module, require);
