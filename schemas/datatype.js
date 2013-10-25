(function (require, module) {
  'use strict';

  var mongoose = require('mongoose');
  var config = require('../include/config');
  var Schema = mongoose.Schema;
  var utils = require('../include/utils');
  var jsonData = require('../data/datatypes.json');

  var DataTypeSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    values: {
      type: {},
    }
  });

  DataTypeSchema.index({
    name: 1
  });

  var DataTypeModel = mongoose.model('DataType', DataTypeSchema);

  utils.populateDBFromJSON(
    jsonData, DataTypeModel, function (err) {
      if (err) {
        throw err;
      }
    }
  );

  module.exports = DataTypeModel;


})(require, module);
