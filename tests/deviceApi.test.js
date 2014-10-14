(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var utils = require('../src/shared/utils.js');
  var config = require('../src/shared/config.js');
  var serverModule = require('../src/server/server.js');
  var _ = require('lodash');
  var Q = require('q');
  var S = require('string');
  var Chance = require('chance');
  var extend = require('extend');

  var _formatTestIndex = function (index) {
    // Mongo uses alphabetical sorting so simply appending
    // numbers doesn't sort properly.
    return S(index)
      .padLeft(3, '0');
  };

  describe('Device API tests', function () {
    var id;
    var users = testData.getTestUsers();
    var devices = testData.getTestDevices();
    var projects = testData.getTestProjects();
    var deviceSchemas = testData.getTestDeviceSchemas();
    var deviceStates = testData.getTestDevicesStates();
    var agent = superagent.agent();
    var deviceAgent = superagent.agent();
    var sentUpdates = null;
    var combinedUpdates = {};
    var tempStore = {};
    var chance = new Chance();

    var getExtendedDevice = function (index) {
      return extend({}, devices[index],
        deviceSchemas[index], deviceStates[index]);
    };

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
          var data = res.body.data;

          expect(data.apiKey)
            .to.be.ok();

          user.apiKey = data.apiKey;

          done();
        });
    });

    it('Logout user [0]', function (done) {
      agent.post('http://localhost:3000/logout/')
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
          var data = res.body.data;

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
          project._id = res.body.data._id;

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
      ' with invalid project id', function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];

        // Need to connect device with all data
        var extendedDevice = getExtendedDevice(0);
        extendedDevice.projectId = encodeURIComponent(chance.string());

        deviceAgent.put('http://localhost:3000/projects/' +
          extendedDevice.projectId + '/devices/' +
          extendedDevice._id + '/')
          .set('apikey', apiKey)
          .send(extendedDevice)
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

        // Need to connect device with all data
        var extendedDevice = getExtendedDevice(0);
        extendedDevice.projectId = project._id;

        deviceAgent.put('http://localhost:3000/projects/' +
          extendedDevice.projectId + '/devices/')
          .send(extendedDevice)
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

        // Need to connect device with all data
        var extendedDevice = getExtendedDevice(0);
        extendedDevice.projectId = project._id;

        deviceAgent.put('http://localhost:3000/projects/' +
          extendedDevice.projectId + '/devices/')
          .set('apikey', apiKey)
          .send(extendedDevice)
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

      // Need to connect device with all data
      var extendedDevice = getExtendedDevice(0);

      deviceAgent.put('http://localhost:3000/projects/' +
        extendedDevice.projectId + '/devices/')
        .set('apikey', apiKey)
        .send(extendedDevice)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);

          expect(res.ok)
            .to.be.ok();

          device._id = res.body.data._id;

          done();
        });
    });

    it('Update device [0] under project [0] ' +
      'to reset timeout', function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];

        // Need to connect device with all data
        var extendedDevice = getExtendedDevice(0);
        extendedDevice.projectId = project._id;

        deviceAgent.post('http://localhost:3000/projects/' +
          extendedDevice.projectId + '/devices/' +
          extendedDevice._id + '/')
          .set('apikey', apiKey)
          .send(extendedDevice)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be.ok();

            done();
          });
      });

    it('Check device [0] has not been added to invalid project', function (
      done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        '000000000000000000000000' + '/devices/' + device._id +
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
        device.projectId + '/devices/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);

          expect(res.ok)
            .to.be.ok();

          device.updatedAt = res.body.data.updatedAt;
          device._id = res.body.data._id;

          expect(utils.objMatch(res.body.data, device))
            .to.be.ok();

          done();
        });
    });

    it('Check devices are listing correctly from invalid project',
      function (
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
          _.every(res.body.data, function (entry) {

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
      'Disconnect device [0] to server under project [0] ' +
      'with invalid project',
      function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var device = devices[0];

        deviceAgent.del('http://localhost:3000/projects/' +
          '000000000000000000000000' + '/devices/' + device._id +
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

    it('Disconnect device [0] to server under project [0]', function (
      done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.del('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id + '/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it(
      'Disconnect device [0] to server under project [0] after removal',
      function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var device = devices[0];

        deviceAgent.del('http://localhost:3000/projects/' +
          device.projectId + '/devices/' + device._id + '/')
          .set('apikey', apiKey)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Check device [0] has been removed from project [0]', function (
      done) {
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id + '/')
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
          _.every(res.body.data, function (entry) {
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

      // Need to connect device with all data
      var extendedDevice = getExtendedDevice(0);

      deviceAgent.put('http://localhost:3000/projects/' +
        extendedDevice.projectId + '/devices/')
        .set('apikey', apiKey)
        .send(extendedDevice)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          device._id = res.body.data._id;

          done();
        });
    });

    it('Connect device [0] to server under project [0] when already ' +
      'connected (with different data)', function (done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var project = projects[0];
        var device = devices[0];
        var dataSchema = deviceSchemas[0].dataSchema;

        dataSchema.rotateSpeed.max = 50;

        // Need to connect device with all data
        var extendedDevice = getExtendedDevice(0);

        deviceAgent.post('http://localhost:3000/projects/' +
          extendedDevice.projectId + '/devices/' +
          extendedDevice._id + '/')
          .set('apikey', apiKey)
          .send(extendedDevice)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
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
          _.every(res.body.data, function (entry) {
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


    it('Logout user [2]', function (done) {
      agent.post('http://localhost:3000/logout/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Start session for device [0] with user [2] without login',
      function (
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

    it(
      'Start session for device [0] with user [2] with invalid project id',
      function (done) {
        var project = projects[0];
        var device = devices[0];

        agent.put('http://localhost:3000/projects/' +
          '0000000000000000000' + '/sessions/' + device._id +
          '/')
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
        device.projectId + '/sessions/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Logout user [2]', function (done) {
      agent.post('http://localhost:3000/logout/')
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

    it('Start conflicting session for device [0] with user [2]',
      function (
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
              .to.be(409);

            done();
          });
      });

    it('Logout user [1]', function (done) {
      agent.post('http://localhost:3000/logout/')
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

        agent.get('http://localhost:3000/projects/' +
          '0000000000000000000' + '/sessions/' + device._id +
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

      agent.get('http://localhost:3000/projects/' +
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
      var dataSchema = deviceSchemas[0].dataSchema;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id +
        '/schema/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(utils.objMatch(dataSchema, res.body.data))
            .to.be.ok();

          done();
        });
    });

    it('Get schema of device [0] with user [2] with invalid project id',
      function (done) {
        var project = projects[0];
        var device = devices[0];

        agent.get('http://localhost:3000/projects/' +
          '0000000000000000000' + '/sessions/' + device._id +
          '/schema/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

            done();
          });
      });

    it('Get currentState for invalid device with user [2]', function (done) {
      var project = projects[0];
      var device = devices[0];

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + '01-23-45-67-89-ab' +
        '/state/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Get currentState of device [0]', function (done) {
      var device = devices[0];
      var currentState = deviceStates[0].currentState;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/' + device._id +
        '/state/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(utils.objMatch(currentState, res.body.data))
            .to.be.ok();

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
          '0000000000000000000' + '/sessions/' + device._id +
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
      var deviceCurrentState = deviceStates[0].currentState;


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

      // Apply to state
      extend(deviceCurrentState, sentUpdates[0]);

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

    it('Check device [0] updates with invalid project', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        '0000000000000000000' + '/sessions/' + device._id +
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

    it('Check device [0] updates with incorrect API key', function (
      done) {
      var user = users[2];
      var apiKey = '00000000-0000-0000-0000-000000000000';
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
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
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var updates = res.body.data;

          expect(Object.keys(updates)
            .length)
            .to.be(1);

          expect(updates.rotateSpeed.values.n)
            .to.be(sentUpdates[0].rotateSpeed.values.n);

          done();
        });
    });

    it('Check device [0] updates have been cleared after read',
      function (
        done) {
        var user = users[2];
        var apiKey = user.apiKey;
        var device = devices[0];

        deviceAgent.get('http://localhost:3000/projects/' +
          device.projectId + '/sessions/' + device._id +
          '/updates/')
          .set('apikey', apiKey)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be.ok();

            var updates = res.body.data;

            expect(Object.keys(updates)
              .length)
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
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // No valid updates
          var updates = res.body.data;

          expect(Object.keys(updates)
            .length)
            .to.be(0);

          done();
        });
    });

    it('Send multiple control updates to device [0] to test ordering',
      function (
        done) {
        var project = projects[0];
        var device = devices[0];
        var dataSchema = deviceSchemas[0].dataSchema;
        var deviceCurrentState = deviceStates[0].currentState;

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

          var update = sentUpdates[currentUpdateIndex];

          // Simulate applying updates onto device state

          // Get locked values
          var maskedUpdate = extend({}, update);
          var schemaType = _.keys(maskedUpdate)[0];
          var schema = dataSchema[schemaType];
          // Restore locked values
          for (var key in schema.lockedValues) {
            if (schema.lockedValues[key] === true) {
              maskedUpdate[schemaType].values[key] =
                deviceCurrentState[schemaType].values[key];
            }
          }
          // Merge updates
          // Deep copy update on top of combined updates
          combinedUpdates = extend(true, combinedUpdates, maskedUpdate);

          agent.post('http://localhost:3000/projects/' +
            device.projectId + '/sessions/' + device._id +
            '/updates/')
            .send(update)
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
            // Apply to state
            extend(deviceCurrentState, combinedUpdates);
            done(); // Finish test step
          });
      });

    it('Check device [0] updates for ordering', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];

      deviceAgent.get('http://localhost:3000/projects/' +
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var updates = res.body.data;

          expect(Object.keys(updates)
            .length)
            .to.be(Object.keys(combinedUpdates)
              .length);

          expect(utils.objMatch(updates, combinedUpdates))
            .to.be.ok();

          done();
        });
    });

    it('Check device [0] state correctness', function (done) {
      var user = users[2];
      var apiKey = user.apiKey;
      var device = devices[0];
      var deviceCurrentState = deviceStates[0].currentState;

      deviceAgent.get('http://localhost:3000/projects/' + device.projectId +
        '/devices/' + device._id + '/state/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var state = res.body.data;

          expect(utils.objMatch(state, deviceCurrentState))
            .to.be.ok();

          done();
        });
    });

    it('Logout user [2]', function (done) {
      agent.post('http://localhost:3000/logout/')
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
          device.projectId + '/sessions/' + device._id + '/')
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
      agent.post('http://localhost:3000/logout/')
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

    it(
      'Stop session for device [0] with user [2] with invalid project id',
      function (done) {
        var project = projects[0];
        var device = devices[0];

        agent.del('http://localhost:3000/projects/' +
          '0000000000000000000' + '/sessions/' + device._id +
          '/')
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

      agent.del('http://localhost:3000/projects/' +
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
        device.projectId + '/sessions/' + device._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Send valid control update to device [0] without session',
      function (
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
        device.projectId + '/sessions/' + device._id +
        '/updates/')
        .set('apikey', apiKey)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var updates = res.body.data;

          expect(Object.keys(updates)
            .length)
            .to.be(0);

          done();
        });
    });

    it('Connect 200 devices', function (done) {
      var project = projects[0];
      var device = devices[0];
      var user = users[2];
      var apiKey = user.apiKey;

      var currentProjectIndex = 199;
      var maxProjectIndex = 199;

      var createTestProject = function (index) {
        var deferred = Q.defer();

        // Need to connect device with all data
        var extendedDevice = getExtendedDevice(0);

        extendedDevice.deviceName = 'TEST_DATA_DELETE_' +
          _formatTestIndex(currentProjectIndex);

        agent.put('http://localhost:3000/projects/' +
          extendedDevice.projectId + '/devices/')
          .set('apikey', apiKey)
          .send(extendedDevice)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be.ok();
            deferred.resolve();
            currentProjectIndex--;
          });
        return deferred.promise;
      };

      // Chain calls sequentially
      var result = createTestProject();
      for (var i = maxProjectIndex; i > 0; i--) {
        result = result.then(createTestProject);
      }
      result.then(function () {
        done(); // Finish test step
      })
        .done();
    });

    it('List devices to test record limit', function (done) {
      var device = devices[0];
      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.data.length)
            .to.be(config.max_records_per_query);
          done();
        });
    });

    it('Test pagination (20-39)', function (done) {
      var device = devices[0];
      var min = 20;
      var max = 39;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].deviceName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (30-40)', function (done) {
      var device = devices[0];
      var min = 30;
      var max = 40;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].deviceName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (40-30)', function (done) {
      var device = devices[0];
      var min = 40;
      var max = 30;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
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
      var device = devices[0];
      var min = 30;
      var max = 30;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].deviceName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (10-90)', function (done) {
      var device = devices[0];
      var min = 10;
      var max = 90;

      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].deviceName)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test sorting (invalid field)', function (done) {
      var device = devices[0];
      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .query({
          sortField: 'invalid'
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);


          done();
        });
    });

    it('Test sorting (invalid dir)', function (done) {
      var device = devices[0];
      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .query({
          sortField: 'name',
          sortDir: 'invalid'
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);

          done();
        });
    });

    it('Test sorting (updatedAt/asc)', function (done) {
      var device = devices[0];
      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .query({
          sortField: 'updatedAt',
          sortDir: 'asc',
          maxRecord: 5
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var prevDev = null;
          _.each(res.body.data, function (dev) {
            if (prevDev) {
              // Check sort order
              expect(prevDev.updatedAt < dev.updatedAt)
                .to.be.ok();
            }
            prevDev = dev;
          });


          done();
        });
    });

    it('Test sorting (updatedAt/desc)', function (done) {
      var device = devices[0];
      agent.get('http://localhost:3000/projects/' +
        device.projectId + '/devices/')
        .query({
          sortField: 'updatedAt',
          sortDir: 'desc',
          maxRecord: 5
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var prevDev = null;
          _.each(res.body.data, function (dev) {
            if (prevDev) {
              // Check sort order
              expect(prevDev.updatedAt > dev.updatedAt)
                .to.be.ok();
            }
            prevDev = dev;
          });


          done();
        });
    });

    // TODO: Somehow simulate device connect timeout for testing
  });
})(require, describe, it);
