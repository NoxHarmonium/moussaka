(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;

  var ProfileSchema = new Schema({
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectVersion: {
      type: String,
      required: true,
      trim: true
    },
    profileName: {
      type: String,
      required: true,
      trim: true
    },
    profileData: {
      type: Schema.Types.Mixed,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    owner: {
      type: String,
      required: true,
      trim: true
    }
  });

  module.exports = mongoose.model('Profile', ProfileSchema);

})(require, module);
