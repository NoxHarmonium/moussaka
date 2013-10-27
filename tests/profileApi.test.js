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
    var projectsExt = testData.getTestProjectsExt();
    var profiles = testData.getTestProfiles();
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

    it('Reset profiles test', function (done) {
      agent.get('http://localhost:3000/test/profile_api/reset/')
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

    it('Create project [0]', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body._id)
            .to.be.ok();
          project._id = res.body._id;

          done();
        });

    });


    it('Create profile [0]', function (done) {
      var project = projects[0];
      var profile = profiles[0];
      profile.project = project._id;

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/profiles/')
        .send(profile)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          //console.log('response: ' + res.body.detail);
          expect(res.status)
            .to.be.ok();
          expect(res.body._id)
            .to.be.ok();
          profile._id = res.body._id;
          done();
        });

    });

    it('Create profile [1] with invalid parent id', function (done) {
      var project = projects[0];
      var profile = profiles[1];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/profiles/')
        .send(profile)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);
          done();
        });

    });



    it('Create profile [1] with valid parent id', function (done) {
      var project = projects[0];

      var profile = profiles[1];
      profile.project = project._id;
      profile.parentProfile = profiles[0]._id;

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/profiles/')
        .send(profile)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(200);
          expect(res.body._id)
            .to.be.ok();
          profile._id = res.body._id;
          done();
        });

    });

    it('Create profile [2] with non existant user', function (done) {
      var project = projects[0];
      var profile = profiles[2];
      profile.parentProfile = profiles[1]._id;

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/profiles/')
        .send(profile)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(400);
          done();
        });

    });



  });

})(require, describe, it);
