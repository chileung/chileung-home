function Eye() {
	if (typeof this.initialize !== 'function') {
		Eye.prototype.initialize = function(object) {
			this.center = {
				x: object.x,
				y: object.y
			};
			this.radius = object.r;
			this.eyeball = object.eyeball;
		};

		Eye.prototype.focus = function(object) {
			var pow = Math.pow,
				sqrt = Math.sqrt,
				abs = Math.abs,
				x0 = this.center.x,
				y0 = this.center.y,
				x = object.x,
				y = object.y,
				r = this.radius;

			this.eyeball.style.top = (y > y0 ? 1 : -1) * r * abs(y - y0) / sqrt(pow((x - x0), 2) + pow((y - y0), 2)) + 'px';

			this.eyeball.style.left = (x > x0 ? 1 : -1) * r * abs(x - x0) / sqrt(pow((x - x0), 2) + pow((y - y0), 2)) + 'px';
		};
	}
	this.initialize.apply(this, arguments);
}

function Cloud() {
	if (typeof this.initialize !== 'function') {
		Cloud.prototype.initialize = function(index, $elem) {
			this.id = index;
			this.elem = $elem;
			this.runTimeout={};
		};

		function parsePrecent(value) {
			if (value.indexOf('px') != -1) {
				// match chrome & ff
				value = parseFloat(value) / parseFloat(this.elem.parent().css('width')) * 100;
			} else if (value.indexOf('%') != -1) {
				// match IE/O/Safari
				value = parseFloat(value);
			}
			return value;
		}

		Cloud.prototype.move = function(range) {
			var left = this.elem.css('left');

			left=parsePrecent.call(this,left);

			this.elem.css({
				left: left + range + '%'
			});
		};

		Cloud.prototype.run = function(speed, range) {
			var that = this;
			this.runTimeout.startFlag = setTimeout(function() {
				if (parsePrecent.call(that,that.elem.css('left')) > 100) {
					that.elem.css({
						left: '-20%'
					});
				}
				that.move(range);
				that.runTimeout.repeatFlag = setTimeout(arguments.callee, speed);
			}, speed);
		};

		Cloud.prototype.stop = function() {
			for(var flag in this.runTimeout){
				clearTimeout(this.runTimeout[flag]);
			}
		};

		Cloud.prototype.runAside = function(cloud) {
			// #todo
		};
	}
	this.initialize.apply(this, arguments);
}

function CloudControler() {
	if (typeof this.initialize !== 'function') {
		CloudControler.prototype.initialize = function(list) {
			this.cloudList = list;
		};

		CloudControler.prototype.runAll = function(speed, range) {
			this.cloudList.each(function() {
				this.run(speed, range);
			});
		};

		CloudControler.prototype.stopAll = function() {
			// #todo
		};

		CloudControler.prototype.highlight = function(cloud) {
			// #todo
		};

		CloudControler.prototype.recover = function() {
			//#todo
		};
	}
	this.initialize.apply(this,arguments);
}