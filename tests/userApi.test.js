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

  // Shared functions

  var startFakeSmtpServer = function (emailRecvCallback) {
    return fakeSmtp.start(emailRecvCallback);
  };

  var stopFakeSmtpServer = function () {
    return fakeSmtp.stop();
  };

  describe('Administration API tests', function () {
    var id;
    var users = testData.getTestUsers();
    var agent = superagent.agent();
    var emailConfig = config.email_settings;
    var passwordResetCode = null;

    it('Reset test', function (done) {
      agent.get('http://localhost:3000/test/user_api/reset/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Create user [0] without username', function (done) {
      agent.put('http://localhost:3000/users/' + users[0].username +
        '/')
        .send({
          password: users[0].password
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);
          done();
        });
    });

    it('Create user [0] without password', function (done) {
      agent.put('http://localhost:3000/users/' + users[0].username +
        '/')
        .send({
          username: users[0].username
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);
          done();
        });
    });

    it('Create user [0]', function (done) {
      agent.put('http://localhost:3000/users/' + users[0].username +
        '/')
        .send(users[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(201);
          done();
        });
    });

    it('Attempt to create existing user [0]', function (done) {
      agent.put('http://localhost:3000/users/' + users[0].username +
        '/')
        .send(users[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);
          done();
        });
    });

    it('Create user [1]', function (done) {
      agent.put('http://localhost:3000/users/' + users[1].username +
        '/')
        .send(users[1])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(201);
          done();
        });
    });

    it('Create user [2]', function (done) {
      agent.put('http://localhost:3000/users/' + users[2].username +
        '/')
        .send(users[2])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(201);
          done();
        });
    });


    it('Login user [0] with incorrect password', function (done) {
      var u = {
        username: users[0].username,
        password: 'incorrect'
      };


      agent.post('http://localhost:3000/login/')
        .send(u)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });

    });

    it('Login user [0] with correct password', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });

    });

    it('Get login information for non-existant user', function (done) {
      agent.get('http://localhost:3000/users/' + 'fake@nonexist.com' +
        '/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);
          done();
        });
    });

    it('Get login information for non logged in user [1]', function (
      done) {
      agent.get('http://localhost:3000/users/' + users[1].username +
        '/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it('Get login information for user', function (done) {
      agent.get('http://localhost:3000/users/' + users[0].username +
        '/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.data.password)
            .to.be(undefined);
          done();
        });
    });



    it(
      'Attempt to change password for user [0] before they are logged out',
      function (done) {
        agent.post('http://localhost:3000/users/' + users[0].username +
          '/password/')
          .send({
            'oldPassword': users[0].password,
            'newPassword': 'new password'

          })
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(400);
            done();
          });
      });

    it('Logout user [0]', function (done) {
      agent.post('http://localhost:3000/logout/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });

    });

    it('Attempt to delete user [0] while logged out', function (done) {
      agent.del('http://localhost:3000/users/' + users[0].username +
        '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it(
      'Attempt to change password for user [0] with incorrect password',
      function (done) {
        agent.post('http://localhost:3000/users/' + users[0].username +
          '/password/')
          .send({
            'oldPassword': 'incorrect',
            'newPassword': 'new password'
          })
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(400);
            done();
          });
      });

    it('Change password for user [0] with correct password', function (
      done) {
      agent.post('http://localhost:3000/users/' + users[0].username +
        '/password/')
        .send({
          'oldPassword': users[0].password,
          'newPassword': 'new password'

        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Login user [0] with old password', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });

    });

    it('Login user [0] with new password', function (done) {

      agent.post('http://localhost:3000/login/')
        .send({
          username: users[0].username,
          password: 'new password'

        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });


    it('Delete user [0]', function (done) {
      agent.del('http://localhost:3000/users/' + users[0].username +
        '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });
    });

    it('Attempt to login user [0] with new password after deletion',
      function (
        done) {

        agent.post('http://localhost:3000/login/')
          .send({
            username: users[0].username,
            password: 'new password'

          })
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(401);
            done();
          });
      });


    it('Login user [1]', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[1])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });

    });

    it('Attempt to delete user [2] logged in as user [1]', function (
      done) {
      agent.del('http://localhost:3000/users/' + users[2].username +
        '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it('Reset password for user [1] while logged in', function (done) {
      var user = users[1];

      agent.post('http://localhost:3000/users/' + user.username +
        '/resetpassword/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);
          done();
        });

    });

    it('Logout user [1]', function (done) {
      agent.post('http://localhost:3000/logout/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Reset password for user [0]', function (done) {
      agent.post('http://localhost:3000/users/' + users[0].username +
        '/resetpassword/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);
          done();
        });

    });

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


  });

})(require, describe, it);
