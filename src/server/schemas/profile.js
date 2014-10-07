(function (require, module) {
  'use strict';

  var mongoose = require('mongoose-q')();
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;
  var timestamps = require('mongoose-timestamp');

  var emailValidator = require('validators/emailValidator.js');
  var nameValidator = require('validators/nameValidator.js');
  var projVersionValidator =
    require('validators/projectVersionValidator.js');

  var ProfileSchema = new Schema({
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    projectVersion: {
      type: String,
      required: true,
      trim: true,
      validator: projVersionValidator
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
