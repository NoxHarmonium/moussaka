/*
 * User Administration Business Logic
 */

(function (require, module) {

  'use strict';

  var moment = require('moment');
  var User = require('../schemas/user.js');
  var passport = require('passport');
  var testData = require('../tests/testData.js');
  var config = require('../include/config.js');

  module.exports = {

    listUsers: function (req, res, next) {
      var query = User.find();
      query.select('email');

      query.exec(function (err, user) {
        if (err) {
          return next(err);
        }
        return res.send(user);
      });
    },

    pUser: function (req, res, next, email) {
      var query = User.findOne({
        'email': email
      });
      query.exec(function (err, user) {
        if (err) {
          return next(err);
        }
        req.selectedUser = user;
        next();
      });
    },

    getUser: function (req, res) {
      if (req.user) {
        return res.send({
          username: req.user.username
        });
      } else {
        return res.send(404, {
          detail: 'User doesn\'t exist'
        });
      }
    },

    deleteUser: function (req, res, next) {

      if (req.user && req.user.email === req.selectedUser.email) {
        return req.user.remove(function (err) {
          if (err) {
            next(err);
          }
          req.logout();
          return res.send(200);
        });
      }
      return res.send(401);
    },

    putUser: function (req, res, next) {
      //console.log(('Create user request: Username: ' + 
      //  req.body.username + ' Password:' + 
      //  req.body.password).green);

      if (req.selectedUser) {
        //console.log('Warning: User already exists'.yellow);
        return res.send(409, {
          detail: 'User already exists'
        });
      }

      var newUser = new User();
      newUser.email = req.body.username;
      newUser.password = req.body.password;
      newUser.save(
        function (err) {
          if (err) {
            next(err);
          }
          return res.send(201);
        }
      );
    },

    changePassword: function (req, res, next) {

      if (req.user) {
        return res.send(400, {
          detail: 'Cannot change password when logged in'
        });
      }

      if (req.selectedUser.passwordExpiary &&
        moment(req.selectedUser.passwordExpiary)
        .isBefore()) {
        return res.send(401, {
          detail: 'Temporary password has expired. You need to create a new one'
        });
      }

      req.selectedUser.comparePassword(req.body.oldPassword, function (err,
        isMatch) {

        if (err) {
          return next(err);
        }

        if (isMatch) {
          req.selectedUser.password = req.body.newPassword;
          req.selectedUser.save(function (err) {
            if (err) {
              next(err);
            }

            return res.send(200);
          });
        } else {
          return res.send(401, {
            detail: 'Old password was incorrect'
          });
        }
      });

    },

    resetPassword: function (req, res, next) {

      if (req.selectedUser) {

        require('crypto')
          .randomBytes(8, function (ex, buf) {
            var tempPwd = buf.toString('hex');
            req.selectedUser.password = tempPwd;
            req.selectedUser.passwordExpiary = moment()
              .add('minutes', 10);
            req.selectedUser.save(function (err) {
              if (err) {
                next(err);
              }

              console.log('Would send email to user with temp password: ' +
                tempPwd);


              return res.send(200);

              // TODO: Actually send email here
            });
          });
      } else {
        return res.send(404, {
          'detail': 'User not found'
        });
      }

    },

    logout: function (req, res, next) {
      if (req.user) {
        req.logout();
      }

      return res.send(200);
    },

    login: function (req, res, next) {
      passport.authenticate('local', function (err, user, info) {
        if (err) {
          return next(err);
        }

        if (user && user.passwordExpiary) {
          return req.send(401, {
            'detail': 'You cannot login with a temporary password. '
          });
        }

        if (!user) {
          return res.send(401, {
            'detail': 'Incorrect username/password'
          });
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          return res.send(200);
        });
      })(req, res, next);
    },

    //
    // Test extensions
    //
    getTestUsers: function (req, res, next) {
      res.send(200, testData.testUsers);
    },

    resetTests: function (req, res, next) {
      var testUsers = testData.testUsers,
        emails = [],
        i;

      for (i = 0; i < testUsers.length; i++) {
        emails.push(testUsers[i].username);
      }

      console.log(emails);

      var query = User.find({
        'email': {
          $in: emails
        }
      });
      query.exec(function (err, users) {
        if (err) {
          return next(err);
        }
        for (i = 0; i < users.length; i++) {
          users[i].remove();
        }
        return res.send(200);
      });
    }
  };



})(require, module);
