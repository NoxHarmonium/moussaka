(function (module, require) {
  'use strict';

  var extend = require('extend');

  module.exports = ['$scope', 'Project', '$location',
    '$cookieStore',
    function projectsListController($scope, Project, $location,
      $cookieStore) {

      // Scope vars/defaults
      $scope.pageSize = 10;
      $scope.queryVars = {
        sortField: 'sortingName',
        sortDir: 'asc',
        minRecord: 0,
        maxRecord: $scope.pageSize
      };
      $scope.activeIndex = 0;
      $scope.currentPage = 1;
      $scope.totalPages = 1;

      // Functions

      $scope.reloadCookies = function () {
        var sortField = $cookieStore.get('sortField');
        var sortDir = $cookieStore.get('sortDir');
        var activeIndex = $cookieStore.get('activeIndex');
        if (sortField) {
          $scope.queryVars.sortField = sortField;
        }
        if (sortDir) {
          $scope.queryVars.sortDir = sortDir;
        }
        if (activeIndex) {
          $scope.activeIndex = parseInt(activeIndex);
        }
      };

      $scope.saveCookies = function () {
        $cookieStore.put('sortField', $scope.queryVars.sortField);
        $cookieStore.put('sortDir', $scope.queryVars.sortDir);
        $cookieStore.put('activeIndex', $scope.activeIndex);
      };

      $scope.getProjects = function () {
        $scope.reloadCookies();
        var queryVars = $location.search();
        $scope.queryVars = extend($scope.queryVars, queryVars);

        Project.getAll($scope.queryVars)
          .then(function (response) {
            $scope.projects = response.projects;
            $scope.totalPages = 
              Math.ceil(response.totalRecords / $scope.pageSize);
          })
          .catch(function (err) {
            // TODO: Error message
          });
      };

      $scope.changeSorting = function (activeIndex, sortField, sortDir) {
        $scope.activeIndex = activeIndex;
        $scope.queryVars.sortField = sortField;
        $scope.queryVars.sortDir = sortDir;
        $location.search('sortField', sortField);
        $location.search('sortDir', sortDir);
        $scope.saveCookies();
        $scope.getProjects();
      };

      $scope.changePaging = function() {
        var minRecord = ($scope.currentPage - 1) * $scope.pageSize;
        var maxRecord = minRecord + $scope.pageSize;
        $scope.getProjects();
      };

      $scope.getTotalContributors = function (project) {
        return project.users.length + project.admins.length;
      };

      $scope.nextPage = function () {
        if($scope.currentPage < $scope.totalPages) {
          $scope.currentPage++;
          $scope.changePaging();
        } 
      };

      $scope.prevPage = function () {
        if($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.changePaging();
        } 

      };

      // Initialization
      $scope.getProjects();
    }
  ];

})(module, require);
