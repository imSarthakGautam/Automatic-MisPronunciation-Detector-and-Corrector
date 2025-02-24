import os
import librosa
import torch
import soundfile as sf
import logging
from django.conf import settings
from pydub import AudioSegment
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from django.http import JsonResponse
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Load ASR model & processor globally
MODEL_PATH = settings.MODEL_DIR
processor = Wav2Vec2Processor.from_pretrained(MODEL_PATH)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_PATH)

# ----- Handles  audio file storage, optional .wav conversion, audio transcription. |---------------
def process_audio_file(audio_file):
    file_path = save_audio_file(audio_file)

    if not file_path.endswith(".wav"):
        print(f"File is not WAV, converting: {file_path}")
        file_path = convert_to_wav(file_path)

    transcription = transcribe_audio(file_path)
    os.remove(file_path)  # Cleanup

    return transcription

# ------ Save uploaded audio file to media directory |----------------
def save_audio_file(audio_file):
    try:
        unique_name = f"temp_{audio_file.name}"
        file_path = os.path.join(settings.MEDIA_ROOT, unique_name)

        print(f"Saving uploaded file: {file_path}")
        with open(file_path, "wb+") as temp_file:
            for chunk in audio_file.chunks():
                temp_file.write(chunk)
        
        return file_path
    except Exception as e:
        print(f"Error while saving audio: {e}")
        return JsonResponse({"error": str(e)}, status=500)

# ------ Convert audio to WAV and resample to 16 kHz
def convert_to_wav(input_path):
    output_path = input_path.replace(".webm", ".wav").replace(".mp3", ".wav").replace(".m4a", ".wav")
    try:  
        print(f"Converting {input_path} to WAV format...")
        audio = AudioSegment.from_file(input_path, format="webm")
        logger.info(f"Audio loaded successfully: {audio.frame_rate} Hz, {audio.channels} channels")
        audio = audio.set_frame_rate(16000)
        audio.export(output_path, format="wav")
        return output_path
    except Exception as e:
        print(f"Error converting file: {e}")
        raise RuntimeError(f"Conversion failed: {e}")

# ----- generate transcription --------------------
def transcribe_audio(file_path):
    """
    Transcribes an audio file using Wav2Vec2.
    """
    try:
        print(f"Loading and resampling audio: {file_path}")
        waveform, _ = librosa.load(file_path, sr=16000)
        sf.write(file_path, waveform, 16000)  # Ensure correct sample rate

        print(f"Processing audio with Wav2Vec2...")
        input_values = processor(waveform, sampling_rate=16000, return_tensors="pt").input_values
        logits = model(input_values).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.decode(predicted_ids[0])
        print(f"Transcription generated: {transcription}")

        return transcription.lower()

    except Exception as e:
        print(f"Error during transcription: {e}")
        raise RuntimeError(f"Transcription failed: {e}")
