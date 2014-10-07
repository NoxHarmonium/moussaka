(function (module, require) {
  'use strict';
  module.exports = ['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/listProjects');

      $stateProvider.
      state('listProjects', {
        url: '/listProjects',
        templateUrl: '/views/partials/listProjects',
        controller: 'projectsListController',
        data: {
          ncyBreadcrumbLabel: 'Projects'
        }
      })
        .state('createProject', {
          url: '/editProject/',
          templateUrl: '/views/partials/editProject',
          controller: 'projectEditController',
          data: {
            ncyBreadcrumbLabel: 'New Project',
            ncyBreadcrumbParent: 'listProjects'
          }
        })
        .state('editProject', {
          url: '/editProject/:projectId',
          templateUrl: '/views/partials/editProject',
          controller: 'projectEditController',
          data: {
            ncyBreadcrumbLabel: '{{project.name}}',
            ncyBreadcrumbParent: 'listProjects'
          }
        })
        .state('viewProject', {
          url: '/viewProject/:projectId',
          templateUrl: '/views/partials/viewProject',
          controller: 'projectViewController',
          data: {
            ncyBreadcrumbLabel: '{{project.name}}',
            ncyBreadcrumbParent: 'listProjects'
          }
        });
    }
  ];
})(module, require);
