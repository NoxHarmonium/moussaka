(function (module, require, window) {
  'use strict';
  module.exports = ['$breadcrumbProvider',
    function ($breadcrumbProvider) {
      $breadcrumbProvider.setOptions({
        templateUrl: '/views/partials/navTemplate'
      });
    }
  ];
})(module, require, window);
