/**************************************
CAFE MANAGER
Product filters
*****************************************/
(function(){'use strict';}());

// Filtra categorias padre para desplegar el arbol completo
angular.module('cafeManagerApp').filter("childrenCategoryFilter",function (){
	return function(categories,parent){ // enviar parent nulo para categorias TOP
		var result = [];
		for(var i in categories){
			if((!parent && !categories[i].parent) || (parent == categories[i].parent)) result.push(categories[i]);

		}
		return result;
	};
});

// Genera los breadcrumbs
angular.module('cafeManagerApp').filter("breadCrumbsFilter",function (){
	function addParent(categories,category,result){
		if(!category.parent) return result;
		else{
			result.unshift(category.parent);
			return addParent(categories,category.parent,result);
		} 
	}
	return function(categories,category){
		if(category) return addParent(categories,category,[category]);
		else return [];
	};
});

// Filtra productos segun la categoría buscada
angular.module('cafeManagerApp').filter("filterProductsCategories",function (){
	function hasCategory(product,category){
	// 1:all|2:sale|3:nocat|4:packs|5:nostock|6:disabled
		if(!category || category.id==1) return product.isEnabled();
		else if(category.id==5) return !product.hasStock();
		else if(category.id==6 && !product.isEnabled()) return true;
		else if(!product.isEnabled()) return false;
		else if(category.id==2) return product.onSale();
		else if(category.id==3 && !product.hasCategories()) return true;
		else if(category.id==4 && product.type=='pack') return true;
		else if(category.hasProduct(product.id,product.type)) return true;
	}
	return function(productsArr,category/*,products*/){
		// log('Filtrando productos por categoria');
		var result = [];
		for(var key in productsArr) {
			if(hasCategory(productsArr[key],category)) result.push(productsArr[key]);
		}
		return result;
	};
});



angular.module('cafeManagerApp').filter("filterProductLetter",function (){
	return function(productsArr,letter){
		var result = [];
		var product,key;
		if(!letter || letter=='') return productsArr;
		else if(letter=='0-9'){
			var nums = ['0','1','2','3','4','5','6','7','8','9'];
			for(key in productsArr) {
				product = productsArr[key];
				if(nums.indexOf(product.name.substr(0,1))!=-1) result.push(product);
			}
			return result;
		}
		else{
			for(key in productsArr) {
				product = productsArr[key];
				if(product.name.substr(0,1).toLowerCase() == letter.toLowerCase()) result.push(product);
			}
			return result;
		}
	};
});


angular.module('cafeManagerApp').filter("filterProductsQuery",function (){

	var fields = ['id','code','name'];

	// Verifica si la query va a un campo especifico con la estructura 'in:campo valor'
	function inField(query){
		if(query.indexOf('in:')==0){
			var q = query.split(':');
			if(q.length==2){
				q = q[1].split(' ');
				if(q.length>=2){
					var real_query=q[1]; for(var i=2;i<q.length;i++) real_query += ' '+q[i];
					if(fields.indexOf(q[0])!=-1){
						return {field:q[0],query:real_query};
					}
				}
			} 
		}
		return false;
	}

	function match_field(product,field,query){
		var q = query.split('!!');//Busqueda exacata con la estructura '!!valor'
		if(q.length==2 && q[0]=='') return (''+product[field]).toLowerCase()==q[1];
		else return (''+product[field]).toLowerCase().indexOf(query)!=-1;
	}
	function match_all(product,query){
		var match = false;
		for(var i in fields){
			match = match || match_field(product,fields[i],query);
		}
		return match;
	}
	function match_in_field(product,field,query){
		var q=inField(query);
		if(q && q.field==field) return match_field(product,q.field,q.query);
		// Si no entro, pasa en banda a buscar normalmente
		return match_field(product,field,query);
	}
	function match(product,query){
		var q=inField(query);
		if(q) return match_field(product,q.field,q.query);
		// Si no entro, pasa en banda a buscar normalmente
		return match_all(product,query);
	}
	return function(productsArr,query/*,products*/){
		// log('Filtrando productos por query');
		if(!query) return productsArr;
		query = query.toLowerCase();
		var result = [];
		var product,pack;
		for(var key in productsArr) {
			product = productsArr[key];
			if(match_in_field(product,'name',query)||match_in_field(product,'code',query)){
				result.push(product);
				// SE CAE ESTA CAGA!!! -> se caía la wea. En veremos
				// Agrega los pack del producto
				if(product.packs && product.packs.collection.length>0){ 
					for(var i in product.packs.collection){
						pack = product.packs.collection[i];
						// Agrega el pack sólo si no se ha agregado antes por hacer match o por otro single.
						if(!match(pack,query) && result.indexOf(pack)==-1){						
							result.push(pack);
						}
					}
				}
			}
			else if(match(product,query)){
				result.push(product);
			}
		}
		return result;
	};
});


angular.module('cafeManagerApp').filter("updateSelected",function (){
	return function(productsArr,products,refreshSelection){
		// log('Actualizando seleccion de productos');
		// var selectedProducts = products.selected;
		if(products && refreshSelection) products.updateSelected(productsArr);
		return productsArr;
	};
});

angular.module('cafeManagerApp').filter("filterPrices",function (){
	return function(prices){
		// log('Filtrando precios');
		var result = [];
		for(var key in prices) {
			if(prices[key].active) result.push(prices[key]);
		}
		return result;
	};
});
