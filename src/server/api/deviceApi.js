(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var Device = require('../schemas/device.js');
  var Update = require('../schemas/update.js');
  var moment = require('moment');
  var config = require('../../shared/config.js');
  var _ = require('lodash');
  var Q = require('q');
  var utils = require('../../shared/utils.js');
  var controls = require('../../shared/controls.js');
  var queryFilters = require('../include/queryFilters.js');

  // Device expiry functionality

  var deviceTimeouts = {};

  var expireDevice = function (device) {
    console.log('Expiring device \'', device.macAddress,
      '\' due to timeout (',
      config.device_Timeout_Seconds, ' seconds)');

    device.removeQ()
      .then(Project.findOneQ({
        '_id': device.projectId
      }))
      .then(function (project) {
        if (project) {
          project.deviceCount--;
          if (project.deviceCount < 0) {
            console.log('WARNING: Device count out of sync.');
            project.deviceCount = 0;
          }
          return project.saveQ();
        }
      })
      .done();
  };

  var resetTimeout = function (device) {
    clearTimeout(device);
    var timeoutId = setTimeout(expireDevice,
      config.device_Timeout_Seconds * 1000,
      device);
    deviceTimeouts[device._id] = timeoutId;
  };

  var clearTimeout = function (device) {
    var timeoutId = deviceTimeouts[device._id];
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  // Public functions
  module.exports = {

    //
    // Parameters
    //

    pDeviceMacAddr: function (req, res, next, macAddress) {
      var project = req.project;

      if (!project) {
        return next();
      }

      if (!utils.validateMacAddress(macAddress)) {
        return res.status(409)
          .send({
            detail: 'Invalid MAC address format. Should be IEEE 802 format. ' +
              '(01-23-45-67-89-ab)'
          });
      }

      var findDevice = Device.findOne({
        'macAddress': macAddress
      });

      findDevice.execQ()
        .then(function (device) {
          req.device = device;
          next();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    //
    // API Methods
    //

    registerDevice: function (req, res, next) {
      var device = req.body;
      var project = req.project;
      var existingDevice = req.device;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      var saveDevice;

      if (existingDevice) {
        // Just update device if exists
        existingDevice.projectId = device.projectId;
        existingDevice.deviceName = device.deviceName;
        existingDevice.projectVersion = device.projectVersion;
        existingDevice.dataSchema = device.dataSchema;
        existingDevice.currentState = device.currentState;
        existingDevice.lastAccess = Date.now();


        saveDevice = existingDevice;

      } else {
        // Else create new
        var newDevice = new Device({
          projectId: device.projectId,
          projectVersion: device.projectVersion,
          macAddress: device.macAddress,
          dataSchema: device.dataSchema,
          deviceName: device.deviceName,
          currentState: device.currentState
        });

        project.deviceCount++;
        saveDevice = newDevice;
      }

      var savedDevice = null;
      saveDevice.saveQ()
        .then(function (data) {
          savedDevice = data;
          return project.saveQ();
        })
        .then(function (data) {
          resetTimeout(savedDevice);
          res.status(200)
            .send({
              data: {
                '_id': savedDevice._id
              }
            });
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    deregisterDevice: function (req, res, next) {
      var project = req.project;
      var device = req.device;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      if (!device) {
        return res.status(404)
          .send({
            detail: 'Device not found'
          });
      }

      project.deviceCount--;

      var removedDevice;
      Device.findOneAndRemoveQ({
        'macAddress': device.macAddress
      })
        .then(function (data) {
          removedDevice = data;
          return true;
        })
        .then(function () {
          return project.saveQ();
        })
        .then(function (data) {
          clearTimeout(removedDevice);
          res.status(200)
            .send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    getDevice: function (req, res, next) {
      var project = req.project;
      var device = req.device;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      if (!device) {
        return res.status(404)
          .send({
            detail: 'Device not found'
          });
      }

      res.status(200)
        .send({
          data: {
            _id: device._id,
            macAddress: device.macAddress,
            deviceName: device.deviceName,
            projectId: device.projectId,
            projectVersion: device.projectVersion,
            dataSchema: device.dataSchema,
            currentState: device.currentState,
            updatedAt: device.updatedAt
          }
        });
    },

    listDevices: function (req, res, next) {
      var project = req.project;

      if (!req.project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      var countTotalRecords = function () {
        return Device.countQ({
          projectId: project._id
        });
      };

      var getPaginatedRecords = function () {
        var query = Device.find({
          projectId: project._id
        });

        query.select('macAddress projectId projectVersion ' +
          'dataSchema currentState updatedAt deviceName');

        try {
          queryFilters.paginate(req.query, query);
          queryFilters.sort(req.query, query, {
            'updatedAt': 'desc',
            'projectVersion': 'asc'
          });
        } catch (ex) {
          return res.status(400)
            .send(ex.message);
        }

        return query.execQ();
      };

      Q.spread([countTotalRecords(), getPaginatedRecords()],
        function (totalRecordCount, devices) {
          res.status(200)
            .send({
              data: devices,
              control: {
                recordsSent: devices.length,
                totalRecords: totalRecordCount
              }
            });

        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    startSession: function (req, res, next) {
      var project = req.project;
      var device = req.device;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      if (!device) {
        return res.status(404)
          .send({
            detail: 'Device not found'
          });
      }

      if (device.sessionUser) {
        if (device.sessionUser !== loggedInUser._id) {
          // Conflict
          return res.status(409)
            .send({
              detail: 'Session already started for this' +
                ' device with other user.'
            });
        }
      } else {
        // Start session
        device.sessionUser = loggedInUser._id;
      }

      device.lastAccess = Date.now();
      device.saveQ()
        .then(function (data) {
          res.status(200)
            .send({
              data: {
                '_id': data._id
              }
            });
        })
        .catch(function (err) {
          return next(err);
        })
        .done();
    },

    stopSession: function (req, res, next) {
      var project = req.project;
      var device = req.device;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      if (!device) {
        return res.status(404)
          .send({
            detail: 'Device not found'
          });
      }

      if (device.sessionUser) {
        if (device.sessionUser === loggedInUser._id) {
          device.sessionUser = null;
        } else {
          // Conflict
          return res.status(409)
            .send({
              detail: 'Cannot stop session you didn\'t start'
            });
        }
      }

      device.saveQ()
        .then(function () {
          res.status(200)
            .send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    getSchema: function (req, res, next) {
      var project = req.project;
      var device = req.device;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      if (!device) {
        return res.status(404)
          .send({
            detail: 'Device not found'
          });
      }

      res.status(200)
        .send({
          data: device.dataSchema
        });
    },

    queueUpdate: function (req, res, next) {
      var project = req.project;
      var device = req.device;
      var loggedInUser = req.user;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      if (!device) {
        return res.status(404)
          .send({
            detail: 'Device not found'
          });
      }

      if (device.sessionUser !== loggedInUser._id) {
        return res.status(401)
          .send({
            detail: 'Logged in user is not in current session ' +
              'with this device.'
          });
      }

      var allSchemas = device.dataSchema;
      var validationErrors = [];

      _.each(req.body, function (val, key) {
        var schema = allSchemas[key];
        var type = schema.type;
        var control = controls[type];

        //console.log('Validating field: ' + key);
        //console.log('Type: ' + type);
        //console.log('Value: ' + JSON.stringify(val));

        var result = control.validate(schema, val);

        //console.log('Schema: ' + JSON.stringify(schema));
        //console.log('Validation result: ' + JSON.stringify(result));

        if (result.success) {
          var currentData = device.currentState[key];
          control.apply(schema, currentData, val);
        } else {
          validationErrors.push(result.reason);
        }
      });

      if (validationErrors.length > 0) {
        return res.status(409)
          .send({
            detail: 'There were error/s during data validation: ' +
              validationErrors.join(', ') + '.'
          });
      }

      var newUpdate = new Update({
        'targetMacAddress': device.macAddress,
        'data': req.body
      });

      newUpdate.saveQ()
        .then(function () {
          return device.saveQ();
        })
        .then(function () {
          res.status(200)
            .send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    getUpdates: function (req, res, next) {
      var project = req.project;
      var device = req.device;

      if (!project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      if (!device) {
        return res.status(404)
          .send({
            detail: 'Device not found'
          });
      }

      var sendMessagesToClient = function (messages) {
        res.status(200)
          .send({data: messages});
        return messages;
      };

      var markMessagesAsReceived = function (messages) {
        if (messages.length > 0) {
          var latestTime =
            _.last(messages)
            .timestamp;

          return Update.updateQ({
            timestamp: {
              $lte: latestTime
            },
            received: false
          }, {
            $set: {
              received: true
            }
          }, {
            multi: true
          });

        } else {
          return null;
        }
      };

      var updateDeviceAccessTime = function () {
        device.lastAccess = Date.now();
        return device.saveQ();
      };


      Update.findQ({
        'targetMacAddress': device.macAddress,
        'received': false
      }, 'data timestamp')
        .then(sendMessagesToClient)
        .then(markMessagesAsReceived)
        .then(updateDeviceAccessTime)
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    //
    // Test extensions
    //

    resetTests: function (req, res, next) {
      var clearDevice = Device.removeQ({});
      var clearUpdates = Update.updateQ({}, {
        $set: {
          received: true
        }
      });

      Q.all([clearDevice, clearUpdates])
        .then(function () {
          res.status(200)
            .send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();

    }

  };

})(require, module);
