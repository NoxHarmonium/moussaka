(function (require, module) {
  'use strict';

  var UserResource = require('../../src/client/resources/userResource.js');
  var sampleData = require('./sampleData.json');
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

        var User = deAngularify(UserResource);
        return new User(args);
    });
  };

  module.exports = { register: register };

})(require, module);