(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var utils = require('../include/utils.js');
  var serverModule = require('../server.js');


  describe('Project API tests', function () {
    var id;
    var users = testData.getTestUsers();
    var projects = testData.getTestProjects();
    var agent = superagent.agent();

    it('Start server', function (done) {
      serverModule.start(function (e, server) {
        expect(e)
          .to.eql(null);

        done();
      });
    });

    it('Reset test', function (done) {
      agent.get('http://localhost:3000/test/project_api/reset/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('List projects before login', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it('Create project [0] before login', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });

    });

    it('Get existing project [0] before login', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it('Add user [1] to project [0] before login', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });

    it('Remove user [1] from project [0] before login', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);
          done();
        });
    });


    it('Login user [2]', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[2])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });

    });

    it('List projects', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.length)
            .to.be(0);

          done();
        });
    });

    it('Get project [0] before creation', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);
          done();
        });
    });

    it('Create project [0]', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Set test data id to the returned id
          project._id = res.body._id;

          done();
        });

    });

    it('Create project [1]', function (done) {
      var project = projects[1];

      agent.put('http://localhost:3000/projects/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Set test data id to the returned id
          project._id = res.body._id;

          done();
        });

    });

    it('Create project [2]', function (done) {
      var project = projects[2];

      agent.put('http://localhost:3000/projects/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Set test data id to the returned id
          project._id = res.body._id;

          done();
        });

    });

    it('List projects', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be(3);
          var match =
            utils.arrayMatch(res.body, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });

    it('Get existing project [0]', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          done();
        });
    });

    it('Get existing project [1]', function (done) {
      var project = projects[1];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          var match =
            utils.arrayMatch(res.body, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });


    it('Get existing project [2]', function (done) {
      var project = projects[2];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          var match =
            utils.arrayMatch(res.body, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });

    it('Add user [1] to project [0]', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          project.users.push(user.username);

          done();
        });
    });

    it('Add user [1] to project [0] (duplicate)', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);

          done();
        });
    });

    it('Add user [2] to project [0]', function (done) {
      var project = projects[0];
      var user = users[2];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          project.users.push(user.username);

          done();
        });
    });

    it('List projects after users added', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.length)
            .to.be(3);

          var match =
            utils.arrayMatch(res.body, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });

    it('Get existing project [0] after users added', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);

          expect(res.ok)
            .to.be.ok();

          expect(res.body.users.length)
            .to.be(2);

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          var match =
            utils.arrayMatch(res.body, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });

    it('Remove user [1] from project [0]', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Delete user from test data
          project.users.splice(
            project.users.indexOf(user.username),
            1);

          done();
        });
    });

    it('List projects after user removed', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be(3);

          var match =
            utils.arrayMatch(res.body, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });

    it('Get existing project [0] after user removed', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.users.length)
            .to.be(1);

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          var match =
            utils.arrayMatch(res.body, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });



  });

})(require, describe, it);
