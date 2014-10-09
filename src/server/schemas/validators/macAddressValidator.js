(function (require, module) {
  'use strict';
  // MAC address Validator

  var validate = require('mongoose-validator');

  module.exports = [
    validate({
      validator: 'matches',
      arguments: ['^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$', 'i'], //v4
      message: 'Invalid MAC address format. Should be IEEE 802 format. ' +
        '(01-23-45-67-89-ab)'
    }),
    validate({
      validator: 'isUppercase',
      message: 'MAC addresses need to be stored in upper case.'
    })
  ];

})(require, module);
