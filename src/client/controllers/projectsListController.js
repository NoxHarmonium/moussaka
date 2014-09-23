(function (module, require) {
  'use strict';

  module.exports = function projectsListController($scope, Projects) {
    $scope.projects = Projects.query();
  };

})(module, require);
