(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var utils = require('../include/utils.js');
  var config = require('../include/config.js');
  var serverModule = require('../server.js');
  var _ = require('lodash');
  var Q = require('q');
  var S = require('string');
  var Chance = require('chance');

  describe('Device API tests', function () {
    var id;
    var users = testData.getTestUsers();
    var projects = testData.getTestProjects();
    var devices = testData.getTestDevices();
    var agent = superagent.agent();
    var session = null;
    var schema = null;
    var sentUpdates = null;
    var tempStore = {};
    var chance = new Chance();

    it('Start server', function (done) {
      serverModule.start(function (e, server) {
        expect(e)
          .to.eql(null);

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

    it('Create project [0]', function (done) {
      var project = projects[0];
      var user = users[2];

      agent.put('http://localhost:3000/projects/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Set test data id to the returned id
          project._id = res.body._id;

          done();
        });
    });

    it('Add user [1] to project [0]', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          project.users.push(user.username);

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

    // Don't need to be logged in to connect device, only need project id

    it('Connect device [0] to server under project [0]' +
      ' with invalid mac', function (done) {
        var project = projects[0];
        var device = devices[0];
        device.projectId = project._id;
        //device.projectVersion = project.version; 
        // TODO: Implement project version stuff

        // Save correct MAC address and set to invalid
        tempStore.correctMac = device.macAddress;
        device.mac = chance.string();


        agent.put('http://localhost:3000/projects/' +
          project._id + '/devices/')
          .send(device)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be(false);
            expect(res.status)
              .to.be(409);

            // Restore correct MAC address
            device.macAddress = tempStore.correctMac;
            delete tempStore.correctMac;

            done();
          });
      });

    it('Connect device [0] to server under project [0]' +
      ' with invalid project id', function (done) {
        var project = projects[0];
        var device = devices[0];
        device.projectId = chance.string();
        //device.projectVersion = project.version; 
        // TODO: Implement project version stuff

        agent.put('http://localhost:3000/projects/' +
          device.projectId + '/devices/')
          .send(device)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be(false);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Connect device [0] to server under project [0]', function (done) {
      var project = projects[0];
      var device = devices[0];
      device.projectId = project._id;
      //device.projectVersion = project.version; 
      // TODO: Implement project version stuff

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .send(device)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body._id)
            .to.be.ok();
          device._id = res.body._id;

          done();
        });
    });

    it('Check device [0] has been added to project [0]', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(utils.objMatch(res.body, device))
            .to.be.ok();

          done();
        });
    });

    it('Check devices are listing correctly', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Scan list for specific device
          var matchFound = false;
          _.every(res.body, function (entry) {
            if (utils.objMatch(entry, device)) {
              matchFound = true;
              return false;
            }
            return true;
          });

          expect(matchFound)
            .to.be.ok();

          done();
        });
    });

    it('Disconnect device [0] to server under project [0]', function (done) {
      var device = devices[0];

      agent.del('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Check device [0] has been removed from project [0]', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(utils.objMatch(res.body, device))
            .to.be(false);

          done();
        });
    });

    it('Check devices are listing correctly', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Scan list for specific device
          var matchFound = false;
          _.every(res.body, function (entry) {
            if (utils.objMatch(entry, device)) {
              matchFound = true;
              return false;
            }
            return true;
          });

          expect(matchFound)
            .to.be(false);

          done();
        });
    });

    it('Reconnect device [0] to server under project [0]', function (done) {
      var project = projects[0];
      var device = devices[0];
      device.projectId = project._id;
      //device.projectVersion = project.version; 
      // TODO: Implement project version stuff

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .send(device)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body._id)
            .to.be.ok();
          device._id = res.body._id;

          done();
        });
    });

    it('Start session for device [0] with user [2] without login', function (
      done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be(false);
          expect(res.status)
            .to.be(401);

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

    it('Start session for device [0] with user [2]', function (done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          session = res.body;

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

    it('Start conflicting session for device [0] with user [2]', function (
      done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be(false);
          expect(res.status)
            .to.be(401);

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

    it('Get schema of device [0]', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id +
        '/schema/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          schema = res.body;

          done();
        });
    });

    it('Send valid control update to device [0]', function (
      done) {
      var project = projects[0];
      var device = devices[0];

      sentUpdates = [{
        'rotateSpeed': {
          // Schema not needed, only values
          //type: 'float',
          //min: 0,
          //max: 100,
          values: {
            n: 6
          }
        }
      }];

      agent.post('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .send(sentUpdates[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Check device [0] updates', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var recvUpdate = res.body[0];
          expect(recvUpdate.rotateSpeed.values.n)
            .to.be(sentUpdates[0].rotateSpeed.values.n);

          done();
        });
    });

    it('Check device [0] updates have been cleared after read', function (
      done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
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

    it('Send invalid control update to device [0]', function (
      done) {
      var project = projects[0];
      var device = devices[0];

      sentUpdates = [{
        'rotateSpeed': {
          // Schema not needed, only values
          //type: 'float',
          //min: 0,
          //max: 100,
          values: {
            n: -5
          }
        }
      }];

      // More extensive value validation testing will be in own
      // test (schemaValidation.test.js?)

      agent.post('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .send(sentUpdates[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);

          done();
        });
    });

    it('Check device [0] updates', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          // No valid updates
          expect(res.body.length)
            .to.be(0);

          done();
        });
    });

    it('Send multiple control updates to device [0] to test ordering',
      function (
        done) {
        var project = projects[0];
        var device = devices[0];

        sentUpdates = [{
          'objectPosition': {
            // Schema not needed, only values
            //type: 'float',
            //min: 0,
            //max: 100,
            values: {
              x: 1,
              y: 2,
              z: 3
            }
          }
        }, {
          'titleColor': {
            //type: 'Color',
            values: {
              r: 255,
              g: 50,
              b: 55,
              a: 99
            }
          }
        }, {
          'objectPosition': {
            // Schema not needed, only values
            //type: 'float',
            //min: 0,
            //max: 100,
            values: {
              x: 3,
              y: 2,
              z: 1
            }
          }
        }];

        var currentUpdateIndex = 0;
        var maxUpdateIndex = sentUpdates.length;

        var sendUpdate = function () {
          var deferred = Q.defer();
          agent.post('http://localhost:3000/projects/' +
            device.projectId + '/sessions/' + device._id +
            '/updates/')
            .send(sentUpdates[currentUpdateIndex])
            .end(function (e, res) {
              expect(e)
                .to.eql(null);
              expect(res.ok)
                .to.be.ok();
              deferred.resolve();
              currentUpdateIndex++;
            });
          return deferred.promise;
        };

        // Chain calls sequentially
        sendUpdate()
          .then(sendUpdate)
          .then(sendUpdate)
          .then(function () {
            done(); // Finish test step
          });
      });

    it('Check device [0] updates for ordering', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          // No valid updates
          expect(res.body.length)
            .to.be(0);

          // Check for correct ordering of updates
          var matchFound = false;
          _.every(
            _.zip(res.body, sentUpdates), function (entry) {
              if (utils.objMatch(entry[0], entry[1])) {
                matchFound = true;
                return false;
              }
              return true;
            }
          );

          done();
        });
    });

    // TODO: Somehow simulate device connect timeout for testing
  });
})(require, describe, it);
