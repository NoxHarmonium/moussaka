(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;

  var DeviceSchema = new Schema({
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    projectVersion: {
      type: String,
      required: true
    },
    macAddress: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    deviceName: {
      type: String,
      required: true
    },
    dataSchema: {
      type: Schema.Types.Mixed,
      required: true
    },
    currentState: {
      type: Schema.Types.Mixed,
      required: true
    },
    sessionUser: {
      type: String,
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    lastAccess: {
      type: Date,
      default: Date.now,
      expires: config.device_Timeout_Seconds
    }
  });

  module.exports = mongoose.model('Device', DeviceSchema);

})(require, module);
