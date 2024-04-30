from django.urls import include, path

from .views import index, FindComponentView, DownloadComponentView


urlpatterns = [
    path('', index),
    path('api/search/', FindComponentView.as_view(), name='components-search'),
    path('api/search/download', DownloadComponentView.as_view(), name='components-search-download')
]
