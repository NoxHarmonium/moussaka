(function (require, describe, it, before, after) {
  'use strict';

  var serverModule = require('../src/server/server.js');
  var expect = require('expect.js');
  var colors = require('colors');
  var fs = require('fs');

  before(function (done) {
    // Write server logs to file to make tests cleaner
    serverModule.logFile = fs.createWriteStream('httpRequests.log');
    // Start server
    serverModule.start(function (e, server) {
      expect(e)
        .to.eql(null);

      done();
    });
  });

  after(function (done) {
    serverModule.stop();
    serverModule.logFile.end();
    done();
  });



})(require, describe, it, before, after);
