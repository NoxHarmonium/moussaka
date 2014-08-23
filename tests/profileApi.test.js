(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var utils = require('../include/utils.js');
  var serverModule = require('../server.js');


  describe('Project API tests', function () {
    var id;
    var users = testData.getTestUsers();
    var projects = testData.getTestProjects();
    var projectsExt = testData.getTestProjectsExt();
    var profiles = testData.getTestProfiles();
    var devices = testData.getTestDevices();
    var agent = superagent.agent();
    var session = null;
    var profile = null;

    it('Start server', function (done) {
      serverModule.start(function (e, server) {
        expect(e)
          .to.eql(null);

        done();
      });
    });

    it('Get session created by deviceApi tests', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/sessions/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.length)
            .to.be(1);
          session = res.body[0];
          device._id = session.device._id;

          done();
        });
    });

    it('Save current session as profile [0]', function (done) {
      var device = devices[0];
      var data = {
        sessionId: session._id,
        profileName: 'test profile 1'
      };

      agent.put('http://localhost:3000/profiles/')
        .send(data)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body._id)
            .to.be.ok();
          profile = res.body;

          done();
        });
    });

    it('Retrieve profile [0]', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/profiles/' + profile._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var savedState = res.body;

          expect(
            utils.objMatch(
              session.device.currentState,
              savedState)
          )
            .to.be.ok();

          done();
        });
    });

  });

})(require, describe, it);
