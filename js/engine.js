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
	
	/*
	Namespace: POODLE.Engine.vars
		Shared local variables
	*/
	var $space = POODLE,
	    $self = $space.Engine,
	
	    BOUNCE_UP = "bounce-up",
	    BOUNCE_DOWN = "bounce-down",
	    GAME_OVER = "game-over",
	
	    PLATFORM = "platform",
	    SPRING = "spring",
	
	    X,
	    EVENTS = {},
	    DIRECTION,
	    VERTICAL_HEIGHT,
	    VERTICAL_CENTER,
	    INTERVAL,
	    CANVAS,
	    SECTION,
	    POODLER,
	    TILTER,
	    FACE,
	    ACTIVE_PLATFORM;
	
	/*
	Namespace: POODLE.Engine.consts
		Shared local variables
	*/
	const TRANSITION_DURATION = 550,
	      TRANSLATE_VALUE = 150,
	      FIRST_PLATFORM_OFFSET = 90,
	      PLATFORM_HEIGHT = (15 / 2),
	      PLATFORM_THRESHOLD = 10,
	      CONSTANT_Y = 40,
	      CONSTANT_OFFSET = 20;
	
	/*
	Namespace: POODLE.Engine.utils
		Shared local utilities
	*/
	$self.utils = {
		setInterval : function (interval, timer) {
			INTERVAL = window.setInterval(interval, timer);
		},
		
		clearInterval : function () {
			window.clearInterval(INTERVAL);
			delete INTERVAL;
		},
		
		checkForCollision : function () {
			if (!POODLER.length) {
				return;
			}
			
			var rect = POODLER.rect(),
			    offsetLeft = Math.max(0, rect.left),
			    offsetRight = Math.min(320, rect.left + rect.width),
			    offsetTop = rect.bottom + PLATFORM_HEIGHT,
			    i, j, translation = TRANSLATE_VALUE,
			    value, collision;
			
			collision = $(document.elementFromPoint(offsetLeft, offsetTop));
			
			if (collision.length && !collision.hasClass(PLATFORM)) {
				collision = $(document.elementFromPoint(offsetRight, offsetTop));
			}
			
			if (POODLER.hasClass(BOUNCE_DOWN) && collision.length && collision.hasClass(PLATFORM)) {
				ACTIVE_PLATFORM = collision;
				
				value = collision.rect().top - POODLER.rect().bottom;
				$self.utils.centerPlatform(collision);
			}
			
			return value;
		},
		
		centerPlatform : function (platform) {
			if (!platform.length) {
				return;
			}
			
			var rect = platform.rect(),
			    center = VERTICAL_CENTER,
			    transition = TRANSITION_DURATION,
			    multiplier = 1;
			
			if (platform.hasClass(SPRING)) {
				multiplier = 2.5;
			}
			
			if (rect.top < center) {
				SECTION.transition(transition);
				SECTION.translate(0, (VERTICAL_CENTER - rect.top) * multiplier, 0);
				
				$self.utils.checkPlatformCount(platform);
			}
		},
		
		randomFromTo : function (from, to) {
			return Math.floor(Math.random() * (to - from + 1) + from);
		},
		
		getRandomClassName : function () {
			var randomNumber = Math.floor(Math.random() * 100),
			    _class = "";
			
			if (randomNumber < 10) {
				_class = SPRING;
			}
			
			return _class;
		},
		
		checkPlatformCount : function (platform) {
			var platforms = $(".platform", SECTION),
			    index = platforms.index(platform),
			    threshold = PLATFORM_THRESHOLD;
			
			if (platforms.length - index < threshold) {
				$self.utils.addPlatforms(SECTION);
			}
		},
		
		removeOldPlatforms : function () {
			var verticalHeight = VERTICAL_HEIGHT,
			    platforms = $(".platform", SECTION);
			
			platforms.each(function (i, platform) {
				if ($(platform).rect().top > verticalHeight) {
					platform.parentNode.removeChild(platform);
				} else {
					return false;
				}
			});
		},
		
		addPlatforms : function () {
			var i, j, platform, previous,
			    previousY, constantY,
			    randomSeed,
			    randomOffset, x, y;
			
			for (i = 0, j = 20; i < j; i++) {
				platform = $('<div></div>').addClass(PLATFORM);
				previous = $(".platform:last-child", SECTION);
				previousY = window.parseInt(previous.css("bottom"));
				constantY = CONSTANT_Y;
				randomOffset = CONSTANT_OFFSET;
				randomSeed = $self.utils.getRandomClassName();

				x = $self.utils.randomFromTo(0, 320 - 57);

				y = previousY + constantY;
				y = $self.utils.randomFromTo(y - randomOffset, y + randomOffset);

				platform.css({
					bottom : y + "px",
					left : x + "px"
				});
				
				if (randomSeed) {
					platform.addClass(randomSeed);
				}

				SECTION.append(platform);
			}
			
			return platform;
		},
		
		addEvent : function (type, handler) {
			EVENTS[type] = EVENTS[type] || [];
			EVENTS[type].push(handler);
		},
		
		fireEvent : function (type) {
			var array = EVENTS[type];
			
			if (array) {
				$(array).each(function (i, handler) {
					handler();
				});
			}
		},
		
		activatePoodler : function () {
			return POODLER.addClass(BOUNCE_UP);
		},
		
		youJustLostTheGame : function () {
			$self.utils.clearInterval();
		}
	};
	
	$self.utils.properties = {
		hideNavigationBar : function () {
			window.setTimeout(function() {
				window.scrollTo(0, 0);
			}, 0);
		},
		
		setVerticalHeight : function () {
			VERTICAL_HEIGHT = CANVAS.height();
		},
		
		setVerticalCenter : function () {
			VERTICAL_CENTER = VERTICAL_HEIGHT / 2;
		},
		
		setupPollingEngine : function () {
			$self.utils.setInterval(function () {
				$self.utils.fireEvent("poll");
			}, 0);
		},
		
		layoutInitialGrid : function () {
			SECTION.append($('<div></div>').addClass(PLATFORM).css({
				bottom : FIRST_PLATFORM_OFFSET + "px"
			}));
			
			$self.utils.addPlatforms();
		},
		
		setInitialTransition : function () {
			var platform = $(".platform", SECTION).eq(0),
			    offset = platform.offset().top - CANVAS.height(),
			    translation = TRANSLATE_VALUE,
			    startValue = offset - translation;

			POODLER.transition(TRANSITION_DURATION).translate(0, startValue, 0);
		}
	};
	
	/*
	Namespace: POODLE.Engine.utils.events
		Shared local events
	*/
	$self.utils.events = {
		transitionEnd : function () {
			POODLER.bind("webkitTransitionEnd", function (e) {
				var isTriggered = e.constructor.AT_TARGET,
				    translation = TRANSLATE_VALUE,
				    duration = TRANSITION_DURATION,
				    offset;
				
				if (e.target === this) {
					
					if (ACTIVE_PLATFORM) {
						if (ACTIVE_PLATFORM.hasClass(SPRING)) {
							duration *= 1.5;
							translation *= 2;
						}
					}
					
					POODLER.transition(duration);

					if (!POODLER.hasClass(BOUNCE_DOWN)) {
						POODLER.removeClass(GAME_OVER).addClass(BOUNCE_DOWN);
						POODLER.translate(0, translation, 0);
					} else {
						if (!isTriggered) {
							if (POODLER.hasClass(GAME_OVER)) {
								console.log("Game Over!");
								$self.utils.youJustLostTheGame();
								return false;
							} else {
								translation = POODLER.rect().top - CANVAS.height();
								POODLER.addClass(GAME_OVER);
							}
						} else {
							POODLER.removeClass(GAME_OVER).removeClass(BOUNCE_DOWN);
						}

						POODLER.translate(0, -translation, 0);
					}
					
					$self.utils.removeOldPlatforms();
				}
			}, false);
		},

		deviceMotion : function () {
			var gravity;
			DIRECTION = "";
			
			if ("DeviceMotionEvent" in window) {
				$(window).bind("devicemotion", function (e) {
					gravity = e.accelerationIncludingGravity;
					
					X = gravity.x;
					
					if (X > 0) {
 						DIRECTION = "left";
					} else {
 						DIRECTION = "right";
					}
				});
			} else {
				X = 0;
				$(window).bind("keydown", function (e) {
					X = (e.keyCode === 39) ? 30 : -30;
				});
			}
		},
		
		collision : function () {
			$self.utils.addEvent("collision", function () {
				POODLER.trigger("webkitTransitionEnd");
			});
		},
		
		polling : function () {
			var collision, verifyCollision;
			
			$self.utils.addEvent("poll", function () {
				TILTER.translate(X, 0, 0);
				
				if (!("DeviceMotionEvent" in window)) {
					X = 0;
				}
			});
			
			$self.utils.addEvent("poll", function () {
				collision = $self.utils.checkForCollision();
				
				if (collision !== undefined) {
					POODLER.transition(0);
					POODLER.translate(0, collision, 0);
					
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
			});
			
			$self.utils.addEvent("poll", function () {
				FACE.attr("class", DIRECTION);
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
		var key;
		
		CANVAS = $("#canvas");
		SECTION = CANVAS.find("section");
		POODLER = CANVAS.find("#poodler-y");
		TILTER = CANVAS.find("#poodler-x");
		FACE = CANVAS.find("#poodler-z");
		
		// Setup Initial Properties
		for (key in $self.utils.properties) {
			$self.utils.properties[key]();
		}
		
		// Add Events
		for (key in $self.utils.events) {
			$self.utils.events[key]();
		}
		
		// Start!
		$self.utils.activatePoodler();
	};
	
	/*
	Callback: queue
		Sends local functions to a global queuer for initialization See: <POODLE.utils.queue>
	*/
	$space.utils.queue($self);
	
})();