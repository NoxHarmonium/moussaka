(function (module, require) {
  'use strict';

  var utils = require('../../shared/utils.js');

  function ApiError(response) {

    var childError = Error();
    this.name = this.constructor.name;

    if (response.data && response.data.detail) {
      this.message = response.data.detail;
    } else {
      // TODO: i18n
      this.message = 'An unknown error occurred.';
    }

    Object.defineProperty(this, 'stack', {
      get: function () {
        return childError.stack;
      }
    });

    return this;
  }

  utils.inherit(Error, ApiError);

  module.exports = ApiError;

})(module, require);
