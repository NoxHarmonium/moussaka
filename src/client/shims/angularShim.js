(function (module, require, window) {
  'use strict';

  var Utils = require('../../shared/utils.js');

  if (typeof window !== 'undefined' && Utils.exists(window.angular)) {
    // Return browser version  of jQuery if it exists
    module.exports = window.angular;
  } else {
    // Return npm version if not in browser
    module.exports = require('angular');
  }

})(module, require, window);
