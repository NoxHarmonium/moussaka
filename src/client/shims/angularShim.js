(function (module, require, window, angular) {
  'use strict';

  var Utils = require('../../shared/utils.js');
  var jsdom = require('jsdom').jsdom;
  var document =
    jsdom('<!doctype html><html><head></head><body></body></html>');
  global.window = document.parentWindow;
  global.document = document;

  console.log('TYPEOF WINDOW: ' + typeof global.window);

  if (typeof window !== 'undefined' && Utils.exists(window.angular)) {
    // Return browser version  of jQuery if it exists
    module.exports = window.angular;
  } else if (typeof angular !== 'undefined') {
    module.exports = angular;
  } else {

    // If it doesn't exist, try and get it from bower component
    require('../../../bower_components/angular/angular.js');
    require('../../../bower_components/angular-cookies/angular-cookies.js');
    require('../../../bower_components/angular-ui-router/release/' +
        'angular-ui-router.js');
    require('../../../bower_components/angular-breadcrumb/dist/' +
        'angular-breadcrumb.js');
    require('../../../bower_components/angular-spectrum-colorpicker/dist/' +
        'angular-spectrum-colorpicker.js');

    module.exports = global.window.angular;
  }

})(module, require, global.window, global.angular);
