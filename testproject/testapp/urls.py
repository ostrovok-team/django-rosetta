from django.conf.urls import url, patterns
from testapp import views
#from django.core.management.commands import makemessages

urlpatterns = patterns('testproject',
    url(r'page/', view=views.page, name='test_page'),
)