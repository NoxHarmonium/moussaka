(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var Device = require('../schemas/device.js');
  var moment = require('moment');
  var config = require('../../shared/config.js');
  var _ = require('lodash');
  var Q = require('q');
  var utils = require('../../shared/utils.js');
  var controls = require('../../shared/controls.js');
  var queryFilters = require('../include/queryFilters.js');
  var InvalidDataError = require('../include/invalidDataError.js');
  var extend = require('extend');

  // Device expiry functionality

  var deviceTimeouts = {};

  var expireDevice = function (device) {
    console.log('Expiring device \'', device.deviceName,
      '\' due to timeout (',
      config.device_Timeout_Seconds, ' seconds )');

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

  var deleteTimeout = function (device) {
    var timeoutId = deviceTimeouts[device._id];
    if (timeoutId) {
      // global js method
      clearTimeout(timeoutId);
      _.pull(deviceTimeouts, device._id);
    }
  };

  var resetTimeout = function (device) {
    deleteTimeout(device);
    var timeoutId = setTimeout(expireDevice,
      config.device_Timeout_Seconds * 1000,
      device);
    deviceTimeouts[device._id] = timeoutId;
  };

  // Public functions
  module.exports = {

    //
    // Parameters
    //

    pDeviceId: function (req, res, next, deviceId) {
      var project = req.project;

      if (!project) {
        return next();
      }

      // Check for valid object ID
      // Thanks: http://stackoverflow.com/a/14942113/1153203
      if (!deviceId.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
      }

      var findDevice = Device.findOne({
        '_id': deviceId
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
        '_id': device._id
      })
        .then(function (data) {
          removedDevice = data;
          return project.saveQ();
        })
        .then(function (data) {
          deleteTimeout(removedDevice);
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
          data: {
            _id: device._id,
            deviceName: device.deviceName,
            projectId: device.projectId,
            projectVersion: device.projectVersion,
            updatedAt: device.updatedAt,
            sessionUser: device.sessionUser,
            locked: utils.exists(device.sessionUser)
          }
        });
    },

    listDevices: function (req, res, next) {
      var project = req.project;
      var loggedInUser = req.user;

      if (!req.project) {
        return res.status(404)
          .send({
            detail: 'Project not found'
          });
      }

      var countTotalRecords = Q.try(function () {
        return Device.countQ({
          projectId: project._id
        });
      });

      var getPaginatedRecords = Q.try(function () {
        var query = Device.find({
          projectId: project._id
        });

        query.select('projectId projectVersion ' +
          'updatedAt deviceName sessionUser');

        queryFilters.paginate(req.query, query);
        queryFilters.sort(req.query, query, {
          'updatedAt': 'desc',
          'projectVersion': 'asc'
        });

        return query.execQ();
      });

      Q.all([countTotalRecords, getPaginatedRecords])
        .spread(function (totalRecordCount, devices) {

          var projectedDevices = [];

          _.each(devices, function (device) {
            projectedDevices.push({
              _id: device._id,
              deviceName: device.deviceName,
              projectId: device.projectId,
              projectVersion: device.projectVersion,
              updatedAt: device.updatedAt,
              sessionUser: device.sessionUser,
              locked: utils.exists(device.sessionUser)
            });
          });

          res.status(200)
            .send({
              data: projectedDevices,
              control: {
                recordsSent: projectedDevices.length,
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
                _id: data._id,
                dataSchema: device.dataSchema,
                currentState: device.currentState
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

    getCurrentState: function (req, res, next) {
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
          data: device.currentState
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

        // console.log('Validating field: ' + key);
        // console.log('Type: ' + type);
        // console.log('Value: ' + JSON.stringify(val));

        var result = control.validate(schema, val);

        // console.log('Schema: ' + JSON.stringify(schema));
        // console.log('Validation result: ' + JSON.stringify(result));

        if (result.success) {
          // Apply change to currentState
          var currentData = device.currentState[key];
          control.apply(schema, currentData, val);
          // Mark as modified, otherwise mongoose doesn't know nested
          // values have changed
          device.markModified('currentState');
          // Set dirty fields for getUpdates
          var dirtyFields = device.sessionDirtyFields;
          if (!_.contains(dirtyFields, key)) {
            dirtyFields.push(key);
          }
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

      var dirtyFields = device.sessionDirtyFields;

      var update = {};

      _.each(dirtyFields, function (field) {
        update[field] = device.currentState[field];
      });

      device.sessionDirtyFields = [];

      device.saveQ()
        .then(function () {
          resetTimeout(device);
          res.status(200)
            .send({
              data: update
            });
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    //
    // Database Methods
    //

    resetDeviceCount: function () {
      // Ensure devices are cleared out if the program is terminated
      // TODO: Should the error handling be better?
      // What if db is not connected?
      Device.removeQ()
        .then(Project.updateQ({}, {
          deviceCount: 0
        }))
        .catch(function (ex) {
          console.error('Error resetting device counts: ' +
            ex.message + '\n' + ex.stack);
        })
        .done();
    },

    //
    // Test extensions
    //

    resetTests: function (req, res, next) {
      var clearDevices = Device.removeQ({});

      clearDevices
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
