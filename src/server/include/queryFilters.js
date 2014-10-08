(function (require, module) {
  'use strict';

  var config = require('../../shared/config.js');
  var _ = require('lodash');
  var extend = require('extend');
  var InvalidQueryParams = require('./invalidQueryParams.js');

  // Pass in a mongoose query and apply pagination and sorting
  // depending on request query params
  module.exports = {
    paginate: function (params, query) {
      var globalMaxRecords = config.max_records_per_query;
      var minRecord = params.minRecord || 0;
      var maxRecord = params.maxRecord || globalMaxRecords;

      if (maxRecord < minRecord) {
        throw new InvalidQueryParams('Invalid pagination range', ['minRecord',
          'maxRecord'
        ]);
      }

      query.skip(minRecord);

      // Make sure you cant go over global max
      maxRecord = Math.min(
        globalMaxRecords, (maxRecord - minRecord) + 1
      );

      query.limit(maxRecord);

      return true;
    },

    sort: function (params, query, defaultSort) {
      var sortField = params.sortField;
      var sortDir = params.sortDir;
      var sortObj;

      if (sortField) {
        if (!query.model.schema.paths[sortField]) {
          throw new InvalidQueryParams('Invalid sort field', 'sortField');
        }

        sortDir = sortDir || 'asc';

        if (!_.contains(['asc', 'desc'], sortDir)) {
          throw new InvalidQueryParams('Invalid sort direction', 'sortDir');
        }

        sortObj = {};
        sortObj[sortField] = sortDir;
      } else {
        sortObj = defaultSort || {};
      }

      query.sort(sortObj);

      return true;
    }
  };



})(require, module);
