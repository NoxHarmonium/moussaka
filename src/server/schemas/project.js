(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;
  var timestamps = require('mongoose-timestamp');
  var validate = require('mongoose-validator');


  var nameValidator = [
    validate({
      validator: 'isLength',
      arguments: [3, 100],
      message: 'Project name should be between 3 and 100 characters'
    })
  ];

  var sortValidator = [
    validate({
      validator: 'isUppercase',
      message: 'The sorting name should be only in uppercase'
    }),
    validate({
      validator: 'isLength',
      arguments: [3, 100],
      message: 'The sorting name should be between 3 and 100 characters'
    })
  ];

  var descriptionValidator = [
    validate({
      validator: 'isLength',
      arguments: [0, 500],
      message: 'Project description should be less than 500 characters',
      passIfEmpty: true
    })
  ];

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
      validate: sortValidator
    },
    description: {
      type: String,
      validate: descriptionValidator
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
