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
    description: {
      type: String,
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
    profiles: [{
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    }]
  });

  // Apply compound index over name and version
  ProjectSchema.index({
    name: 1,
    version: 1
  });
  //, {
  // Mongo cannot use 2 keys to determine uniqueness
  //unique: true, dropDups: true 
  //});

  module.exports = mongoose.model('Project', ProjectSchema);

})(require, module);
