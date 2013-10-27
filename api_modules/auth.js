/*
 * Passport Authentication Setup
 */
(function (require, module) {
  'use strict';

  var passport = require('passport');
  var LocalStrategy = require('passport-local')
    .Strategy;
  var User = require('../schemas/user.js');

  module.exports = {
    init: function (next) {
      passport.use(new LocalStrategy(
        function (email, password, done) {
          User.findOne({
            _id: email
          }, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              //console.log('Incorrect email');
              return done(null, false, {
                detail: 'Incorrect email'
              });
            }
            user.comparePassword(password, function (err, isMatch) {
              if (isMatch) {
                return done(null, user);
              }

              //console.log('Incorrect password');
              return done(null, false, {
                detail: 'Incorrect password'
              });

            });
          });
        }
      ));

      passport.serializeUser(function (user, done) {
        done(null, user.id);
      });

      passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
          done(err, user);
        });
      });
    }
  };
})(require, module);
