// Modified from http://stackoverflow.com/a/25585402/1153203
// to support ngModel attributes that are getterSetter functions
// see "Binding to a getter/setter" in
//      https://docs.angularjs.org/api/ng/directive/ngModel

(function (module, require) {
  'use strict';

    var Utils = require('../../shared/utils.js');

    module.exports = ['$parse', '$timeout', function($parse, $timeout) {
        return {
            restrict: 'AE',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {

                var slider = element.slider({
                    value: ngModel.$viewValue,
                    min: parseFloat($parse(attrs.min)(scope)),
                    max: parseFloat($parse(attrs.max)(scope)),
                    step: parseFloat($parse(attrs.step)(scope)),
                    slide: function(event, ui) {
                        scope.$apply(function() {
                            ngModel.$setViewValue(ui.value);
                        });
                    }
                });

                ngModel.$render = function () {
                    var newValue = ngModel.$viewValue;
                    element.slider('value', newValue);
                };

            }
        };
    }];

})(module, require);
