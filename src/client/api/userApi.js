(function (module, require) {
  'use strict';
  var Q = require('q');
  var agent = require('superagent');

  module.exports = {
    login: function (data) {
      var deferred = Q.defer();
      agent.post('/login/')
        .timeout(5000)
        .send(data)
        .end(function (e, res) {
          if (e) {
            deferred.reject(e);
          } else {
            var success = res.ok;
            var detail = null;
            if (res.body) {
              detail = res.body.detail;
            }
            deferred.resolve({
              success: success,
              detail: detail
            });
          }
        });
      return deferred.promise;
    },
    putUser: function (data) {
      var deferred = Q.defer();
      agent.put('/users/' + data.username + '/')
        .timeout(5000)
        .send(data)
        .end(function (e, res) {
          if (e) {
            deferred.reject(e);
          } else {
            var success = res.ok;
            var detail = null;
            if (res.body) {
              detail = res.body.detail;
            }
            deferred.resolve({
              success: success,
              detail: detail
            });
          }
        });
      return deferred.promise;
    }
  };
})(module, require);