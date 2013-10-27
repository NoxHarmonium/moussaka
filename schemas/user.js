(function (require, module) {
  'use strict';
  // Thanks 
  // http://stackoverflow.com/questions/14588032/mongoose-password-hashing

  var mongoose = require('mongoose');
  var bcrypt = require('bcrypt');
  var config = require('../include/config');
  var Schema = mongoose.Schema;

  var UserSchema = new Schema({
    _id: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },

  });

  UserSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) {
      return next();
    }

    bcrypt.genSalt(config.salt_work_factor, function (err, salt) {
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }

        user.password = hash;
        next();

      });
    });
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
