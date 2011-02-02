(function ($) {
	$.fn.rect = function () {
		return this.get(0).getBoundingClientRect();
	};
}(Zepto));