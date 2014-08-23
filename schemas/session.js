(function (require, module) {
  'use strict';

  var mongoose = require('mongoose');
  var config = require('../include/config');
  var Schema = mongoose.Schema;

  var SessionSchema = new Schema({
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    user: {
      type: String,
      required: true
    },
    timestamp: [{
      type: Date,
      default: Date.now
    }]
  });

  module.exports = mongoose.model('Session', SessionSchema);

})(require, module);
