/**
 * 此文主要是控制目标元素的拖拽以及缩放
 *
 * @author panjaignhong
 * @since 2017-08-16
 * @email luomengtianya@gmail.com
 */

(function($) {

	$.fn.xingquanDrag = function(options) {

		var data = {
			fullScreen: false,
			container: null,
			target: null,
			resize: true,
			drag: true,
		}


		options = options ? options : {};

		//data.fullScreen = options.fullScreen ? options.fullScreen : null;
		data.container = options.container ? options.container : null;
		data.target = this;
		data.resize = options.resize ? options.resize : true;
		data.drag = options.drag ? options.drag : true;

		var xingquanDrag = $.xingquanDrag.newInstance();

		xingquanDrag.init(data);
	}


	$.xingquanDrag = {
		settings: {
			data: null,
			pointSize: 12, //圆点长宽为12px
			maxSize: null,
			min: { //缩放的最小宽高,真实宽高，没有缩放
				width: 40,
				height: 40
			},
			directions: { //各个方向对应的值
				leftUp: '.leftUp',
				rightUp: '.rightUp',
				leftDown: '.leftDown',
				rightDown: '.rightDown',
				up: '.up',
				down: '.down',
				left: '.left',
				right: '.right'
			}
		},
		newInstance: function() {
			return $.extend(true, {}, this);
		},

		init: function(data) {
			this.initDataEvent(data);
			this.addPointEvent();
			this.handleResizeEvent();
			this.handleTargetClick();
			this.handelTargetCancel();
		},

		initDataEvent: function(data) {

			this.settings.data = data;

			$(this.settings.data.target).addClass("xingquanDrag");

			if (this.settings.data.fullScreen) {
				return;
			}

			$($(this.settings.data.target).parent())[0].oncontextmenu = function() {
				return false;
			};

			$($(this.settings.data.target).parent()).css({
				position: 'relative'
			});
		},

		handleTargetClick: function() {
			var drag = this;
			$(this.settings.data.target).off("mousedown").on("mousedown", function(e) {

				drag.preventBuddle(e);

				drag.select(e);

				drag.handleTargetMoveEvent(e);

				drag.handleKeyDownEvent(e);
			});

			$(this.settings.data.target).off("touchstart").on("touchstart", function(e) {

				drag.preventBuddle(e);

				drag.select(e);

				drag.handleTargetMoveEvent(e);
			});


		},

		select: function(e) { //用户鼠标点击画布中元素即可选中(单选或多选)或取消选中当前元素

			if (!e.ctrlKey) { //单选
				this.singleSelect();
			} else { //多选
				this.multiSelect();
			}
		},

		singleSelect: function() {

			//单选时 先清空选中效果
			this.hidden($(this.settings.data.target).parent());


			var point = $(this.settings.data.target).find(".point");

			$(this.settings.data.target).addClass("select");
			this.show(this.settings.data.target);

		},

		multiSelect: function() {

			var point = $(this.settings.data.target).find(".point");

			if ($(this.settings.data.target).hasClass("select")) {
				this.hidden($(this.settings.data.target));
				$(this.settings.data.target).removeClass("select");
			} else {

				$(this.settings.data.target).addClass("select");
				this.show(this.settings.data.target);
			}

		},

		show: function(flag) {
			$(flag).find(".point").addClass("show");
			$(flag).find(".point").removeClass("hidden");
		},

		hidden: function(flag) {
			$(flag).find(".point").addClass("hidden");
			$(flag).find(".point").removeClass("show");
		},

		handelTargetCancel: function() {
			var drag = this;
			$(this.settings.data.target).parent().off("mousedown").on("mousedown", function() {

				var point = $(this).find(".point");

				$(this).find(".select").removeClass("select");

				drag.hidden($(this));

			});

			$(this.settings.data.target).parent().off("touchstart").on("touchstart", function() {

				var point = $(this).find(".point");

				$(this).find(".select").removeClass("select");

				drag.hidden($(this));

			});
		},

		addPointEvent: function() {

			$(this.settings.data.target).find('.point').remove(); //先清空之前设置的助托点，重新设置
			var horizentalMiddle = ($(this.settings.data.target).width() - this.settings.pointSize) / 2;
			var verticalMiddle = ($(this.settings.data.target).height() - this.settings.pointSize) / 2;

			// 左上角
			var rLeftUp = document.createElement('div');
			$(rLeftUp).addClass(this.settings.directions.leftUp.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rLeftUp));
			// 右上角
			var rRightUp = document.createElement('div');
			$(rRightUp).addClass(this.settings.directions.rightUp.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rRightUp));
			// 左下角
			var rLeftDown = document.createElement('div');
			$(rLeftDown).addClass(this.settings.directions.leftDown.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rLeftDown));
			// 右下角
			var rRightDown = document.createElement('div');
			$(rRightDown).addClass(this.settings.directions.rightDown.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rRightDown));
			// 上中点
			var rUp = document.createElement('div');
			$(rUp).addClass(this.settings.directions.up.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rUp));
			$(rUp).css({
				left: horizentalMiddle + 'px'
			});
			// 下中点
			var rDown = document.createElement('div');
			$(rDown).addClass(this.settings.directions.down.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rDown));
			$(rDown).css({
				left: horizentalMiddle + 'px'
			});

			// 左中点
			var rLeft = document.createElement('div');
			$(rLeft).addClass(this.settings.directions.left.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rLeft));
			$(rLeft).css({
				top: verticalMiddle + 'px'
			});

			// 右中点
			var rRight = document.createElement('div');
			$(rRight).addClass(this.settings.directions.right.substring(1) + ' point hidden');
			$(this.settings.data.target).append($(rRight));
			$(rRight).css({
				top: verticalMiddle + 'px'
			});



		},

		preventBuddle: function(e) { //阻止事件冒泡
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		},

		handleTargetMoveEvent: function(e) {

			if (!this.settings.data.drag) {
				return;
			}

			var drag = this

			var startXY = this.getXY(e);

			$(document).off("mousemove").on("mousemove", function(e) { //拖动时移动
				console.log(startXY)
				drag.preventBuddle(e);
				drag.resetPosition(e, startXY);
			});

			$(document).off("mouseup").on("mouseup", function(e) {
				drag.preventBuddle(e);
				$(document).unbind('mousemove');
				$(document).unbind('mouseup');
			});


			$(document).off("touchmove").on("touchmove", function(e) { //拖动时移动
				drag.preventBuddle(e);
				drag.resetPosition(e, startXY);
			});

			$(document).off("touchend").on("touchend", function(e) {
				drag.preventBuddle(e);
				$(document).unbind('touchmove');
				$(document).unbind('touchend');
			});

		},

		handleKeyDownEvent: function(){
			var drag = this;
			$(document).off("keydown").on("keydown", function(e) {
				drag.preventBuddle(e);


				var position = drag.getTargetPosition();
				var maxSize = drag.getMaxSize();

				//左
				if (e.keyCode==37){
					if(position.left > 0){
						$(drag.settings.data.target).css({
							left: position.left - 1
						});
					}
				}

				//上
				if (e.keyCode==38){
					if(position.top > 0){
						$(drag.settings.data.target).css({
							top: position.top - 1
						});
					}

					e.preventDefault();
				}


				//右
				if (e.keyCode==39){
					if(position.width + position.left < maxSize.width){
						$(drag.settings.data.target).css({
							left: position.left*1 + 1
						});
					}
				}

				//下
				if (e.keyCode==40){
					if(position.height + position.top < maxSize.height){
						$(drag.settings.data.target).css({
							top: position.top*1 + 1
						});
					}

					e.preventDefault();
				}
				
			});

		},


		getXY: function(e) {
			return {
				x: e.pageX != undefined ? e.pageX : e.originalEvent.targetTouches[0].pageX,
				y: e.pageY != undefined ? e.pageY : e.originalEvent.targetTouches[0].pageY
			};
		},

		resetPosition: function(e, startXY) {

			var xy = this.getXY(e);
			var distanceX = xy.x - startXY.x;
			var distanceY = xy.y - startXY.y;
			var left = $(this.settings.data.target)[0].offsetLeft + distanceX;
			var top = $(this.settings.data.target)[0].offsetTop + distanceY;


			if (!this.settings.data.fullScreen) {

				var maxPosition = this.getMaxPosition();

				if (left < 0) {
					left = 0;
				} else if (left > maxPosition.left) {
					left = maxPosition.left;
				}

				if (top < 0) {
					top = 0;
				} else if (top > maxPosition.top) {
					top = maxPosition.top
				}

			}

			$(this.settings.data.target).css({
				left: left,
				top: top
			});


			//更新后将当前xy设置为startXY
			$.extend(startXY, xy);

		},

		getMaxPosition: function() {

			if (!this.settings.data.fullScreen) {
				var left = $(this.settings.data.target).parent().width() - $(this.settings.data.target).width();
				var top = $(this.settings.data.target).parent().height() - $(this.settings.data.target).height();

				return {
					left: left,
					top: top
				};
			} else {
				// TODO
			}
		},

		handleResizeEvent: function() {

			var drag = this;

			$(this.settings.data.target).find('.point').off('mousedown').on('mousedown', function(e) {

				drag.preventBuddle(e);
				var direction = $(this).attr('class').split('point', 1)[0].trim();
				var startXY = drag.getXY(e);

				$(document).off("mousemove").on("mousemove", function(e) {
					drag.preventBuddle(e);
					drag.handleResize(e, startXY, direction);
					return false;
				});


				$(document).off("mouseup").on("mouseup", function(e) {
					drag.preventBuddle(e);
					$(document).unbind('mousemove');
					$(document).unbind('mouseup');
					return false;
				});


			});




			$(this.settings.data.target).find('.point').off('touchstart').on('touchstart', function(e) {

				drag.preventBuddle(e);
				var direction = $(this).attr('class').split('point', 1)[0].trim();
				var startXY = drag.getXY(e);

				$(document).off("touchmove").on("touchmove", function(e) {
					drag.preventBuddle(e);
					drag.handleResize(e, startXY, direction);
					return false;
				});


				$(document).off("touchend").on("touchend", function(e) {
					drag.preventBuddle(e);
					$(document).unbind('touchmove');
					$(document).unbind('touchend');
					return false;
				});


			});

		},

		handleResize: function(e, startXY, direction) {

			if (!this.settings.data.resize) {
				return;
			}

			var xy = this.getXY(e);
			var directions = this.settings.directions;

			switch (direction) {
				case directions.leftUp.substring(1):
					this.handleResizeLeftUp(startXY, xy);
					break;
				case directions.rightUp.substring(1):
					this.handleResizeRightUp(startXY, xy);
					break;
				case directions.leftDown.substring(1):
					this.handleResizeLeftDown(startXY, xy);
					break;
				case directions.rightDown.substring(1):
					this.handleResizeRightDown(startXY, xy);
					break;
				case directions.left.substring(1):
					this.handleResizeLeft(startXY, xy);
					break;
				case directions.right.substring(1):
					this.handleResizeRight(startXY, xy);
					break;
				case directions.up.substring(1):
					this.handleResizeTop(startXY, xy);
					break;
				case directions.down.substring(1):
					this.handleResizeDown(startXY, xy);
					break;
				default:
					toastr.error('发生错误，方向未知!');
					break;
			}

			$.extend(startXY, xy);

		},

		handleResizeLeftUp: function(startXY, xy) {

			var position = this.getTargetPosition();

			var distanceX = xy.x - startXY.x;
			var distanceY = xy.y - startXY.y;

			var xValue = distanceX;
			var yValue = distanceY;


			position.left += xValue;
			position.top += yValue;

			if (position.left > 0 && position.top > 0) {

				position.width -= xValue;

				if (position.width <= this.settings.min.width) {
					position.left -= xValue; //前面加了 这里减去  保持不变
					position.width += xValue;
				}

				if (position.top > 0) {
					position.height -= yValue;
					if (position.height <= this.settings.min.height) {
						position.top -= yValue;
						position.height += yValue;
					}
				}

			} else {
				position.left -= xValue;
				position.top -= yValue;
			}

			this.handlePosition(position);
		},

		handleResizeRightUp: function(startXY, xy) {
			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			var yValue = xy.y - startXY.y;

			position.width += xValue;

			position.top += yValue;

			if (position.top > 0) {

				position.height -= yValue;

				if (position.height < this.settings.min.height) {
					position.top -= yValue;
					position.height += yValue;
				}

				if (position.width < this.settings.min.width || position.left + position.width > maxSize.width) {
					position.width -= xValue;
				}

			} else {
				position.width -= xValue;

				position.top -= yValue;
			}

			this.handlePosition(position);
		},

		handleResizeLeftDown: function(startXY, xy) {

			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			var yValue = xy.y - startXY.y;

			position.height += yValue;

			position.left += xValue;

			if (position.left > 0) {

				position.width -= xValue;

				if (position.width < this.settings.min.width) {
					position.left -= xValue;
					position.width += xValue;
				}

				if (position.height < this.settings.min.height || position.top + position.height > maxSize.height) {
					position.height -= yValue;
				}

			} else {
				position.height -= yValue;

				position.left -= xValue;
			}

			this.handlePosition(position);
		},

		handleResizeRightDown: function(startXY, xy) {

			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			var yValue = xy.y - startXY.y;

			position.width += xValue;
			position.height += yValue;

			if (position.width + position.left > maxSize.width || position.width < this.settings.min.width) {
				position.width -= xValue;
			}

			if (position.height + position.top > maxSize.height || position.height < this.settings.min.height) {
				position.height -= yValue;
			}

			this.handlePosition(position);
		},


		handleResizeLeft: function(startXY, xy) {
			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			var yValue = xy.y - startXY.y;

			position.left += xValue;

			if (position.left > 0) {
				position.width -= xValue;

				if (position.width < this.settings.min.width) {
					position.left -= xValue;
					position.width += xValue;
				}

			} else {
				position.left -= xValue;
			}

			this.handlePosition(position);

		},

		handleResizeRight: function(startXY, xy) {
			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			var yValue = xy.y - startXY.y;

			position.width += xValue;

			if (position.width + position.left > maxSize.width || position.width < this.settings.min.width) {
				position.width -= xValue;
			}

			this.handlePosition(position);

		},

		handleResizeTop: function(startXY, xy) {
			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			var yValue = xy.y - startXY.y;

			position.top += yValue;

			if (position.top > 0) {
				position.height -= yValue;

				if (position.height < this.settings.min.height) {
					position.top -= yValue;
					position.height += yValue;
				}

			} else {
				position.top -= yValue;
			}

			this.handlePosition(position);
		},

		handleResizeDown: function(startXY, xy) {
			var position = this.getTargetPosition();
			var maxSize = this.getMaxSize();

			var xValue = xy.x - startXY.x;
			var yValue = xy.y - startXY.y;

			position.height += yValue;

			if (position.height + position.top > maxSize.height || position.height < this.settings.min.height) {
				position.height -= yValue;
			}

			this.handlePosition(position);

		},

		getTargetPosition: function() { //获取控件位置大小
			var left = $(this.settings.data.target)[0].offsetLeft;
			var top = $(this.settings.data.target)[0].offsetTop;
			var width = $(this.settings.data.target).width();
			var height = $(this.settings.data.target).height();

			return {
				left: left,
				top: top,
				width: width,
				height: height
			}
		},

		handlePosition: function(position) {

			//目标元素位置大小的改变
			$(this.settings.data.target).css({
				width: position.width,
				height: position.height,
				top: position.top,
				left: position.left
			});


			//四个拖点的位置改变
			//调整中间4个点的位置居中
			var parentWidth = $(this.settings.data.target).width();
			var parentHeight = $(this.settings.data.target).height();
			var up = $(this.settings.data.target).find(this.settings.directions.up);
			var down = $(this.settings.data.target).find(this.settings.directions.down);
			var left = $(this.settings.data.target).find(this.settings.directions.left);
			var right = $(this.settings.data.target).find(this.settings.directions.right);

			var size = this.settings.pointSize;

			$(up).css({
				left: (parentWidth - size) / 2 + 'px'
			});
			$(down).css({
				left: (parentWidth - size) / 2 + 'px'
			});

			$(left).css({
				top: (parentHeight - size) / 2 + 'px'
			});
			$(right).css({
				top: (parentHeight - size) / 2 + 'px'
			});

		},

		getMaxSize: function() {
			if (!this.settings.data.fullScreen) {
				var height = $(this.settings.data.target).parent().height();
				var width = $(this.settings.data.target).parent().width();

				return {
					height: height,
					width: width
				}
			} else {
				// TODO
			}
		}

	}



}(jQuery))