goog.provide('gcinui.FormatBeautifier');

goog.require('goog.array');
goog.require('goog.object');

/**
 * @param {goog.i18n.MessageFormat} mf
 * @constructor
 */
gcinui.FormatBeautifier = function(mf) {
  this._mf = mf;
  this._analyze();
};

/**
 * @type {string}
 * @const
 */
gcinui.FormatBeautifier.INDENT_SYMBOL = '  ';


/** @private */
gcinui.FormatBeautifier.prototype._analyze = function() {
  var parsedPattern = this._mf.parsedPattern_;
  this._indent = 0;
  this._string = this._parseBlocks(parsedPattern);
  this._string = this._string.replace(/\$\$\$([^$]+)\$\$\$/g, '{$$$1}');
};

/**
 * @param {number=} opt_delta
 * @private
 */
gcinui.FormatBeautifier.prototype._getIndent = function(opt_delta) {
  return goog.string.repeat(gcinui.FormatBeautifier.INDENT_SYMBOL,
      this._indent + (opt_delta || 0));
};

/**
 * @param {Object} block
 * @private
 * @return {string}
 */
gcinui.FormatBeautifier.prototype._parseVariants = function(block, type, isNl) {
  var str = '';
  if (isNl) {
    str += this._getIndent();
  }
  str += '{' + block.value.argumentIndex + ', ' + type + ',\n';
  this._indent += 1;
  goog.array.forEach(this._getVariants(block.value), function(key) {
    str += this._getIndent() + key + ' {';
    this._indent += 1;
    var inner = this._parseBlocks(block.value[key]);
    this._indent -= 1;
    if (/\n/.test(inner)) {
      str += '\n' + this._getIndent(1) +
        inner + '\n' +
        this._getIndent();
    } else {
      str += inner.replace(this._getIndent(1), '');
    }
    str += '}\n';
  }, this);
  this._indent -= 1;
  str += this._getIndent() + '}';

  return str;
};


/**
 * @param {Array} parsedPattern
 * @param {string=} opt_str
 * @private
 */
gcinui.FormatBeautifier.prototype._parseBlocks = function(parsedPattern,
    opt_str) {
  var pattern;
  var str = opt_str || '';

  goog.array.forEach(parsedPattern, function(block) {
    switch (block.type) {
      case goog.i18n.MessageFormat.BlockType_.SIMPLE:
        str += '{' + block.value + '}';
        break;
      case goog.i18n.MessageFormat.BlockType_.SELECT:
        str += this._parseVariants(block, 'select', /\n$/.test(str));
        break;
      case goog.i18n.MessageFormat.BlockType_.ORDINAL:
        str += this._parseVariants(block, 'selectordinal', /\n$/.test(str));
        break;
      case goog.i18n.MessageFormat.BlockType_.PLURAL:
        str += this._parseVariants(block, 'plural', /\n$/.test(str));
        break;
      case goog.i18n.MessageFormat.BlockType_.STRING:
        str += block.value;
      default:
        break;
    }
  }, this);

  return str;
};

/**
 * @param {Array} arr
 * @return {string}
 * @private
 */
gcinui.FormatBeautifier.prototype._callParseBlocksForChildren = function(arr) {
  var ret = '';
  for (var key in arr) {
    if (!arr.hasOwnProperty(key)) {
      continue;
    }
    if (!goog.isArray(arr[key])) {
      continue;
    }
    ret += this._parseBlocks(arr[key]);
  }
  return ret;
};

/**
 * @param {Array} arr
 * @return {Array.<string>}
 * @private
 */
gcinui.FormatBeautifier.prototype._getVariants = function(arr) {
  var ret = [];
  for (var key in arr) {
    if (!arr.hasOwnProperty(key)) {
      continue;
    }
    if (!goog.isArray(arr[key])) {
      continue;
    }
    ret.push(key);
  }

  return ret;
};

/** @inheritDoc */
gcinui.FormatBeautifier.prototype.toString = function() {
  return this._string;
};
