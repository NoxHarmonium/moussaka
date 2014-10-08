(function (module, require) {
  'use strict';

  var extend = require('extend');

  module.exports = ['$scope', 'Project', '$location',
    '$cookieStore',
    function projectsListController($scope, Project, $location,
      $cookieStore) {

      // Scope vars/defaults
      $scope.sortingOptions = [{
        sortField: 'sortingName',
        sortDir: 'asc'
      }, {
        sortField: 'sortingName',
        sortDir: 'desc'
      }, {
        sortField: 'updatedAt',
        sortDir: 'desc'
      }];
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
      $scope.loading = true;

      // Functions

      $scope.restorePageNumber = function () {
        var minRecord = $location.search().minRecord;
        if (minRecord) {
          $scope.currentPage = Math.floor(minRecord / $scope.pageSize) + 1;
        }
      };

      $scope.getProjects = function () {
        $scope.loading = true;
        var queryVars = $location.search();
        $scope.queryVars = extend($scope.queryVars, queryVars);

        Project.getAll($scope.queryVars)
          .then(function (response) {
            $scope.projects = response.projects;
            $scope.totalPages =
              Math.ceil(response.totalRecords / $scope.pageSize);
            $scope.loading = false;
          })
          .catch(function (err) {
            // TODO: Error message
          });
      };

      $scope.isHighlighted = function (sortingOption) {
        return $scope.queryVars.sortField === sortingOption.sortField &&
          $scope.queryVars.sortDir === sortingOption.sortDir;
      };

      $scope.changeSorting = function (sortingOption) {
        if ($scope.loading) {
          return;
        }
        $scope.queryVars.sortField = sortingOption.sortField;
        $scope.queryVars.sortDir = sortingOption.sortDir;
        $location.search('sortField', sortingOption.sortField);
        $location.search('sortDir', sortingOption.sortDir);
        $scope.getProjects();
      };

      $scope.changePaging = function () {
        var minRecord = ($scope.currentPage - 1) * $scope.pageSize;
        var maxRecord = minRecord + $scope.pageSize - 1;
        $location.search('minRecord', minRecord);
        $location.search('maxRecord', maxRecord);
        $scope.getProjects();
      };

      $scope.getTotalContributors = function (project) {
        return project.users.length + project.admins.length;
      };

      $scope.nextPage = function () {
        if ($scope.loading) {
          return;
        }
        if ($scope.currentPage < $scope.totalPages) {
          $scope.currentPage++;
          $scope.changePaging();
        }
      };

      $scope.prevPage = function () {
        if ($scope.loading) {
          return;
        }
        if ($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.changePaging();
        }

      };

      // Initialization
      $scope.restorePageNumber();
      $scope.getProjects();
    }
  ];

})(module, require);
