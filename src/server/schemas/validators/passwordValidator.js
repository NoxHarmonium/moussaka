(function (require, module) {
  'use strict';
  // Password Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isLength',
      arguments: [8, 40],
      message: 'Password should be between 8 and 40 characters'
    })
  ];

})(require, module);
