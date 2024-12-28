let mediaRecorder;
let audioChunks = [];
let isRecording = false; // Toggle state for recording
let audioBlob;
let audioURL;

const recordButton = document.getElementById("recordButton");
const recordingStatus = document.getElementById("recordingStatus");
const buttonLabel = document.getElementById("buttonLabel");
const audioPlayback = document.getElementById("audioPlayback");
const downloadButton = document.getElementById("downloadButton");

recordButton.addEventListener("click", async () => {

//const isRecording = recordButton.classList.toggle('recording'); // Toggle recording state
document.getElementById('recordingStatus').textContent = isRecording
        ? 'Recording.....'
        : 'Press the button to start speaking...';

        if (isRecording) {
            recordingStatus.classList.add('recording-text');
        } else {
            recordingStatus.classList.remove('recording-text');
        }

  if (!isRecording) {
    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize MediaRecorder
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      // Update UI
      isRecording = true;
      buttonLabel.textContent = "Stop Speaking";
      recordingStatus.innerHTML = '<span style="color: red; font-weight: bold;">Recording...</span> Press the button to stop.';
      recordButton.classList.add("recording");

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // Combine chunks into Blob
        audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = []; // Clear chunks for next recording

        // Create playback URL
        audioURL = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioURL;
        audioPlayback.hidden = false;
        downloadButton.hidden = false;

        // Save the blob for submission
        downloadButton.audioBlob = audioBlob;

        // Stop the stream
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      recordingStatus.textContent = "Error accessing microphone. Please check permissions.";
    }
  } else {
    // Stop recording
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();

      // Update UI
      isRecording = false;
      buttonLabel.textContent = "Start Speaking";
      recordingStatus.textContent = "Recording stopped. You can play or download the audio.";
      recordButton.classList.remove("recording");
    }
  }
});

// Download the recorded audio

downloadButton.addEventListener("click", async () => {
    console.log('Send button clicked')
    const audioBlob = downloadButton.audioBlob;

    if (!audioBlob) {
        alert("No recorded audio available to submit.");
        return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    try {
        console.log('fetching function')
        const response = await fetch("/process-audio/", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": csrfToken,
            },
        });

        if (response.ok) {
            console.log('response has arrived here')
            const result = await response.json();
            console.log(result)
            document.getElementById('transcriptionResult').textContent = result.transcription;
        } else {
            console.error("Server error:", response.status);
            document.getElementById("recordingStatus").textContent = "Error occurred during transcription.";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("recordingStatus").textContent = "Failed to process audio.";
    }
});