(function (module, require) {
  'use strict';

  module.exports = ['$scope', 'Project',
    function projectsListController($scope, Project) {
      // TODO: Pagination
      Project.getAll()
        .then(function (projects) {
          $scope.projects = projects;
        })
        .catch(function (err) {
          // TODO: Error message
        });
    }
  ];

})(module, require);
