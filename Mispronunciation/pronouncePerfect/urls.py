from django.urls import path
from . import views

urlpatterns = [
    path('', views.pronouncePerfect, name='home'),
]
