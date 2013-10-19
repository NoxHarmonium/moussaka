(function (require, module) {
  'use strict';
  module.exports = {
    // Checks if the two arrays hold identical objects 
    // Checks by property values rather than reference.
    arrayMatch: function (objArrayA, objArrayB) {
      for (var i = 0; i < objArrayA.length; i++) {
        var a = objArrayA[i];
        var match = false;

        for (var j = 0; j < objArrayB.length; j++) {
          var b = objArrayB[j];

          for (var key in a) {
            if (a.hasOwnProperty(key)) {
              match = (a[key] === b[key]);
              if (match) {
                break;
              }
            }
          }
          if (match) {
            break;
          }
        }
        if (!match) {
          return false;
        }
      }

      return true;
    }
  };
})(require, module);
