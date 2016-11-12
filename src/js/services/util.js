/**************************************
CAFE MANAGER
Util services
*****************************************/
'use strict';

angular.module('cafeManagerApp').factory('focus',['$timeout', '$window',function($timeout, $window) {
	return function(id,selectAll) {
	  // timeout makes sure that it is invoked after any other event has been triggered.
	  // e.g. click events that need to run before the focus or
	  // inputs elements that are in a disabled state but are enabled when those events
	  // are triggered.
	  $timeout(function() {
		var element = $window.document.getElementById(id);
		if(element)
			element.focus();
			if(selectAll) element.select();
	  });
	};
}]);

angular.module('cafeManagerApp').factory('selectAll',['$timeout', '$window',function($timeout, $window) {
	return function(id) {
	  // timeout makes sure that it is invoked after any other event has been triggered.
	  // e.g. click events that need to run before the focus or
	  // inputs elements that are in a disabled state but are enabled when those events
	  // are triggered.
	  $timeout(function() {
		var element = $window.document.getElementById(id);
		if(element)
			element.select();
	  });
	};
}]);

angular.module('cafeManagerApp').factory('matchMediaQuery',['FoundationApi',function(foundationApi) {
	var match_up = function(size_name){
		var size_up = foundationApi.getSettings().mediaMap[size_name];
		if(size_up){
			size_up = size_up.up;
			return match_me(size_up);
		} else return false;
	}
	var match_down = function(size_name){
		var size_down = foundationApi.getSettings().mediaMap[size_name];
		if(size_down){
			size_down = size_down.down;
			return match_me(size_down);
		} else return false;
	}
	var match_me = function(size_name){
		var size = foundationApi.getSettings().mediaQueries[size_name];
		return window.matchMedia(size).matches;
	}

	return function(size_name,only){
		return only? match_me(size_name) && !match_up(size_name) : match_me(size_name);
		// return match_me(size_name);
	}
}]);

angular.module('cafeManagerApp').factory('WindowResize',[function() {
	return {
		on: function(callback){
			window.addEventListener('resize',callback);
		},
		off: function(callback){
			window.removeEventListener('resize',callback);
		},
	};
}]);