goog.provide('gcinui.MsgParser');

goog.require('goog.array');
goog.require('goog.object');

/**
 * @param {string} msg
 * @constructor
 */
gcinui.MsgParser = function(msg) {
  this._msg = msg;
  this._analyze();
};

/**
 * @type {boolean}
 * @private
 */
gcinui.MsgParser.prototype._hasBlocks = false;

/** @private */
gcinui.MsgParser.prototype._analyze = function() {
  this._params = [];

  var re = /\{\$(.+?)\}/g;
  var match;
  while (match = re.exec(this._msg)) {
    this._params.push(match[1]);
  }

  goog.array.removeDuplicates(this._params);
};

/** @return {Array} */
gcinui.MsgParser.prototype.getParams = function() {
  return this._params;
};
