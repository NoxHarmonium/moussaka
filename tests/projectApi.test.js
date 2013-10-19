(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var rek = require('rekuire');
  var testData = rek('testData.js');

  describe('Project API tests', function () {
    var id;
    var users = testData.testUsers;
    var agent = superagent.agent();

    it('List projects', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });

    });


  });

})(require, describe, it);
