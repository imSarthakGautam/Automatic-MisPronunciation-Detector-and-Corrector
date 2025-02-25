# PronouncePerfect

## Overview

PronouncePerfect is a web application designed to help users improve their pronunciation by recording audio, submitting text or audio inputs, and receiving transcriptions and comparisons against expected text. 

Built using **Django** for the backend and **vanilla JavaScript** for the frontend, it features three main components:

- **Audio Only:** Record or upload audio for transcription.
- **Audio + Text:** Record audio and provide text for comparison with transcriptions.
- **Audio Practice:** Practice with pre-selected text samples, record audio, and compare transcriptions.

The application leverages **HTML5, CSS, and JavaScript** for dynamic functionality, including audio recording, submission, and transcription feedback.

## Features

- **Audio Recording:** Record audio directly in the browser using the microphone.
- **Audio Upload:** Upload audio files for processing.
- **Text Input:** Enter or select text for comparison with audio transcriptions.
- **Transcription Feedback:** Display transcriptions with color-coded comparisons (green for correct, red for incorrect).
- **Practice Mode:** Select from database-driven text samples to practice pronunciation.
- **Interactive UI:** Buttons for copying, editing, and removing transcriptions, with real-time state management.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+**
- **Node.js 14+** (if managing JavaScript dependencies)
- **pip** (Python package manager)
- **virtualenv** (optional, for Python environment isolation)
- **Git** (for cloning the repository)
- **ffmpeg** (required for audio processing)

## Installation

Follow these steps to set up and run **PronouncePerfect** locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pronouncePerfect.git
cd pronouncePerfect
```

### 2. Set Up Python Virtual Environment

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn’t exist, create it with:

```bash
pip freeze > requirements.txt
```

Ensure it includes **Django, pydub**, and other dependencies.

### 4. Install JavaScript Dependencies (Optional)

If additional JavaScript dependencies are needed, install them via npm:

```bash
npm init -y
npm install --save-dev <package-name>
```

### 5. Install ffmpeg (for Audio Processing)

#### On Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### On macOS:
```bash
brew install ffmpeg
```

#### On Windows:
Download and install `ffmpeg` from [ffmpeg.org](https://ffmpeg.org/) and add it to your system `PATH`.

### 6. Configure Django Settings

Copy the sample settings file:

```bash
cp pronouncePerfect/settings/local.py.example pronouncePerfect/settings/local.py
```

Update `local.py` with database credentials, secret key, and other settings.

### 7. Apply Migrations

```bash
python manage.py migrate
```

### 8. Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 9. Load Initial Data (Optional)

```bash
python manage.py loaddata initial_data.json
```

### 10. Run the Development Server

```bash
python manage.py runserver
```

Open your browser to **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)** to access PronouncePerfect.

## Usage

### Components

- **Audio Only:** Navigate to "Speak or Upload Audio," record via the microphone, or upload an audio file for transcription.
- **Audio + Text:** Use "Speak or Type Your Text" to record audio and provide text for comparison.
- **Audio Practice:** Select a sample text, record your pronunciation, and submit for transcription comparison.

### Transcription Feedback

- After submission, transcriptions appear with **color-coded feedback** (green for correct words, red for incorrect).
- Use the **"[Copy]"**, **"[Edit]"**, and **"[Remove]"** buttons to interact with transcriptions.

## Troubleshooting

- **Audio Not Recording:** Ensure your browser has microphone permissions and `ffmpeg` is installed.
- **Transcription Errors:** Check server logs for HTTP 500 errors.
- **Disabled Buttons:** Verify unique button IDs in `app.js`.

## Project Structure

```
pronouncePerfect/
├── manage.py
├── pronouncePerfect/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── local.py
│   ├── urls.py
│   ├── wsgi.py
│   └── templates/
│       └── pronouncePerfect/
│           ├── components/
│               ├── speak_or_upload_audio.html
│               ├── text_input_component.html
│               ├── practice_on_samples.html
│               ├── transcription.html
├── static/
│   ├── pronouncePerfect/
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   ├── audioRecorder.js
│   │   │   ├── audioSubmitter.js
│   │   │   ├── transcriptionUI.js
│   │   ├── css/
│   │   ├── images/
│   │   │   ├── sound_logo.jpg
├── requirements.txt
└── README.md
```

## Dependencies

### Python
- **Django >= 4.0**
- **pydub** (for audio processing)
- **ffmpeg-python** (optional)

### JavaScript
- Vanilla JavaScript, supports modern browsers.

### System
- **ffmpeg** (for audio processing)

## Contributing

1. **Fork** the repository.
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/pronouncePerfect.git
   cd pronouncePerfect
   ```
3. Create a virtual environment and install dependencies.
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
5. Make your changes, ensuring code adheres to best practices.
6. Commit changes:
   ```bash
   git commit -m "Describe your changes"
   ```
7. Push to your fork and submit a **pull request**.

## Testing

Run Django tests:

```bash
python manage.py test
```

Manually test UI components in the browser.

## Code Style

- **Python:** Follow **PEP 8** guidelines.
- **JavaScript:** Use **camelCase** for variables and functions.

## Known Issues and Troubleshooting

- **Audio Processing Errors (HTTP 500):** Ensure `ffmpeg` is installed and configured.
- **Disabled Submit Buttons:** Check for unique button IDs in `app.js`.
- **Transcription Not Displaying:** Verify correct template structure and script references.

## Browser Compatibility

Ensure your browser supports:
- **MediaRecorder API**
- **navigator.clipboard**
- **HTML5 Audio APIs**
