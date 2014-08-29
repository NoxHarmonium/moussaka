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
  var emailSend = require('../include/emailSend.js');
  var Q = require('q');

  var emailConfig = config.email_settings;

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
        .catch(function (err) {
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
        .catch(function (err) {
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
        .catch(function (err) {
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
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    changePassword: function (req, res, next) {
      var data = req.body;
      var loggedInUser = req.user;
      var selectedUser = req.selectedUser;

      if (loggedInUser) {
        return res.send(400, {
          detail: 'Cannot change password when logged in'
        });
      }

      if (!selectedUser.tempPasswordCode &&
        !data.oldPassword) {
        return res.send(400, {
          detail: 'You need either \'tempPasswordCode\'' +
            'or \'oldPassword\' to change your password.'
        });
      }

      var verifyTempCode = function (tempCode) {
        var deferred = Q.defer();
        var exprTime = moment(selectedUser.passwordExpiry);

        if (selectedUser.passwordExpiry &&
          exprTime.isBefore()) {
          var err = new Error('Temporary password has expired. ' +
            'You need to create a new one');
          // Don't cause 500 error
          err.sendToClient = {
            code: 401
          };
          deferred.reject(err);
        } else {
          var isMatch =
            data.tempPasswordCode === selectedUser.tempPasswordCode;
          deferred.resolve(isMatch);
        }
        return deferred.promise;
      };

      var verifyOldPassword = function (oldPassword) {
        var deferred = Q.defer();

        req.selectedUser.comparePassword(oldPassword, function (err,
          isMatch) {

          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(isMatch);
          }
        });

        return deferred.promise;
      };

      var saveNewPassword = function (isMatch) {
        var deferred = Q.defer();

        if (!isMatch) {
          var err = new Error('Old password or temporary code is incorrect');
          // Don't cause 500 error
          err.sendToClient = {
            code: 401
          };
          deferred.reject(err);
        } else {
          selectedUser.password = data.newPassword;
          selectedUser.passwordExpiry = null;
          selectedUser.save(function (err) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve();
            }
          });
        }

        return deferred.promise;
      };

      var verifyMethod;

      if (selectedUser.tempPasswordCode) {
        verifyMethod = verifyTempCode(selectedUser.tempPasswordCode);
      } else {
        verifyMethod = verifyOldPassword(data.oldPassword);
      }

      verifyMethod
        .then(saveNewPassword)
        .then(function () {
          res.send(200);
        })
        .catch(function (err) {
          if (err.sendToClient) {
            res.send(err.sendToClient.code, {
              detail: err.sendToClient.message
            });
          } else {
            next(err);
          }
        });


    },

    resetPassword: function (req, res, next) {
      var selectedUser = req.selectedUser;
      var loggedInUser = req.user;
      var emailInfo = require('../emails.json')
        .forgottonPassword;

      if (!emailInfo) {
        next(new Error('Cannot find email template data'));
      }

      if (loggedInUser) {
        return res.send(400, {
          'detail': 'Cannot reset password while logged in'
        });
      }

      if (!selectedUser) {
        return res.send(404, {
          'detail': 'User not found'
        });
      }

      var generateTempPasswordCode = function () {
        var deferred = Q.defer();
        crypto.randomBytes(config.tempPasswordCodeLength,
          function (err, buf) {
            if (err) {
              deferred.reject(err);
            } else {
              var tempPwdCode = buf.toString('hex');
              deferred.resolve(tempPwdCode);
            }
          });
        return deferred.promise;
      };

      var saveTempPasswordCode = function (tempPwdCode) {
        req.selectedUser.tempPasswordCode = tempPwdCode;
        req.selectedUser.passwordExpiry = moment()
          .add(20, 'minutes');

        return selectedUser.saveQ();
      };

      var renderEmail = function (tempPwdCode) {
        var deferred = Q.defer();
        req.app.render(
          emailInfo.templateFile, {
            tempPwd: tempPwdCode
          },
          function (err, html) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(html);
            }
          });
        return deferred.promise;
      };

      var sendEmail = function (renderedHtml) {
        return emailSend.sendText({
          from: emailConfig.from,
          to: req.selectedUser._id,
          subject: emailInfo.subject,
          text: renderedHtml
        });
      };

      generateTempPasswordCode()
        .then(function (tempPwdCode) {
          return [
            saveTempPasswordCode(tempPwdCode),
            renderEmail(tempPwdCode)
          ];
        })
        .spread(function (saveResult, renderedEmail) {
          return sendEmail(renderedEmail);
        })
        .then(function (message) {
          res.send(200);
        })
        .catch(function (err) {
          if (err.previous) {
            // emailjs hides the actual error sometimes.
            // Extract it if it exists.
            next(err.previous);
          } else {
            next(err);
          }
        })
        .done();
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
