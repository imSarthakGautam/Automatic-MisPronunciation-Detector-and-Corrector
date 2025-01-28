const audioUpload = document.getElementById("audioUpload");
const recordButton = document.getElementById("recordButton");
const submitButton = document.getElementById("submitAudioButton");
const transcriptionResult = document.getElementById("transcriptionResult");
const audioPlayback = document.getElementById("audioPlayback"); //Audio player for manual playback

let mediaRecorder;
let audioBlob = null;

/*Function to Enable Submit Button */
function enableSubmitButton() {
  console.log("✅ Submit button enabled!");
  submitButton.classList.add("enabled");
  submitButton.disabled = false;
}

/*Function to Disable Submit Button */
function disableSubmitButton() {
  console.log("⛔ Submit button disabled.");
  submitButton.classList.remove("enabled");
  submitButton.disabled = true;
}

/*Enable Submit Button and Show Audio Playback for Uploaded Files */
audioUpload.addEventListener("change", function () {
  if (audioUpload.files.length > 0) {
    console.log("🎵 File selected:", audioUpload.files[0].name);

    //Create a playable URL for the uploaded file
    const audioURL = URL.createObjectURL(audioUpload.files[0]);
    audioPlayback.src = audioURL;
    audioPlayback.hidden = false;
    audioPlayback.controls = true; //User can manually play the uploaded file

    enableSubmitButton(); //Enable submit after file upload
  } else {
    disableSubmitButton(); // Disable submit if no file is selected
    audioPlayback.hidden = true; // Hide audio player if file is removed
  }
});

/*Start/Stop Recording and Show Playback Option */
recordButton.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    console.log("🎙️ Starting recording...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    recordButton.textContent = "Stop Speaking";
    recordButton.classList.add("recording");

    let chunks = [];
    mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

    mediaRecorder.onstop = () => {
      console.log("🛑 Recording stopped!");

      //Create a playable audio Blob
      audioBlob = new Blob(chunks, { type: "audio/webm" });
      const audioURL = URL.createObjectURL(audioBlob);

      //Set audio source and show the player
      audioPlayback.src = audioURL;
      audioPlayback.hidden = false;
      audioPlayback.controls = true; //User can manually play the recorded file

      enableSubmitButton(); //Enable submit after recording
    };
  } else {
    console.log("🛑 Stopping recording...");
    mediaRecorder.stop();
    recordButton.textContent = "Start Speaking";
    recordButton.classList.remove("recording");
  }
});

/*Submit Audio (Recorded or Uploaded) */
submitButton.addEventListener("click", async () => {
  if (!submitButton.classList.contains("enabled")) return;
  console.log("🚀 Submitting audio...");

  const formData = new FormData();
  if (audioUpload.files.length > 0) {
    console.log("📤 Uploading file...");
    formData.append("audio", audioUpload.files[0]);
  } else if (audioBlob) {
    console.log("📤 Uploading recorded audio...");
    formData.append("audio", audioBlob, "recording.webm");
  } else {
    console.error("❌ No audio available.");
    alert("No audio available.");
    return;
  }

  submitButton.textContent = "Submitting...";
  submitButton.disabled = true;

  const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  try {
    const response = await fetch("/process-audio/", {
      method: "POST",
      body: formData,
      headers: { "X-CSRFToken": csrfToken },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Response received:", result);
      transcriptionResult.textContent =
        "Transcription: " + result.transcription;
    } else {
      console.error("❌ Server error:", response.status);
      transcriptionResult.textContent = "Error occurred during transcription.";
    }
  } catch (error) {
    console.error("❌ Fetch error:", error);
    transcriptionResult.textContent = "Failed to process audio.";
  } finally {
    submitButton.textContent = "Submit Audio";
    disableSubmitButton();
  }
});
