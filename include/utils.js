(function (require, module) {
  'use strict';
  module.exports = {
    // Checks if the two arrays hold identical objects 
    // Checks by property values rather than reference.
    arrayMatch: function (objArrayA, objArrayB) {

      //console.log('Match: ' + JSON.stringify(objArrayA) + ' and ' + JSON.stringify(objArrayB) );

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
    }
  };
})(require, module);
