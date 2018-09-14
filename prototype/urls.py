from django.urls import path

from . import views

app_name = 'prototype'
urlpatterns = [
    path(r'', views.index, name='index'),
    path(r'download', views.download, name='download'),
    path(r'upload', views.upload, name='upload'),
]
