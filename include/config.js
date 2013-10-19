(function (require, module) {
  'use strict';

  var configReader = require('yaml-config');
  var colors = require('colors');

  var enviroment = process.env.NODE_ENV;

  if (!enviroment) {
    console.log('Warning: '.yellow +
      'The NODE_ENV enviroment variable isn\'t set.' +
      ' Defaulting to \'development\'');
    enviroment = 'development';
  }

  module.exports = configReader.readConfig('config.yaml', enviroment);

})(require, module);
