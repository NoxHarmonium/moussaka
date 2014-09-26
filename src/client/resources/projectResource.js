(function (module, require) {
  'use strict';
  module.exports = ['$http',
    function ($http) {
      // TODO: Implement!
      return require('../../../tests/testData.js')
        .getTestProjects();
    }
  ];
})(module, require);
