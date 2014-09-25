(function (module, require) {
  'use strict';
  module.exports = ['$resource',
    function ($resource) {
      return $resource('/projects/ ', {});
    }
  ];
})(module, require);
