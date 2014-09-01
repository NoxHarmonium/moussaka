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
    var deviceAgent = superagent.agent();
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

    it('Reset devices test', function (done) {
      agent.get('http://localhost:3000/test/device_api/reset/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Login user [0]', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });
    });

    it('Get API key for user [0]', function (done) {
      var user = users[0];
      agent.get('http://localhost:3000/users/' +
        user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be.ok();
          var data = res.body;

          expect(data.apiKey)
            .to.be.ok();

          user.apiKey = data.apiKey;

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

    it('Get API key for user [2]', function (done) {
      var user = users[2];
      agent.get('http://localhost:3000/users/' +
        user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be.ok();
          var data = res.body;

          expect(data.apiKey)
            .to.be.ok();

          user.apiKey = data.apiKey;

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

    // Don't need to be logged in to connect device, only need api key

    it('Connect device [0] to server under project [0]' +
      ' with no mac', function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];
        device.projectId = project._id;

        // Save correct MAC address and set to invalid
        tempStore.correctMac = device.macAddress;
        device.macAddress = '';

        deviceAgent.put('http://localhost:3000/projects/' +
          project._id + '/devices/' + device.macAddress + '/')
          .set('apikey', apiKey)
          .send(device)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be(false);
            expect(res.status)
              .to.be(404);

            // Restore correct MAC address
            device.macAddress = tempStore.correctMac;
            delete tempStore.correctMac;

            done();
          });
      });

    it('Connect device [0] to server under project [0]' +
      ' with invalid mac', function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];
        device.projectId = project._id;

        // Save correct MAC address and set to invalid
        tempStore.correctMac = device.macAddress;
        device.macAddress = encodeURIComponent(chance.string());

        deviceAgent.put('http://localhost:3000/projects/' +
          project._id + '/devices/' + device.macAddress + '/')
          .set('apikey', apiKey)
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
        var user = users[2];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];
        device.projectId = encodeURIComponent(chance.string());

        deviceAgent.put('http://localhost:3000/projects/' +
          device.projectId + '/devices/' + device.macAddress + '/')
          .set('apikey', apiKey)
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

    it('Connect device [0] to server under project [0] without API key',
      function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];
        device.projectId = project._id;

        deviceAgent.put('http://localhost:3000/projects/' +
          device.projectId + '/devices/' + device.macAddress + '/')
          .send(device)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(401);

            done();
          });
      });

    it('Connect device [0] to server under project [0] with user [0] ' +
      'who is not part of project.', function (done) {
        var user = users[0];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];
        device.projectId = project._id;

        deviceAgent.put('http://localhost:3000/projects/' +
          device.projectId + '/devices/' + device.macAddress + '/')
          .set('apikey', apiKey)
          .send(device)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(401);

            done();
          });
      });

    it('Connect device [0] to server under project [0]', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var project = projects[0];
      var device = devices[0];
      device.projectId = project._id;

      deviceAgent.put('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device.macAddress + '/')
        .set('apikey', apiKey)
        .send(device)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Check device [0] has been added to invalid project', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        '000000000000000000000000' + '/devices/' + device.macAddress +
        '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });


    it('Check device [0] has been added to project [0]', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device.macAddress + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          device.timestamp = res.body.timestamp;
          device._id = res.body._id;

          expect(utils.objMatch(res.body, device))
            .to.be.ok();

          done();
        });
    });

    it('Check devices are listing correctly from invalid project', function (
      done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        '000000000000000000000000' + '/devices/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

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

    it(
      'Disconnect device [0] to server under project [0] with invalid project',
      function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var device = devices[0];

        deviceAgent.del('http://localhost:3000/projects/' +
          '000000000000000000000000' + '/devices/' + device.macAddress +
          '/')
          .set('apikey', apiKey)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Disconnect device [0] to server under project [0]', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.del('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device.macAddress + '/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Disconnect device [0] to server under project [0] after removal',
      function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var device = devices[0];

        deviceAgent.del('http://localhost:3000/projects/' +
          device.projectId + '/devices/' + device.macAddress + '/')
          .set('apikey', apiKey)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Check device [0] has been removed from project [0]', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device.macAddress + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

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
      var user = users[2];
      var apiKey = user.apiKey;
      var project = projects[0];
      var device = devices[0];
      device.projectId = project._id;

      deviceAgent.put('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device.macAddress + '/')
        .set('apikey', apiKey)
        .send(device)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

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

    it('Start session for device [0] with user [2] without login', function (
      done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress + '/')
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

    it('Start session for device [0] with user [2] with invalid project id',
      function (done) {
        var project = projects[0];
        var device = devices[0];

        agent.put('http://localhost:3000/projects/' +
          '0000000000000000000' + '/sessions/' + device.macAddress + '/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Start session for invalid device with user [2]', function (done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + '01-23-45-67-89-ab' + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Start session for device [0] with user [2]', function (done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

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
        device.projectId + '/sessions/' + device.macAddress + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be(false);
          expect(res.status)
            .to.be(409);

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

    it('Get schema of device [0] with user [2] with invalid project id',
      function (done) {
        var project = projects[0];
        var device = devices[0];

        agent.put('http://localhost:3000/projects/' +
          '0000000000000000000' + '/sessions/' + device.macAddress +
          '/schema/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Get schema for invalid device with user [2]', function (done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + '01-23-45-67-89-ab' +
        '/schema/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Get schema of device [0]', function (done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device.macAddress +
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

    it('Send valid control update to device [0] with user [2] ' +
      'with invalid project id',
      function (done) {
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
          '0000000000000000000' + '/sessions/' + device.macAddress +
          '/updates/')
          .send(sentUpdates[0])
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Send valid control update to invalid device with user [2]',
      function (done) {
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
          device.projectId + '/sessions/' + '01-23-45-67-89-ab' +
          '/updates/')
          .send(sentUpdates[0])
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

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
        device.projectId + '/sessions/' + device.macAddress +
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

    it('Check device [0] updates with invalid project', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        '0000000000000000000' + '/sessions/' + device.macAddress +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Check invalid device updates', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + '01-23-45-67-89-ab' +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Check device [0] updates with incorrect API key', function (done) {
      var user = users[2];
      var apiKey = '00000000-0000-0000-0000-000000000000';
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('Check device [0] updates', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be(1);

          var recvUpdate = res.body[0].data;
          expect(recvUpdate.rotateSpeed.values.n)
            .to.be(sentUpdates[0].rotateSpeed.values.n);

          done();
        });
    });

    it('Check device [0] updates have been cleared after read', function (
      done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress +
        '/updates/')
        .set('apikey', apiKey)
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
        device.projectId + '/sessions/' + device.macAddress +
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
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress +
        '/updates/')
        .set('apikey', apiKey)
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
            device.projectId + '/sessions/' + device.macAddress +
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
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          // No valid updates
          expect(res.body.length)
            .to.be(3);

          // Check for correct ordering of updates
          var matchFound = true;

          _.every(
            _.zip(res.body, sentUpdates), function (entry) {
              if (!utils.objMatch(entry[0].data, entry[1])) {
                matchFound = false;
                return false;
              }
              return true;
            }
          );

          expect(matchFound)
            .to.be.ok();

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

    it('Stop session for device [0] with user that didn\'t start it',
      function (
        done) {
        var device = devices[0];

        agent.del('http://localhost:3000/projects/' +
          device.projectId + '/sessions/' + device.macAddress + '/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be(false);
            expect(res.status)
              .to.be(409);

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

    it('Stop session for device [0] with user [2] with invalid project id',
      function (done) {
        var project = projects[0];
        var device = devices[0];

        agent.put('http://localhost:3000/projects/' +
          '0000000000000000000' + '/sessions/' + device.macAddress + '/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Stop session for invalid device with user [2]', function (done) {
      var project = projects[0];
      var device = devices[0];

      agent.put('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + '01-23-45-67-89-ab' + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Stop session for device [0] with correct user', function (
      done) {
      var device = devices[0];

      agent.del('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Send valid control update to device [0] without session', function (
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
        device.projectId + '/sessions/' + device.macAddress +
        '/updates/')
        .send(sentUpdates[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('Check device [0] updates', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device.macAddress +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    // TODO: Somehow simulate device connect timeout for testing
  });
})(require, describe, it);
