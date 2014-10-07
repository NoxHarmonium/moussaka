(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;

  var macAddressValidator = require('./validators/macAddressValidator.js');

  var UpdateSchema = new Schema({
    targetMacAddress: {
      type: String,
      required: true,
      trim: true,
      index: true,
      validate: macAddressValidator
    },
    data: {
      type: Schema.Types.Mixed,
      required: true
    },
    received: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }, {
    capped: {
      size: 8192
    }
  });


  module.exports = mongoose.model('Update', UpdateSchema);

})(require, module);
