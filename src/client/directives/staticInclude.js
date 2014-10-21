(function (module, require) {
  'use strict';

  // Needed unfortunatly because ng-change doesn't
  // work on invalid controls
  // src: http://stackoverflow.com/a/20898509/1153203
  module.exports = ['$http', '$templateCache', '$compile',
    function ($http, $templateCache, $compile) {
      return function (scope, element, attrs) {
        var templatePath = scope.$eval(attrs.staticInclude);
        $http.get(templatePath, {
          cache: $templateCache
        })
          .success(function (response) {
            var contents = element.html(response)
              .contents();
            $compile(contents)(scope);
          });
      };
    }
  ];

})(module, require);
