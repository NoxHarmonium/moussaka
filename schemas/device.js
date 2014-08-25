(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../include/config');
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
    }
  });

  module.exports = mongoose.model('Device', DeviceSchema);

})(require, module);
