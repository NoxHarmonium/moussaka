(function (require, module) {
  'use strict';
  // Description Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isLength',
      arguments: [0, 500],
      message: 'Description should be less than 500 characters',
      passIfEmpty: true
    })
  ];

})(require, module);
