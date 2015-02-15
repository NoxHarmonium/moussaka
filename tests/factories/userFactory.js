(function (require, module) {
  'use strict';

  var sampleData = require('./sampleData.json');
  var S = require('string');
  var Factory = require('js-factories');
  var angular = require('../../src/client/shims/angularShim.js');
  var UserClass = require('../../src/client/resources/userResource.js');
  var injector = angular.injector(['ng']);

  var generateEmail = function(args) {
    var address =
        this.sample(args.firstName[0], args.firstName) +
        this.sample('', '.','_') +
        this.sample(args.lastName[0], args.lastName);

    var domain = this.sample.apply(this, sampleData.emailDomains);

    return address + '@' + domain;
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

        var User = injector.instantiate(UserClass);
        return new User(args);
    });
  };

  module.exports = { register: register };

})(require, module);