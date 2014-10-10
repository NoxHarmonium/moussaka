(function (require, module) {
  'use strict';

  var colors = require('colors');
  var config = require('../../shared/config.js');
  var simplesmtp = require('simplesmtp');
  var utils = require('../../shared/utils.js');
  var Q = require('q');

  var self = module.exports;

  module.exports = {
    debug: false,
    smtpServer: null,
    messageQueue: [],
    messageDeferred: null,

    start: function (debug) {
      var deferred = Q.defer();

      if (!utils.exists(debug)) {
        debug = false;
      }
      self.debug = debug;

      var emailConfig = config.email_settings;

      console.log(('Starting fake SMTP server on: ' +
        emailConfig.host + ':' + emailConfig.port));

      var smtpServer = simplesmtp.createServer({
        enableAuthentication: true,
        requireAuthentication: true,
        debug: debug,
        ignoreTLS: true,
        disableDNSValidation: true
      });

      smtpServer.listen(emailConfig.port, function (
        err) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });

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

        self.messageQueue.push({
          from: connection.from,
          to: connection.to,
          body: buffer
        });

        if (self.messageDeferred) {
          self.messageDeferred.resolve(self.messageQueue);
          self.messageDeferred = null;
        }

        respCallback(null, 'FAKEQUEUE');

        buffer = '';
      });

      smtpServer.on('authorizeUser', function (connection, username,
        password,
        authCallback) {
        if (username === emailConfig.user &&
          password === emailConfig.password) {
          authCallback(null, true);
        } else {
          authCallback(null, false);
        }
      });

      self.smtpServer = smtpServer;

      return deferred.promise;
    },

    getMessages: function () {
      if (self.messageDeferred === null) {
        self.messageDeferred = Q.defer();
      }
      return self.messageDeferred.promise;
    },

    stop: function () {
      var deferred = Q.defer();
      var smtpServer = self.smtpServer;
      try {
        if (smtpServer) {
          if (self.debug) {
            console.log('simplesmtp: > Qutting.');
          }
          smtpServer.end(function () {
            deferred.resolve();
          });
        } else {
          deferred.resolve();
        }
      } catch (err) {
        deferred.reject(err);
      }
      return deferred.promise;
    }
  };
})(require, module);
