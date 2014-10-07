(function (require, module) {
  'use strict';
  // Project name Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isLength',
      arguments: [3, 100],
      message: 'Profile name should be between 3 and 100 characters'
    }),
  ];

})(require, module);
