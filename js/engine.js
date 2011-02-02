/*
File: engine.js

About: Version
	1.0

Project: Poodle Jump

Description:
	Includes all Engine functionality

Requires:
	- <global.js>
	
*/

/*
Class: POODLE
	Scoped to the POODLE Global Namespace
*/
var POODLE = POODLE || {};

/*
Namespace: POODLE.Engine
	Under the POODLE.Engine Local Namespace
*/
POODLE.Engine = POODLE.Engine || {};

(function () {
	
	// Storing a variable to reference
	var $space = POODLE;
	var $self = $space.Engine;
	
	/*
	Namespace: POODLE.Engine.vars
		Shared local variables
	*/
	$self.vars = {
		transitionValue : 75,
		firstPlatformOffset : 90,
		platformHeight : (15 / 2),
		platformThreshold : 10,
		constantY : 40,
		constantOffset : 20
	};
	
	/*
	Namespace: POODLE.Engine.utils
		Shared local utilities
	*/
	$self.utils = {
		hideNavigationBar : function () {
			window.setTimeout(function() {
				window.scrollTo(0, 0);
			}, 0);
		},
		
		setVerticalHeight : function (canvas) {
			$self.vars.verticalHeight = canvas.height();
		},
		
		getVerticalHeight : function () {
			return $self.vars.verticalHeight;
		},
		
		setVerticalCenter : function (canvas) {
			$self.vars.verticalCenter = $self.vars.verticalHeight / 2;
		},
		
		getVerticalCenter : function () {
			return $self.vars.verticalCenter;
		},
		
		getTransitionValue : function () {
			return $self.vars.transitionValue;
		},
		
		getFirstPlatform : function (canvas) {
			return $(".platform", canvas).eq(0);
		},
		
		getPlatformThreshold : function () {
			return $self.vars.platformThreshold;
		},
		
		getPlatformHeight : function () {
			return $self.vars.platformHeight;
		},
		
		getConstantY : function () {
			return $self.vars.constantY;
		},
		
		getConstantOffset : function () {
			return $self.vars.constantOffset;
		},
		
		getInitialOffset : function () {
			return $self.vars.firstPlatformOffset;
		},
		
		stashVars : function (obj) {
			for (var key in obj) {
				$self.vars[key] = obj[key];
			}
		},
		
		checkForPlatforms : function (el) {
			var rect = el.rect(),
			    offsetLeft = rect.left + (rect.width / 2),
			    offsetTop = rect.bottom + $self.utils.getPlatformHeight(),
			    i, j, translation = $self.utils.getTransitionValue(),
			    collision;
			
			for (i = 1, j = translation; i < j; i++) {
				collision = document.elementFromPoint(offsetLeft, offsetTop + i);
				
				if (collision && $(collision).hasClass("platform")) {
					break;
				} else {
					collision = false;
				}
			}
			
			// console.log(collision);
			return $(collision);
		},
		
		centerPlatform : function (platform) {
			var rect = platform.rect(),
			    center = $self.utils.getVerticalCenter(),
			    section = platform.parent();
			
			if (rect.top < center) {
				section.translate(0, $self.utils.getVerticalCenter() - rect.top, 0);
				$self.utils.checkPlatformCount(section, platform);
			}
		},
		
		calcOffset : function (el, obj) {
			var elRect = el.rect(),
			    objRect = obj.rect();
			
			return objRect.top - elRect.bottom;
		},
		
		randomFromTo : function (from, to) {
			return Math.floor(Math.random() * (to - from + 1) + from);
		},
		
		layoutInitialGrid : function (section) {
			section.append($('<div></div>').addClass("platform").css({
				bottom : $self.utils.getInitialOffset() + "px"
			}));
			
			$self.utils.addPlatforms(section);
		},
		
		checkPlatformCount : function (section, platform) {
			var platforms = $(".platform"),
			    index = platforms.index(platform),
			    threshold = $self.utils.getPlatformThreshold(),
			    verticalHeight = $self.utils.getVerticalHeight();
			
			if (platforms.length - index < threshold) {
				$self.utils.addPlatforms(section);
			}
			
			platforms.each(function (i, platform) {
				if ($(platform).rect().top > verticalHeight) {
					platform.parentNode.removeChild(platform);
				} else {
					return false;
				}
			});
		},
		
		addPlatforms : function (section) {
			var i, j, platform, previous,
			    previousX, previousY, constantY,
			    randomOffset, x, y;
			
			for (i = 0, j = 20; i < j; i++) {
				platform = $('<div></div>').addClass("platform");
				previous = $(".platform:last-child", section);
				previousX = previous.get(0).offsetLeft;
				previousY = window.parseInt(previous.css("bottom"));
				constantY = $self.utils.getConstantY();
				randomOffset = $self.utils.getConstantOffset();

				x = $self.utils.randomFromTo(Math.min(320, previousX + 150), Math.max(0, previousX - 150));

				y = previousY + constantY;
				y = $self.utils.randomFromTo(y - randomOffset, y + randomOffset);

				platform.css({
					bottom : y + "px",
					left : x + "px"
				});

				section.append(platform);
			}
			
			return platform;
		},
		
		setInitialTransition : function (poodler, canvas) {
			var platform = $self.utils.getFirstPlatform(canvas),
			    offset = platform.offset().top - canvas.height(),
			    transition = $self.utils.getTransitionValue(),
			    startValue = offset - transition;

			poodler.transition(startValue * (startValue / transition)).translate(0, startValue, 0);
		},
		
		activatePoodler : function (poodler) {
			return poodler.addClass("bounce-up");
		}
	};
	
	/*
	Namespace: POODLE.Engine.utils.events
		Shared local events
	*/
	$self.utils.events = {
		transitionEnd : function (poodler) {
			poodler.bind("webkitTransitionEnd", function (e) {
				var platform = $self.utils.checkForPlatforms(poodler),
				    transition = $self.utils.getTransitionValue(),
				    offset;

				if (!poodler.hasClass("bounce-down")) {
					if (platform.get(0)) {
						offset = $self.utils.calcOffset(poodler, platform);
						poodler.translate(0, offset, 0);
					} else {
						poodler.translate(0, transition, 0);
					}

					poodler.addClass("bounce-down");
				} else {
					if (platform) {
						$self.utils.centerPlatform(platform);
					}
					poodler.translate(0, -transition, 0);
					poodler.removeClass("bounce-down");
				}
			}, false);
		},

		deviceMotion : function (tilter) {
			var gravity, x;
			
			$(window).bind("devicemotion", function (e) {
				gravity = e.accelerationIncludingGravity;
				x = gravity.x * 10;
				
				tilter.transition(100).translate(x, 0, 0);
			});
		}
	};
	
	/*
	Namespace: POODLE.Engine
		Under the POODLE.Engine Local Namespace
	*/
	
	/*
	Function: initialize
	*/
	$self.initialize = function () {
		var canvas = $("#canvas"),
		    poodler = canvas.find("#poodler"),
		    section = canvas.find("section"),
		    tilter = canvas.find("#poodler-tilt");
		
		// Hide URL Bar
		$self.utils.hideNavigationBar();
		
		// Set Default Properties
		$self.utils.setVerticalHeight(canvas);
		$self.utils.setVerticalCenter(canvas);
		
		// Layout Starting Template
		$self.utils.layoutInitialGrid(section);
		$self.utils.setInitialTransition(poodler, canvas);
		
		// Add Events
		$self.utils.events.transitionEnd(poodler);
		$self.utils.events.deviceMotion(tilter);
		
		// Start!
		$self.utils.activatePoodler(poodler);
	};
	
	/*
	Callback: queue
		Sends local functions to a global queuer for initialization See: <POODLE.utils.queue>
	*/
	$space.utils.queue($self);
	
})();