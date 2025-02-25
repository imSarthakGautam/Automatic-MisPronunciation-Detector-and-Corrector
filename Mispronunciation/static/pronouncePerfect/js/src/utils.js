export function enableButton(button) {
  if (button && button instanceof HTMLElement) {
    button.classList.add("enabled"); // for CSS --> .enabled{}
    button.disabled = false;
    console.log("Button enabled:", button.id);
  } else {
    console.error("Invalid button element provided to enableButton.");
  }
}

export function disableButton(button) {
  if (button && button instanceof HTMLElement) {
    button.classList.remove("enabled"); // removes CSS on .enabled
    button.disabled = true;
    console.log("Button disabled:", button.id);
  } else {
    console.error("Invalid button element provided to disableButton.");
  }
}

/**
 * Resets audio-related states for a specific component, scoped to its parent element.
 * @param {HTMLElement} parentElement - The parent element (e.g., [data-task]) to scope queries within.
 */
export function resetAudioState(parentElement = document) {
  console.log(" Resetting audio states for component...");

  // Ensure parentElement is an HTMLElement, default to document
  const safeParentElement =
    parentElement instanceof HTMLElement ? parentElement : document;

  // Audio Playback (scoped to parent)
  const audioPlayback = safeParentElement.querySelector("#audioPlayback");
  if (audioPlayback) {
    audioPlayback.pause();
    audioPlayback.src = "";
    audioPlayback.hidden = true;
    audioPlayback.controls = false;
    audioPlayback.load();
  } else {
    console.warn("Audio playback element not found within parent element.");
  }

  // Submit Button (scoped to parent, using unique IDs)
  const submitButton =
    safeParentElement.querySelector("#submitAudioOnlyButton") ||
    safeParentElement.querySelector("#submitAudioTextButton") ||
    safeParentElement.querySelector("#practiceSubmitButton");
  if (submitButton) {
    disableButton(submitButton);
    submitButton.textContent =
      submitButton.id === "practiceSubmitButton" ? "Submit" : "Submit Audio";
  } else {
    console.warn("Submit button not found within parent element.");
  }

  // File Input (scoped to parent)
  const audioUpload = safeParentElement.querySelector("#audioUpload");
  if (audioUpload) {
    audioUpload.value = "";
  } else {
    console.warn("Audio upload input not found within parent element.");
  }

  // Record Button (scoped to parent)
  const recordButton =
    safeParentElement.querySelector("#recordButton") ||
    safeParentElement.querySelector("#practiceRecordButton");
  if (recordButton) {
    recordButton.textContent =
      recordButton.id === "practiceRecordButton"
        ? "Start Speaking"
        : "Start Speaking";
    recordButton.classList.remove("recording");
  } else {
    console.warn("Record button not found within parent element.");
  }

  // Clear recorded blob (scoped to instance, not global)
  // Note: This should be handled in AudioRecorder.getRecordedFile() or passed as a parameter
  // For now, remove global window.recordedBlob to avoid conflicts
  window.recordedBlob = null;
}

/**
 * Using these utility functions, we can make buttons clickable or unclickable.
 *
 * @html <button id="submitBtn"> Submit </button>
 * @retrieve_by const submitBtn = document.getElementById("submitBtn");
 * @use enableButton(submitBtn)
 */
