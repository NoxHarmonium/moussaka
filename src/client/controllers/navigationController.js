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

      $scope.closeUserDropdown = function (e) {
        var dropdown = $('#userDropdownToggle').data('dropdown');
        $.proxy(dropdown.hide, dropdown)();
      };
    }
  ];
})(module, require, window);
