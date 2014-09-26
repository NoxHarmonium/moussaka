(function (module, require) {
  'use strict';

  var util = require('util');
  var extend = require('extend');
  var BaseResource = require('./baseResource.js');

  module.exports = ['$http',
    function ($http) {
      // TODO: Implement!

      var Project = function (data) {
        this.base = BaseResource;
        this.base();
        // TODO: Validation?

        extend(this, data);
      };

      // Inherit from BaseResource
      util.inherits(Project, BaseResource);

      // Static Methods

      Project.get = function (email) {
        return require('../../../tests/testData.js')
          .getTestProjects();
      };

      return Project;

    }
  ];
})(module, require);
