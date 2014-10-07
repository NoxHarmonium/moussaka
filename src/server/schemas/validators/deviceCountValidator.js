(function (require, module) {
  'use strict';
  // Device count validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isInt',
      message: 'Device count should be an integer.',
    })
  ];

})(require, module);
