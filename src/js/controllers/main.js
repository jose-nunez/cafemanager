/**************************************
CAFE MANAGER
Head controller
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').controller('MainCtrl',
	['$scope','$translate','angularLoad','Config','hotkeys','focus','selectAll',/*'matchMediaQuery',*/'$state',
	function($scope,$translate,angularLoad,Config,hotkeys,focus,selectAll/*,MatchMediaQuery*/,$state){
	
	/*$scope.matchMediaQuery = function(size_name,only){
		return MatchMediaQuery(size_name,only);
	}*/
	

	/*$scope.cleanCache = function(){
		var indices = amplify.store();
		for(var i in indices){
			amplify.store(i,null);
		}
	}*/

	/*$scope.UIOptions = {
		mode : 'tables', // tables|prices|order|counts|cashio|bookings
	}*/

	/* *********************************************************************************************************
		UI Panel System
	********************************************************************************************************* */

	$scope.state = $state;
	$scope.is = $state.is;
	$scope.includes = $state.includes;


	/* *********************************************************************************************************
		UI Utils
	********************************************************************************************************* */

	$scope.consoleamelo = function(wea){window.wea=wea;log(wea);}
	$scope.focus = function(id,selectAll){ focus(id,selectAll);	}
	$scope.selectAll = function(id){ selectAll(id);	}
	$scope.stopWheelPropagation = function($event, $delta, $deltaX, $deltaY){$event.stopPropagation();}

	/*$scope.clearSelected = function(){
		$scope.$broadcast('clearSelected');
	}*/


	$scope.changeLanguage = function (key) {
		$translate.use(key);
	};	
	
	/* *********************************************************************************************************
		INIT
	********************************************************************************************************* */

	var start = function(config){
		// SI ES DESK-APP
		if(typeof require == 'function'){ 

			require('nw.gui').Window.get().maximize();

			hotkeys.add({combo: 'ctrl+shift+f12',
			description: '',callback: function() {
				require('nw.gui').Window.get().showDevTools();
			}});
			hotkeys.add({combo: 'ctrl+shift+f5',
			dscription: '',callback: function() {
					equire('nw.gui').Window.get().reloadDev();
			}});

			hotkeys.add({combo: 'f11',
			description: '',callback: function() {
				require('nw.gui').Window.get().toggleFullscreen();
			}});

			hotkeys.add({combo: 'shift+f11',
			description: '',callback: function() {
				require('nw.gui').Window.get().toggleFullscreen();
			}});

			hotkeys.add({combo: 'ctrl+alt+enter',
			description: '',callback: function() {
				$scope.startServer();
			}});
		}
	}
	
	Config.then(function(config){
		if(config.debug)  window.scope_main = $scope;
		window.log = function(){if(config.debug){for(var i in arguments){console.log(arguments[i]); }}}
		$scope.noSelectText = config["no-select-text"];

		start(config);
	});

}]);