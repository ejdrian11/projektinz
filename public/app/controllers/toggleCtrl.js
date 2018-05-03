angular.module('toggleController', [])

.controller('toggleCtrl', function($scope) {

    for (var k=1; k<=6; k++){
        $scope['myVar'+k] = true
    };
for (var i=1; i<=6; i++){
    $scope.toggle = function(j) {
        $scope['myVar'+j] = !$scope['myVar'+j];
    };
}

});
