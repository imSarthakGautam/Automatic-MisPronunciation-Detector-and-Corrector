from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings

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




# -------------- Convert audio to WAV and resample to 16 kHz
def convert_to_wav(input_path, output_path):
    try:
        print(f"Converting {input_path} to WAV format...")
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000)
        audio.export(output_path, format="wav")
        print(f"File converted to: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error converting file: {e}")
        raise RuntimeError(f"Conversion failed: {e}")

# Django view to process uploaded audio
def process_audio(request):
    if request.method == "POST" and request.FILES.get("audio"):
        try:
            # Get uploaded audio file
            audio_file = request.FILES["audio"]
            unique_name = f"temp_{audio_file.name}"
            file_path = os.path.join(settings.MEDIA_ROOT, unique_name)
            wav_path = os.path.join(settings.MEDIA_ROOT, "processed_audio.wav")

            # Save uploaded file
            print(f"Saving uploaded file: {file_path}")
            with open(file_path, "wb+") as temp_file:
                for chunk in audio_file.chunks():
                    temp_file.write(chunk)

            # Convert to WAV if necessary
            if not file_path.endswith(".wav"):
                print("Converting uploaded file to WAV format...")
                file_path = convert_to_wav(file_path, wav_path)

            # Transcribe audio
            transcription = transcribe_audio(file_path)

            # Clean up temporary files
            if os.path.exists(file_path):
                os.remove(file_path)

            return JsonResponse({"transcription": transcription})
        
        except Exception as e:
            print(f"Error in process_audio view: {e}")
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request. No audio file provided."}, status=400)

# Transcribe audio file
def transcribe_audio(file_path):
    try:
        print(f"Loading and resampling audio: {file_path}")
        waveform, rate = librosa.load(file_path, sr=16000)
        sf.write(file_path, waveform, 16000)  # Optional: Save resampled audio for debugging
        
        print(f"Processing audio with Wav2Vec2...")
        input_values = processor(waveform, sampling_rate=16000, return_tensors="pt").input_values
        logits = model(input_values).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.decode(predicted_ids[0])
        
        print(f"Transcription completed: {transcription}")
        return transcription
    except Exception as e:
        print(f"Error during transcription: {e}")
        raise RuntimeError(f"Transcription failed: {e}")

"""
def convert_to_wav(input_path, output_path):
    
    Converts an audio file to WAV format using ffmpeg.
    :param input_path: Path to the input audio file
    :param output_path: Path to save the converted WAV file
    
    try:
        ffmpeg.input(input_path).output(output_path, format='wav').run()
    except ffmpeg.Error as e:
        raise RuntimeError(f"FFmpeg error: {e.stderr.decode()}")
"""

"""
def process_audio(request):
    if request.method == 'POST' and request.FILES.get('audio'):
        # Get the uploaded audio file
        audio_file = request.FILES['audio']

        # Define file path where the audio will be saved
        file_path = os.path.join(settings.MEDIA_ROOT, 'uploaded_audio.wav')

        try:
            # Save the uploaded file to the specified path
            with open(file_path, 'wb+') as f:
                for chunk in audio_file.chunks():
                    f.write(chunk)

            # Return a success response with the file path
            return JsonResponse({'message': 'Audio file uploaded successfully!', 'file_path': file_path})

        except Exception as e:
            # Handle errors, like file saving issues
            return JsonResponse({'error': f'Failed to save the file: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'No audio file uploaded or incorrect request method.'}, status=400)


def transcribe_audio(file_path):

    # Example: Load an audio file and process it
    waveform, rate = torchaudio.load(file_path) # wavefrom = raw audio data, rate = sample rate
    input_values = processor(waveform, sampling_rate=rate, return_tensors="pt").input_values

    # get predictions
    with torch.no_grad():
        logits = model(input_values).logits
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)
    return transcription[0]
"""
