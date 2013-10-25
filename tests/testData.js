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
    users: [],
    description: 'This one has a description'
  }, {
    name: 'testProjectB',
    version: 0,
    users: [],
  }, {
    name: 'testProjectC',
    version: 0,
    users: [],
    description: 'So does this one'
  }];

  exports.testProjectsExt = [{
    name: 'testProjectA',
    version: 0,
    users: [],
    description: 'This one has a description'

  }, {
    name: 'testProjectB',
    version: 0,
    users: []
  }, {
    name: 'testProjectC',
    version: 0,
    users: [],
    description: 'So does this one'
  }];

})();
