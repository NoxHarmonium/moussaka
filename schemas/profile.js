(function (require, module) {
  'use strict';

  var mongoose = require('mongoose');
  var config = require('../include/config');
  var Schema = mongoose.Schema;

  var ProfileSchema = new Schema({
    projectVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectVersion',
      required: true
    },
    profileData: {
      type: Schema.Types.Mixed,
      required: true
    },
    timestamp: [{
      type: Date,
      default: Date.now
    }]
  });

  module.exports = mongoose.model('Profile', ProfileSchema);

})(require, module);
