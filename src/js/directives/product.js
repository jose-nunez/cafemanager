
angular.module('cafeManagerApp').directive('productImg', function() {
	return {
		restrict: 'E',
  
		link: function (scope, element){
			var imgs = scope.product.getImg();
			if(imgs.length==0) element.append('<div class="pimg no-img" ></div>');
			else if(imgs.length==1) element.append('<div class="pimg" style="background-image:url(' + scope.baseImgUrl + imgs[0] +')"></div>');
			else {
				var result='';
				result += '<div class="pimg clearfix">';
				if(scope.showMoreThanTwoImages){
					var imgClass = (imgs.length==2)? 'img-2':'img-plus';
					for(var key in imgs){
						result += '<div class="'+imgClass+'" style="background-image:url(' + scope.baseImgUrl + imgs[key] +')" ></div>';
					}
					result += '</div>';
				}
				else{
					result += '<div class="img-2" style="background-image:url(' + scope.baseImgUrl + imgs[0] +')" ></div>';
					result += '<div class="img-2" style="background-image:url(' + scope.baseImgUrl + imgs[1] +')" ></div>';
				}
				element.append(result);
			}
		}
	};
});