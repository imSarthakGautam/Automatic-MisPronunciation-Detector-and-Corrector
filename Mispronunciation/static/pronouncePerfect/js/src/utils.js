export function enableButton(button) {
  button.classList.add("enabled"); // for css-->  .enabled{}
  button.disabled = false;
  console.log("Button enabled:", button.id);
}

export function disableButton(button) {
  button.classList.remove("enabled"); // removes css on .enabled
  button.disabled = true;
  console.log("Button disabled:", button.id);
}


export function resetAudioState() {
  console.log("🔄 Resetting all audio states...");

  // Audio Playback
  const audioPlayback = document.getElementById("audioPlayback");
  if (audioPlayback) {
    audioPlayback.pause();
    audioPlayback.src = "";
    audioPlayback.hidden = true;
    audioPlayback.controls = false;
    audioPlayback.load();
  }

  // Submit Button
  const submitButton = document.getElementById("submitAudioButton");
  if (submitButton) {
    disableButton(submitButton);
    submitButton.textContent = "Submit Audio";
  }

  // File Input
  const audioUpload = document.getElementById("audioUpload");
  if (audioUpload) {
    audioUpload.value = "";
  }

  // Record Button
  const recordButton = document.getElementById("recordButton");
  if (recordButton) {
    recordButton.textContent = "Start Speaking";
    recordButton.classList.remove("recording");
  }

  // Clear recorded blob
  window.recordedBlob = null;
}
/**
 * Using these utility functions we can make btn clickable or unclickable
 *
 * @html <button id="submitBtn"> Submit </button>
 * @retrive_by const submitBtn = document.getElementById("submitBtn");
 * @use enableButton(submitBtn)
 */
