from django.conf.urls import include, url

from . import views

app_name = 'prototype'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^download$', views.download, name='download'),
    url(r'^upload$', views.upload, name='upload'),
]
