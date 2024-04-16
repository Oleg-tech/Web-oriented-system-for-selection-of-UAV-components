from django.urls import include, path

from .views import index


urlpatterns = [
    path('', index),
    path('api/', include('rest_framework.urls')),
]
