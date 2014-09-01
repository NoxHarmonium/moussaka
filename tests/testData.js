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
    }, {
      username: 'test.account4@test.com',
      password: 'test_password5'
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

  exports.getTestDevices = function () {
    return [{
      projectId: '',
      projectVersion: '0.3',
      deviceName: 'Jeff\'s iPad',
      macAddress: '3D:F2:C9:A6:B3:4F',
      dataSchema: {
        'titleColor': {
          type: 'color'
        },
        'rotateSpeed': {
          type: 'float',
          min: 0,
          max: 100
        },
        'objectPosition': {
          type: 'position',
          lockedValues: {
            x: false,
            y: false,
            z: true
          }
        }
      },
      currentState: {
        'titleColor': {
          values: {
            r: 255,
            g: 50,
            b: 0,
            a: 0
          }
        },
        'rotateSpeed': {
          values: {
            n: 3
          }
        },
        'objectPosition': {
          values: {
            x: 10,
            y: 20,
            z: 30
          }
        }
      }
    }];
  };

})();
