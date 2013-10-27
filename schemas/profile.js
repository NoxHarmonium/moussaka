(function (require, module) {
  'use strict';

  var mongoose = require('mongoose');
  var config = require('../include/config');
  var Schema = mongoose.Schema;

  var ProfileSchema = new Schema({
    project: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    owner: {
      type: String,
      ref: 'User'
    },
    description: {
      type: String,
    },
    overlay: {
      type: Schema.Types.Mixed
    },
    parentProfile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    }
  });

  // Apply compound index over name and version
  ProfileSchema.index({
    projectName: 1,
    timestamp: -1,
  });
  //, {
  // Mongo cannot use 2 keys to determine uniqueness
  //unique: true, dropDups: true 
  //});

  module.exports = mongoose.model('Profile', ProfileSchema);

})(require, module);
