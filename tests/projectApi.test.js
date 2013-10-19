(function (require, describe, it) {
  'use strict';

  var superagent = require('superagent');
  var expect = require('expect.js');
  var rek = require('rekuire');
  var testData = rek('testData.js');

  describe('Project API tests', function () {
    var id;
    var users = testData.testUsers;
    var projects = testData.testProjects;
    var agent = superagent.agent();

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

    it('List projects', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          expect(res.body.length)
            .to.be(0);
          //console.log('\nCurrent Projects:\n' + JSON.stringify(res.body));

          done();
        });
    });

    it('Create Project [0]', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });

    });

    it('Create Project [1]', function (done) {
      var project = projects[1];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
          done();
        });

    });

    it('Create Project [2]', function (done) {
      var project = projects[2];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();
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

          //console.log('\nCurrent Projects:\n' + JSON.stringify(res.body));
          expect(res.body.length)
            .to.be(3);
          for (var i = 0; i < res.body.length; i++) {
            var project = res.body[i];
            // Hacky but easy way to determine if object contents match by value
            expect(JSON.stringify(projects))
              .to.match(new RegExp(JSON.stringify('*' + project + '*')));
          }

          done();
        });
    });


  });

})(require, describe, it);
