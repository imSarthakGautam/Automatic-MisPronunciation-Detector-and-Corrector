document.addEventListener("DOMContentLoaded", function () {
  const audioUpload = document.getElementById("audioUpload");
  const submitButton = document.getElementById("submitAudioButton");
  const recordButton = document.getElementById("recordButton");
  const transcriptionSection = document.getElementById("transcriptionSection");
  const transcriptionText = document.getElementById("transcriptionText");
  const copyButton = document.getElementById("copyTranscription");
  const editButton = document.getElementById("editTranscription");
  const removeButton = document.getElementById("removeTranscription");

  let audioBlob = null; // Stores recorded audio

  if (
    !audioUpload ||
    !submitButton ||
    !recordButton ||
    !transcriptionSection ||
    !transcriptionText
  ) {
    console.error("Error: Required elements not found in the DOM");
    return;
  }

  /* ✅ Enable Submit Button */
  function enableSubmitButton() {
    submitButton.classList.add("enabled");
    submitButton.disabled = false;
    console.log("✅ Submit button enabled!");
  }

  /* ❌ Disable Submit Button */
  function disableSubmitButton() {
    submitButton.classList.remove("enabled");
    submitButton.disabled = true;
    console.log("⛔ Submit button disabled.");
  }

  /* ✅ Enable Submit Button When File is Uploaded */
  audioUpload.addEventListener("change", function () {
    const audioPlayback = document.getElementById("audioPlayback");
    if (audioUpload.files.length > 0) {
      console.log("📂 File selected:", audioUpload.files[0].name);
      const audioURL = URL.createObjectURL(audioUpload.files[0]);

      audioPlayback.src = audioURL;
      audioPlayback.hidden = false;
      audioPlayback.controls = true;

      enableSubmitButton(); // Enable submit after file upload
    } else {
      disableSubmitButton();
      audioPlayback.hidden = true;
    }
  });

  /* ✅ Enable Submit Button When Recording is Stopped */
  recordButton.addEventListener("click", async () => {
    if (!navigator.mediaDevices) {
      console.error("🎙️ Microphone access not available.");
      return;
    }

    if (!audioBlob) {
      console.log("🎙️ Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let chunks = [];

      mediaRecorder.start();
      recordButton.textContent = "Stop Speaking";
      recordButton.classList.add("recording");

      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

      mediaRecorder.onstop = () => {
        console.log("🛑 Recording stopped!");
        audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(audioBlob);

        const audioPlayback = document.getElementById("audioPlayback");
        audioPlayback.src = audioURL;
        audioPlayback.hidden = false;
        audioPlayback.controls = true;

        enableSubmitButton(); // Enable submit after recording
      };

      setTimeout(() => {
        mediaRecorder.stop();
        recordButton.textContent = "Start Speaking";
        recordButton.classList.remove("recording");
      }, 5000); // Automatically stops after 5 seconds
    }
  });

  /* ✅ Submit Audio */
  submitButton.addEventListener("click", async () => {
    console.log("🚀 Submit button clicked!");

    if (!submitButton.classList.contains("enabled")) {
      console.warn("⚠️ Submit button clicked but not enabled!");
      return;
    }

    const audioFile =
      audioUpload.files.length > 0 ? audioUpload.files[0] : null;

    submitButton.textContent = "Submitting...";
    submitButton.disabled = true;

    const response = await submitAudioToServer(audioBlob, audioFile);
    handleAudioSubmissionResponse(response);

    submitButton.textContent = "Submit Audio";
    disableSubmitButton();
  });

  /* ✅ Handle Audio Submission */
  async function submitAudioToServer(audioBlob, audioFile) {
    const formData = new FormData();

    if (audioFile) {
      formData.append("audio", audioFile);
    } else if (audioBlob) {
      formData.append("audio", audioBlob, "recording.webm");
    } else {
      return { error: "No audio available to submit." };
    }

    const csrfToken = document.querySelector(
      "[name=csrfmiddlewaretoken]"
    ).value;

    try {
      const response = await fetch("/process-audio/", {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": csrfToken },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Transcription received:", result);
        return { success: result.transcription };
      } else {
        return { error: `Server error: ${response.status}` };
      }
    } catch (error) {
      return { error: "Failed to connect to the server." };
    }
  }

  /* ✅ Handle Response & Display Transcription */
  function handleAudioSubmissionResponse(response) {
    if (!transcriptionSection || !transcriptionText) {
      console.error("Error: Transcription display elements not found");
      return;
    }

    if (response.success) {
      transcriptionText.textContent = response.success;
      transcriptionSection.hidden = false;
      transcriptionSection.style.display = "block";
    } else if (response.error) {
      transcriptionText.textContent = "Error: " + response.error;
      transcriptionSection.hidden = false;
      transcriptionSection.style.display = "block";
    }
  }

  /* ✅ Copy Transcription */
  copyButton.addEventListener("click", function () {
    navigator.clipboard
      .writeText(transcriptionText.textContent)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => console.error("Copy failed:", err));
  });

  /* ✅ Edit Transcription */
  editButton.addEventListener("click", function () {
    if (transcriptionText.isContentEditable) {
      transcriptionText.contentEditable = "false";
      editButton.textContent = "✏️"; // Change back to Edit icon
    } else {
      transcriptionText.contentEditable = "true";
      transcriptionText.focus();
      editButton.textContent = "💾"; // Change icon to Save
    }
  });

  /* ✅ Remove Transcription */
  removeButton.addEventListener("click", function () {
    transcriptionText.textContent = "Your transcription will appear here.";
    transcriptionSection.style.display = "none";
  });
});
