(function (require, describe, it, before, after) {
  'use strict';

  var serverModule = require('../src/server.js');
  var expect = require('expect.js');
  var colors = require('colors');

  before(function (done) {
    serverModule.start(function (e, server) {
      expect(e)
        .to.eql(null);

      done();
    });
  });

  after(function (done) {
    serverModule.stop();
    done();
  });



})(require, describe, it, before, after);
