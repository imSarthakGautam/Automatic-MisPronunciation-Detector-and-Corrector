from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from pronouncePerfect.services import process_audio_file, compare_texts

import os
import librosa
import soundfile as sf

from pydub import AudioSegment
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
# import torchaudio

# -----------Load the model and the processor--------
MODEL_PATH = settings.MODEL_DIR
processor = Wav2Vec2Processor.from_pretrained(MODEL_PATH) # Loads the processor from directory specified by MODEL_PATH,  it is needed because processor handles the preprocessing of audio input, ensures consistency with setup during fine tuning
model = Wav2Vec2ForCTC.from_pretrained(MODEL_PATH) # loads the fine tuned wav2vec2 model [ reads config.json and model.safetensors to recreate the model with architecture and weights]

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
            
        try:
            # Get uploaded audio file
            audio_file = request.FILES["audio"]
            unique_name = f"temp_{audio_file.name}"
            
            # process audio ( possible conversion + transcribes it)
            transcription = process_audio_file(audio_file)

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

        try:
            # Get uploaded audio file & user-provided text
            audio_file = request.FILES.get("audio")
            #["audio"]
            text_input = request.POST.get("text"," ").strip()
            #["text"].strip()

            if not audio_file or not text_input:
                return JsonResponse({"error": "Missing audio file or text input"}, status=400)

            # Process audio (converts if needed, transcribes)
            transcription = process_audio_file(audio_file)

            # Compare transcribed text with user input
            comparison_result = compare_texts(transcription, text_input)

            return JsonResponse({
                "transcription": transcription,
                "result": comparison_result
            })

        except Exception as e:
            print(f"Error in process_audio view: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)