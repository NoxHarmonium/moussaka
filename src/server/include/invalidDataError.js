(function (module, require) {
  'use strict';

  var util = require('util');

  function InvalidDataError(message, params) {

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
      },
      set: function (value) {
        // Needed for Q long stacks
        childError.stack = value;
      }
    });

    return this;
  }

  util.inherits(InvalidDataError, Error);

  module.exports = InvalidDataError;

})(module, require);
