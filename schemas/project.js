(function (require, module) {
  'use strict';

  var mongoose = require('mongoose');
  var config = require('../include/config');
  var Schema = mongoose.Schema;

  var ProjectSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    snapshots: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      publisher: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      overlay: {
        type: Schema.Types.Mixed
      }
    }]
  });

  // Apply compound index over name and version
  ProjectSchema.index({
    name: 1,
    version: 1
  }, {
    unique: true
  });

  module.exports = mongoose.model('Project', ProjectSchema);

})(require, module);
