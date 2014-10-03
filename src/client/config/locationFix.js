(function (module, require, window) {
  'use strict';
  // Original: 
  //https://github.com/angular/angular.js/issues/1699#issuecomment-22511464
  //
  // Usage:
  //
  // (interception is needed for Back/Forward buttons to work)
  //
  // location.intercept($scope._url_pattern, function(matched) {
  //   // can return false to abort interception
  //   var type = matched[1]
  //   if (!type) {
  //     return;
  //   }
  //   $scope.safeApply(function() {
  //     $scope.data_type = type; 
  //     $scope.params.page = 1; 
  //     $scope.get_data(); 
  //   });
  // });
  // 
  // anywhere in your controller: 
  // location.skipReload().path(url);
  //
  // to replace in history stack:
  // location.skipReload().path(url).replace();

  module.exports = [
    '$location',
    '$route',
    '$rootScope',
    function ($location, $route, $rootScope) {
      var page_route = $route.current;

      $location.skipReload = function () {
        //var lastRoute = $route.current;
        var unbind = $rootScope.$on('$locationChangeSuccess',
          function () {
            $route.current = page_route;
            unbind();
          });
        return $location;
      };

      if ($location.intercept) {
        throw '$location.intercept is already defined';
      }

      $location.intercept = function (url_pattern, load_url) {

        function parse_path() {
          var match = $location.path()
            .match(url_pattern);
          if (match) {
            match.shift();
            return match;
          }
        }

        var unbind = $rootScope.$on('$locationChangeSuccess',
          function () {
            var matched = parse_path();
            if (!matched || load_url(matched) === false) {
              return unbind();
            }
            $route.current = page_route;
          });
      };

      return $location;
    }
  ];
})(module, require, window);
