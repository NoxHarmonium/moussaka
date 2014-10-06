/*
 * Passport Authentication Setup
 */
(function (require, module) {
  'use strict';

  var passport = require('passport');
  var LocalStrategy = require('passport-local')
    .Strategy;
  var S = require('string');
  var _ = require('lodash');
  // TODO: This is so hacky. The original author made a new
  // version on github but didn't update his npm package so
  // somebody did a fork. Someday I hope this will be resolved.
  // SRC: https://github.com/cholalabs/passport-localapikey/issues/9
  var LocalAPIKeyStrategy = require('passport-localapikey-update')
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

      passport.use(new LocalAPIKeyStrategy(
        function (apiKey, done) {
          User.findOne({
            apiKey: apiKey
          }, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false, {
                detail: 'Incorrect API key'
              });
            }
            return done(null, user);
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
    },
    apiKeyAuthoriser: function (req, res, next) {
      passport.authenticate('localapikey', {
          session: false
        },
        function (err, user, info) {
          if (err) {
            return next(err);
          }
          if (user) {
            req.user = user;
            //console.log('API Authenticated with user: ' + user._id);
          }
          next();
        })(req, res, next);
    },
    ensureAuth: function (req, res, next) {
      var path = S(req.path)
        .chompRight('/');
      var isView = path.startsWith('/views/');
      var publicViews = [
        '/views/auth',
        '/views/partials/login',
        '/views/partials/createAccount'
      ];
      if (isView && !_.contains(publicViews, path.s) && !req.user) {
        res.redirect('/views/auth/#/login');
      } else {
        next();
      }
    }
  };
})(require, module);
