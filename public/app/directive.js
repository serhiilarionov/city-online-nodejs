angular.module('App')
    .directive('translate', function() {
        return function($scope,  element, attrs) {
            $scope.$watch('lang',function() {
                var arr = attrs.translate.split('.');
                var translate = $scope.lang[arr[0]];

                if (translate) {
                    for (var i = 1; i < arr.length; i++) {
                        translate = translate[arr[i]];
                    }
                    element.text(translate);
                }
                element.addClass('my_animate');
            });
        }
    });