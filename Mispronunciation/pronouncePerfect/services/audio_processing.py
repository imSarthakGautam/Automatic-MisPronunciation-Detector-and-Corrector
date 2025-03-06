import os
import librosa
import torch
import soundfile as sf

from django.conf import settings
from pydub import AudioSegment
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from django.http import JsonResponse

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load ASR model & processor globally
def select_model(language):
    """
    Selects and loads a Wav2Vec2 model and processor based on the given language.
    Args: language (str): The language code ('eng' or 'np').
    Returns: A tuple containing the processor and model, or None if an error occurs.
    """
    try:
        if language == 'eng':
            model_path = settings.MODEL_DIR
            print('english selected')
        elif language == 'np':
            model_path = settings.NEP_MODEL_DIR
            print('nepali selected')
        else:
            logger.warning(f"Model language '{language}' not defined. Setting to default (None).")
            return None  # Return None for invalid language

        processor = Wav2Vec2Processor.from_pretrained(model_path)
        model = Wav2Vec2ForCTC.from_pretrained(model_path)
        return processor, model

    except FileNotFoundError:
        logger.error(f"Model files not found at {model_path}.")
        return None
    except Exception as e:
        logger.exception(f"An unexpected error occurred while loading the model: {e}")
        return None

# ----- Handles  audio file storage, optional .wav conversion, audio transcription. |---------------
def process_audio_file(audio_file, language):
    file_path = save_audio_file(audio_file)

    if not file_path.lower().endswith(".wav"):
        print(f"File is not WAV, converting: {file_path}")
        file_path = convert_to_wav(file_path)

    transcription = transcribe_audio(file_path, language)
    os.remove(file_path)  # Cleanup

    if os.path.exists(file_path):
        os.remove(file_path)  # Cleanup
    return transcription

# ------ Save uploaded audio file to media directory |----------------
def save_audio_file(audio_file):
    try:
        unique_name = f"temp_{audio_file.name}.wav" if audio_file.name else "temp_audio.wav"
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

        # Try loading as WAV first to avoid unnecessary conversion
        if input_path.lower().endswith('.wav'):
            return input_path  # No conversion needed if already WAV
   
        audio = AudioSegment.from_file(input_path, format="webm")
        logger.info(f"Audio loaded successfully: {audio.frame_rate} Hz, {audio.channels} channels")
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(output_path, format="wav")
        return output_path
    except Exception as e:
        print(f"Error converting file: {e}")
        raise RuntimeError(f"Conversion failed: {e}")

# ----- generate transcription --------------------
def transcribe_audio(file_path, language):
    """
    Transcribes an audio file using Wav2Vec2.
    """
    try:
        print(f"Loading and resampling audio: {file_path}")
        # Ensure file_path ends with .wav for librosa
        if not file_path.lower().endswith('.wav'):
            raise ValueError(f"Expected WAV file, got: {file_path}")

       # Load with librosa, explicitly specifying format if needed
        waveform, sample_rate = librosa.load(file_path, sr=16000, mono=True)
        if sample_rate != 16000:
            print(f"Resampling to 16kHz...")
            waveform, _ = librosa.resample(waveform, sample_rate, 16000)

        # Write to ensure correct format, overwriting if needed
        sf.write(file_path, waveform, 16000, format='WAV')

        processor, model= select_model(language)

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
