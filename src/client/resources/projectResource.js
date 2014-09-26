(function (module, require) {
  'use strict';

  var utils = require('../../shared/utils.js');
  var BaseResource = require('./baseResource.js');

  module.exports = ['$http',
    function ($http) {
      // TODO: Implement!

      var Project = function (data) {
        this.base = BaseResource;
        this.base();
        // TODO: Validation?

        utils.extend(this, data);
      };

      // Inherit from BaseResource
      utils.inherit(BaseResource, Project);

      // Static Methods

      Project.get = function (email) {
        return require('../../../tests/testData.js')
          .getTestProjects();
      };

      return Project;

    }
  ];
})(module, require);
