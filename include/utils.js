(function (require, module) {
  'use strict';

  Object.getOwnPropertyDescriptors = function (obj) {
    var ret = {};
    Object.getOwnPropertyNames(obj)
      .forEach(function (name) {
        ret[name] = Object.getOwnPropertyDescriptor(obj, name);
      });
    return ret;
  };

  module.exports = {
    // Checks if the two arrays hold identical objects 
    // Checks by property values rather than reference.
    arrayMatch: function (objArrayA, objArrayB) {

      //console.log('Match: ' + JSON.stringify(objArrayA) + 
      //   ' and ' + JSON.stringify(objArrayB) );

      // Reference Equality
      if (objArrayA === objArrayB) {
        return true;
      }

      // Only one null value
      if ((!objArrayA && objArrayB) || (objArrayA && !objArrayB)) {
        return false;
      }

      // Exaustive compare
      for (var i = 0; i < objArrayA.length; i++) {
        var a = objArrayA[i];
        var match = false;

        for (var j = 0; j < objArrayB.length; j++) {
          var b = objArrayB[j];
          match = module.exports.objMatch(a, b);
          if (match) {
            break;
          }
        }
        if (!match) {
          return false;
        }
      }

      return true;
    },

    // Checks if 2 objects are identical by their values
    // rather than reference
    objMatch: function (objA, objB) {

      // Reference Equality
      if (objA === objB) {
        return true;
      }

      // Only one null value
      if ((!objA && objB) || (objA && !objB)) {
        return false;
      }

      var deepEqual = require('deep-equal');
      return deepEqual(objA, objB);
    },

    //Thanks: http://stackoverflow.com/a/7915060/1153203
    shallowClone: function (obj) {
      return Object.create(
        Object.getPrototypeOf(obj),
        Object.getOwnPropertyDescriptors(obj)
      );
    },

    // Populates a Mongoose database model with the contents of a JSON file.
    // WARNING: Will delete all data existing in the database
    populateDBFromJSON: function (jsonObject, DBModel, next) {
      var dataArray = jsonObject.data;

      if (!dataArray ||
        typeof dataArray !== 'object' || !Array.isArray(dataArray)) {
        return next(
          new Error(
            'JSON data not valid'
          )
        );
      }

      DBModel.remove(function (err) {
        if (err) {
          next(err);
        } else {
          DBModel.collection.insert(dataArray, function (dbErr) {
            if (dbErr) {
              return next(dbErr);
            }
            next();
          });
        }

      });
    }
  };
})(require, module);
