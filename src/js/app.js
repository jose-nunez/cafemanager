/**************************************
CAFE MANAGER
Main module
*****************************************/
'use strict';

var app = angular.module('cafeManagerApp',['angularUtils.directives.dirPagination','pascalprecht.translate','ngSanitize','angularLoad','foundation','ui.router','cfp.hotkeys']);

app.config(['$translateProvider','$stateProvider','$urlRouterProvider',function($translateProvider,$stateProvider,$urlRouterProvider){
	// Translations
	(function(){
		$translateProvider.translations('es', {
			// Productos
			Product: 'Producto',
			Pack: 'Paquete',pack:'Paquete',
			"no products":"Nada que ver acá",
			// Categorías
			all: 'Todos los productos',
			sale: 'En oferta',
			nocat: 'Sin categoría',
			packs: 'Paquetes',
			nostock: 'Sin existencias',
			disabled: 'Deshabilitados',
			// Precios
			cost: 'Costo',
			normal: 'Normal',
			special: 'Especial',
			//Extras
			"no extras":"Nada que ver acá",
			"with":"Con",
			"without":"Sin",
		});
		$translateProvider.translations('en', {
			// Productos
			Product: 'Product',
			Pack: 'Pack',pack: 'Pack',
			"no products":"Nothing to show here",
			// Categorías
			all: 'All products',
			sale: 'On sale',
			nocat: 'No category',
			packs: 'Packs',
			nostock: 'Out of stock',
			disabled: 'Disabled',
			// Precios
			cost: 'Cost',
			normal: 'Normal',
			special: 'Special',
			// Extras
			"no extras":"Nothing to show here",
			"with":"Add",
			"without":"Remove",
		});

		$translateProvider.preferredLanguage('en');
		$translateProvider.useSanitizeValueStrategy('sanitizeParameters'); // usar parameters para UTF8
	})();

	(function(){

		var views = {
			topFrame: 		{templateUrl:'views/layout/top_frame.tpl.html'},
			productsFrame: 	{templateUrl:'views/products/products_frame.tpl.html',controller:'ProductCtrl'},
			productSelect: 	{templateUrl:'views/products/product_select.tpl.html'},
			productForm: 	{templateUrl:'views/products/product_form.tpl.html'},
			filters:  		{templateUrl:'views/products/categories_tree.tpl.html',controller:'FilterCtrl'},
			tableCount: 	{templateUrl:'views/tables/table_count.tpl.html'},
			tablesMap: 		{templateUrl:'views/tables/table_select.tpl.html'},
			openedTables: 	{templateUrl:'views/tables/table_select.tpl.html'}, //°°°°°°°°°°°°°°°°°°°°°°°°°°°
		}

		/*$urlRouterProvider
		.when('/legacy-route', {
			redirectTo: '/'
		})
		.otherwise('/');*/

		$stateProvider
		.state('app',{ url:'/',views:{
			'header':views.topFrame,
			'content':views.tablesMap,
		}})
		// TABLES _____________________________________________________________________________________
		.state('app.tables',{ url:'tables',views:{
			'content@':views.tablesMap,
		}})
		// PRODUCTS _____________________________________________________________________________________
		.state('app.addOrder',{ url:'addOrder/:filtersTab',views:{
			// MAIN
			'content@':views.productsFrame,
			// SMALL
			'small@app.addOrder':views.productSelect,
			// MEDIUM
			'medium-right@app.addOrder':views.filters,
			'medium-left@app.addOrder':views.productSelect,
			// LARGE
			'large-left@app.addOrder':views.filters,
			'large-center@app.addOrder':views.productSelect,
			'large-right@app.addOrder':views.tableCount,
		}})

		.state('app.addOrder.filters',{ url:'/filters',views:{
			'small@app.addOrder':views.filters,
			// 'medium-right@app.addOrder':views.filters,
		}})
		.state('app.addOrder.tableCount',{ url:'/tableCount',views:{
			'small@app.addOrder':views.tableCount,
			'medium-right@app.addOrder':views.tableCount,
		}})

		;
	})();

}]);