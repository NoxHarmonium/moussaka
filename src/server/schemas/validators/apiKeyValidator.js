(function (require, module) {
  'use strict';
  // Api key Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isUUID',
      arguments: [4], //v4
      message: 'API Key should be in a valid UUID v4 format',
    })
  ];

})(require, module);
