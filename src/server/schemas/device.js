(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;
  var timestamps = require('mongoose-timestamp');

  var projVersionValidator =
    require('./validators/projectVersionValidator.js');
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
    sessionDirtyFields: [{
      type: String,
      trim: true
    }],
    sessionUser: {
      type: String,
      required: false,
      trim: true,
      validate: emailValidator,
      default: null
    },
    lastAccess: {
      type: Date,
      default: Date.now
    }
  });

  DeviceSchema.plugin(timestamps);

  module.exports = mongoose.model('Device', DeviceSchema);

})(require, module);
