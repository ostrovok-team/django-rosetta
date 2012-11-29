goog.provide('gcinui.Form');

goog.require('gcinui.FormatBeautifier');
goog.require('gcinui.FormatParser');
goog.require('gcinui.MsgParser');
goog.require('goog.i18n.MessageFormat');
goog.require('goog.ui.Component');
goog.require('goog.dom.forms');
goog.require('goog.dom.classes');
goog.require('gcinui.templates.Form');
goog.require('gcinui.templates.FormFields');

/**
 * @param {string} origMessage
 * @param {Element} textarea
 * @param {boolean} hasFormatter
 * @constructor
 * @extends {goog.ui.Component}
 */
gcinui.Form = function(origMessage, textarea, hasFormatter) {
  goog.base(this);
  this._data = {};
  this._origMessage = origMessage;
  this._hasFormatter= !!hasFormatter;
  this.setTextarea(textarea);
};
goog.inherits(gcinui.Form, goog.ui.Component);

/**
 * @enum {string}
 */
gcinui.Form.EventType = {
  SUBMIT: goog.events.getUniqueId('submit')
};

/**
 * @type {string}
 * @const
 */
gcinui.Form.CSS_NAME = goog.getCssName('gcinui-form');

/**
 * @type {Element?}
 * @private
 */
gcinui.Form.prototype._textarea = null;

/**
 * @type {string}
 * @private
 */
gcinui.Form.prototype._origMessage = '';

/**
 * @type {boolean}
 * @private
 */
gcinui.Form.prototype._hasFormatter = false;

/**
 * @type {Element?}
 * @private
 */
gcinui.Form.prototype._buttonsParent = null;

/**
 * @type {Element?}
 * @private
 */
gcinui.Form.prototype._resultParent = null;

/**
 * @type {goog.i18n.MessageFormat}
 * @private
 */
gcinui.Form.prototype._mf = null;

/**
 * @type {Array}
 * @private
 */
gcinui.Form.prototype._params = null;

/**
 * @type {!Object}
 * @private
 */
gcinui.Form.prototype._data;

/** @inheritDoc */
gcinui.Form.prototype.createDom = function() {
  var template = new gcinui.templates.Form();
  template.setBaseCssName(gcinui.Form.CSS_NAME);
  var element = ojster.createElement(template);
  this.setElementInternal(element);

  this._result = goog.dom.getElementByClass(
      goog.getCssName(gcinui.Form.CSS_NAME, 'result'), element);
  this._fields = goog.dom.getElementByClass(
      goog.getCssName(gcinui.Form.CSS_NAME, 'fields'), element);
  this._prettify = goog.dom.getElementByClass(
      goog.getCssName(gcinui.Form.CSS_NAME, 'prettify'), element);
  this._copy = goog.dom.getElementByClass(
      goog.getCssName(gcinui.Form.CSS_NAME, 'copy'), element);

  if (this._buttonsParent) {
    var buttons = goog.dom.getElementByClass(
        goog.getCssName(gcinui.Form.CSS_NAME, 'buttons'), element);
    goog.dom.appendChild(this._buttonsParent, buttons);
  }

  if (this._resultParent) {
    goog.dom.appendChild(this._resultParent, this._result);
  }
};

/** @inheritDoc */
gcinui.Form.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var handler = this.getHandler();
  if (this._textarea) {
    goog.dom.classes.add(this._textarea,
        goog.getCssName(gcinui.Form.CSS_NAME, 'textarea'));
    handler.listen(this._textarea, [
      goog.events.EventType.CHANGE,
      goog.events.EventType.KEYUP
    ], this._onTextareaChange, false, this);
  }

  handler.listen(this._prettify, goog.events.EventType.CLICK,
      this._onPrettyClick, false, this);
  handler.listen(this._copy, goog.events.EventType.CLICK,
      this._onCopyClick, false, this);

  this._updateTextarea();
};

/** @param {boolean} enable */
gcinui.Form.prototype.enableListeners = function(enable) {
  var handler = this.getHandler();
  var element = this.getElement();
  var inputs = element.getElementsByTagName(goog.dom.TagName.INPUT);
  var selects = element.getElementsByTagName(goog.dom.TagName.SELECT);

  var EventType = goog.events.EventType;
  if (enable) {
    goog.array.forEach(inputs, function(el) {
      handler.listen(el, [EventType.CHANGE, EventType.KEYUP],
        this._onChange, false, this);
    }, this);

    goog.array.forEach(selects, function(el) {
      handler.listen(el, [EventType.CHANGE, EventType.KEYUP],
        this._onChange, false, this);
    }, this);
  } else {
    goog.array.forEach(inputs, function(el) {
      handler.unlisten(el, [EventType.CHANGE, EventType.KEYUP],
        this._onChange, false, this);
    }, this);

    goog.array.forEach(selects, function(el) {
      handler.unlisten(el, [EventType.CHANGE, EventType.KEYUP],
        this._onChange, false, this);
    }, this);
  }
};


/** @param {Element?} element */
gcinui.Form.prototype.setTextarea = function(element) {
  if (this.isInDocument()) {
    throw Error('Already rendered');
  }

  this._textarea = element;
};

/** @param {Element?} element */
gcinui.Form.prototype.setButtonsParent = function(element) {
  if (this.getElement()) {
    throw Error('Already created');
  }

  this._buttonsParent = element;
};

/** @param {Element?} element */
gcinui.Form.prototype.setResultParent = function(element) {
  if (this.getElement()) {
    throw Error('Already created');
  }

  this._resultParent = element;
};

/** @return {Element} */
gcinui.Form.prototype.getTextarea = function() {
  return this._textarea;
};


/**
 * @param {goog.events.Event} evt
 * @private
 */
gcinui.Form.prototype._onChange = function(evt) {
  if (!this._params) {
    return;
  }

  this._updateResult();

  this.dispatchEvent({
    type: gcinui.Form.EventType.SUBMIT,
    data: this._data
  });
};

/**
 * @param {goog.events.Event} evt
 * @private
 */
gcinui.Form.prototype._onTextareaChange = function(evt) {
  this._updateTextarea();
};

/**
 * Abstract implementation of goog.getMsg for use with localized messages.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
gcinui.Form.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};

/** @private */
gcinui.Form.prototype._updateTextarea = function() {
  var hiddenCssName = goog.getCssName(gcinui.Form.CSS_NAME, 'hidden');
  var onFail = goog.bind(function(opt_err) {
    this._mf = null;
    this._params = [];
    this._replacements = [];
    goog.dom.classes.add(this._prettify, hiddenCssName);
    this._updateFields();
    this._updateResult();

    if (opt_err) {
      var errorCssName = goog.getCssName(gcinui.Form.CSS_NAME, 'error');
      this._setResult('<span class="' + errorCssName + '">' +
          opt_err.message + '</span>');
    } else {
      this._setResult('');
    }
  }, this);


  try {
    this._updateMf();
    if (this._message == '') {
      onFail();
      return;
    }

    if (this._params.length > 0 && !this._hasFormatter) {
      onFail({
        message: "This token has no special formatting"
      });
      return;
    }

    goog.dom.classes.enable(this._prettify, hiddenCssName, !this._fp.hasBlocks());
    this._updateFields();
    this._updateResult();
  } catch(err) {
    onFail(err);
  }
};

/** @private */
gcinui.Form.prototype._updateMf = function() {
  this._message = this._textarea.value;

  if (this._hasFormatter) {
    this._message = this._message
      .replace(/^[\s\xa0]+|[\s\xa0]+$/g, '')
      .replace(/\n\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\<%\s*@space\s*%\>/g, ' ');
  }

  this._message = this._message
    .replace(/\<%\s*@space\s*%\>/g, ' ');

  this._mp = new gcinui.MsgParser(this._message);
  this._replacements = this._mp.getParams();
  var replacements = {};
  goog.array.forEach(this._replacements, function(key) {
    if (this._data['$' + key]) {
      replacements[key] = this._data['$' + key];
    } else {
      replacements[key] = '$$$' + key + '$$$';
    }
  }, this);
  this._message = gcinui.Form.getMsg(this._message, replacements);
  this._mf = new goog.i18n.MessageFormat(this._message);
  this._fp = new gcinui.FormatParser(this._mf);
  this._params = this._fp.getParams();
};


/** @private */
gcinui.Form.prototype._updateFields = function() {
  this.enableListeners(false);
  var template = new gcinui.templates.FormFields({
    params: this._params,
    replacements: this._replacements,
    values: this._data
  });
  template.setBaseCssName(gcinui.Form.CSS_NAME);
  ojster.fillElement(this._fields, template);
  this.enableListeners(true);
};

/** @private */
gcinui.Form.prototype._updateResult = function() {
  if (!this._mf) {
    this._setResult('');
    return;
  }

  var map = goog.dom.forms.getFormDataMap(/** @type {HTMLFormElement}*/ (
    this.getElement()
  ));
  goog.iter.forEach(map.getKeyIterator(), function(key) {
    this._data[key] = map.get(key)[0];
  }, this);

  this._updateMf();
  this._setResult(this._mf.format(this._data));
};


/**
 * @param {string} str
 * @private
 */
gcinui.Form.prototype._setResult = function(str) {
  this._result.innerHTML = str;
  var hiddenCssName = goog.getCssName(gcinui.Form.CSS_NAME, 'hidden');
  goog.dom.classes.enable(this._result, hiddenCssName, !str);
};

/**
 * @param {goog.events.Event} evt
 * @private
 */
gcinui.Form.prototype._onPrettyClick = function(evt) {
  if (!this._mf || !this._textarea) {
    return;
  }
  var fb = new gcinui.FormatBeautifier(this._mf);
  this._textarea.value = fb.toString();
};

/**
 * @param {goog.events.Event} evt
 * @private
 */
gcinui.Form.prototype._onCopyClick = function(evt) {
  this._textarea.value = this._origMessage;
  this._updateTextarea();
};

