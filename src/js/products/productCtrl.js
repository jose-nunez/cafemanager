/**************************************
CAFE MANAGER
Product controller
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').controller('ProductCtrl',[
'$scope','DataLoader','Config','FoundationApi','focus','$state','ProductDataManager',
function($scope,DataLoader,Config,foundationApi,focus,$state,PDM){

	// log('Me estan creando CTM');

	/* *********************************************************************************************************
		SETTINGS
	********************************************************************************************************* */

	$scope.baseImgUrl = 'img/';
	$scope.filteredProducts = [];

	// $scope.extras_currentPage = 1;

	$scope.paginationOptions ={};
	$scope.filterOptions ={};
	$scope.UIOptions = {};
	

	$scope.productsOptions = {
		allPriceable: "none", // expand|over|none
		allExpanded: true,
		allOvered: false,
		allSelectable: 'multiple', // multiple|unit|none
		selectCarousel: true,
		switchSelection:true,

		productQuantity: 1,
	};
	
	Config.then(function(config){
		$scope.config = config;
		$scope.showMoreThanTwoImages = config['show-more-than-two-images'];
		$scope.refreshSelection = config['refresh-selection'];
		
		$scope.paginationOptions = {
			current: 1,
			itemsPerPage_aux: config["products-per-page"], // Backup para cuando se paga la paginacion
			itemsPerPage: config["products-per-page"],
			paginateFilters: config["paginate-filters"],
			carousel: true,
		};

		$scope.filterOptions = {
			pre_query: '',
			query: '',
			letter: '',
			exclude: config["exclusive-filters"],
		};

		$scope.UIOptions = {
		// $scope.globalUIOptions.ProductCtrl = {
			responsiveGrid: config["responsive-grid-columns"],
			gridSmall: config["grid-columns-small"],
			gridMedium: config["grid-columns-medium"],
			gridLarge: config["grid-columns-large"],
			gridXlarge: config["grid-columns-xlarge"],
			gridXxlarge: config["grid-columns-xxlarge"],
			// filtersTab: 'categories', // categories|alphabet
			showPrices:false,
		};
		// $scope.UIOptions = $scope.globalUIOptions.ProductCtrl;


		

		if(config.debug){
			window.scope_product = $scope;
			$scope.DataLoader = DataLoader;//!!!!!!!!!!!!!!!!!!!!!!!!!!!
			$scope.PDM = PDM;//!!!!!!!!!!!!!!!!!!!!!!!!!!!
		}

	}
	// ,function(err){log('Error leyendo la configuracion',err)}
	);


	function bindFunctions(){

		/* *********************************************************************************************************
			UI
		********************************************************************************************************* */
		$scope.setPricesMode = function(onoff){
			$scope.productsOptions.showPrices = onoff;
			$scope.UIOptions.frame.large.right = !onoff? "tableCount" : undefined;
		};


		$scope.getClassGrid = function(){
			var factorize = function(val){ return $scope.UIOptions.doubleSize? Math.ceil(val/2) : val ;};
			var gridclass = {};
			gridclass['small-up-' + factorize($scope.UIOptions.gridSmall)] = true;
			if($scope.UIOptions.responsiveGrid){
				gridclass['medium-up-' + factorize($scope.UIOptions.gridMedium)] = true;
				gridclass['large-up-' + factorize($scope.UIOptions.gridLarge)] = true;
				gridclass['xlarge-up-' + factorize($scope.UIOptions.gridXlarge)] = true;
				gridclass['xxlarge-up-' + factorize($scope.UIOptions.gridXxlarge)] = true;
			}
			return gridclass;
		};


		/* *********************************************************************************************************
			FILTERS
		********************************************************************************************************* */
		
		$scope.filterQuery = function(query,noSetPagination){
			if($scope.filterOptions.pre_query!=query) $scope.filterOptions.pre_query=query;
			var hayQuery = query && query!='';
			if(hayQuery){
				$scope.setSelectedCategory(undefined,true);
				$scope.filterLetter(undefined,true);
			}
			$scope.filterOptions.query = query;

			if(!noSetPagination) $scope.refreshFiltersPagination();
		};
		
		$scope.setSelectedCategory = function(category,noSetPagination){
			var hayCategory = category && category.id!=1;
			if(hayCategory){ // SI viene, borra los demas
				if($scope.filterOptions.exclude) $scope.filterQuery('',true);
				$scope.filterLetter('',true);
			}
			$scope.categories.setSelected(category);
			if(!noSetPagination) $scope.refreshFiltersPagination();
		};

		$scope.filterLetter = function(letter,noSetPagination){
			var hayLetter = letter && letter!='';
			if(hayLetter){ // SI viene, borra los demas
				if($scope.filterOptions.exclude) $scope.filterQuery('',true);
				$scope.setSelectedCategory(undefined,true);
			} 
			$scope.filterOptions.letter = letter;
			if(!noSetPagination) $scope.refreshFiltersPagination();
		};

		$scope.cleanFilters = function(all){
			$scope.setSelectedCategory(undefined,true);
			$scope.filterLetter(undefined,true);
			if(all) $scope.filterQuery('',true);
			$scope.refreshFiltersPagination();
		};

		$scope.isFilterActive = function(filter){
			var hayQuery = ($scope.filterOptions.query && $scope.filterOptions.query!='');
			var hayCategory = ($scope.categories.selected && $scope.categories.selected.id!=1);
			var hayLetter = ($scope.filterOptions.letter && $scope.filterOptions.letter!='');
			if(filter=="query") return hayQuery;
			if(filter=="category") return hayCategory;
			if(filter=="letter") return hayLetter;
			if(filter=="all") return hayQuery && hayCategory && hayLetter;
			if(filter=="any") return hayQuery || hayCategory || hayLetter;
		};

		$scope.refreshFiltersPagination = function(){
			if(!$scope.paginationOptions.paginateFilters && $scope.isFilterActive('any')){
				$scope.setPagination(false);
			}
			else $scope.setPagination(true);
		};

		$scope.countFilteredProducts = function(){
			return $scope.filteredProducts? $scope.filteredProducts.length : 0;
		};

		/* *********************************************************************************************************
			PAGINATION
		********************************************************************************************************* */
		$scope.setPagination = function(onoff){
			if(onoff){
				$scope.paginationOptions.itemsPerPage = $scope.paginationOptions.itemsPerPage_aux;
				// if($scope.paginationOptions.current == 1) $scope.pageChanged(); //hace como si cambio la pagina
				// else $scope.paginationOptions.current = 1;
				$scope.paginationOptions.current = 1;
			}
			else $scope.paginationOptions.itemsPerPage = 0;
			$scope.pageChanged();
		};
		$scope.pageChanged = function(){
			// log('se va a subir el scroll');
			var listado = document.getElementById('seleccion_productos');
			if(listado) listado.scrollTop = 0; //NO funciona cuando esta chico
		};

		$scope.getPageCount = function(){
			return !$scope.filteredProducts? 1 : ($scope.paginationOptions.itemsPerPage==0? 1 : Math.floor($scope.filteredProducts.length/$scope.paginationOptions.itemsPerPage)+1);
		};
		$scope.nextPage = function(){
			if($scope.paginationOptions.current<$scope.getPageCount()) $scope.paginationOptions.current++;
			else if($scope.paginationOptions.carousel) $scope.paginationOptions.current = 1;
		};
		$scope.prevPage = function(){
			if($scope.paginationOptions.current>1) $scope.paginationOptions.current--;
			else if($scope.paginationOptions.carousel) $scope.paginationOptions.current = $scope.getPageCount();
		};

		$scope.findPageProduct = function(product){
			var pos = $scope.filteredProducts.indexOf(product);
			if(pos!=-1){
				var new_page =$scope.paginationOptions.itemsPerPage==0? 1 :  Math.floor(pos/$scope.paginationOptions.itemsPerPage)+1;
				if($scope.paginationOptions.current != new_page) $scope.paginationOptions.current = new_page;
			} 
		};

		/* *********************************************************************************************************
			OTHERS
		********************************************************************************************************* */

		$scope.setSelectedProduct = function(product,price,findPage){
			var fn = $scope.productsOptions.switchSelection? 'switchSelected' : 'setSelected';
			var is_selected = $scope.products[fn](product,price);
			if(is_selected && price!=false && findPage){
				$scope.findPageProduct($scope.products.selected.product);
			}
			if(is_selected){ 
				$scope.productsOptions.productQuantity = 1;
				// focus('productQuantity');
			}
		};
		$scope.setNextSelectedProduct = function(is_single,findPage){
			if($scope.products.setNextSelected($scope.filteredProducts,is_single)  && findPage){
				$scope.findPageProduct($scope.products.selected.product);
			}
		};
		$scope.setPrevSelectedProduct = function(is_single,findPage){
			if($scope.products.setPrevSelected($scope.filteredProducts,is_single)  && findPage){
				$scope.findPageProduct($scope.products.selected.product);
			}
		};

		$scope.addProductCheck = function(product){
			foundationApi.publish('main-notifications', { title: product.name+' +1', content: '' ,autoclose:1000,color:"success"});
		};

		/*$scope.filterProducts = function(){
			var fp = filterProductsQueryFilter($scope.products.collection,$scope.filterProduct);
			fp = filterProductsCategoriesFilter(fp,$scope.categories.selected);
			fp = updateSelectedFilter(fp,$scope.products,$scope.paginationOptions.itemsPerPage);

			$scope.filteredProducts 
		}*/


		/* DUMMIES ----------------------------------------------- */
		$scope.$on('clearSelected',function(evt,args){ // gatillado desde controlador superior
			$scope.products.clearSelected();
		});


	}


	/* *********************************************************************************************************
		DATA REFRESHING
	********************************************************************************************************* */
	PDM.then(function(data){

		log('ProductCtrl: Actualizando vista');

		$scope.productsOptions = data.productsOptions;

		$scope.prices = data.prices;
		$scope.categories = data.categories;
		$scope.products = data.products;
		$scope.extras = data.extras;
		$scope.modifiers = data.modifiers;
		$scope.modifier_extra_singles = data.modifier_extra_singles;

		// $scope.$apply(); // Actualiza toda la app
		// $scope.$digest(); // Solo actualiza este controlador + ctrl hijos: ESTA ESTABA PUESTA!!!!!!!!!!!

		bindFunctions();

	},function(err){
		alert('Un errorcillo');
		console.log('Un errorcillo',err);
	});

	

}]);