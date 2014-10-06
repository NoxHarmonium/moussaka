(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;
  var timestamps = require('mongoose-timestamp');

  var ProjectSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    // sortingName is all uppercase for sorting purposes
    // MongoDB cant sort mixed case strings alphabetically
    // http://stackoverflow.com/questions/7644087/php-mongodb-sort-results-by-alphabetical
    sortingName: { 
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
    sortingName: 1
  });

  ProjectSchema.plugin(timestamps);

  module.exports = mongoose.model('Project', ProjectSchema);

})(require, module);
