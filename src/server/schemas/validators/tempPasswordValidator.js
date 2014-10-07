(function (require, module) {
  'use strict';
  // Temp Password Validator

  var config = require('../../../shared/config.js');
  var validate = require('mongoose-validator');
  // Multiplied by due to hex conversion
  var validLength = config.tempPasswordCodeLength * 2;

  module.exports = [
    validate({
      validator: 'isLength',
      arguments: [validLength, validLength],
      message: 'Temporary password should be ' + validLength +
        ' characters long',
      passOnEmpty: true
    }),
    validate({
      validator: 'isAlphanumeric',
      message: 'Temporary password should only consist ' +
        'of alphanumeric characters',
      passOnEmpty: true
    })
  ];

})(require, module);
