(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var serverModule = require('../server.js');


  describe('Administration API tests', function () {
    var id;
    var users = testData.testUsers;
    var agent = superagent.agent();

    it('Start server', function (done) {
      serverModule.start(function (e, server) {
        expect(e)
          .to.eql(null);

        done();
      });
    });

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

    it('Create user [0]', function (done) {
      agent.put('http://localhost:3000/users/' + users[0].username + '/')
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
      agent.put('http://localhost:3000/users/' + users[0].username + '/')
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
      agent.put('http://localhost:3000/users/' + users[1].username + '/')
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
      agent.put('http://localhost:3000/users/' + users[2].username + '/')
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

    it('Get login information for user', function (done) {
      agent.get('http://localhost:3000/users/' + users[0].username + '/')
        .send()
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.password)
            .to.be(undefined);
          done();
        });
    });



    it('Attempt to change password for user [0] before they are logged out',
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
      agent.get('http://localhost:3000/logout/')
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
      agent.del('http://localhost:3000/users/' + users[0].username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it('Attempt to change password for user [0] with incorrect password',
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
              .to.be(401);
            done();
          });
      });

    it('Change password for user [0] with correct password', function (done) {
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
      agent.del('http://localhost:3000/users/' + users[0].username + '/')
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

    it('Attempt to delete user [2] logged in as user [1]', function (done) {
      agent.del('http://localhost:3000/users/' + users[2].username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it('Logout user [1]', function (done) {
      agent.get('http://localhost:3000/logout/')
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
      agent.post('http://localhost:3000/users/' + users[1].username +
        '/resetpassword/')
        .send()
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
