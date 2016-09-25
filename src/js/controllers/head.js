/**************************************
CAFE MANAGER
Head controller
*****************************************/
'use strict';

angular.module('cafeManagerApp').controller('HeadCtrl',['$scope',function($scope){
	$scope.windowTitle = 'El Barista | Cafe Manager';
	$scope.windowIconUrl = 'img/icon.ico';
}]);