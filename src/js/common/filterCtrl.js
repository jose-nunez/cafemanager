/**************************************
CAFE MANAGER
Filter Product controller
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').controller('FilterCtrl',[
'$scope','$state','$stateParams',
function($scope,$state,$stateParams){
	$scope.filtersTab = $stateParams.filtersTab? $stateParams.filtersTab : 'categories';
	
	$scope.autohideFiltersFrame = function(evt){
		if(!$state.is('app.addOrder')) $state.go('^');
	};

}]);