# coding=utf-8
from django.conf import settings
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from django.utils.translation import ugettext as _
import datetime

def page(request):
    context = RequestContext(request=request)
    text = u'Перевод этого текста сгенерили на бэкэнде'
    context_vars = {
        'text_from_backed': _(text),
        'born_at': datetime.datetime.now(),
        'available_languages': settings.LANGUAGES,
    }

    return render_to_response('page.html', context_vars, context_instance=context)