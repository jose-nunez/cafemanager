/*************************************
CAFE MANAGER
General filters
*****************************************/
(function(){'use strict';}());

angular.module('cafeManagerApp').filter('numberFixedLen', function () {
	return function (n, len) {
		var num = parseInt(n, 10);
		len = parseInt(len, 10);
		if (isNaN(num) || isNaN(len)) {
			return n;
		}
		num = ''+num;
		while (num.length < len) {
			num = '0'+num;
		}
		return num;
	};
});

angular.module('cafeManagerApp').filter("customCurrency", function (numberFilter){
	function isNumeric(value){return (!isNaN(parseFloat(value)) && isFinite(value));}
	return function (inputNumber, currencySymbol, decimalSeparator, thousandsSeparator, decimalDigits){
		if (isNumeric(inputNumber)){
			currencySymbol = (typeof currencySymbol === "undefined") ? "$" : currencySymbol;
			decimalSeparator = (typeof decimalSeparator === "undefined") ? "." : decimalSeparator;
			thousandsSeparator = (typeof thousandsSeparator === "undefined") ? "," : thousandsSeparator;
			decimalDigits = (typeof decimalDigits === "undefined" || !isNumeric(decimalDigits)) ? 2 : decimalDigits;
			if (decimalDigits < 0) decimalDigits = 0;
			var formattedNumber = numberFilter(inputNumber, decimalDigits);
			var numberParts = formattedNumber.split(".");
			numberParts[0] = numberParts[0].split(",").join(thousandsSeparator);
			var result = currencySymbol + numberParts[0];
			if (numberParts.length == 2){
				result += decimalSeparator + numberParts[1];
			}
			return result;
		}
		else{
			return inputNumber;
		}
	};
});
