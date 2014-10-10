(function (require, module) {
  'use strict';

  var UserResource = require('../../src/client/resources/userResource.js');
  var sampleData = require('./sampleData.json');
  var chance = require('chance').Chance();
  var S = require('string');
  var Factory = require('js-factories');

  var generateEmail = function(args) {
    var address =
        this.sample(args.firstName[0], args.firstName) +
        this.sample('', '.','_') +
        this.sample(args.lastName[0], args.lastName);

    var domain = this.sample.apply(this, sampleData.emailDomains);

    return address + '@' + domain;
  };

  var deAngularify = function(angularModule) {
    if (!Array.isArray(angularModule)) {
        throw new Error('Angular module not in correct format.');
    }
    for (var i = 0; i < angularModule.length; i++) {
        if (typeof angularModule[i] === 'function') {
            return angularModule[i]();
        }
    }
    throw new Error('Could not find angular method.');
  };

  var register = function() {
    Factory.define('user', function (args) {
        args = args || {};

        args.firstName = args.firstName ||
            this.sample.apply(this, sampleData.firstNames);
        args.lastName = args.lastName ||
            this.sample.apply(this, sampleData.lastNames);
        args.username = args.username ||
            generateEmail.call(this, args);
        args.password = args.password ||
            chance.string();

        if (this.is('invalid') && this.is('no')) {
            throw new Error('The \'invalid\' and \'no\' traits are not compatible.');
        }

        // Use traits to remove fields
        if (this.is('no')) {
            if (this.is('firstName')) {
                delete args.firstName;
            }
            if (this.is('lastName')) {
                delete args.lastName;
            }
            if (this.is('username')) {
                delete args.username;
            }
            if (this.is('password')) {
                delete args.password;
            }
        }

        // Use traits to invalidate fields
        if (this.is('invalid')) {
            if (this.is('username')) {
                username = 'invalid';
            }
        }

        // Trim values so they are too short to validate
        if (this.is('short')) {
            if (this.is('firstName')) {
                args.firstName =
                    S(args.firstName).left(2).s;
            }
            if (this.is('lastName')) {
                args.lastName =
                   S(args.lastName).left(2).s;
            }
            if (this.is('password')) {
                args.password =
                   S(args.password).left(7).s;
            }
        }

        // Extend values so they are too long to validate
        if (this.is('long')) {
            if (this.is('firstName')) {
                args.firstName =
                    S(args.firstName).pad(41,'x').s;
            }
            if (this.is('lastName')) {
                args.lastName =
                   S(args.lastName).pad(41,'x').s;
            }
            if (this.is('password')) {
                args.password =
                   S(args.password).pad(41,'x').s;
            }
        }

        var User = deAngularify(UserResource);
        return new User(args);
    });
  };

  module.exports = { register: register };

})(require, module);