goog.provide('gcinui.FormatParser');

goog.require('goog.array');
goog.require('goog.object');

/**
 * @param {goog.i18n.MessageFormat} mf
 * @constructor
 */
gcinui.FormatParser = function(mf) {
  this._mf = mf;
  this._analyze();
};

/**
 * @type {boolean}
 * @private
 */
gcinui.FormatParser.prototype._hasBlocks = false;

/** @private */
gcinui.FormatParser.prototype._analyze = function() {
  this._params = [];

  var pattern;
  var parsedPattern = this._mf.parsedPattern_;
  this._parseBlocks(parsedPattern);
  this._normalizeParams();
};

/**
 * @param {Array} parsedPattern
 * @private
 */
gcinui.FormatParser.prototype._parseBlocks = function(parsedPattern) {
  var pattern;
  var param;

  goog.array.forEach(parsedPattern, function(block) {
    param = {};
    param.type = block.type;

    switch (block.type) {
      case goog.i18n.MessageFormat.BlockType_.SIMPLE:
        this._params.push({
          type: 'simple',
          value: block.value
        });
        this._hasBlocks = this._hasBlocks || true;
        break;
      case goog.i18n.MessageFormat.BlockType_.SELECT:
        this._params.push({
          type: 'select',
          value: block.value.argumentIndex,
          variants: this._getVariants(block.value)
        });
        this._callParseBlocksForChildren(block.value);
        this._hasBlocks = this._hasBlocks || true;
        break;
      case goog.i18n.MessageFormat.BlockType_.ORDINAL:
      case goog.i18n.MessageFormat.BlockType_.PLURAL:
        this._params.push({
          type: 'plural',
          value: block.value.argumentIndex
        });
        this._callParseBlocksForChildren(block.value);
        this._hasBlocks = this._hasBlocks || true;
        break;
      case goog.i18n.MessageFormat.BlockType_.STRING:
      default:
        break;
    }
  }, this);
};


/**
 * @param {Array} arr
 * @private
 */
gcinui.FormatParser.prototype._callParseBlocksForChildren = function(arr) {
  for (var key in arr) {
    if (!arr.hasOwnProperty(key)) {
      continue;
    }
    if (!goog.isArray(arr[key])) {
      continue;
    }
    this._parseBlocks(arr[key]);
  }
};

/**
 * @param {Array} arr
 * @return {Array.<string>}
 * @private
 */
gcinui.FormatParser.prototype._getVariants = function(arr) {
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

/** @return {boolean} */
gcinui.FormatParser.prototype.hasBlocks = function() {
  return this._hasBlocks;
};


/** @private */
gcinui.FormatParser.prototype._normalizeParams = function() {
  var newParams = [];

  goog.array.forEach(this._params, function(block) {
    var existedBlock = goog.array.find(newParams, function(exBlock) {
      return exBlock.value == block.value;
    });

    if (existedBlock) {
      if (existedBlock.type != block.type) {
        var types = existedBlock.type + block.type;
        if (types == 'simpleplural' || types == 'pluralsimple') {
          existedBlock.type = 'plural';
        } else {
          throw Error('Bad variable types: ' + block.value + '(' + block.type + ', ' + existedBlock.type + ')');
        }
      } else if (block.variants) {
        existedBlock.variants = goog.array.removeDuplicates(
          goog.array.concat(block.variants, existedBlock.variants)
        );
      }
    } else {
      newParams.push(block);
    }
  });

  this._params = newParams;
};

/** @return {Array} */
gcinui.FormatParser.prototype.getParams = function() {
  return this._params;
};


