(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;

  var ProjectSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
    },
    admins: [String], // Referencing user email address
    users: [String] // Referencing user email address
  });

  // Apply index over name
  ProjectSchema.index({
    name: 1
  });
  //, {
  // Mongo cannot use 2 keys to determine uniqueness
  //unique: true, dropDups: true 
  //});

  module.exports = mongoose.model('Project', ProjectSchema);

})(require, module);
