// Thanks: http://stackoverflow.com/a/17472118

(function (module, require) {
  'use strict';

  module.exports = function () {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  };

})(module, require);
