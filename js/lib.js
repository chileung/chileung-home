/**********满足这个小网站需求的小小框架(其实写得这么烂我也不知道算不算框架)********/
function $(value) {
	function F() {}

	F.prototype = $.prototype;

	var o = new F();

	o.constructor = $;

	//查询结果栈
	o.elemList = [];

	if (typeof value == 'string') {
		o.elemList.push(Sizzle(value));
	} else if (typeof value == 'object') {
		o.elemList.push([value]);
	} else {
		return null;
	}
	return o;
}

$.prototype.each = function(fn) {
	if (typeof fn != 'function') {
		return this;
	}

	var i, list = this.elemList[this.elemList.length - 1];

	for (i in list) {
		fn.call(list[i],parseInt(i));
	}

	return this;
};

$.prototype.get = function(index) {
	var list = this.elemList[this.elemList.length - 1];
	return index !== undefined ? list[index] : list;
};

$.prototype.index = function(elem) {
	var list = this.elemList[this.elemList.length - 1];
	for (var i in list) {
		if (list[i] === elem) {
			return parseInt(i);
		}
	}
	return -1;
};

$.prototype.bindFn = function(name, fn) {
	$.prototype[name] = function() {
		var newObj,
			result = undefined,
			args = arguments;
		this.each(function() {
			result = fn.apply(this, args);
		});

		if (result && result.nodeType) {
			newObj = $('');
			newObj.elemList = this.elemList.concat();
			newObj.elemList.push([result]);
			return newObj;
		} else if (result && result instanceof Array && result[0].nodeType) {
			newObj = $('');
			newObj.elemList = this.elemList.concat();
			newObj.elemList.push(result);
			return newObj;
		} else {
			return result !== undefined ? result : this;
		}
	};
};

$.prototype.bind = function(type, handler) {
	var bindFn = arguments.callee;

	this.each(function() {
		//这里的this指向栈顶元素(数组)的元素(dom)
		//为每一个时间处理函数赋予一个独立的ID
		if (!handler.$$guid) {
			handler.$$guid = bindFn.guid++;
		}

		//为元素建立一个事件类型的散列表
		if (!this.events) {
			this.events = {};
		}

		//为每对元素/事件建立一个事件处理函数的散列表
		var handlers = this.events[type];
		if (!handlers) {
			handlers = this.events[type] = {};

			//存储已有的事件处理函数(如果已经存在一个)
			if (this["on" + type]) {
				handlers[0] = this["on" + type];
			}
		}

		//在散列表中存储该事件处理函数
		handlers[handler.$$guid] = handler;

		//赋予一个全局事件处理函数来处理所有工作
		this["on" + type] = handleEvent;
	});
};

//创建独立ID的计数器
$.prototype.bind.guid = 1;

$.prototype.unbind = function(type, handler) {
	this.each(function() {
		//这里的this指向栈顶元素(数组)的元素(dom)
		if (this.events && this.events[type]) {
			delete this.events[type][handler.$$guid];
		}
	});
};

function handleEvent(event) {
	var handlers,
		returnValue = true;

	//获取事件对象
	event = event || fixEvent(window.event);

	//获取事件处理函数散列表的引用
	handlers = this.events[event.type];

	//依次执行每个事件处理函数
	for (var i in handlers) {
		this.$$handleEvent = handlers[i];
		if (this.$$handleEvent(event) === false) {
			returnValue = false;
		}
	}
	return returnValue;
}

function fixEvent(event) {
	//增加W3C标准事件方法
	event.preventDefault = fixEvent.preventDefault;
	event.stopPropagation = fixEvent.stopPropagation;
	return event;
}

fixEvent.preventDefault = function() {
	this.returnValue = false;
};

fixEvent.stopPropagation = function() {
	this.cancelBubble = true;
};

(function() {
	$.prototype.bindFn('addClass', addClass);
	$.prototype.bindFn('removeClass', removeClass);
	$.prototype.bindFn('hasClass', hasClass);
	$.prototype.bindFn('prev', prev);
	$.prototype.bindFn('next', next);
	$.prototype.bindFn('first', first);
	$.prototype.bindFn('last', last);
	$.prototype.bindFn('parent', parent);
	$.prototype.bindFn('text', text);
	$.prototype.bindFn('empty', empty);
	$.prototype.bindFn('remove', remove);
	$.prototype.bindFn('pageX', pageX);
	$.prototype.bindFn('pageY', pageY);
	$.prototype.bindFn('parentX', parentX);
	$.prototype.bindFn('parentY', parentY);
	$.prototype.bindFn('css', css);
	$.prototype.bindFn('parentsUntil', parentsUntil);
	$.prototype.bindFn('children',children);

	function addClass(name) {
		var names = this.className,
			reg = new RegExp("(^|\\s+)" + name + "(\\s+|$)", "g");

		if (!reg.test(names)) {
			this.className = this.className + ' ' + name;
		}
	}

	function removeClass(name) {
		var reg = new RegExp("(^|\\s+)" + name + "(\\s+|$)", "g");

		this.className = this.className.replace(reg, ' ');
	}

	function hasClass(name) {
		var reg = new RegExp("(^|\\s+)" + name + "(\\s+|$)");
		return reg.test(this.className) ? true : false;
	}

	function prev() {
		var elem = this;
		do {
			elem = elem.previousSibling;
		} while (elem && elem.nodeType != 1);
		return elem;
	}

	function next() {
		var elem = this;
		do {
			elem = elem.nextSibling;
		} while (elem && elem.nodeType != 1);
		return elem;
	}

	function first() {
		var elem = this.firstChild;
		return elem && elem.nodeType != 1 ? next.apply(elem) : elem;
	}

	function last() {
		var elem = this.lastChild;
		return elem && elem.nodeType != 1 ? prev.apply(elem) : elem;
	}

	function parent() {
		return this.parentNode;
	}

	function parentsUntil(arg) {
		var ret = [],
			cur = this;

		if (cur == document.documentElement) {
			return;
		}

		if (typeof arg == 'string') {
			var i,
				flag = false,
				elems = Sizzle(arg);

			for (;
				(cur = parent.apply(cur)) != document.documentElement;) {
				for (i = 0; i < elems.length; i++) {
					if (elems[i] === cur) {
						flag = true;
						break;
					}
				}
				if (flag) {
					break;
				} else {
					ret.push(cur);
				}
			}
		} else if (arg.nodeType) {
			while ((cur = parent.apply(cur)) != arg && cur != document.documentElement) {
				ret.push(cur);
			}
		}
		return ret;
	}

	function children(filter) {
		var cur = first.apply(this),
			result = [],
			flag, arr, i, j;

		while (cur) {
			result.push(cur);
			cur = next.apply(cur);
		}

		if (typeof filter == 'string') {
			arr = Sizzle(filter);
			for (i = 0; i < result.length;) {
				flag = false;
				for (j in arr) {
					if (result[i] == arr[j]) {
						flag = true;
						break;
					}
				}
				flag ? ++i : result.splice(i, 1);
			}
		}

		return result;
	}

	function remove(elem) {
		if (elem) {
			elem.parentNode.removeChild(elem);
		}
	}

	function empty() {
		while (this.firstChild) {
			remove(this.firstChild);
		}
	}

	function text(value) {
		return value === undefined ? getText.apply(this) : setText.call(this, value);

		function getText() {
			var elem = this,
				node,
				ret = "",
				i = 0,
				nodeType = elem.nodeType;

			if (!nodeType) {
				// If no nodeType, this is expected to be an array
				for (;
					(node = elem[i]); i++) {
					// Do not traverse comment nodes
					ret += arguments.callee(node);
				}
			} else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
				// Use textContent for elements
				// innerText usage removed for consistency of new lines (see #11153)
				if (typeof elem.textContent === "string") {
					return elem.textContent;
				} else {
					// Traverse its children
					for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
						ret += arguments.callee(elem);
					}
				}
			} else if (nodeType === 3 || nodeType === 4) {
				return elem.nodeValue;
			}
			// Do not include comment or processing instruction nodes

			return ret;
		}

		function setText(value) {
			empty.apply(this);
			this.appendChild((this.ownerDocument || document).createTextNode(value));
		}
	}

	function pageX() {
		return this.offsetParent ? this.offsetLeft + arguments.callee.call(this.offsetParent) : this.offsetLeft;
	}

	function pageY() {
		return this.offsetParent ? this.offsetTop + arguments.callee.call(this.offsetParent) : this.offsetTop;
	}

	function parentX() {
		return this.parentNode == this.offsetParent ? this.offsetLeft : pageX.call(this) - pageX.call(this.parentNode);
	}

	function parentY() {
		return this.parentNode == this.offsetParent ? this.offsetTop : pageY.call(this) - pageY.call(this.parentNode);
	}

	function css(value) {
		return arguments.length == 1 && typeof value == 'string' ? getStyle.apply(this, arguments) : setStyle.apply(this, arguments);

		function getStyle(name) {
			//first try style obj
			if (this.style[name]) {
				return this.style[name];
			}

			//second try IE
			else if (this.currentStyle) {
				return this.currentStyle[name];
			}

			//third try W3C
			else if (document.defaultView && document.defaultView.getComputedStyle) {
				name = name.replace(/([A-Z])/g, "-$1").toLowerCase();

				var s = document.defaultView.getComputedStyle(this, "");
				return s && s.getPropertyValue(name);
			}

			// other browser
			else {
				return null;
			}
		}

		function setStyle(name, value) {
			if (arguments.length == 1 && arguments[0] instanceof Object) {
				for (var prop in arguments[0]) {
					this.style[prop] = arguments[0][prop];
				}
			} else {
				this.style[name] = value;
			}
		}
	}
})();

/*Javascript实现接口*/
/*
	用“鸭式辨型”来实现接口。(如果走路像鸭子，像鸭子嘎嘎的叫，不管它贴不贴标签说自己是鸭子，那我们认为它就是鸭子)
	只要判断类中拥有相应的所有方法，那就说明已经实现接口了。
*/
/**
 * 创建接口对象
 * @param name 接口名
 * @param methods 接口方法
 */

function Interface(name, methods) {
	if (arguments.length != 2) {
		throw new Error('必须输入两个参数,当前个数' + arguments.length);
	}
	if (!(methods instanceof Array)) {
		throw new Error('第二个参数必须是数组。');
	}

	this.name = name;
	this.methods = [];

	for (var i = 0, len = methods.length; i < len; i++) {
		if (typeof methods[i] !== 'string') {
			throw new Error('方法名参数必须为string');
		}
		this.methods.push(methods[i]);
	}
}
/**
 * 接口实现
 * @param  object1 实现接口对象
 * @param  object2 对应接口
 * @return 实现错误抛出异常
 */
Interface.prototype.ensureImplements = function(object) {
	if (arguments.length < 2) {
		throw new Error('必须输入两个或以上参数,当前个数' + arguments.length);
	}

	var i, j, len, curInterface, methodsLen, method;

	for (i = 1, len = arguments.length; i < len; i++) {
		curInterface = arguments[i];
		if (!(curInterface instanceof Interface)) {
			throw new Error("请实现接口");
		}

		for (j = 0, methodsLen = curInterface.methods.length; j < methodsLen; j++) {
			method = curInterface.methods[j];
			if (!object[method] || typeof object[method] !== 'function') {
				throw new Error("接口名:" + curInterface.name + " 方法名：" + method + "没找到");
			}
		}
	}
	return true;
}

/*使用寄生组合式继承的辅助方法*/
function inheritPrototype(subType, superType) {
	function F() {}
	F.prototype = superType.prototype;
	var prototype = new F();
	prototype.constructor = subType;
	subType.prototype = prototype;
}

/*自己实现的模仿C# List 的集合类，增强功能*/
function List() {
	//[public] method
	if (!List.prototype.hasOwnProperty('initialize')) {
		List.prototype.initialize = function(id) {
			//[public] property
			this.id = id;
			//[private] property
			var arr = [];
			//[public] method
			//特权方法，为了使每个实例有一个私有变量的副本，将此方法置于实例中而不是原型中。
			//私有变量不会继承,但可以引用这个私有变量的闭包，不管实例化出多少个实例，都会引用同一个私有变量，因此需要使用置于实例中的特权方法
			this.getList = function() {
				return arr;
			};
		};

		List.prototype.each = function(fn) {
			var i, list = this.getList();
			for (i in list) {
				fn.call(list[i], parseInt(i));
			}
		};

		List.prototype.length = function() {
			return this.getList().length;
		};

		List.prototype.setList = function(func) {
			if (typeof func == 'function') {
				func.apply(this.getList());
			}
			return this;
		};

		List.prototype.addItem = function(object) {
			this.getList().push(object);
			return this;
		};

		List.prototype.removeItem = function(object) {
			var i, list = this.getList();
			for (i in list) {
				if (list[i] === object) {
					list.splice(i, 1);
					break;
				}
			}
			return this;
		};

		List.prototype.removeAt = function(index) {
			var i, list = this.getList();
			for (i in list) {
				if (i == index) {
					list.splice(i, 1);
					break;
				}
			}
			return this;
		};

		List.prototype.empty = function() {
			this.getList().splice(0, this.length());
		};

		List.prototype.find = function(object) {
			var i, list = this.getList();
			for (i in list) {
				if (list[i] === object) {
					return list[i];
				}
			}
			return null;
		};

		List.prototype.findByIndex = function(index) {
			return this.getList()[index];
		};

		List.prototype.findByKey = function(value, name) {
			//接受对象或两个值
			var i, j,
				list = this.getList(),
				flag = true;

			if (arguments.length == 1 && typeof value == 'object') {
				//按对象查找
				for (i in list) {
					for (j in value) {
						if (list[i][j] !== value[j]) {
							flag = false;
							break;
						}
					}
					if (!flag) {
						flag = true;
					} else {
						return list[i];
					}
				}
				return null;
			} else if (arguments.length == 2) {
				//按键值对查找
				for (i in list) {
					if (list[i][name] === value) {
						return list[i];
					}
				}
				return null;
			} else if (arguments.length == 1 && typeof value != 'object' && typeof value != 'function') {
				this.find(value);
			} else {
				return null;
			}
		};

		List.prototype.indexOf = function(object) {
			var i, list = this.getList();
			for (i in list) {
				if (list[i] === object) {
					return i;
				}
			}
			return -1;
		};
	}

	this.initialize.apply(this, arguments);
}