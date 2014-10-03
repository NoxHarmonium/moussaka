(function (module, require, window) {
  'use strict';
  module.exports = ['$q', '$location',
    function ($q, $location) {
      var jQuery = require('jquery');
      var progressShown = false;
      var showProgress = function () {
        if (!progressShown) {
          jQuery.progress.show();
          progressShown = true;
        }
      };

      var hideProgress = function () {
        if (progressShown) {
          jQuery.progress.hide();
          progressShown = false;
        }
      };


      return {
        response: function (response) {
          return response || $q.when(response);
        },
        responseError: function (rejection) {
          if (rejection.status === 401 &&
              rejection.config.method === 'GET') {
            $location.url('/views/auth#/login');
          }
          return $q.reject(rejection);
        }
      };
    }
  ];
})(module, require, window);
