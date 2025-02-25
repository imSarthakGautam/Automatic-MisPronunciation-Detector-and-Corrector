from django.urls import path
from . import views

urlpatterns = [
    path('', views.pronouncePerfect, name='home'),
    path('audio-upload/', views.audio_upload, name='audio_upload'),
    path('process-audio/', views.process_audio, name='process_audio'),
    path('process-audio-text/', views.process_audio_text, name='process_audio_text'),
    path('get-practice-samples/', views.get_practice_samples, name='get_practice_samples'),
]
