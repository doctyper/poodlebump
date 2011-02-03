/*
File: global.js

About: Version
	1.0

Project: Poodle Jump

Description:
	A common file that includes all globally shared functionality for POODLE
	
*/

/*
Class: POODLE
	Scoped to the POODLE Global Namespace
*/
var POODLE = POODLE || {};

// When the DOM is ready.
(function () {
	
	// Storing a variable to reference
	var $self = POODLE;
	
	/*
	Namespace: POODLE.vars
		Shared global variables
	*/
	$self.vars = {
		
		/*
		variable: queue
			Contains the functions ready to be fired on DOM ready
		*/
		queue : []
	};
	
	/*
	Namespace: POODLE.utils
		Shared global utilities
	*/
	$self.utils = {
		
		/*
		sub: queue
		 	A global initializer. Takes a function argument and queues it until <init> is fired
		
		Parameters:
			object - The function to initialize when the DOM is ready
		*/
		queue : function (object) {
			$self.vars.queue.push(object);
		},
		
		/*
		sub: init
		 	When fired, loops through $self.vars.queue and fires each queued function
		*/
		init : function() {
			var queue = $self.vars.queue;
			
			$(queue).each(function(i, object) {
				for (var key in object) {
					if (object.hasOwnProperty(key) && (typeof object[key] === "function")) {
						object[key]();
					}
				}
			});
			
			$self.vars.initialized = true;
		},
		
		/*
		sub: isMobile
		*/
		isMobile : function () {
			return ("ontouchstart" in window);
		}
	};
	
	/*
	Namespace: POODLE
		Under the POODLE Local Namespace
	*/
	
	/*
	Function: global
	 	Takes care of a few global functionalities.
	*/
	$self.global = function () {
		$(document.body).bind("touchmove", function (e) {
			e.preventDefault();
		});
	};
	
	/*
	Callback: queue
		Sends local functions to a global queuer for initialization See: <POODLE.utils.queue>
	*/
	$self.utils.queue($self);
	$(document).ready($self.utils.init);
	
}).call(POODLE);