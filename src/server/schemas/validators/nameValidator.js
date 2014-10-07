(function (require, module) {
  'use strict';
  // Name Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isLength',
      arguments: [3, 40],
      message: 'Name should be between 3 and 50 characters'
    }),
    validate({
      validator: 'isAlphanumeric',
      passIfEmpty: true,
      message: 'Name should contain alpha-numeric characters only'
    })
  ];

})(require, module);
