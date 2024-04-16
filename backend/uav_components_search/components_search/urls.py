from django.urls import include, path

from .views import index, FindComponentView


urlpatterns = [
    path('', index),
    path('api/search/', FindComponentView.as_view(), name='components-search'),
]
