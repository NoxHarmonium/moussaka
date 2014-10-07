(function (require, module) {
  'use strict';
  // Project Version Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'isLength',
      arguments: [1, 40],
      message: 'Project version should be between 1 and 40 characters'
    })
  ];

})(require, module);
