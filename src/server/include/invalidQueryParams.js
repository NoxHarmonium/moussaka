(function (module, require) {
  'use strict';

  var util = require('util');

  function InvalidQueryParams(message, params) {

    var childError = Error(message);
    this.name = this.constructor.name;
    this.message = message;
    if (params) {
      if (Array.isArray(params)) {
        this.params = params;
      } else {
        this.params = [params];
      }
    }

    Object.defineProperty(this, 'stack', {
      get: function () {
        return childError.stack;
      }
    });

    return this;
  }

  util.inherits(InvalidQueryParams, Error);

  module.exports = InvalidQueryParams;

})(module, require);
