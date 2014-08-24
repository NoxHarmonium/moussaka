(function (require, module) {
  'use strict';

  var Project = require('../schemas/project.js');
  var User = require('../schemas/user.js');
  var Device = require('../schemas/device.js');
  var Session = require('../schemas/session.js');
  var moment = require('moment');
  var config = require('../include/config.js');
  var _ = require('lodash');
  var utils = require('../include/utils.js');

  // Public functions
  module.exports = {

    pDeviceMacAddr: function (req, res, next, macAddress) {
      var project = req.project;

      if (!project) {
        return next();
      }

      // TODO: Universal undefined check fn?
      if (!macAddress || macAddress === 'undefined') {
        return next();
      }

      if (!utils.validateMacAddress(macAddress)) {
        return res.send(409, {
          detail: 'Invalid MAC address format. Should be IEEE 802 format. ' +
            '(01-23-45-67-89-ab)'
        });
      }

      var query = Device.findOne({
        'macAddress': macAddress
      });

      query.exec(function (err, device) {
        if (err) {
          return next(err);
        }
        req.device = device;
        next();
      });

    },

    registerDevice: function (req, res, next) {
      var device = req.body;
      var existingDevice = req.device;

      if (!utils.validateMacAddress(device.macAddress)) {
        return res.send(409, {
          detail: 'Invalid MAC address format. Should be IEEE 802 format. ' +
            '(01-23-45-67-89-ab)'
        });
      }

      if (!req.project) {
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

        existingDevice.save(function (err) {
          if (err) {
            return next(err);
          }
          return res.send(200);
        });

      } else {
        // Else create new
        var d = new Device({
          projectId: device.projectId,
          projectVersion: device.projectVersion,
          macAddress: device.macAddress,
          dataSchema: device.dataSchema,
          deviceName: device.deviceName,
          currentState: device.currentState
        });

        d.save(function (err, data) {
          if (err) {
            return next(err);
          }
          return res.send(200, {
            '_id': data._id
          });
        });
      }
    },

    getDevice: function (req, res, next) {
      var project = req.project;
      var device = req.device;

      if (!req.project) {
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      if (!req.device) {
        return res.send(404, {
          detail: 'Device not found'
        });
      }

      res.send(200, {
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

      if (!req.project) {
        return res.send(404, {
          detail: 'Project not found'
        });
      }

      var query = Device.find({
        projectId: project._id
      });

      query.select('-_id macAddress projectId projectVersion ' +
        'dataSchema currentState timestamp deviceName');

      query.sort({
        'projectVersion': 'asc',
        'timestamp': 'desc'
      });

      query.exec(function (err, devices) {
        if (err) {
          return next(err);
        }
        res.send(200, devices);
      });
    },



    //
    // Test extensions
    //

    resetTests: function (req, res, next) {

    }

  };

})(require, module);
