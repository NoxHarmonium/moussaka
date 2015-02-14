(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var serverModule = require('../src/server/server.js');
  var fakeSmtp = require('../src/server/email/fakeSmtp.js');
  var cheerio = require('cheerio');
  var colors = require('colors');
  var config = require('../src/shared/config.js');
  var Q = require('q');
  var mockgoose = require('mockgoose');
  var Factory = require('js-factories');
  var chance = require('chance').Chance();
  var _ = require('lodash');
  var S = require('string');

  var User = require('../src/client/resources/userResource.js');
  var ApiError = require('../src/client/exceptions/apiError.js');

  var chai = require('chai');
  var chaiAsPromised = require('chai-as-promised');

  chai.use(chaiAsPromised);

  var userFactory = require('./factories/userFactory.js');
  userFactory.register();

  // Shared functions

  var startFakeSmtpServer = function (emailRecvCallback) {
    return fakeSmtp.start();
  };

  var stopFakeSmtpServer = function () {
    return fakeSmtp.stop();
  };

  describe('Administration API tests', function () {

    beforeEach(function () {
      // Reset database before every test
      mockgoose.reset();
    });

    describe('should validate data correctly when adding new users',
      function () {

        var fields = {
          'username':   { min: 3, max: 40 },
          'firstName':  { min: 3, max: 40 },
          'lastName':   { min: 3, max: 40 }
        };
        var passwordField =  { min: 8, max: 40 };
        var fieldInfo = null;
        var field = null;

        _.each(fields, function(field) {
          fieldInfo = fields[field];

          it('should not create user without ' + field,
            function () {
              var user = Factory.create('user');
              var password = chance.string();
              delete user[field];

              return user.create(password)
                .should.be.rejectedWith(ApiError, /400/);
          });

          it('should not create user with ' + field + ' less than ' +
            fieldInfo.min + 'characters' , function () {
              var user = Factory.create('user');
              var password = chance.string();
              user[field] = S(user[field]).left(fieldInfo.min - 1).s;

              return user.create(password)
                .should.be.rejectedWith(ApiError, /400/);
          });

          it('should not create user with ' + field + ' more than ' +
            fields[field].max + 'characters' , function () {
              var user = Factory.create('user');
              var password = chance.string();
              user[field] = S(user[field]).pad(fieldInfo.max + 1).s;

              return user.create(password)
                .should.be.rejectedWith(ApiError, /400/);
          });

        });

        field = 'password';
        fieldInfo = passwordField;

        it('should not create user without ' + field,
            function () {
              var user = Factory.create('user');

              return user.create()
                .should.be.rejectedWith(ApiError, /400/);
          });

          it('should not create user with ' + field + ' less than ' +
            fieldInfo.min + 'characters' , function () {
              var user = Factory.create('user');
              var password = chance.string();
              password = S(password).left(fieldInfo.min - 1).s;

              return user.create(password)
                .should.be.rejectedWith(ApiError, /400/);
          });

          it('should not create user with ' + field + ' more than ' +
            fields[field].max + 'characters' , function () {
              var user = Factory.create('user');
              var password = chance.string();
              user[field] = S(password).pad(fieldInfo.max + 1).s;

              return user.create(password)
                .should.be.rejectedWith(ApiError, /400/);
          });

      });

    describe('should be able to perform basic user admin tasks', function () {
      it('should only be able to create user once',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(user.create)
            .should.be.rejectedWith(ApiError, /409/);
        });

      it('should not be able to login with wrong password',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(function () {
              user.login('wrong_password');
            })
            .should.be.rejectedWith(ApiError, /401/);
        });

      it('should be able to login with correct password',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(function () {
              user.login(user.password);
            })
            .should.be.fulfilled;
        });

      it('should not be able to get information on a user ' +
        'that doesn\'t exist', function () {
          return User.get('non-existant-user')
            .should.be.rejectedWith(ApiError, /404/);
        });

      it('should not be able to get information on a user that ' +
        'is not logged in', function () {
          var user1 = Factory.create('user');
          var user2 = Factory.create('user');
          return user1.create()
            .should.be.fulfilled
            .then(user2.create)
            .should.be.fulfilled
            .then(function () {
              user1.login(user1.password);
            })
            .should.be.fulfilled
            .then(User.get(user2.email))
            .should.be.rejectedWith(ApiError, /401/);
        });

      it(
        'should be able to get information on the currently logged in user',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(function () {
              user.login(user.password);
            })
            .should.be.fulfilled
            .then(User.get(user.email))
            .should.be.fulfilled;
        });

      it('should not be able to delete user if they are not logged in',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(user.delete)
            .should.be.rejectedWith(ApiError, /401/);
        });

      it('should be able to delete user if they are logged in as ' +
        'different user',
        function () {
          var user1 = Factory.create('user');
          var user2 = Factory.create('user');
          return user1.create()
            .should.be.fulfilled
            .then(user2.create())
            .should.be.fulfilled
            .then(function () {
              user1.login(user1.password);
            })
            .should.be.fulfilled
            .then(user2.delete)
            .should.be.rejectedWith(ApiError, /401/);
        });

      it('should be able to delete user if they are logged in',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(function () {
              user.login(user.password);
            })
            .should.be.fulfilled
            .then(user.delete)
            .should.be.fulfilled
            .then(function () {
              user.login(user.password);
            })
            .should.be.rejectedWith(ApiError, /401/);

        });

    });

    describe('should be able to change user passwords', function () {

      it('should not be able to change password for user ' +
        'if they are logged in', function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(function () {
              user.login(user.password);
            })
            .should.be.fulfilled
            .then(User.get(user.email))
            .should.be.rejectedWith(ApiError, /400/);
        });

      it('should not be able to change password with wrong ' +
        'existing password', function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(user.changePassword('wrong_password', 'new_password'))
            .should.be.rejectedWith(ApiError, /401/);
        });

      it('should be able to change password with correct ' +
        'existing password', function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(user.changePassword(user.password, 'new_password'))
            .should.be.fulfilled;
        });

      it('should not be able to login with old password ' +
        'after changing it', function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(user.changePassword(user.password, 'new_password'))
            .should.be.fulfilled
            .then(function () {
              user.login(user.password);
            })
            .should.be.rejectedWith(ApiError, /401/);
        });

      it('should be able to login with new password after changing it',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(user.changePassword(user.password, 'new_password'))
            .should.be.fulfilled
            .then(function () {
              user.login('new_password');
            })
            .should.be.fulfilled;
        });

    });

    describe('should be able to reset user passwords', function () {

      it('should not be able to reset password when logged in',
        function () {
          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(function () {
              user.login(user.password);
            })
            .should.be.fulfilled
            .then(user.resetPassword)
            .should.be.rejectedWith(ApiError, /400/);
        });

      it('should not be able to reset password for non-existant user',
        function () {
          var user = Factory.create('user');
          return user.resetPassword()
            .should.be.rejectedWith(ApiError, /404/);
        });

      /*
    it('should be able to reset password when not logged in',
        function () {
          if (!config.email_settings.enabled ||
            !config.email_settings.fake_smtp) {
            console.log('Test skipped because email support disabled'.yellow);
            return true;
          }

          var user = Factory.create('user');
          return user.create()
            .should.be.fulfilled
            .then(user.resetPassword)
            .should.be.fulfilled;
      });
*/

    });

  });

  /*

    it('Reset password for user [1]', function (done) {
      var user = users[1];

      if (!emailConfig.enabled || !emailConfig.fake_smtp) {
        console.log('Test skipped because email support disabled'.yellow);
        return done();
      }

      var emailRecieved = Q.defer();
      var fakeSmtpServer = null;

      var emailRecvCallback = function (email) {
        try {
          var $ = cheerio.load(email.body);
          var codeEl = $('#resetPasswordCode');
          if (codeEl.length > 0) {
            var code = codeEl.text();
            emailRecieved.resolve(code);
          } else {
            emailRecieved.reject(
              new Error('Code element not found in email.')
            );
          }
        } catch (err) {
          emailRecieved.reject(err);
        }
      };

      var requestPasswordCode = function () {
        var deferred = Q.defer();

        agent.post('http://localhost:3000/users/' + user.username +
          '/resetpassword/')
          .send()
          .end(function (e, res) {
            try {
              expect(e)
                .to.eql(null);
              expect(res.ok)
                .to.be.ok();
              deferred.resolve();
            } catch (err) {
              deferred.reject(err);
            }
          });
        return deferred.promise;
      };

      var waitForEmail = function () {
        return emailRecieved.promise;
      };

      var saveCodeForNextTest = function (code) {
        passwordResetCode = code;
      };

      startFakeSmtpServer(emailRecvCallback)
        .then(requestPasswordCode)
        .then(waitForEmail)
        .then(saveCodeForNextTest)
        .then(stopFakeSmtpServer)
        .then(done)
        .done();

    });

    it('Change password for user [1] without code or old password',
      function (
        done) {
        var user = users[1];

        agent.post('http://localhost:3000/users/' + user.username +
          '/password/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(400);
            done();
          });

      });

    it('Change password for user [1] using wrong temporary code',
      function (
        done) {
        var user = users[1];

        agent.post('http://localhost:3000/users/' + user.username +
          '/password/')
          .send({
            'tempPasswordCode': '',
            'newPassword': 'resettedPassword'

          })
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(400);
            done();
          });

      });

    it('Change password for user [1] using temporary code', function (
      done) {
      var user = users[1];

      agent.post('http://localhost:3000/users/' + user.username +
        '/password/')
        .send({
          'tempPasswordCode': passwordResetCode,
          'newPassword': 'resettedPassword'

        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });

    });

    it('Reset password for user [1] again', function (done) {
      var user = users[1];

      if (!emailConfig.enabled || !emailConfig.fake_smtp) {
        console.log('Test skipped because email support disabled'.yellow);
        return done();
      }

      var emailRecieved = Q.defer();
      var fakeSmtpServer = null;

      var emailRecvCallback = function (email) {
        try {
          var $ = cheerio.load(email.body);
          var codeEl = $('#resetPasswordCode');
          if (codeEl.length > 0) {
            var code = codeEl.text();
            emailRecieved.resolve(code);
          } else {
            emailRecieved.reject(
              new Error('Code element not found in email.')
            );
          }
        } catch (err) {
          emailRecieved.reject(err);
        }
      };

      var requestPasswordCode = function () {
        var deferred = Q.defer();

        agent.post('http://localhost:3000/users/' + user.username +
          '/resetpassword/')
          .send()
          .end(function (e, res) {
            try {
              expect(e)
                .to.eql(null);
              expect(res.ok)
                .to.be.ok();
              deferred.resolve();
            } catch (err) {
              deferred.reject(err);
            }
          });
        return deferred.promise;
      };

      var waitForEmail = function () {
        return emailRecieved.promise;
      };

      var saveCodeForNextTest = function (code) {
        passwordResetCode = code;
      };

      startFakeSmtpServer(emailRecvCallback)
        .then(requestPasswordCode)
        .then(waitForEmail)
        .then(saveCodeForNextTest)
        .then(stopFakeSmtpServer)
        .then(done)
        .done();

    });

    it('Expire temporary code for user [1]', function (done) {
      var user = users[1];
      agent.post(
        'http://localhost:3000/test/user_api/expirePassword/' +
        user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Change password for user [1] using expired temporary code',
      function (done) {
        var user = users[1];

        agent.post('http://localhost:3000/users/' + user.username +
          '/password/')
          .send({
            'tempPasswordCode': passwordResetCode,
            'newPassword': 'resettedPassword'

          })
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(400);
            done();
          });

      });

    it('Login user [0] with new password', function (done) {
      var user = users[1];

      agent.post('http://localhost:3000/login/')
        .send({
          username: user.username,
          password: 'resettedPassword'

        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });
  */


})(require, describe, it);
