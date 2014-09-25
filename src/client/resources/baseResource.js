(function (module, require) {
  'use strict';

  var ApiError = require('../exceptions/apiError.js');

  var BaseResource = function () {};

  // Classify the type of error and throw
  // a meaningful exception.
  BaseResource.handleError = function (response) {
    // Code thanks to SuperAgent
    // https://github.com/visionmedia/superagent/
    // blob/84af2343a31f0b0e0b169372bcc225380cd9f653/lib/client.js#L362-L407

    var status = response.status;

    var type = Math.floor(status / 100);

    var is = {};
    // status / class
    // basics
    is.info = 1 === type;
    is.ok = 2 === type;
    is.clientError = 4 === type;
    is.serverError = 5 === type;

    // sugar
    is.accepted = 202 === status;
    is.noContent = 204 === status || 1223 === status;
    is.badRequest = 400 === status;
    is.unauthorized = 401 === status;
    is.notAcceptable = 406 === status;
    is.notFound = 404 === status;
    is.forbidden = 403 === status;

    response.is = is;

    if (response.is.clientError || response.is.serverError) {
      // An error related to the API not due to connection etc.
      throw new ApiError(response);
    }

    return response;
  };

  module.exports = BaseResource;


})(module, require);
