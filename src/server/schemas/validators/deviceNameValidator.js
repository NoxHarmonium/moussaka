(function (require, module) {
  'use strict';
  // Name Validator

  var validate = require('mongoose-validator');
  var pattern = /^([\u00c0-\u01ffa-zA-Z]+\b['\-]{0,1})+\b$/;

  module.exports = [
    validate({
      validator: 'isLength',
      arguments: [3, 100],
      message: 'Device name should be between 3 and 100 characters'
    })
  ];

})(require, module);
