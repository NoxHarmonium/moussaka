(function (module, require) {
  'use strict';

  // Needed unfortunatly because ng-change doesn't
  // work on invalid controls
  // src: http://stackoverflow.com/a/20898509/1153203
  module.exports = function watchChange() {
    return {
      scope: {
        onchange: '&watchChange'
      },
      link: function (scope, element, attrs) {
        element.on('input', function () {
          scope.$apply(function () {
            scope.onchange();
          });
        });
      }
    };
  };

})(module, require);
