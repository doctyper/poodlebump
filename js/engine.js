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
		transitionDuration : 550,
		transitionValue : 150,
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
		
		setGlobalTransition : function (value) {
			$self.vars.globalTransitionValue = value;
		},
		
		getGlobalTransition : function () {
			return $self.vars.transitionDuration;
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
		
		setInterval : function (interval, timer) {
			$self.vars.interval = window.setInterval(interval, timer);
		},
		
		getInterval : function () {
			return $self.vars.interval;
		},
		
		clearInterval : function () {
			window.clearInterval($self.vars.interval);
			delete $self.vars.interval;
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
		
		checkForCollision : function (poodler) {
			if (!poodler.length) {
				return;
			}
			
			var rect = poodler.rect(),
			    offsetLeft = Math.max(0, rect.left),
			    offsetRight = Math.min(320, rect.left + rect.width),
			    offsetTop = rect.bottom + $self.utils.getPlatformHeight(),
			    i, j, translation = $self.utils.getTransitionValue(),
			    value, collision;
			
			collision = $(document.elementFromPoint(offsetLeft, offsetTop));
			
			if (collision.length && !collision.hasClass("platform")) {
				collision = $(document.elementFromPoint(offsetRight, offsetTop));
			}
			
			if (poodler.hasClass("bounce-down") && collision.length && collision.hasClass("platform")) {
				value = collision.rect().top - poodler.rect().bottom;
				$self.utils.centerPlatform(collision);
			}
			
			return value;
		},
		
		centerPlatform : function (platform) {
			if (!platform.length) {
				return;
			}
			
			var rect = platform.rect(),
			    center = $self.utils.getVerticalCenter(),
			    section = platform.parent();
			
			if (rect.top < center) {
				section.translate(0, $self.utils.getVerticalCenter() - rect.top, 0);
				$self.utils.checkPlatformCount(section, platform);
			}
		},
		
		calcOffset : function (el, obj) {
			if (!el.length) {
				return;
			}
			
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
			    threshold = $self.utils.getPlatformThreshold();
			
			if (platforms.length - index < threshold) {
				$self.utils.addPlatforms(section);
			}
		},
		
		removeOldPlatforms : function () {
			var verticalHeight = $self.utils.getVerticalHeight(),
			    platforms = $(".platform");
			
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
			    previousY, constantY,
			    randomOffset, x, y;
			
			for (i = 0, j = 20; i < j; i++) {
				platform = $('<div></div>').addClass("platform");
				previous = $(".platform:last-child", section);
				previousY = window.parseInt(previous.css("bottom"));
				constantY = $self.utils.getConstantY();
				randomOffset = $self.utils.getConstantOffset();

				x = $self.utils.randomFromTo(0, 320 - 57);

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

			$self.utils.setGlobalTransition(startValue * (startValue / transition));
			poodler.transition($self.utils.getGlobalTransition()).translate(0, startValue, 0);
		},
		
		setupPollingEngine : function () {
			$self.utils.setInterval(function () {
				$self.utils.fireEvent("poll");
			}, 0);
		},
		
		addEvent : function (type, handler) {
			$self.vars.events = $self.vars.events || {};
			$self.vars.events[type] = $self.vars.events[type] || [];
			
			$self.vars.events[type].push(handler);
		},
		
		fireEvent : function (type) {
			var array = $self.vars.events[type];
			
			if (array) {
				$(array).each(function (i, handler) {
					handler();
				});
			}
		},
		
		activatePoodler : function (poodler) {
			return poodler.addClass("bounce-up");
		},
		
		youJustLostTheGame : function () {
			$self.utils.clearInterval();
		}
	};
	
	/*
	Namespace: POODLE.Engine.utils.events
		Shared local events
	*/
	$self.utils.events = {
		transitionEnd : function (poodler, section) {
			poodler.bind("webkitTransitionEnd", function (e) {
				var isTriggered = e.constructor.AT_TARGET,
				    transition = $self.utils.getTransitionValue(),
				    offset;
				
				if (e.target === this) {
					poodler.transition($self.utils.getGlobalTransition());

					if (!poodler.hasClass("bounce-down")) {
						poodler.removeClass("game-over").addClass("bounce-down");
						poodler.translate(0, transition, 0);
					} else {
						if (!isTriggered) {
							if (poodler.hasClass("game-over")) {
								console.log("Game Over!");
								$self.utils.youJustLostTheGame();
								return false;
							} else {
								transition = poodler.rect().top - $("#canvas").height();
								poodler.addClass("game-over");
							}
						} else {
							poodler.removeClass("game-over").removeClass("bounce-down");
						}

						poodler.translate(0, -transition, 0);
					}
					
					$self.utils.removeOldPlatforms();
				}
			}, false);
		},

		deviceMotion : function () {
			var gravity;
			$self.vars.direction = "";
			
			if ("DeviceMotionEvent" in window) {
				$(window).bind("devicemotion", function (e) {
					gravity = e.accelerationIncludingGravity;
					
					$self.vars.x = gravity.x;
					
					if ($self.vars.x > 0) {
						$self.vars.direction = "right";
					} else {
						$self.vars.direction = "left";
					}
				});
			} else {
				$self.vars.x = 0;
				$(window).bind("keydown", function (e) {
					$self.vars.x = (e.keyCode === 39) ? 30 : -30;
				});
			}
		},
		
		collision : function (poodler) {
			$self.utils.addEvent("collision", function () {
				poodler.trigger("webkitTransitionEnd");
			});
		},
		
		polling : function (poodler, tilter, face) {
			var collision, verifyCollision;
			
			$self.utils.addEvent("poll", function () {
				tilter.translate($self.vars.x, 0, 0);
				
				collision = $self.utils.checkForCollision(poodler);
				
				if (collision !== undefined) {
					poodler.transition(0);
					poodler.translate(0, collision, 0);
					
					if (!verifyCollision) {
						verifyCollision = 1;
					}
				}
				
				if (verifyCollision) {
					if (verifyCollision > 1) {
						verifyCollision = 0;
						$self.utils.fireEvent("collision");
					} else {
						verifyCollision = verifyCollision + 1;
					}
				}
				
				face.attr("class", $self.vars.direction);
				
				if (!("DeviceMotionEvent" in window)) {
					$self.vars.x = 0;
				}
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
		    section = canvas.find("section"),
		    poodler = canvas.find("#poodler-y"),
		    tilter = canvas.find("#poodler-x"),
		    face = canvas.find("#poodler-z");
		
		// Hide URL Bar
		$self.utils.hideNavigationBar();
		
		// Set Default Properties
		$self.utils.setVerticalHeight(canvas);
		$self.utils.setVerticalCenter(canvas);
		
		// Layout Starting Template
		$self.utils.setupPollingEngine();
		$self.utils.layoutInitialGrid(section);
		$self.utils.setInitialTransition(poodler, canvas);
		
		// Add Events
		$self.utils.events.transitionEnd(poodler, section);
		$self.utils.events.deviceMotion(poodler, tilter, face);
		$self.utils.events.collision(poodler);
		$self.utils.events.polling(poodler, tilter, face);
		
		// Start!
		$self.utils.activatePoodler(poodler);
	};
	
	/*
	Callback: queue
		Sends local functions to a global queuer for initialization See: <POODLE.utils.queue>
	*/
	$space.utils.queue($self);
	
})();