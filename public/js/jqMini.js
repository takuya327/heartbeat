/*****************************************************************
 *
 * jQuery Mobile Mini
 * jQueryMobileÇ©ÇÁâÊñ ëJà⁄ÇÃïîï™ÇæÇØÇíäèoÇµåyó âªÇµÇΩÉâÉCÉuÉâÉä
 * 
 * Required: jQuery(http://jquery.com/)
 * Inspired: jQuery Mobile(http://jquerymobile.com/)
 * License: MIT
 * Update: 2012/09/22
 * Version: 0.3.3
 * Author: yuu.creatorish
 * URL: http://creatorish.com
 * PluginURL: http://creatorish.com/lab/3415
 *
 *
*******************************************************************/
var jqMiniEvent = {
	changeStart: "changestart",
	changeEnd: "changeend",
	show: "show",
	hide: "hide",
	preHide: "preshow",
	preShow: "prehide"
};

$.fn.jqMini = function(op) {
	var option = {
		transition: "fade",
		scrollCheck: true,
		scrollTime: 0,
		external: "external",
		hash: true
	};
	$.extend(option,op);
	
	var self = $(this);
	var isAnimation = false;
	
	var lastHash = null;
	var history = {};
	
	var CHANGE_OPTION = {
		transition: option.transition,
		back: false,
		reverse: false,
		scrollPos: 0,
		hash: true,
		sync: false,
		direction: "out",
		from: null,
		to: null
	};
	var currentId = null;
	var hashTimer = null;
	var latestScrollPos = 0;
	
	function init() {
		var current = self.children(".current");
		if (current.length === 0) {
			current = self.children(":first").addClass("current");
		}
		currentId = "#"+current.attr("id");
		lastHash = currentId;
		
		self.find("a[rel!='"+option.external+"']").click(clickHandler);
		
		startHashCheck();
		if (!option.hash) {
			lastHash = location.hash;
		}
	}
	function hashCheck() {
		var hash = location.hash;
		if (!hash) {
			hash = currentId;
		}
		if (lastHash !== hash) {
			var hist = getHistory(hash);
			if (hist) {
				if (hist.to !== lastHash && hist.from !== lastHash) {
					hist.transition = option.transition;
				}
				hist.reverse = !hist.reverse;
				hist.hash = false;
				
				self.goTo(hash,hist);
			} else {
				self.goTo(hash,{
					transition: option.transition
				});
			}
		}
	}
	
	function startHashCheck() {
		if (option.hash) {
			stopHashCheck();
			hashTimer = setInterval(hashCheck,100);
		}
	}
	function stopHashCheck() {
		clearInterval(hashTimer);
	}
	
	function getHistory(hash) {
		return history[hash];
	}
	function addHistory(to,options) {
		history[to] = options;
	}
	function clickHandler(e) {
		var href = $(this).attr("href");
		if (href.charAt(0) === "#") {
			var trans = $(this).attr("data-transition");
			var reverse = $(this).attr("data-reverse");
			var back = $(this).attr("data-back");
			var hash = $(this).attr("data-hash");
			changePage(href,{
				transition: trans,
				reverse: reverse,
				back: back,
				hash: hash
			});
			e.preventDefault();
		}
	}
	
	function cancel() {
		if (option.hash) {
			var hash = location.hash;
			if (!hash) {
				hash = currentId;
			}
			if (lastHash !== hash) {
				var hist = getHistory(hash);
				if (!hist) {
					location.hash = "";
				}
			}
		}
	}
	
	function getHash(val) {
		val = String(val);
		var index = val.indexOf("?");
		if (index !== -1) {
			return val.slice(0,index);
		} else {
			return val;
		}
	}
	
	function consoleError(message) {
		if (window.console) {
			window.console.error(message);
		} else {
			alert(message);
		}
	}
	
	function changePage(id,op) {
		var from = self.children(".current");
		var to = $(getHash(id));
		
		var options = $.extend({},CHANGE_OPTION,op);
		
		if (isAnimation) {
			return;
		} else if (to.length === 0) {
			consoleError('Not Found "To Page"');
			return;
		}
		
		if (self.triggerHandler(jqMiniEvent.changeStart,[from,to]) === false) {
			cancel();
			return;
		}
		if (to.triggerHandler(jqMiniEvent.preShow,[from]) === false) {
			cancel();
			return;
		}
		if (from.triggerHandler(jqMiniEvent.preHide,[to]) === false) {
			cancel();
			return;
		}
		
		isAnimation = true;
		stopHashCheck();
		
		switch(options.transition) {
			case "fade":
			case "pop":
			case "flow":
			case "slidefade":
			case "shuffleleft":
			case "shuffleright":
			case "shuffleup":
			case "shuffledown":
				options.sync = true;
				break;
			case "flip":
			case "vflip":
				self.addClass("viewport-flip");
				options.sync = true;
				break;
			case "turn":
				self.addClass("viewport-turn");
				options.sync = true;
				break;
			default:
				break;
		}
		
		options.scrollPos = $(window).scrollTop();
		options.from = "#"+from.attr("id");
		options.to = "#"+to.attr("id");
		
		if (window.history.length !== 0 && option.hash && options.back && options.hash) {
			isAnimation = false;
			window.history.back();
			startHashCheck();
		} else {
			addHistory(options.from,options);
			var toOptions = $.extend({},options);
			toOptions.direction = "in";
			addHistory(options.to,toOptions);
			lastHash = id;
			if (option.hash && options.hash === true) {
				location.hash = id;
			}
			executeChange(from,to,options);
		}
	}
	
	function executeChange(from,to,options) {
		var rev = "";
		if (options.reverse) {
			rev = " reverse";
		}
		
		if (options.transition === "none") {
			from.hide().removeClass("current");
			to.show().addClass("current");
			isAnimation = false;
			self.trigger(jqMiniEvent.changeEnd,[from,to]);
			
			from.trigger(jqMiniEvent.hide,[to]);
			to.trigger(jqMiniEvent.show,[from]);
			
			if (options.reverse && option.scrollCheck) {
				$(window).animate({
					scrollTop: latestScrollPos
				},option.scrollTime);
			} else {
				scrollTo(1,0);
				latestScrollPos = options.scrollPos;
			}
			startHashCheck();
			return;
		}
		
		from.bind("webkitAnimationEnd", function() {
			$(this).unbind("webkitAnimationEnd");
			$(this).hide().removeClass(options.transition + " out current" + rev);
			if (options.sync) {
				if (option.scrollCheck) {
					to.show().addClass(options.transition + " in" + rev).scrollTop(latestScrollPos);
				} else {
					to.show().addClass(options.transition + " in" + rev);
				}
			}
			$(this).trigger(jqMiniEvent.hide,[to]);
		});
		to.bind("webkitAnimationEnd", function() {
			$(this).unbind("webkitAnimationEnd");
			$(this).removeClass(options.transition + " in" + rev).addClass("current");
			isAnimation = false;
			self.removeClass("viewport-flip viewport-turn");
			if (options.reverse && option.scrollCheck) {
				$("html,body").animate({
					scrollTop: latestScrollPos
				},option.scrollTime);
			} else {
				scrollTo(1,0);
				latestScrollPos = options.scrollPos;
			}
			
			$(this).trigger(jqMiniEvent.show,[from]);
			self.trigger(jqMiniEvent.changeEnd,[from,to]);
			
			startHashCheck();
		});
		
		from.addClass(options.transition + " out" + rev).scrollTop(options.scrollPos);;
		if (!options.sync) {
			if (option.scrollCheck) {
				to.show().addClass(options.transition + " in" + rev).scrollTop(latestScrollPos);
			} else {
				to.show().addClass(options.transition + " in" + rev);
			}
		}
	}
	
	function scrollTo(val,time) {
		window.setTimeout(function() {
			window.scrollTo(0,val);
		},time);
	}
	
	self.goTo = function(id,op) {
		changePage(id,op);
	};
	
	scrollTo(0,100);
	
	init();
	return self;
};