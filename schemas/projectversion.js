(function (require, module) {
  'use strict';

  var mongoose = require('mongoose');
  var config = require('../include/config');
  var Schema = mongoose.Schema;

  var ProjectVersionSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    }
  });


  module.exports = mongoose.model('ProjectVersion', ProjectVersionSchema);

})(require, module);
