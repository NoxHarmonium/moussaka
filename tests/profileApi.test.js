(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var utils = require('../src/shared/utils.js');
  var serverModule = require('../src/server/server.js');
  var config = require('../src/shared/config.js');
  var _ = require('lodash');
  var Q = require('q');
  var S = require('string');

  var _formatTestIndex = function (index) {
    // Mongo uses alphabetical sorting so simply appending
    // numbers doesn't sort properly. 
    return S(index)
      .padLeft(3, '0');
  };

  describe('Project API tests', function () {
    var id;
    var users = testData.getTestUsers();
    var projects = testData.getTestProjects();
    var devices = testData.getTestDevices();
    var agent = superagent.agent();
    var project = null;
    var profileId = null;
    var device = null;

    it('Reset profiles test', function (done) {
      agent.get('http://localhost:3000/test/profile_api/reset/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Login user [2]', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[2])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });
    });

    it('Get project created by device API tests', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.length)
            .to.be(1);

          project = res.body[0];

          done();
        });
    });

    it('Get device created by device API tests', function (done) {
      agent.get('http://localhost:3000/projects/' +
        project._id + '/devices/' + devices[0].macAddress + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          device = res.body;

          done();
        });
    });

    it(
      'Save current session as profile [0] without device ID query string',
      function (done) {
        var data = {
          profileName: 'test profile 1'
        };

        agent.put('http://localhost:3000/projects/' +
          device.projectId + '/profiles/')
          .send(data)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(409);

            done();
          });
      });

    it('Save current session as profile [0] with non existant project',
      function (done) {

        var data = {
          profileName: 'test profile 1'
        };

        agent.put('http://localhost:3000/projects/' +
          '000000000000000000000000' + '/profiles/')
          .query({
            deviceId: device._id
          })
          .send(data)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Save current session as profile [0] with no name', function (
      done) {
      var data = {};

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .query({
          deviceId: device._id
        })
        .send(data)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);

          done();
        });
    });

    it('Save current session as profile [0]', function (done) {
      var data = {
        profileName: 'test profile 1'
      };

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .query({
          deviceId: device._id
        })
        .send(data)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body._id)
            .to.be.ok();

          profileId = res.body._id;

          done();
        });
    });

    it('Retrieve profile [0] from non existant project', function (done) {

      agent.get('http://localhost:3000/projects/' +
        '000000000000000000000000/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Retrieve profile [0]', function (done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var profile = res.body;

          expect(utils.objMatch(
            device.currentState,
            profile.profileData))
            .to.be.ok();

          done();
        });
    });

    it('List profiles [0] of project [0]', function (done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var profile = res.body[0];

          expect(utils.objMatch(
            device.currentState,
            profile.profileData))
            .to.be.ok();

          done();
        });
    });

    it('List profiles [0] of project [0] filtered to ' +
      'project version \'0.3\'', function (done) {

        agent.get('http://localhost:3000/projects/' +
          device.projectId + '/profiles/')
          .query({
            projectVersion: '0.3'
          })
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be.ok();

            var profile = res.body[0];

            expect(utils.objMatch(
              device.currentState,
              profile.profileData))
              .to.be.ok();

            done();
          });
      });

    it('List profiles [0] of project [0] filtered to ' +
      'project version \'0.4\'', function (done) {

        agent.get('http://localhost:3000/projects/' +
          device.projectId + '/profiles/')
          .query({
            projectVersion: '0.4'
          })
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be.ok();

            expect(res.body.length)
              .to.be(0);

            done();
          });
      });

    it('List profiles [0] of non existant project', function (done) {

      agent.get('http://localhost:3000/projects/' +
        '000000000000000000000000' + '/profiles/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Logout user [2]', function (done) {
      agent.get('http://localhost:3000/logout/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Retrieve profile [0] while not logged in', function (done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be.ok(401);

          done();
        });
    });

    it('List profiles [0] of project [0] while not logged in', function (
      done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('Login user [1]', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[1])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });
    });


    it('Delete profile [0] as non owner', function (done) {

      agent.del('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);

          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('Retrieve profile [0]', function (done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var profile = res.body;

          expect(utils.objMatch(
            device.currentState,
            profile.profileData))
            .to.be.ok();

          done();
        });
    });

    it('Logout user [1]', function (done) {
      agent.get('http://localhost:3000/logout/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Login user [0]', function (done) {
      var user = users[0];
      agent.post('http://localhost:3000/login/')
        .send(user)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });
    });

    it('Retrieve profile [0] as non project member', function (done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('List profiles [0] of project [0] as non member', function (done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('Logout user [0]', function (done) {
      agent.get('http://localhost:3000/logout/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Login user [2]', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[2])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });
    });

    it('Delete profile [0] from non existant project', function (done) {

      agent.del('http://localhost:3000/projects/' +
        '000000000000000000000000' + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Delete profile [0]', function (done) {

      agent.del('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Retrieve profile [0] after deletion', function (done) {

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + profileId + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Delete non existant profile', function (done) {

      agent.del('http://localhost:3000/projects/' +
        device.projectId + '/profiles/' + 'fdsdfdfsfd' + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Create 200 profiles', function (done) {
      var profile = {
        profileName: 'TEST_DATA_DELETE'
      };

      var currentProjectIndex = 0;
      var maxProjectIndex = 200;

      var createTestProject = function (index) {
        var deferred = Q.defer();

        profile.profileName = 'TEST_DATA_DELETE_' +
          _formatTestIndex(currentProjectIndex);

        agent.put('http://localhost:3000/projects/' +
          device.projectId + '/profiles/')
          .query({
            deviceId: device._id
          })
          .send(profile)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be.ok();
            deferred.resolve();
            currentProjectIndex++;
          });
        return deferred.promise;
      };

      // Chain calls sequentially
      var result = createTestProject();
      for (var i = 1; i < maxProjectIndex; i++) {
        result = result.then(createTestProject);
      }
      result.then(function () {
        done(); // Finish test step
      });
    });

    it('List profiles to test record limit', function (done) {
      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be(config.max_records_per_query);
          done();
        });
    });

    it('Test pagination (20-39)', function (done) {
      var min = 20;
      var max = 39;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].profileName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (30-40)', function (done) {
      var min = 30;
      var max = 40;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].profileName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (40-30)', function (done) {
      var min = 40;
      var max = 30;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);

          done();
        });
    });

    it('Test pagination (30-30)', function (done) {
      var min = 30;
      var max = 30;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].profileName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (10-90)', function (done) {
      var min = 10;
      var max = 90;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/profiles/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          max = min + config.max_records_per_query - 1;

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].profileName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

  });

})(require, describe, it);
