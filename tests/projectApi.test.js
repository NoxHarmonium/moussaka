(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var testData = require('./testData.js');
  var utils = require('../src/shared/utils.js');
  var config = require('../src/shared/config.js');
  var serverModule = require('../src/server/server.js');
  var _ = require('lodash');
  var Q = require('q');
  var S = require('string');
  var extend = require('extend');

  var _formatTestIndex = function (index) {
    // Mongo uses alphabetical sorting so simply appending
    // numbers doesn't sort properly. 
    return S(index)
      .padLeft(3, '0');
  };

  var _generateProjDesc = function (index) {
    var padded = _formatTestIndex(index);
    var chars = '';
    for (var i = 0; i < padded.length; i++) {
      var n = parseInt(padded.charAt(i));
      var c = String.fromCharCode(97 + n);
      chars += c;
    }
    return chars;
  };

  describe('Project API tests', function () {
    var id;
    var users = testData.getTestUsers();
    var projects = testData.getTestProjects();
    var agent = superagent.agent();

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

    it('Reset projects test', function (done) {
      agent.get('http://localhost:3000/test/project_api/reset/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
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

    it('Create user [3]', function (done) {
      agent.put('http://localhost:3000/users/' + users[3].username +
        '/')
        .send(users[3])
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

    it('Add user [1] as admin to project [0] before login', function (
      done) {
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

    it('Remove user [1] as admin from project [0] before login',
      function (
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
          expect(res.body.data.length)
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

    it('Create project [0] without name', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/')
        .send({
          description: project.description
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);

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
          project._id = res.body.data._id;

          done();
        });

    });

    it('Create project [0] with whitespace in name', function (done) {
      // Check if whitespace is trimmed in queries
      var projectCopy = extend({}, projects[0]);

      projectCopy.name = '    ' + projectCopy.name + '    ';

      agent.put('http://localhost:3000/projects/')
        .send(projectCopy)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);

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
          project._id = res.body.data._id;

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
          project._id = res.body.data._id;

          done();
        });

    });

    it('Create project [2] (duplicate name)', function (done) {
      var project = projects[2];

      agent.put('http://localhost:3000/projects/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);

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

          expect(res.body.data.length)
            .to.be(3);
          var match =
            utils.arrayMatch(res.body.data, projects);
          expect(match)
            .to.be(true);

          done();
        });
    });


    it('Update project [0] with invalid project id', function (done) {
      var project = projects[0];
      project.name += ' (updated)';

      agent.post('http://localhost:3000/projects/' +
        'invalidprojectid' + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Update project [0]', function (done) {
      var project = projects[0];

      agent.post('http://localhost:3000/projects/' +
        project._id + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Update project [0] with different user/admin list', function (done) {
      var project = projects[0];
      project.users = [users[0].username];
      project.admins = [users[2].username, users[1].username];

      agent.post('http://localhost:3000/projects/' +
        project._id + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

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

          expect(utils.objMatch(res.body.data, project))
            .to.be.ok();

          done();
        });
    });

    it('Update project [0] with original user/admin list', function (done) {
      var project = projects[0];
      project.users = [];
      project.admins = [users[2].username];

      agent.post('http://localhost:3000/projects/' +
        project._id + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          done();
        });
    });

    it('Update project [0]', function (done) {
      var project = projects[0];

      agent.post('http://localhost:3000/projects/' +
        project._id + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

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

          expect(utils.objMatch(res.body.data, project))
            .to.be.ok();

          done();
        });
    });

    it('Update project [0] with invalid fields', function (done) {
      // Copy project 
      var projectCopy = extend({}, projects[0]);

      // Set a field not in the schema
      projectCopy.invalidField = 'blah blah blah';

      agent.post('http://localhost:3000/projects/' +
        projectCopy._id + '/')
        .send(projectCopy)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

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

          expect(utils.objMatch(res.body.data, project))
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

          expect(utils.objMatch(res.body.data, project))
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

          expect(utils.objMatch(res.body.data, project))
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

    it('List projects as user that is not part of a project', function (
      done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.data.length)
            .to.be(0);

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
          expect(res.body.data.length)
            .to.be(3);

          var match =
            utils.arrayMatch(res.body.data, projects);
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

          expect(res.body.data.users.length)
            .to.be(2);

          expect(utils.objMatch(res.body.data, project))
            .to.be.ok();

          done();
        });
    });

    it('Remove user [1] from invalid project', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' +
        '000000000000000000000000' +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Remove invalid user from project [0]', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/users/' + 'Invalid@fakeemail.incorrect' + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Remove user [3] (non user) from project [0]', function (done) {
      var project = projects[0];
      var user = users[3];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/users/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

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

          expect(res.body.data.length)
            .to.be(3);

          var match =
            utils.arrayMatch(res.body.data, projects);
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
          expect(res.body.data.users.length)
            .to.be(project.users.length);

          expect(utils.objMatch(res.body.data, project))
            .to.be.ok();

          done();
        });
    });

    it('Logout user [2]', function (done) {
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

    it('Login user [0]', function (done) {
      agent.post('http://localhost:3000/login/')
        .send(users[0])
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          done();
        });
    });

    it('Modify project [0] as non-admin', function (done) {
      var projectCopy = extend({}, projects[0]);
      projectCopy.name = 'Changed!!!';
      projectCopy.description = 'Also changed';
      agent.post('http://localhost:3000/projects/' + projectCopy._id +
        '/')
        .send(projectCopy)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('Get existing project [0] to check if no modifications',
      function (done) {
        var project = projects[0];

        agent.get('http://localhost:3000/projects/' + project._id + '/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);

            expect(res.ok)
              .to.be.ok();

            expect(utils.objMatch(res.body.data, project))
              .to.be.ok();

            done();
          });
      });

    it('Add user [1] to project [0] as non-admin', function (done) {
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

    it('Remove user [2] from project [0] as non-admin', function (done) {
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

    it('Remove project [0] when not logged in', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id + '/')
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

    it('Remove user [2] as admin to project [0] ' +
      'logged in as non admin user', function (done) {
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

    it('Remove project [0] as user [1] (non admin)', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(401);

          done();
        });
    });

    it('Get existing project [0] after removal failed', function (done) {
      var project = projects[0];

      agent.get('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          expect(utils.objMatch(res.body.data, project))
            .to.be.ok();

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

    it('Add user [1] as admin to project [0] (duplicate)', function (
      done) {
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
          expect(res.body.data.length)
            .to.be(3);

          var match =
            utils.arrayMatch(res.body.data, projects);
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

          expect(res.body.data.admins.length)
            .to.be(2);

          expect(utils.objMatch(res.body.data, project))
            .to.be.ok();

          done();
        });
    });

    it('Remove user [1] as admin from invalid project', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' +
        '000000000000000000000000' +
        '/admins/' + user.username + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Remove invalid user as admin from project [0]', function (done) {
      var project = projects[0];
      var user = users[1];

      agent.del('http://localhost:3000/projects/' + project._id +
        '/admins/' + 'fakeuser@nonexistant.com.org' + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Remove user [3] (non-admin) as admin from project [0]',
      function (
        done) {
        var project = projects[0];
        var user = users[3];

        agent.del('http://localhost:3000/projects/' + project._id +
          '/admins/' + user.username + '/')
          .end(function (e, res) {
            expect(e)
              .to.eql(null);
            expect(res.status)
              .to.be(404);

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

          expect(res.body.data.length)
            .to.be(3);

          var match =
            utils.arrayMatch(res.body.data, projects);
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
          expect(res.body.data.admins.length)
            .to.be(1);

          expect(utils.objMatch(res.body.data, project))
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

    it('Remove invalid project as user [2] (admin)', function (done) {
      var project = projects[0];
      var user = users[2];

      agent.del('http://localhost:3000/projects/' +
        '000000000000000000000000' + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(404);

          done();
        });
    });

    it('Remove project [0] as user [2] (admin)', function (done) {
      var project = projects[0];
      var user = users[2];

      agent.del('http://localhost:3000/projects/' + project._id + '/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);

          done();
        });
    });

    it('Get existing project [0] after removal succeeded', function (
      done) {
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

        project.description = _generateProjDesc(currentProjectIndex);

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

          expect(res.body.data.length)
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].name)
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].name)
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].name)
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

          expect(res.body.data.length)
            .to.be((max - min) + 1);

          for (var i = min; i <= max; i++) {
            expect(
              S(res.body.data[i - min].name)
              .endsWith(_formatTestIndex(i))
            )
              .to.be.ok();
          }

          done();
        });
    });

    it('Test sorting (invalid field)', function (done) {
      agent.get('http://localhost:3000/projects/')
        .query({
          sortField: 'invalid'
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);


          done();
        });
    });

    it('Test sorting (invalid dir)', function (done) {
      agent.get('http://localhost:3000/projects/')
        .query({
          sortField: 'name',
          sortDir: 'invalid'
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);

          done();
        });
    });

    it('Test sorting (description/asc)', function (done) {
      agent.get('http://localhost:3000/projects/')
        .query({
          sortField: 'description',
          sortDir: 'asc',
          maxRecord: 5
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var prevProj = null;
          _.each(res.body.data, function (proj) {
            if (prevProj) {
              // Check sort order
              expect(prevProj.description < proj.description)
                .to.be.ok();
            }
            prevProj = proj;
          });


          done();
        });
    });

    it('Test sorting (description/desc)', function (done) {
      agent.get('http://localhost:3000/projects/')
        .query({
          sortField: 'description',
          sortDir: 'desc',
          maxRecord: 5
        })
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          var prevProj = null;
          _.each(res.body.data, function (proj) {
            if (prevProj) {
              // Check sort order
              expect(prevProj.description > proj.description)
                .to.be.ok();
            }
            prevProj = proj;
          });


          done();
        });
    });

    // Clear out all the test projects
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


  });
})(require, describe, it);
