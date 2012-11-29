goog.provide('gcinui.CodeSelect');

goog.require('goog.ui.Component');

/**
 * @constructor
 * @extends {goog.ui.Component}
 */
gcinui.CodeSelect = function() {
  goog.base(this);
};
goog.inherits(gcinui.CodeSelect, goog.ui.Component);

/** @param {Element} element */
gcinui.CodeSelect.select = function(element) {
  var range;
  if (window.getSelection) {
    var selection = window.getSelection();
    if (selection.setBaseAndExtent) { /* for Safari */
      selection.setBaseAndExtent(element, 0, element, 1);
    } else { /* for FF, Opera */
      range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else { /* for IE */
    range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  }
};

/**
 * @type {boolean}
 * @private
 */
gcinui.CodeSelect.prototype._isDown = false;

/**
 * @type {boolean}
 * @private
 */
gcinui.CodeSelect.prototype._isClick = true;

/**
 * @type {Array}
 * @private
 */
gcinui.CodeSelect.prototype._coords = null;


/** @inheritDoc */
gcinui.CodeSelect.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var element = this.getElement();
  var EventType = goog.events.EventType;
  this.getHandler()
      .listen(element, EventType.MOUSEUP, this._onMouseup, false, this)
      .listen(element, EventType.MOUSEMOVE, this._onMousemove, false, this)
      .listen(element, EventType.MOUSEDOWN, this._onMousedown, false, this);
};

/**
 * @param {goog.events.Event} evt
 * @private
 */
gcinui.CodeSelect.prototype._onMouseup = function(evt) {
  if (this._isClick) {
    gcinui.CodeSelect.select(this.getElement());
  }
  this._isDown = false;
  this._isClick = false;
};

/**
 * @param {goog.events.Event} evt
 * @private
 */
gcinui.CodeSelect.prototype._onMousedown = function(evt) {
  this._isDown = true;
  this._isClick = true;
  this._coords = [evt.offsetX, evt.offsetY];
};

/**
 * @param {goog.events.Event} evt
 * @private
 */
gcinui.CodeSelect.prototype._onMousemove = function(evt) {
  if (!this._isDown) {
    return;
  }

  if (Math.max(Math.abs(evt.offsetX - this._coords[0]),
      Math.abs(evt.offsetY - this._coords[1])) > 5) {
    this._isClick = false;
  }
};
