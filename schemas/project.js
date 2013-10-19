(function (require, module) {
  'use strict';

  var mongoose = require('mongoose');
  var config = require('../include/config');
  var Schema = mongoose.Schema;

  var ProjectSchema = new Schema({
    name: {
      type: String,
      required: true,
      index: {
        unique: true
      }
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

  module.exports = mongoose.model('Project', ProjectSchema);

})(require, module);
