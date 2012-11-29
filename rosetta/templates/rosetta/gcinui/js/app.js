goog.provide('gcinui');

goog.require('gcinui.Form');
goog.require('gcinui.CodeSelect');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.string');

gcinui.install = function() {
  var msgrows = goog.dom.getElementsByClass('msgrow');
  goog.array.forEach(msgrows, function(msgrow) {
    var textarea = goog.dom.getElementByClass('textarea-translation', msgrow);
    var gcinuiHelper = goog.dom.getElementByClass('gcinuielper', msgrow);
    var message = goog.dom.getElementByClass('message', msgrow);
    var buttonsWrap = goog.dom.getElementByClass('translation-buttons', msgrow);

    var hasFormatter = goog.dom.classes.has(message, 'message-with-formatter');

    if (!textarea) {
      return;
    }

    var codeSelect = new gcinui.CodeSelect();
    codeSelect.decorate(message);

    var rows = message.innerHTML.split('\n').length;
    textarea.setAttribute('rows', Math.max(rows, 3));

    var form = new gcinui.Form(goog.string.unescapeEntities(message.innerHTML),
        textarea, hasFormatter);
    form.setButtonsParent(buttonsWrap);
    form.render(gcinuiHelper);
  });
};
goog.exportSymbol('gcinui.install', gcinui.install);