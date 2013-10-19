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
          done();
        });

    });

    it('Create project [1]', function (done) {
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

    it('Create project [2]', function (done) {
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
            var a = res.body[i];
            var match = false;

            for (var j = 0; j < projects.length; j++) {
              var b = projects[j];
              if (a.name === b.name &&
                a.version === b.version) {
                match = true;
                break;
              }
            }
            expect(match)
              .to.be(true);
          }

          done();
        });
    });

    it('Create existing project [0]', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);
          done();
        });

    });

    it('Create existing project [1]', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);
          done();
        });

    });

    it('Create existing project [2]', function (done) {
      var project = projects[0];

      agent.put('http://localhost:3000/projects/' + project.name + '/' +
        project.version + '/')
        .send(project)
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.status)
            .to.be(409);
          done();
        });

    });

    it('Increment version of project [0] to 1', function (done) {
      var project = projects[0];
      project.version += 1;

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

    it('Increment version of project [0] to 2', function (done) {
      var project = projects[0];
      project.version += 1;

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

    it('List projects (Should only show latest versions)', function (done) {
      agent.get('http://localhost:3000/projects/')
        .end(function (e, res) {
          expect(e)
            .to.eql(null);
          expect(res.ok)
            .to.be.ok();

          //console.log('\nCurrent Projects:\n' + JSON.stringify(projects));
          expect(res.body.length)
            .to.be(3);

          for (var i = 0; i < res.body.length; i++) {
            var a = res.body[i];
            var match = false;

            for (var j = 0; j < projects.length; j++) {
              var b = projects[j];
              if (a.name === b.name &&
                a.version === b.version) {
                match = true;
                break;
              }
            }
            if (!match) {
              console.log('\'' + JSON.stringify(a) + '\'not in \'' +
                JSON.stringify(projects) + '\'');
            }
            expect(match)
              .to.be(true);
          }


          done();
        });
    });


  });

})(require, describe, it);