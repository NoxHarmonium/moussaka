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
  var crypto = require('crypto');

  module.exports = {

    //
    // Parameters
    //

    pUser: function (req, res, next, email) {
      var getUser = User.findOne({
        '_id': email
      });

      getUser.execQ()
        .then(function (user) {
          req.selectedUser = user;
          next();
        })
        .fail(function (err) {
          next(err);
        })
        .done();
    },

    //
    // API Methods
    //

    listUsers: function (req, res, next) {
      var getUsers = User.find();

      getUsers.select('_id');

      getUsers.execQ()
        .then(function (users) {
          res.send(users);
        })
        .fail(function (err) {
          next(err);
        })
        .done();
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
      var currentUser = req.user;
      var selectedUser = req.selectedUser;

      if (!currentUser) {
        return res.send(401, {
          detail: 'You are not logged in as a user'
        });
      }

      if (currentUser._id !== selectedUser._id) {
        return res.send(401, {
          detail: 'A user can only delete their own account'
        });
      }

      currentUser.removeQ()
        .then(function () {
          req.logout();
          res.send(200);
        })
        .fail(function (err) {
          next(err);
        })
        .done();
    },

    putUser: function (req, res, next) {
      var data = req.body;

      if (req.selectedUser) {
        return res.send(409, {
          detail: 'User already exists'
        });
      }

      var newUser = new User({
        _id: data.username,
        password: data.password
      });

      newUser.saveQ()
        .then(function () {
          res.send(201);
        })
        .fail(function (err) {
          next(err);
        })
        .done();
    },

    changePassword: function (req, res, next) {

      if (req.user) {
        return res.send(400, {
          detail: 'Cannot change password when logged in'
        });
      }

      if (req.selectedUser.passwordExpiry &&
        moment(req.selectedUser.passwordExpiry)
        .isBefore()) {
        return res.send(401, {
          detail: 'Temporary password has expired. You need to create a new one'
        });
      }

      req.selectedUser.comparePassword(req.body.oldPassword,
        function (err, isMatch) {
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
      var selectedUser = req.selectedUser;

      if (!selectedUser) {
        return res.send(404, {
          'detail': 'User not found'
        });
      }

      crypto.randomBytes(8, function (ex, buf) {
        var tempPwd = buf.toString('hex');
        req.selectedUser.password = tempPwd;
        req.selectedUser.passwordExpiry = moment()
          .add('minutes', 10);

        selectedUser.saveQ()
          .then(function () {
            // TODO: Actually send email to user
            console.log('Would send email to user with temp password: ' +
              tempPwd);
            res.send(200);
          })
          .fail(function (err) {
            next(err);
          })
          .done();
      });
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

        if (user && user.passwordExpiry) {
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
      res.send(200, testData.getTestUsers());
    },

    resetTests: function (req, res, next) {
      var testUsers = testData.getTestUsers(),
        emails = [],
        i;

      for (i = 0; i < testUsers.length; i++) {
        emails.push(testUsers[i].username);
      }

      //console.log(emails);

      var query = User.find({
        '_id': {
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
