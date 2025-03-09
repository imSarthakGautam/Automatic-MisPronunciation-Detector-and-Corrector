from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from pronouncePerfect.services import process_audio_file, compare_texts,  NepaliTextComparer
from django.views.decorators.csrf import csrf_exempt
from pronouncePerfect.models import PracticeSample
import os
import librosa

import logging
logger = logging.getLogger(__name__)
# import soundfile as sf

from pydub import AudioSegment
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
# import torchaudio

# ------Render--------
def pronouncePerfect(request):
    return render(request, 'pronouncePerfect/pronouncePerfect.html')

def audio_upload(request):
    return render(request, 'pronouncePerfect/audio_upload.html')



# Django view to process uploaded audio
def process_audio(request):
    if request.method == "POST":
        print("FILES RECEIVED:", request.FILES)
        
        if "audio" not in request.FILES:
            return JsonResponse({"error": "No audio file received"}, status=400)
        
        language=request.POST.get("language")
        print("Requested Language:", language )
            
        try:
            # Get uploaded audio file
            audio_file = request.FILES["audio"]
            unique_name = f"temp_{audio_file.name}.wav" if audio_file.name else "temp_audio.wav"
            
            # process audio ( possible conversion + transcribes it)
            transcription = process_audio_file(audio_file, language)

            return JsonResponse({"transcription": transcription})
        
        except Exception as e:
            print(f"Error in process_audio view: {e}")
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request. No audio file provided."}, status=400)

# Django view to process audio and text
def process_audio_text(request):
    if request.method == "POST":
        print("FILES RECEIVED:", request.FILES)
        if "audio" not in request.FILES or "text" not in request.POST:
            return JsonResponse({"error": "Missing audio file or text input"}, status=400)

        language=request.POST.get("language")
        print("Requested Language:", language )

        try:
            # Get uploaded audio file & user-provided text
            audio_file = request.FILES.get("audio")
            #["audio"]
            text_input = request.POST.get("text"," ").strip()
            #["text"].strip()

            if not audio_file or not text_input:
                return JsonResponse({"error": "Missing audio file or text input"}, status=400)

            # Process audio (converts if needed, transcribes)
            transcription = process_audio_file(audio_file, language)

            # Compare transcribed text with user input
            if language=='eng':
                comparison_result = compare_texts(transcription, text_input)
            elif language == 'np':
                nep = NepaliTextComparer()
                comparison_result=nep.compare_texts(transcription, text_input)

            return JsonResponse({
                "transcription": transcription,
                "result": comparison_result
            })

        except Exception as e:
            print(f"Error in process_audio text view: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def get_practice_samples(request):
    if request.method == "GET":
        language = request.GET.get("language") #Get language from query parameter.

        if language:
            samples = PracticeSample.objects.filter(language=language).values("id", "text", "title")
            print('samples in language:', language, '--')
        else:
            samples = PracticeSample.objects.all().values("id", "text", "title") #if no language, return all.

        samples_list = list(samples)
        
        # Log each sample and the final JSON response
        for sample in samples_list:
            logger.info(f"Sample: {sample}")
        
        logger.info(f"JSON response sent: {samples_list}")  # Log the entire response
        
        return JsonResponse({"samples": samples_list}, safe=False)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def csrf_token_view(request):
     return JsonResponse({'status': 'success'})
