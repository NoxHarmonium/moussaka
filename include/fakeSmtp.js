(function (require, module) {
  'use strict';

  var colors = require('colors');
  var config = require('./config.js');
  var simplesmtp = require('simplesmtp');
  var utils = require('./utils.js');
  var smtpServer;

  module.exports = {
    debug: false,

    start: function (recvCallback, errorCallback, debug) {
      if (!utils.exists(debug)) {
        debug = false;
      }
      module.exports.debug = debug;

      var emailConfig = config.email_settings;

      console.log(('Starting fake SMTP server on: ' +
        emailConfig.host + ':' + emailConfig.port));

      smtpServer = simplesmtp.createServer({
        enableAuthentication: true,
        requireAuthentication: true,
        debug: debug,
        ignoreTLS: true,
        disableDNSValidation: true
      });

      smtpServer.listen(emailConfig.port, errorCallback);

      var buffer = '';

      smtpServer.on('data', function (connection, chunk) {
        buffer += chunk;
      });

      smtpServer.on('dataReady', function (connection, respCallback) {
        if (debug) {
          console.log('simplesmtp: > Email has been received.');
          console.log('simplesmtp: > req.from: ' + connection.from + '.');
          console.log('simplesmtp: > message: ' + buffer);
          console.log('simplesmtp: > accepting.');
        }

        if (recvCallback) {
          recvCallback({
            from: connection.from,
            to: connection.to,
            body: buffer
          });
        }

        respCallback(null, 'FAKEQUEUE');

        buffer = '';
      });

      smtpServer.on('authorizeUser', function (connection, username, password,
        authCallback) {
        if (username === emailConfig.user &&
          password === emailConfig.password) {
          authCallback(null, true);
        } else {
          authCallback(null, false);
        }
      });
    },

    stop: function () {
      if (smtpServer) {
        if (module.exports.debug) {
          console.log('simplesmtp: > Qutting.');
        }
        smtpServer.quit();
      }
    }
  };
})(require, module);
