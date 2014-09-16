(function (require, module) {
  'use strict';

  var configReader = require('yaml-config');
  var colors = require('colors');

  var environment = process.env.NODE_ENV;

  if (!environment) {
    console.log('Warning: '.yellow +
      'The NODE_ENV environment variable isn\'t set.' +
      ' Defaulting to \'development\'');
    environment = 'development';
  }

  module.exports = configReader.readConfig('config.yaml', environment);

})(require, module);
