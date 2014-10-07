(function (require, module) {
  'use strict';
  // Thanks 
  // http://stackoverflow.com/questions/14588032/mongoose-password-hashing

  var mongoose = require('mongoose-q')();
  var bcrypt = require('bcrypt');
  var config = require('../../shared/config.js');
  var Schema = mongoose.Schema;
  var uuid = require('node-uuid');
  var Q = require('q');
  var validator = require('validator');

  var emailValidator = require('./validators/emailValidator.js');
  var nameValidator = require('./validators/nameValidator.js');
  var passwordValidator = require('./validators/passwordValidator.js');
  var apiKeyValidator = require('./validators/apiKeyValidator.js');
  var tempPasswordValidator = require('./validators/tempPasswordValidator.js');

  var UserSchema = new Schema({
    _id: {
      type: String,
      required: true,
      trim: true,
      validate: emailValidator
    },
    password: {
      type: String,
      required: true,
      trim: true // Validated at hashing stage
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      validate: nameValidator
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      validate: nameValidator
    },
    tempPasswordCode: {
      type: String,
      trim: true,
      validate: tempPasswordValidator
    },
    passwordExpiry: {
      type: Date
    },
    apiKey: {
      type: String,
      default: uuid.v4,
      unique: true,
      trim: true,
      validate: apiKeyValidator
    }

  });

  var genSalt = function (user) {
    var deferred = Q.defer();

    bcrypt.genSalt(config.salt_work_factor, function (err, salt) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve({
          user: user,
          salt: salt
        });
      }
    });

    return deferred.promise;
  };

  var hash = function (result) {
    var deferred = Q.defer();

    bcrypt.hash(result.user.password,
      result.salt, function (err, hash) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(hash);
        }
      });

    return deferred.promise;
  };

  UserSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) {
      return next();
    }

    // Pre-hash validation
    if (!validator.isLength(user.password, 8, 40)) {
      next(new mongoose.Error(
        'Password length must be between 8 and 40 characters.'));
    }

    genSalt(user)
      .then(hash)
      .then(function (hash) {
        user.password = hash;
        next();
      })
      .done();

  });

  UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    if (!candidatePassword) {
      cb(new Error('Cannot compare a null password'));
    }

    if (!this.password) {
      cb(new Error(
        'Cannot compare password on a user object with an undefined password'
      ));
    }

    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  };

  module.exports = mongoose.model('User', UserSchema);

})(require, module);
