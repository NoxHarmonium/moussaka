(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var Device = require('../schemas/device.js');
  var Update = require('../schemas/update.js');
  var moment = require('moment');
  var config = require('../include/config.js');
  var _ = require('lodash');
  var Q = require('q');
  var utils = require('../include/utils.js');
  var controls = require('../shared/controls.js');

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
        return res.send(409, {
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
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (existingDevice) {
        // Just update device if exists
        existingDevice.projectId = device.projectId;
        existingDevice.deviceName = device.deviceName;
        existingDevice.projectVersion = device.projectVersion;
        existingDevice.dataSchema = device.dataSchema;
        existingDevice.currentState = device.currentState;
        existingDevice.timestamp = Date.now();
        existingDevice.lastAccess = Date.now();

        existingDevice.saveQ()
          .then(function () {
            res.send(200);
          })
          .catch(function (err) {
            next(err);
          })
          .done();
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

        newDevice.saveQ()
          .then(function (data) {
            res.send(200, {
              '_id': data._id
            });
          })
          .catch(function (err) {
            next(err);
          })
          .done();
      }
    },

    deregisterDevice: function (req, res, next) {
      var project = req.project;
      var device = req.device;

      if (!project) {
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      var removeDevice = Device.remove({
        'macAddress': device.macAddress
      });

      removeDevice.execQ()
        .then(function () {
          res.send(200);
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
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      res.send(200, {
        _id: device._id,
        macAddress: device.macAddress,
        deviceName: device.deviceName,
        projectId: device.projectId,
        projectVersion: device.projectVersion,
        dataSchema: device.dataSchema,
        currentState: device.currentState,
        timestamp: device.timestamp
      });
    },

    listDevices: function (req, res, next) {
      var project = req.project;

      // TODO: Pagination

      if (!req.project) {
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      var getDevices = Device.find({
        projectId: project._id
      });

      getDevices.select('macAddress projectId projectVersion ' +
        'dataSchema currentState timestamp deviceName');

      getDevices.sort({
        'projectVersion': 'asc',
        'timestamp': 'desc'
      });

      getDevices.execQ()
        .then(function (devices) {
          res.send(200, devices);
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
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      if (device.sessionUser) {
        if (device.sessionUser !== loggedInUser._id) {
          // Conflict
          return res.send(409, {
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
          res.send(200, {
            '_id': data._id
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
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      if (device.sessionUser) {
        if (device.sessionUser === loggedInUser._id) {
          device.sessionUser = null;
        } else {
          // Conflict
          return res.send(409, {
            detail: 'Cannot stop session you didn\'t start'
          });
        }
      }

      device.saveQ()
        .then(function () {
          res.send(200);
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

      if (!loggedInUser) {
        return res.send(401, {
          detail: 'Not logged in'
        });
      }

      if (!(_.contains(project.admins, loggedInUser._id) ||
        _.contains(project.users, loggedInUser._id))) {
        return res.send(401, {
          detail: 'Only authorised project members can ' +
            'start a session on this device'
        });
      }

      if (!project) {
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      res.send(200, device.dataSchema);
    },

    queueUpdate: function (req, res, next) {
      var project = req.project;
      var device = req.device;
      var loggedInUser = req.user;

      if (!project) {
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      if (device.sessionUser !== loggedInUser._id) {
        return res.send(401, {
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
        return res.send(409, {
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
          res.send(200);
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
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      var sendMessagesToClient = function (messages) {
        res.send(messages);
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
      Update.updateQ({}, {
        $set: {
          received: true
        }
      })
        .then(function () {
          res.send(200);
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    }

  };

})(require, module);
