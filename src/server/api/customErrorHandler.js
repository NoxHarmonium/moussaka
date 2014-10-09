(function (require, module) {
  'use strict';

  var MongooseValidationError =
    require('mongoose/lib/error/validation');
  var InvalidQueryParams =
    require('../include/invalidQueryParams.js');
  var InvalidDataError =
    require('../include/invalidDataError.js');
  //var colors = require('colors');

  module.exports = function (err, req, res, next) {
    // Client Errors (400)

    if (err instanceof MongooseValidationError) {
      //console.log('Invalid Client Request:  '.red,
      //  '[MongooseValidationError]'.yellow,
      // err.toString());
      return res.status(400)
        .send({
          type: 'ValidationError',
          detail: err.toString()
        });
    }

    if (err instanceof InvalidQueryParams) {
      //console.log('Invalid Client Request:  '.red,
      //  '[InvalidQueryParams]'.yellow,
      //  err.toString());
      return res.status(400)
        .send({
          type: 'InvalidQueryParams',
          detail: err.toString(),
          params: err.params
        });
    }

    if (err instanceof InvalidDataError) {
      //console.log('Invalid Client Request:  '.red,
      //  '[InvalidDataError]'.yellow,
      //  err.toString());
      return res.status(400)
        .send({
          type: 'InvalidDataError',
          detail: err.toString(),
        });
    }

    // Pass her right along through
    next(err);
  };
})(require, module);
