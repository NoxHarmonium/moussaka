(function (require, module) {
  'use strict';

  var _ = require('lodash');
  var utils = require('./utils.js');

  // Alias for self reference
  var self = module.exports;

  module.exports = {
    'float': {
      validate: function (schema, data) {
        var value = parseFloat(data.values.n);

        if (!utils.exists(value)) {
          return {
            success: false,
            reason: 'A value is required'
          };
        }

        if (isNaN(value)) {
          return {
            success: false,
            reason: 'Invalid number format'
          };
        }

        if ((utils.exists(schema.min) && value < parseFloat(schema.min)) ||
          (utils.exists(schema.max) && value > parseFloat(schema.max))) {
          // TODO: More intelligent reason
          // (i.e. don't show undefined max/min values)
          // TODO: i18n reminder
          return {
            success: false,
            reason: 'Number out of range. ' +
              '(Min: ' + schema.min + ' max: ' + schema.max + ')'
          };
        }

        return {
          success: true
        };
      },
      apply: function (schema, currentData, newData) {
        if (!utils.exists(newData.values)) {
          newData.values = {};
        }
        var keys = ['n'];
        _.forEach(keys, function (key) {
          if (!schema.lockedValues || !schema.lockedValues[key]) {
            currentData.values[key] = parseFloat(newData.values[key]);
          }
        });
      }
    },

    'double': self.float,

    'decimal': self.float,

    'string': {
      validate: function (schema, data) {
        var value = data.values.s;

        if (!utils.exists(value)) {
          return {
            success: false,
            reason: 'A value is required'
          };
        }

        return {
          success: true
        };
      },
      apply: function (schema, currentData, newData) {
        if (!utils.exists(newData.values)) {
          newData.values = {};
        }
        var keys = ['s'];
        _.forEach(keys, function (key) {
          if (!schema.lockedValues || !schema.lockedValues[key]) {
            currentData.values[key] = String(newData.values[key]);
          }
        });
      }
    },

    'boolean': {
      validate: function (schema, data) {
        var value = data.values.b;

        if (!utils.exists(value)) {
          return {
            success: false,
            reason: 'A value is required'
          };
        }

        var sValue = value.toString();

        if (sValue !== 'true' && sValue !== 'false') {
          return {
            success: false,
            reason: 'A boolean value must be either \'true\' or ' +
              '\'false\''
          };
        }

        return {
          success: true
        };
      },
      apply: function (schema, currentData, newData) {
        if (!utils.exists(newData.values)) {
          newData.values = {};
        }
        var keys = ['b'];
        _.forEach(keys, function (key) {
          if (!schema.lockedValues || !schema.lockedValues[key]) {
            currentData.values[key] = !!newData.values[key];
          }
        });
      }
    },

    'color': {
      validate: function (schema, data) {
        var keys = ['r', 'g', 'b', 'a'];
        var currentKey = null;

        var allKeysExist = _.every(keys, function (key) {
          currentKey = key;
          var keyValue = data.values[key];
          return utils.exists(keyValue) &&
            utils.exists(parseInt(keyValue));
        });

        if (!allKeysExist) {
          return {
            success: false,
            reason: 'A required value is missing: \'' + currentKey + '\''
          };
        }

        var allKeysValid = _.every(keys, function (key) {
          currentKey = key;
          var keyValue = parseInt(data.values[key]);
          return utils.exists(keyValue) && !isNaN(keyValue);
        });

        if (!allKeysValid) {
          return {
            success: false,
            reason: 'A value is in an incorrect format: \'' + currentKey + '\''
          };
        }

        var allKeysWithinRange = _.every(keys, function (key) {
          currentKey = key;
          return parseInt(data.values[key]) >= 0 && parseInt(data.values[
            key]) <= 255;
        });

        if (!allKeysWithinRange) {
          return {
            success: false,
            reason: 'A value is out of the valid range (0-255): \'' +
              currentKey + '\''
          };
        }

        return {
          success: true
        };
      },
      apply: function (schema, currentData, newData) {
        if (!utils.exists(newData.values)) {
          newData.values = {};
        }
        var keys = ['r', 'g', 'b', 'a'];
        _.forEach(keys, function (key) {
          if (!schema.lockedValues || !schema.lockedValues[key]) {
            currentData.values[key] = parseInt(newData.values[key]);
          }
        });
      }
    },

    'position': {
      validate: function (schema, data) {
        var keys = ['x', 'y', 'z'];
        var currentKey = null;
        var keyValue = null;

        var allKeysExist = _.every(keys, function (key) {
          currentKey = key;
          keyValue = data.values[key];
          return utils.exists(keyValue) &&
            ((typeof(keyValue) !== 'string') || keyValue.length > 0);
        });

        if (!allKeysExist) {
          return {
            success: false,
            reason: 'A required value is missing: \'' + currentKey + '\''
          };
        }

        var allKeysValid = _.every(keys, function (key) {
          currentKey = key;
          keyValue = parseFloat(data.values[key]);
          return utils.exists(keyValue) && !isNaN(keyValue);
        });

        if (!allKeysValid) {
          return {
            success: false,
            reason: 'A value is in an incorrect format: \'' + currentKey + '\''
          };
        }

        return {
          success: true
        };
      },
      apply: function (schema, currentData, newData) {
        if (!utils.exists(newData.values)) {
          newData.values = {};
        }
        var keys = ['x', 'y', 'z'];
        _.forEach(keys, function (key) {
          if (!schema.lockedValues || !schema.lockedValues[key]) {
            currentData.values[key] = parseFloat(newData.values[key]);
          }
        });
      }
    }

  };

})(require, module);
