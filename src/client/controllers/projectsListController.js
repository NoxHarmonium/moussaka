(function (module, require) {
  'use strict';

  module.exports = function projectsListController($scope, Projects) {
    $scope.projects = Projects.get();
  };

})(module, require);
