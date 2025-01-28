let mediaRecorder;
let audioBlob = null;

const recordButton = document.getElementById("recordButton");
const audioUpload = document.getElementById("audioUpload");
const submitButton = document.getElementById("submitAudioButton");

/* Function to enable submit button */
function enableSubmitButton() {
    submitButton.classList.add("enabled");
    submitButton.disabled = false;
}

/* Function to disable submit button */
function disableSubmitButton() {
    submitButton.classList.remove("enabled");
    submitButton.disabled = true;
}

/* Enable submit when file is uploaded */
audioUpload.addEventListener("change", function () {
    if (audioUpload.files.length > 0) {
        enableSubmitButton();
    } else {
        disableSubmitButton();
    }
});

/* Enable submit when recording is done */
recordButton.addEventListener("click", async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        recordButton.textContent = "Stop Speaking";
        recordButton.classList.add("recording");

        let chunks = [];
        mediaRecorder.ondataavailable = event => chunks.push(event.data);
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(chunks, { type: "audio/webm" });
            enableSubmitButton();
        };
    } else {
        // Stop recording
        mediaRecorder.stop();
        recordButton.textContent = "Start Speaking";
        recordButton.classList.remove("recording");
    }
});

/* Submit Audio File */
submitButton.addEventListener("click", async () => {
    if (!submitButton.classList.contains("enabled")) return;

    const formData = new FormData();
    if (audioUpload.files.length > 0) {
        formData.append("audio", audioUpload.files[0]);
    } else if (audioBlob) {
        formData.append("audio", audioBlob, "recording.webm");
    } else {
        alert("No audio available.");
        return;
    }

    submitButton.textContent = "Submitting...";
    submitButton.disabled = true;

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    try {
        const response = await fetch("/process-audio/", {
            method: "POST",
            body: formData,
            headers: { "X-CSRFToken": csrfToken },
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById("recordingStatus").textContent = "Transcription: " + result.transcription;
        } else {
            alert("Error processing audio.");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        submitButton.textContent = "Submit Audio";
        disableSubmitButton();
    }
});
