(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;
  var timestamps = require('mongoose-timestamp');

  var projVersionValidator =
    require('./validators/projectVersionValidator.js');
  var macAddressValidator =
    require('./validators/macAddressValidator.js');
  var deviceNameValidator =
    require('./validators/deviceNameValidator.js');
  var emailValidator =
    require('./validators/emailValidator.js');

  var DeviceSchema = new Schema({
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    projectVersion: {
      type: String,
      required: true,
      trim: true,
      validate: projVersionValidator
    },
    macAddress: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      validate: macAddressValidator
    },
    deviceName: {
      type: String,
      required: true,
      trim: true,
      validate: deviceNameValidator
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
      required: false,
      trim: true,
      validate: emailValidator
    },
    lastAccess: {
      type: Date,
      default: Date.now
    }
  });

  DeviceSchema.plugin(timestamps);

  module.exports = mongoose.model('Device', DeviceSchema);

})(require, module);
