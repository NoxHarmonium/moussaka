(function (module, require, window) {
  'use strict';

  var Utils = require('../../shared/utils.js');

  if (typeof window !== 'undefined' && Utils.exists(window.$)) {
    // Return browser version  of jQuery if it exists
    module.exports = window.$;
  } else {
    // Return npm version if not in browser
    module.exports = require('jquery');
  }

})(module, require, global.window);
