(function ($) {
	$.fn.transform = function (obj, matrix) {
		var el = this.get(0);
		
		matrix = matrix || new WebKitCSSMatrix(window.getComputedStyle(el, null).webkitTransform);
		
		for (var key in obj) {
			matrix = matrix[key].apply(matrix, obj[key]);
		}
		
		el.style.webkitTransform = matrix;
		return this;
	};
	
	$.fn.translate = function () {
		return this.transform({
			translate : [].slice.call(arguments)
		});
	};
}(Zepto));