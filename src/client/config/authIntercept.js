(function (module, require, window) {
  'use strict';
  module.exports = ['$q',
    function ($q) {
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
        'request': function (config) {
          return config;
        },
        'requestError': function (rejection) {
          return $q.reject(rejection);
        },
        'response': function (response) {
          return response;
        },
        'responseError': function (response) {
          var status = response.status;

          if (status === 401) {
            // Redirect to login
            window.location = '/views/auth#/login';
          }

          // otherwise
          return;
        }
      };
    }
  ];
})(module, require, window);
