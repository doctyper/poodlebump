(function ($) {
	$.fn.transition = function(duration, timing, delay) {
		var el = this.get(0);
		
		duration += (typeof duration === "number") ? "ms" : "";
		timing += (typeof duration === "number") ? "ms" : "";
		delay += (typeof duration === "number") ? "ms" : "";

		el.style.webkitTransitionDuration = duration;
		el.style.webkitTransitionTimingFunction = timing;
		el.style.webkitTransitionDelay = delay;
		
		return this;
	};
}(Zepto));