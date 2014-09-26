(function (module, require) {
  'use strict';

  module.exports = ['$scope', 'Projects',
    function projectsListController($scope, Projects) {
      $scope.projects = Projects.get();
    }
  ];

})(module, require);
