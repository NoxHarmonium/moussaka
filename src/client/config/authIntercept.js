(function (module, require, window) {
  'use strict';
  module.exports =
    function () {
      return {
        'responseError': function(response) {
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
