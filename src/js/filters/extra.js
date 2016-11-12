/**************************************
CAFE MANAGER
Extra filters
*****************************************/
(function(){'use strict';}());

// Filtra extras segun producto
angular.module('cafeManagerApp').filter("filterExtras",function (){
	return function(extras,selectedProduct,active){
		if(!active || !selectedProduct) return extras;
		else{
			var result = [];
			for(var i in extras){
				if(selectedProduct.extras.get(extras[i].id)) result.push(extras[i]);
			}
			return result;
		}
	}

});