(function (require, module) {
  'use strict';

  var MongooseValidationError =
    require('mongoose/lib/error/validation');
  var InvalidQueryParams =
    require('../include/InvalidQueryParams.js');

  module.exports = function (err, req, res, next) {
    // Client Errors (400)

    if (err instanceof MongooseValidationError) {
      return res.status(400)
        .send({
          type: 'ValidationError',
          detail: err.toString()
        });
    }

    if (err instanceof InvalidQueryParams) {
      return res.status(400)
        .send({
          type: 'InvalidQueryParams',
          detail: err.toString(),
          params: err.params
        });
    }
  };
})(require, module);
