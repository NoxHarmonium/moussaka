(function (module, require) {
  'use strict';

  var extend = require('extend');

  module.exports = ['$scope', 'Project', 'locationPatched', 
  '$cookieStore',
    function projectsListController($scope, Project, locationPatched, 
      $cookieStore) {

      // Scope vars/defaults
      $scope.sortVars = {
        sortField: 'name',
        sortDir: 'desc'
      };
      $scope.activeIndex = 0;

      // Functions

      $scope.reloadCookies = function() {
        var sortField = $cookieStore.get('sortField');
        var sortDir = $cookieStore.get('sortDir');
        var activeIndex = $cookieStore.get('activeIndex');
        if (sortField) {
          $scope.sortVars.sortField = sortField;
        }
        if (sortDir) {
          $scope.sortVars.sortDir = sortDir;
        }
        if (activeIndex) {
          $scope.activeIndex = parseInt(activeIndex);
        }
      };

      $scope.saveCookies = function() {
        $cookieStore.put('sortField', $scope.sortVars.sortField);
        $cookieStore.put('sortDir', $scope.sortVars.sortDir);
        $cookieStore.put('activeIndex', $scope.activeIndex);
      };

      // TODO: Pagination
      $scope.getProjects = function() {
        var queryVars = locationPatched.search();
        $scope.reloadCookies();
        $scope.sortVars = extend($scope.sortVars, queryVars);

        Project.getAll($scope.sortVars)
          .then(function (projects) {
            $scope.projects = projects;
          })
          .catch(function (err) {
            // TODO: Error message
          });
      };

      $scope.changeSorting = function(activeIndex, field, direction) {
        $scope.activeIndex = activeIndex;
        locationPatched.skipReload().search({
          'sortField': field,
          'sortDir': direction
        });
        $scope.saveCookies();
        $scope.getProjects();
      };

      // Initialization
      $scope.getProjects();
    }
  ];

})(module, require);
