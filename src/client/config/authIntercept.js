(function (module, require, window) {
  'use strict';
  module.exports =
    function ($q) {
      var jQuery = require('jquery');
      return {
        'request': function (config) {
          jQuery.progress.show();
          return config;
        },
        'requestError': function (rejection) {
          jQuery.progress.hide();
          return $q.reject(rejection);
        },
        'response': function (response) {
          jQuery.progress.hide();
          return response;
        },
        'responseError': function (response) {
          jQuery.progress.hide();
          var status = response.status;

          if (status === 401) {
            // Redirect to login
            window.location = '/views/auth#/login';
            return;
          }

          // otherwise
          return response;
        }
      };
  };
})(module, require, window);
