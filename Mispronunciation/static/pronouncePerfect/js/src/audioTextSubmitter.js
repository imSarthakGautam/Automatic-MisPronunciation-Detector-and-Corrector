import { enableButton, disableButton, resetAudioState } from "./utils.js";

/**
 * Submit audio and text both:
 * Model gives transcript from audio input and compares it with text input.
 */
export class AudioTextSubmitter {
  constructor(
    submitButtonId,
    textInputId,
    apiUrl,
    transcriptionUI,
    isPractice = false,
    parentElement = document
  ) {
    this.submitButtonId = submitButtonId;
    this.textInputId = textInputId;
    this.apiUrl = apiUrl;
    this.transcriptionUI = transcriptionUI;
    this.isPractice = isPractice;
    this.parentElement = parentElement; // Store parentElement as a property

    console.log("inside submit-audio-text class");

    // Scope DOM queries within parentElement or fall back to document
    this.submitButton =
      this.parentElement.querySelector(`#${submitButtonId}`) ||
      document.getElementById(submitButtonId);
    this.textInput =
      this.parentElement.querySelector(`#${textInputId}`) ||
      document.getElementById(textInputId);

    if (!this.submitButton || !this.textInput) {
      console.error(
        `Error: Required DOM element for ${
          isPractice ? "sample selection" : "text input"
        } not found.`
      );
      return;
    }

    this.initEvents();
  }

  initEvents() {
    if (this.submitButton) {
      this.submitButton.addEventListener("click", () => this.submitAudioText());
    }

    if (this.textInput) {
      if (this.isPractice) {
        // For practice (select element), listen for changes to update selected text
        this.textInput.addEventListener("change", (e) => {
          this.selectedText = e.target.value; // Store selected text for practice
          console.log("Selected practice text:", this.selectedText);

          // Update practiceTextInput if it exists (for UI display)
          const practiceTextInput =
            this.parentElement.querySelector("#practiceTextInput");
          if (practiceTextInput) {
            practiceTextInput.value = this.selectedText;
            practiceTextInput.style.height = ""; // Reset height
            practiceTextInput.style.height =
              practiceTextInput.scrollHeight + "px"; // Auto-resize
          }
        });
      }
    }
  }

  async submitAudioText() {
    console.log("inside text+audio upload");
    if (!this.submitButton.classList.contains("enabled")) return;

    // Create FormData { audio: File, text: textInput }
    const formData = new FormData();
    const audioFile = window.recordedBlob;
    if (!audioFile) {
      console.error("No audio file available for submission!");
      return;
    }
    formData.append("audio", audioFile);

    let textInput;
    if (this.isPractice) {
      textInput = this.selectedText; // Use selected practice text
      if (!textInput) {
        console.error("No practice sample selected!");
        return;
      }
    } else {
      textInput = this.textInput.value; // Use textarea value for audio-text
      if (!textInput) {
        console.error("No text input provided!");
        return;
      }
    }

    formData.append("text", textInput);

    // Changes in UI elements
    this.submitButton.textContent = "Submitting...";
    this.submitButton.disabled = true;

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": this.getCSRFToken() },
      });
      console.log("back from be");
      if (response.ok) {
        const result = await response.json();
        console.log("response received:", result);

        if (result.result && Array.isArray(result.result)) {
          this.transcriptionUI.showTranscription(
            this.formatComparison(result.result)
          );
        } else {
          console.error("Invalid result format:", result);
        }

        resetAudioState();
      } else {
        console.error("Server error:", response.status);
      }
    } catch (error) {
      console.error("Error while submitting audio and text:", error);
    } finally {
      // Disable button at last regardless of success/failure
      this.submitButton.textContent = this.isPractice
        ? "Submit Practice"
        : "Submit Audio";
      disableButton(this.submitButton);
    }
  }

  formatComparison(result) {
    return result
      .map(([word, status]) => {
        const color = status === "correct" ? "green" : "red";
        return `<span style="color: ${color};">${word}</span>`;
      })
      .join(" ");
  }

  getCSRFToken() {
    // Use this.parentElement for scoping, fall back to document
    const csrfElement =
      this.parentElement.querySelector("[name=csrfmiddlewaretoken]") ||
      document.querySelector("[name=csrfmiddlewaretoken]");
    if (!csrfElement) {
      console.error("CSRF token element not found.");
      return "";
    }
    return csrfElement.value;
  }
}
