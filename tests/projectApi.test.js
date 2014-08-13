(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var utils = require('../include/utils.js');
  var config = require('../include/config.js');
  var serverModule = require('../server.js');
  var _ = require('lodash');
  var Q = require('q');
  var S = require('string');

  var _formatTestIndex = function (index) {
    // Mongo uses alphabetical sorting so simply appending
    // numbers doesn't sort properly. 
    return S(index)
      .padLeft(3, '0');
  };

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

    it('Reset users test', function (done) {
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

    it('Reset project test', function (done) {
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

    it('Add user [1] to project [0] before login (', function (done) {
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

    it('Add user [1] as admin to project [0] before login', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
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

    it('Remove user [1] as admin from project [0] before login', function (
      done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
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

          done();
        });
    });

    // Add/remove project users

    it('Add user [1] to non existant project', function (done) {
      var project = {
        _id: 'bogusprojectid'
      };
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Add non existant user to project [0]', function (done) {
      var project = projects[0];
      var user = {
        username: 'bogus@test.com'
      };

      agent.put('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Logout user [2]', function (done) {
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

    it('Add user [1] to project [0] ' +
      'logged in as a non admin user', function (done) {
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

    it('Add current admin as user to project [0]', function (done) {
      var project = projects[0];
      var user = users[2];

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

    it('Add user [0] to project [0]', function (done) {
      var project = projects[0];
      var user = users[0];

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
          _.pull(project.users, user.username);

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
            .to.be(project.users.length);

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          done();
        });
    });

    it('Add user [1] to project [0] again', function (done) {
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

    // Add/remove project admins

    it('Add user [1] as admin to non existant project', function (done) {
      var project = {
        _id: 'bogusprojectid'
      };
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Add non existant user as admin to project [0]', function (done) {
      var project = projects[0];
      var user = {
        username: 'bogus@test.com'
      };

      agent.put('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Logout user [2]', function (done) {
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

    it('Add user [1] as admin to project [0] ' +
      'logged in as non admin user', function (done) {
        var project = projects[0];
        var user = users[1];

        agent.put('http://localhost:3000/projects/' + project._id +
          '/admins/' + user.username + '/')
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

    it('Add user [1] as admin to project [0]', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Make sure user [1] is not in both
          // the admin and user lists
          project.admins.push(user.username);
          _.pull(project.users, user.username);

          done();
        });
    });

    it('Add user [1] as admin to project [0] (duplicate)', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.put('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);

          done();
        });
    });

    it('List projects after admin added', function (done) {
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

    it('Get existing project [0] after admin added', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);

          expect(res.ok)
            .to.be.ok();

          expect(res.body.admins.length)
            .to.be(2);

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          done();
        });
    });

    it('Remove user [1] as admin from project [0]', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          // Delete user from test data
          _.pull(project.admins, user.username);

          done();
        });
    });

    it('List projects after admins removed', function (done) {
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

    it('Get existing project [0] after admin removed', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.admins.length)
            .to.be(1);

          expect(utils.objMatch(res.body, project))
            .to.be.ok();

          done();
        });
    });

    it('Try to remove user [2] as last admin', function (done) {
      var project = projects[0];
      var user = users[2];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/admins/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    // Pagination

    it('Reset project test', function (done) {
      agent.get('http://localhost:3000/test/project_api/reset/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });
    });

    it('Create 200 projects', function (done) {
      var project = {
        name: 'TEST_DATA_DELETE',
        users: [],
        admins: ['test.account3@test.com'],
        description: 'This one has a description'
      };

      var currentProjectIndex = 0;
      var maxProjectIndex = 200;

      var createTestProject = function (index) {
        var deferred = Q.defer();

        project.name = 'TEST_DATA_DELETE_' +
          _formatTestIndex(currentProjectIndex);

        agent.put('http://localhost:3000/projects/')
          .send(project)
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.ok)
              .to.be.ok();
            deferred.resolve();
            currentProjectIndex++;
          });
        return deferred.promise;
      };

      // Chain calls sequentially
      var result = createTestProject();
      for (var i = 1; i < maxProjectIndex; i++) {
        result = result.then(createTestProject);
      }
      result.then(function () {
        done(); // Finish test step
      });
    });

    it('List projects to test record limit', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be(config.max_records_per_query);
          done();
        });
    });

    it('Test pagination (20-39)', function (done) {
      var min = 20;
      var max = 39;

      agent.get('http://localhost:3000/projects/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].name)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (30-40)', function (done) {
      var min = 30;
      var max = 40;

      agent.get('http://localhost:3000/projects/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].name)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (40-30)', function (done) {
      var min = 40;
      var max = 30;

      agent.get('http://localhost:3000/projects/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);

          done();
        });
    });

    it('Test pagination (30-30)', function (done) {
      var min = 30;
      var max = 30;

      agent.get('http://localhost:3000/projects/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].name)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test pagination (10-90)', function (done) {
      var min = 10;
      var max = 90;

      agent.get('http://localhost:3000/projects/')
        .query({
          minRecord: min
        })
        .query({
          maxRecord: max
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          max = min + config.max_records_per_query - 1;

          expect(res.body.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body[i - min].name)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });




  });
})(require, describe, it);
