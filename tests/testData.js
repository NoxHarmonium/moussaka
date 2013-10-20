/*
  Shared data used for API testing
*/

(function () {
  'use strict';

  exports.testUsers = [{
    username: 'test.account@test.com',
    password: 'test_password'
  }, {
    username: 'test.account2@test.com',
    password: 'test_password3'
  }, {
    username: 'test.account3@test.com',
    password: 'test_password4'
  }, ];

  exports.testProjects = [{
    name: 'testProjectA',
    version: 0,
  }, {
    name: 'testProjectB',
    version: 0,
  }, {
    name: 'testProjectC',
    version: 0,
  }];

  exports.testProjectsExt = [{
    name: 'testProjectA',
    version: 0,
    users: []
  }, {
    name: 'testProjectB',
    version: 0,
    users: []
  }, {
    name: 'testProjectC',
    version: 0,
    users: []
  }];

})();
