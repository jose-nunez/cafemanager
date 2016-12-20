/**************************************
CAFE MANAGER
Extra controller
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').controller('ExtraCtrl',['$scope','Config',function($scope,Config){
	
	Config.then(function(config){
		if(config.debug) window.scope_extra = $scope;
	}
	// ,function(err){console.log('Error leyendo la configuracion',err)}
	);

	$scope.filterExtrasByProdut = true;
	$scope.selectedProduct = {};
	$scope.selectedExtra = {};
	// $scope.selectedModifiers;
	/*$scope.$watch('products.selectedSingle', function(){
		$scope.selectedProduct = $scope.products.selectedSingle? $scope.products.selectedSingle.product : undefined;
		$scope.setSelectModifiers();
	});
	$scope.$watch('extras.selected', function(){ 
		$scope.selectedExtra = $scope.extras.selected;	
		$scope.setSelectModifiers();
	});*/
	
	var getModifierExtraSingle = function(modifier){
		if($scope.selectedProduct && $scope.selectedExtra){
			var id = $scope.selectedProduct.id + '|' + $scope.selectedExtra.id + '|' + modifier.id;
			return $scope.modifier_extra_singles.get(id);
		}
		else return undefined;
	};

	$scope.setSelectModifiers = function(){
		var modifier,modifierExtraSingle;
		for(var i in $scope.modifiers.collection){
			modifier = $scope.modifiers.collection[i];
			modifierExtraSingle = getModifierExtraSingle(modifier);
			if(modifierExtraSingle){
				modifier.active = true;
				modifier.variation = modifierExtraSingle.variation;
			}
			else{
				modifier.active = false;
				modifier.variation = 0;
			}
		}
	};

}]);