/*
 * User Administration Business Logic
 */

(function (require, module) {

  'use strict';

  var moment = require('moment');
  var User = require('../schemas/user.js');
  var passport = require('passport');
  var testData = require('../../../tests/testData.js');
  var config = require('../../shared/config.js');
  var crypto = require('crypto');
  var emailSend = require('../email/emailSend.js');
  var Q = require('q');
  var utils = require('../../shared/utils.js');
  var emailTemplates = require('../../../emails.json');
  var queryFilters = require('../include/queryFilters.js');

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

    getUser: function (req, res) {
      var loggedInUser = req.user;
      var selectedUser = req.selectedUser;

      // TODO: Should you be able to get limited information
      // on user who you share a project with?

      if (!selectedUser) {
        return res.status(404)
          .send({
            detail: 'User doesn\'t exist'
          });
      }

      if (loggedInUser._id !== selectedUser._id) {
        return res.status(401)
          .send({
            detail: 'Can only get information on logged in user.'
          });
      }

      return res.status(200)
        .send({
          data: {
            username: loggedInUser.username,
            apiKey: loggedInUser.apiKey,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName
          }
        });
    },

    deleteUser: function (req, res, next) {
      var currentUser = req.user;
      var selectedUser = req.selectedUser;

      if (!currentUser) {
        return res.status(401)
          .send({
            detail: 'You are not logged in as a user'
          });
      }

      if (currentUser._id !== selectedUser._id) {
        return res.status(401)
          .send({
            detail: 'A user can only delete their own account'
          });
      }

      currentUser.removeQ()
        .then(function () {
          req.logout();
          res.status(200)
            .send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    },

    putUser: function (req, res, next) {
      if (!config.allow_signup) {
        return res.status(401)
          .send({
            detail: 'Sign up is disabled on this server'
          });
      }


      var data = req.body;

      if (req.selectedUser) {
        return res.status(409)
          .send({
            detail: 'User already exists'
          });
      }

      if (!utils.isNonEmptyString(data.username) ||
        !utils.isNonEmptyString(data.password)) {
        return res.status(409)
          .send({
            detail: 'Both username and password fields are required'
          });
      }

      var newUser = new User({
        _id: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      newUser.saveQ()
        .then(function (savedUser) {
          res.status(201)
            .send({
              data: {
                username: savedUser.username,
                apiKey: savedUser.apiKey,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName
              }
            });
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
        return res.status(400)
          .send({
            detail: 'Cannot change password when logged in'
          });
      }

      if (!data.tempPasswordCode &&
        !data.oldPassword) {
        return res.status(400)
          .send({
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
            code: 400
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
            code: 400
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
          res.status(200)
            .send();
        })
        .catch(function (err) {
          if (err.sendToClient) {
            res.status(err.sendToClient.code)
              .send({
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
      var emailInfo = emailTemplates
        .forgottonPassword;

      if (!emailInfo) {
        next(new Error('Cannot find email template data'));
      }

      if (loggedInUser) {
        return res.status(400)
          .send({
            'detail': 'Cannot reset password while logged in'
          });
      }

      if (!selectedUser) {
        return res.status(404)
          .send({
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
        // Remember!: Render is relative to the app views directory
        // i.e. <appdir>/views/
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
          res.status(200)
            .send();
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

      res.clearCookie('userEmail');

      return res.status(200)
        .send();
    },

    login: function (req, res, next) {
      passport.authenticate('local', function (err, user, info) {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401)
            .send({
              'detail': 'Incorrect username/password'
            });
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          // Set a cookie so that client side can
          // user logic based on email
          res.cookie('userEmail', user._id);
          return res.status(200)
            .send();
        });
      })(req, res, next);
    },

    //
    // Test extensions
    //

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
        return res.status(200)
          .send();
      });
    },

    expireTempPassword: function (req, res, next) {
      var selectedUser = req.selectedUser;
      selectedUser.passwordExpiry = moment();

      selectedUser.saveQ()
        .then(function () {
          res.status(200)
            .send();
        })
        .catch(function (err) {
          next(err);
        })
        .done();
    }

  };



})(require, module);
