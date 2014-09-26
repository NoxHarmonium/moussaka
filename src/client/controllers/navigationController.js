(function (module, require) {
  'use strict';
  module.exports = ['$scope', 'User',
    function navigationController($scope, User) {
      $scope.logout = function () {
        User.logout()
          .then(function () {
            window.location = '/views/auth/#/login';
          });
      };
    }
  ];
})(module, require);
