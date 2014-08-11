/*
  Shared data used for API testing
*/

(function () {
  'use strict';

  exports.getTestUsers = function () {
    return [{
      username: 'test.account@test.com',
      password: 'test_password'
    }, {
      username: 'test.account2@test.com',
      password: 'test_password3'
    }, {
      username: 'test.account3@test.com',
      password: 'test_password4'
    }, ];
  };

  exports.getTestProjects = function () {
    return [{
      //_id: 'to be defined',
      name: 'testProjectA',
      users: [],
      admins: ['test.account3@test.com'],
      description: 'This one has a description'
    }, {
      //_id: 'to be defined',
      name: 'testProjectB',
      users: [],
      admins: ['test.account3@test.com'],
    }, {
      //_id: 'to be defined',
      name: 'testProjectC',
      users: [],
      admins: ['test.account3@test.com'],
      description: 'So does this one'
    }];
  };

  exports.getTestProfiles = function () {
    return [{
      owner: 'test.account@test.com',
      description: 'Initial profile',
      overlay: [{
        name: 'NumberOfEnemies',
        type: 'Integer',
        value: 5
      }, {
        name: 'DeathMessage',
        type: 'String',
        value: 'Oh No! You died!'
      }, {
        name: 'ParticleColor',
        type: 'Color',
        values: {
          r: 128,
          g: 0,
          b: 0
        }
      }]
    }, {
      owner: 'test.account@test.com',
      description: 'Reduced NumberOfEnemies to 2 as it was too hard',
      overlay: [{
        name: 'NumberOfEnemies',
        type: 'Integer',
        value: 2
      }, ],
      parentProfile: 'replace with id'
    }, {
      owner: 'nonexistant@test.com',
      description: 'Reduced NumberOfEnemies to 2 as it was too hard',
      overlay: [{
        name: 'ParticleColor',
        type: 'Color',
        values: {
          r: 0,
          g: 0,
          b: 0
        }
      }],
      parentProfile: 'replace with id'
    }];
  };

})();
