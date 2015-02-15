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
            ncyBreadcrumbLabel: '{{project.name || \'New Project\'}}',
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
        })
        .state('deviceSession', {
          url: '/viewProject/:projectId/session/:deviceId',
          templateUrl: '/views/partials/deviceSession',
          controller: 'deviceSessionController',
          data: {
            ncyBreadcrumbLabel: '{{device.deviceName}}',
            ncyBreadcrumbParent: 'viewProject'
          }
        })
        .state('userPreferences', {
          url: '/viewProject/userPreferences',
          templateUrl: '/views/partials/userPreferences',
          controller: 'userPreferencesController',
          data: {
            ncyBreadcrumbLabel: 'User Preferences',
            ncyBreadcrumbParent: 'listProjects'
          }
        });
    }
  ];
})(module, require);
