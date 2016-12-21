angular.module('cafeManagerApp').directive('rightClick',['$parse',function($parse) {
	return function(scope, element, attrs) {
		var fn = $parse(attrs.rightClick);
		element.bind('contextmenu', function(event) {
			scope.$apply(function() {
				if(!event.shiftKey){
					event.preventDefault();
					fn(scope, {$event:event});
				}
			});
		});

	};
}]);