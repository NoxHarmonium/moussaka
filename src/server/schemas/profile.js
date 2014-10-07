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
      message: 'Profile name should be between 3 and 100 characters'
    })
  ];

  var emailValidator = [
    validate({
      validator: 'isEmail',
      message: 'Owner should be in a valid email format'
    })
  ];

  var ProfileSchema = new Schema({
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    projectVersion: {
      type: String,
      required: true,
      trim: true
    },
    profileName: {
      type: String,
      required: true,
      trim: true,
      validate: nameValidator
    },
    profileData: {
      type: Schema.Types.Mixed,
      required: true
    },
    owner: {
      type: String,
      required: true,
      trim: true,
      validator: emailValidator
    }
  });

  ProfileSchema.plugin(timestamps);

  module.exports = mongoose.model('Profile', ProfileSchema);

})(require, module);
