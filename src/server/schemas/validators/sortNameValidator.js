(function (require, module) {
  'use strict';
  // Sort name Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isUppercase',
      message: 'The sorting name should be only in uppercase'
    }),
    validate({
      validator: 'isLength',
      arguments: [3, 100],
      message: 'The sorting name should be between 3 and 100 characters'
    })
  ];

})(require, module);
