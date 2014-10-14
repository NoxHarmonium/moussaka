/*
  Shared data used for API testing
*/

(function () {
  'use strict';

  exports.getTestUsers = function () {
    return [{
      username: 'test.account@test.com',
      password: 'test_password',
      firstName: 'firstName',
      lastName: 'lastName',
    }, {
      username: 'test.account2@test.com',
      password: 'test_password3',
      firstName: 'firstNameTwo',
      lastName: 'lastNameTwo',
    }, {
      username: 'test.account3@test.com',
      password: 'test_password4',
      firstName: 'firstName-Three',
      lastName: 'lastName-THree',
    }, {
      username: 'test.account4@test.com',
      password: 'test_password5',
      firstName: 'firstNameo\'Four',
      lastName: 'lastNameO\'Four',
    }, ];
  };

  exports.getTestProjects = function () {
    return [{
      //_id: 'to be defined',
      name: 'Star Wars: Knights of the Old Republic',
      users: [],
      admins: ['test.account3@test.com'],
      description: 'Star Wars: Knights of the Old Republic is a ' +
        'role-playing video game developed ' +
        'by BioWare and published by LucasArts. ' +
        'Written by Drew Karpyshyn, the ' +
        'soundtrack for the game was composed by Jeremy Soule. ',
      deviceCount: 0
    }, {
      //_id: 'to be defined',
      name: 'FTL: Faster Than Light',
      users: [],
      admins: ['test.account3@test.com'],
      description: 'FTL: Faster Than Light is a top-down, real ' +
        'time strategy video game created by ' +
        'indie developers Subset Games. In the game, the player ' +
        'controls the crew of a ' +
        'single spacecraft, holding critical information to be ' +
        'delivered to an allied ' +
        'fleet several sectors away, while being pursued by a ' +
        'large rebel fleet. ',
      deviceCount: 0
    }, {
      //_id: 'to be defined',
      name: 'The Stanley Parable',
      users: [],
      admins: ['test.account3@test.com'],
      description: 'The Stanley Parable is an interactive story ' +
        'modification built on the Source ' +
        'game engine, developed by Davey Wreden and released ' +
        'in July 2011. A ' +
        'high-definition remastered stand-alone version, including ' +
        'new story elements, ' +
        'was developed by Wreden and Source modeler William Pugh ' +
        'under the Galactic ' +
        'Cafe development team name. ',
      deviceCount: 0
    }, {
      //_id: 'to be defined',
      name: 'A Project Without A Description',
      users: [],
      admins: ['test.account1@test.com'],
      deviceCount: 0
    }];
  };

  exports.getTestDevices = function () {
    return [{
      projectId: '',
      projectVersion: '0.3',
      deviceName: 'Jeff\'s iPad',
    }];
  };

  exports.getTestDeviceSchemas = function () {
    return [{
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
      }
    }];
  };

  exports.getTestDevicesStates = function () {
    return [{
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
