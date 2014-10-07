(function (require, module) {
  'use strict';
  // Email Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isEmail',
      message: 'Email should be in a valid email format',
      passIfEmpty: true
    }),
    validate({
      validator: 'isLength',
      arguments: [3, 254],
      message: 'Email should be between 3 and 254 characters',
      passIfEmpty: true
    })
  ];

})(require, module);
