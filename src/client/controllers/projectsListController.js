(function (module, require) {
  'use strict';

  module.exports = function ($scope, Projects) {
    $scope.projects = Projects.query();
  };

})(module, require);
