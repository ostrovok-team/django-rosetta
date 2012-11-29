goog.provide('gcinui');

goog.require('gcinui.Form');
goog.require('gcinui.CodeSelect');
goog.require('goog.dom');
goog.require('goog.dom.classes');

gcinui.install = function() {
  var msgrows = goog.dom.getElementsByClass('msgrow');
  goog.array.forEach(msgrows, function(msgrow) {
    var textarea = goog.dom.getElementByClass('textarea-translation', msgrow);
    var gcinuiHelper = goog.dom.getElementByClass('gcinuielper', msgrow);
    var message = goog.dom.getElementByClass('message', msgrow);

    var hasFormatter = goog.dom.classes.has(message, 'message-with-formatter');

    if (!textarea) {
      return;
    }

    var codeSelect = new gcinui.CodeSelect();
    codeSelect.decorate(message);

    var rows = message.innerHTML.split('\n').length;
    textarea.setAttribute('rows', Math.max(rows, 3));

    var form = new gcinui.Form(textarea, hasFormatter);
    form.setPrettifyParent(/** @type {Element} */ (textarea.parentNode));
    form.setResultParent(/** @type {Element} */ (textarea.parentNode));
    form.render(gcinuiHelper);
  });
};
goog.exportSymbol('gcinui.install', gcinui.install);