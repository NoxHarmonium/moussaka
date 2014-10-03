(function (module, require, window) {
  'use strict';
  module.exports = ['$scope', 'User', '$location',
    function navigationController($scope, User, $location) {
      $scope.logout = function () {
        User.logout()
          .then(function () {
            window.location = '/views/auth/';
          });
      };
    }
  ];
})(module, require, window);
