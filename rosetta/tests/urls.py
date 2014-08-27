try:
    from django.conf.urls.defaults import url, patterns, include
except ImportError:
    # Django 1.6+
    from django.conf.urls import url, patterns, include
urlpatterns = patterns('',
    url(r'^rosetta/',include('rosetta.urls')),
    url(r'^admin/$','rosetta.tests.views.dummy', name='dummy-login')
)
