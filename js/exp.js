function Hand() {
	if (typeof this.initialize !== 'function') {
		Hand.prototype.initialize = function(elem, direction, range) {
			this.element = elem;
			this.direction = direction;
			this.maxOffsetTop = range[1];
			this.minOffsetTop = range[0];
			this.curOffsetTop = parseFloat(this.element.style.top.replace(/%/, ''));
		};

		Hand.prototype.move = function() {
			this.checkDirection();
			this.direction > 0 ? this.curOffsetTop += 0.4 : this.curOffsetTop -= 0.4;
			this.element.style.top = this.curOffsetTop + '%';
		};

		Hand.prototype.checkDirection = function() {
			var top = parseFloat(this.element.style.top.replace(/%/, ''));
			if (top > this.maxOffsetTop || top < this.minOffsetTop) {
				this.direction = -this.direction;
			}
		};
	}

	this.initialize.apply(this, arguments);
}

function TopBtn() {
	if (typeof this.initialize !== 'function') {
		TopBtn.prototype.initialize = function(elem) {
			var that = this;
			this.element = elem;
			this.element.onclick = function() {
				that.goTop();
			};
		};

		TopBtn.prototype.goTop = function(speed, acceleration) {
			var timeout, y = document.documentElement.scrollTop || document.body.scrollTop || 0;
			speed = Math.floor(speed) || 1; //每次移动1像素
			acceleration = acceleration || 10; //加速度默认是10像素

			(function() {
				window.scrollTo(0, y -= speed);
				speed += acceleration;
				if (y > 0) {
					// requestAnimationFrame(arguments.callee);
					timeout = setTimeout(arguments.callee, 16);
				}
			})();
		};
	}

	this.initialize.apply(this, arguments);
}