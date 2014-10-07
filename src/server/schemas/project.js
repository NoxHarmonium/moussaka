(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;
  var timestamps = require('mongoose-timestamp');

  var nameValidator = require('validators/nameValidator.js');
  var sortNameValidator = require('validators/sortNameValidator.js');
  var descriptionValidator = require('validators/descriptionValidator.js');
  var emailValidator = require('validators/emailValidator.js');

  var ProjectSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: nameValidator
    },
    // sortingName is all uppercase for sorting purposes
    // MongoDB cant sort mixed case strings alphabetically
    // http://stackoverflow.com/questions/7644087/php-mongodb-sort-results-by-alphabetical
    sortingName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: sortNameValidator
    },
    description: {
      type: String,
      validate: descriptionValidator
    },
    admins: { // Referencing user email address
      type: [String],
      validate: [emailValidator]
    },
    users: [String] // Referencing user email address
  });

  // Apply index over name
  ProjectSchema.index({
    sortingName: 1
  });

  ProjectSchema.plugin(timestamps);

  module.exports = mongoose.model('Project', ProjectSchema);

})(require, module);
