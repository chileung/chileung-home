inheritPrototype(Point, Section);
inheritPrototype(Word, Section);
inheritPrototype(Button, Section);
inheritPrototype(Letter, Section);

function Word() {
	//[public] method
	if (!Word.prototype.hasOwnProperty('initialize')) {
		Word.prototype.initialize = function($elem, content) {
			//status默认是0(0为隐藏)
			//inherit superClass's instance property
			Section.call(this, $elem, content, 0);
		};

		Word.prototype.show = function() {
			//#todo
		};

		Word.prototype.hide = function() {
			// #todo
		};

		Word.prototype.destruct = function() {
			// #todo
		};
	}

	this.initialize.apply(this, arguments);
}

function Letter() {
	//[public] method
	if (!Letter.prototype.hasOwnProperty('initialize')) {
		Letter.prototype.initialize = function($elem, content) {
			//[public] property
			//0:隐藏(默认) 1:实线 2:虚线
			switch (content) {
				case 'B':
				case '!':
				case 'N':
				case 'H':
				case 'C':
				case 'I':
				case 'U':
				case 'E':
					this.direction = 'top';
					break;
				case 'P':
				case 'O':
				case 'G':
					this.direction = 'bottom';
					break;
				case 'Y':
				case 'T':
				case 'V':
				case 'D':
				case 'W':
				case 'A':
				case 'M':
				case 'R':
					this.direction = 'left';
					break;
				case 'F':
				case 'L':
					this.direction = 'right';
					break;
			}

			//inherit superClass's instance property
			Section.call(this, $elem, content, 0);
		};

		Letter.prototype.show = function() {
			this.performScroll();
		};

		Letter.prototype.hide = function() {
			// 目前是对父容器整个隐藏，因此暂时不用写hide
		}

		Letter.prototype.destruct = function() {
			this.status = 0;
			switch (this.direction) {
				case 'top':
				case 'bottom':
					this.elem.removeClass('to_top').removeClass('to_bottom');
					break;
				case 'left':
				case 'right':
					this.elem.removeClass('to_left').removeClass('to_right');
					break;
			}
		};

		Letter.prototype.scrollMyself = function(duration) {
			var that = this;
			this.performScroll();
			setTimeout(function() {
				that.performScroll();
			}, duration);
		};
	}

	this.initialize.apply(this, arguments);
}

function Button() {
	//[public] method
	if (!Button.prototype.hasOwnProperty('initialize')) {
		Button.prototype.initialize = function($elem, content, btnLocation, belonging) {
			//[public] property
			//status:0:(默认) 1:翻滚
			this.direction = 'top'; //默认都是top
			this.btnLocation = btnLocation;
			this.belonging = belonging;

			//inherit superClass's instance property
			Section.call(this, $elem, content, 0);
		};

		Button.prototype.show = function() {
			this.performScroll();
		};

		Button.prototype.hide = function() {
			// 目测有destruct就足够
		};

		Button.prototype.destruct = function() {
			this.status = 0;
			this.elem.removeClass('to_top').removeClass('to_bottom');
		};

		Button.prototype.goTo = function() {
			// #todo
		};
	}

	this.initialize.apply(this, arguments);
}

function Point() {
	//[public] method
	if (!Point.prototype.hasOwnProperty('initialize')) {
		Point.prototype.initialize = function($elem, pointer, position, isCurrent) {
			//[public] property
			this.position = position;
			// status: 0:no 1:yes

			//inherit superClass's instance property
			Section.call(this, $elem, pointer, isCurrent);
		};

		Point.prototype.show = function() {
			//对父容器做操作
		};

		Point.prototype.hide = function() {
			//对父容器做操作
		};

		Point.prototype.goTo = function(point) {
			var className;
			if (this.position == point.position) {
				return;
			} else {
				className = this.position > point.position ? 'skewing_left' : 'skewing_right';
				this.status = 0;
				this.elem.removeClass('current');
				point.status = 1;
				point.elem.addClass('current');
				this.content.hide();
				point.content.show(className);
			}
		};

		Point.prototype.destruct = function() {
			//暂时不用想
		};
	}

	this.initialize.apply(this, arguments);
}

function Section() {
	//[public] method
	if (!Section.prototype.hasOwnProperty('initialize')) {
		Section.prototype.initialize = function($elem, content, status) {
			//[public] property
			this.elem = $elem;
			this.content = content;
			this.status = status;

			//[protected] property
			if (this instanceof Section) {
				this.scrollBehavior = null;
			}
		};

		Section.prototype.setScrollBehavior = function(scrollStrategy) {
			if (scrollStrategy.constructor.isSupport === ScrollStrategy.name) {
				this.scrollBehavior = scrollStrategy;
			} else {
				throw new Error('参数必须是支持ScrollStrategy接口的对象。');
			}
		};

		Section.prototype.performScroll = function() {
			return this.scrollBehavior.scroll.apply(this, arguments);
		};
	}

	Section.prototype.initialize.apply(this, arguments);
}

function Part() {
	if (!Part.prototype.hasOwnProperty('initialize')) {
		/*	用空间换时间，因为直接在letterList中查询实色(状态为1)的元素的时间开销太大
			因此决定将所有状态为1的元素放到noScrollList中，相应地增加维护该数组的代码
			我将这两个数组实现为私有且所有实例共享，因为任意时刻都只会有一个part在运行
			但是要注意，每次part转换后，要清空一下noScrollList
			私有共享变量:
		*/
		var noScrollList = [], //状态1数组
			autoScrollList = [], //自动选择队列
			scrollObject = {}; //计时器

		//[private] method

		function updateNoScrollList() {
			noScrollList.splice(0, noScrollList.length);
			this.letterList.each(function() {
				if (this.status == 1) {
					noScrollList.push(this);
				}
			});
		}

		//[public] method
		Part.prototype.initialize = function($elem) {
			//[public] property
			this.elem = $elem;
			switch (true) {
				case this.elem.hasClass('chileung'):
					this.color = 'rgb(96,16,174)';
					break;
				case this.elem.hasClass('plumeria'):
					this.color = 'rgb(233,219,0)';
					break;
				case this.elem.hasClass('newfangled'):
					this.color = 'rgb(255,163,18)';
					break;
				case this.elem.hasClass('logical'):
					this.color = 'rgb(51,51,51)';
					break;
				case this.elem.hasClass('web'):
					this.color = 'rgb(67,161,221)';
					break;
				case this.elem.hasClass('dev'):
					this.color = 'rgb(0,209,212)';
					break;
				case this.elem.hasClass('funny'):
					this.color = 'rgb(239,63,35)';
					break;
				default:
					this.color = 'rgb(0,0,0)';
			}
		};

		Part.prototype.setLetterList = function(list) {
			if (list instanceof List) {
				this.letterList = list;
			}
			return this;
		};

		Part.prototype.setWordList = function(list) {
			if (list instanceof List) {
				this.wordList = list;
			}
			return this;
		};

		Part.prototype.setBtnList = function(list) {
			if (list instanceof List) {
				this.btnList = list;
			}
			return this;
		};

		//多个part共同指向一个point list
		Part.prototype.setPointList = function(list) {
			if (list instanceof List) {
				this.pointList = list;
			}
			return this;
		}

		//#todo
		Part.prototype.show = function(direction) {
			var that = this;

			//first show part
			this.elem.removeClass('opacity_hide').addClass('cur_part');

			//second change color
			this.changeColor();

			//1.0 初始化字母
			//这个each中运用了闭包
			//如果不用that保存这个this,则setTimeout中的this会指向window
			this.letterList.each(function(index) {
				var that = this;
				setTimeout(function() {
					that.show();
				}, index * 30);
			});

			//1.1 启动自动滚动字母
			this.startScrollLetters(500, 1500);

			//1.2 倾斜进入
			direction = direction || 'skewing_left';

			this.letterList.id.addClass(direction);

			// 2.0 滚动点点
			this.pointList.id.addClass('point_' + direction);
			// 400毫秒后清空动画，为下次动画做准备
			setTimeout(function() {
				that.pointList.id.removeClass('point_' + direction);
			}, 400);

			// 2.1 设置当前点点
			this.pointList.each(function() {
				if (this.content === that) {
					this.elem.addClass('current');
					this.status = 1;
				} else {
					this.elem.removeClass('current');
					this.status = 0;
				}
			});

			//3.滚动单词
			// #todo temp
			setTimeout(function() {
				that.elem.children('.word_list').children().css({
					top: 0
				});
			}, 200);

			// 4.滚动按钮
			this.btnList.each(function() {
				this.show();
			});
		};

		Part.prototype.hide = function() {
			//点点在show中统一操作
			var that = this;

			//1.隐藏按钮
			this.btnList.each(function() {
				this.destruct();
			});

			// 2.滚动单词
			// #todo temp
			this.elem.children('.word_list').children().css({
				top: '-100%'
			});

			//3.隐藏字母
			this.letterList.id.removeClass('skewing_left').removeClass('skewing_right');

			this.elem.addClass('opacity_hide').removeClass('cur_part');

			this.stopScrollLetters();

			//对应show的字母初始化，要将它们还原到状态0
			//先隐藏再变换，因此延迟时间要大于隐藏时间
			//隐藏时间：300毫秒
			setTimeout(function() {
				that.letterList.each(function() {
					this.destruct();
				});
			}, 400);
		};

		Part.prototype.startScrollLetters = function(startTime, duration) {
			//设计一个定时器，每隔range就随机挑选一个状态为1的字母，然后压入队列，使其滚动，同时队列出队一个结点
			var that = this;

			scrollObject.startFlag = setTimeout(function() {
				(function() {
					var i,
						oldEle,
						newELe;

					//每次自动滚动前，更新状态1数组
					updateNoScrollList.apply(that);

					i = Math.floor(Math.random() * noScrollList.length);

					if (autoScrollList.length < 2) {
						//初始化自动选择队列
						newEle = noScrollList.splice(i, 1)[0];
						autoScrollList.push(newEle);
						newEle.performScroll();
					} else {
						oldEle = autoScrollList.shift(); //出队
						oldEle.performScroll(); //滚动到状态1
						noScrollList.push(oldEle); //放入状态1数组

						newEle = noScrollList.splice(i, 1)[0];
						autoScrollList.push(newEle); //入队
						newEle.performScroll(); //滚动到状态2
					}
					scrollObject.repeatFlag = setTimeout(arguments.callee, duration);
				})();
			}, startTime);
		};

		Part.prototype.stopScrollLetters = function() {
			for (var scrollType in scrollObject) {
				clearTimeout(scrollObject[scrollType]);
			}

			autoScrollList.splice(0, autoScrollList.length);
		};

		Part.prototype.changeColor = function() {
			if (!arguments.callee.statements) {
				arguments.callee.statements = $('#home_statements');
			}
			arguments.callee.statements.css({
				'backgroundColor': this.color
			});
		};
	}

	this.initialize.apply(this, arguments);
}

function Module() {
	if (!Module.prototype.hasOwnProperty('initialize')) {
		Module.prototype.initialize = function($elem) {
			//[public] property
			this.elem = $elem;
			this.partList = new List();
			this.showTimeoutObject = {};
		};

		Module.prototype.addItem = function(object) {
			if (object instanceof Part) {
				this.partList.addItem(object);
			}
			return this;
		};

		Module.prototype.show = function(duration, curPartIndex) {
			var arr = this.partList.getList(),
				len = arr.length,
				cur = curPartIndex || 0,
				pList = this.partList.getList()[0].pointList,
				that = this;
			if (len > 1) {
				//设置定时器,定时转换part：销毁当前Part,显示当前Part的下一个Part
				//生成一个闭包并循环调用
				arr[(cur - 1 + len) % len].hide();
				arr[cur].show();
				this.showTimeoutObject.startFlag = setTimeout(function() {
					arr[cur].hide();
					arr[(cur + 1) % len].show();

					pList.each(function() {
						if (this.status == 1) {
							cur = this.position;
						}
					});

					that.showTimeoutObject.repeatFlag = setTimeout(arguments.callee, duration);

				}, duration);
			} else if (len == 1) {
				arr[0].show();
			}
		};

		Module.prototype.resetShow = function(duration, nextPartIndex) {
			var that = this;

			for (var timeoutType in this.showTimeoutObject) {
				clearTimeout(this.showTimeoutObject[timeoutType]);
			}

			this.showTimeoutObject.resetFlag = setTimeout(function() {
				that.show(duration, nextPartIndex);
			}, duration);
		};

		Module.prototype.hide = function() {
			// #todo
		};
	}

	this.initialize.apply(this, arguments);
}

var ScrollStrategy = new Interface('ScrollStrategy', ['scroll']);

function HorizontalScroll() {
	if (typeof this.scroll !== 'function') {
		HorizontalScroll.prototype.scroll = function() {
			if (this.status == 1) {
				if (this.direction == 'left') {
					this.elem.removeClass('to_left').addClass('to_right');
				} else if (this.direction == 'right') {
					this.elem.removeClass('to_right').addClass('to_left');
				}
				this.status = 2;
			} else if (this.status == 2) {
				if (this.direction == 'left') {
					this.elem.removeClass('to_right').addClass('to_left');
				} else if (this.direction == 'right') {
					this.elem.removeClass('to_left').addClass('to_right');
				}
				this.status = 1;
			} else if (this.status == 0) {
				if (this.direction == 'left') {
					this.elem.addClass('to_left');
				} else if (this.direction == 'right') {
					this.elem.addClass('to_right');
				}
				this.status = 1;
			}
		};
	}

	//if success ,return VerticalScroll obeject;if fail,return undifined(实例化失败)
	Interface.prototype.ensureImplements(this, ScrollStrategy) ? arguments.callee.isSupport = ScrollStrategy.name : 0;
}

function VerticalScroll() {
	if (typeof this.scroll !== 'function') {
		VerticalScroll.prototype.scroll = function() {
			if (this.status == 1) {
				if (this.direction == 'top') {
					this.elem.removeClass('to_top').addClass('to_bottom');
				} else if (this.direction == 'bottom') {
					this.elem.removeClass('to_bottom').addClass('to_top');
				}
				this.status = 2;
			} else if (this.status == 2) {
				if (this.direction == 'top') {
					this.elem.removeClass('to_bottom').addClass('to_top');
				} else if (this.direction == 'bottom') {
					this.elem.removeClass('to_top').addClass('to_bottom');
				}
				this.status = 1;
			} else if (this.status == 0) {
				if (this.direction == 'top') {
					this.elem.addClass('to_top');
				} else if (this.direction == 'bottom') {
					this.elem.addClass('to_bottom');
				}
				this.status = 1;
			}
		};
	}

	//if success ,return VerticalScroll obeject;if fail,return undifined(实例化失败)
	Interface.prototype.ensureImplements(this, ScrollStrategy) ? arguments.callee.isSupport = ScrollStrategy.name : 0;
}