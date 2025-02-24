import { enableButton, disableButton, resetAudioState } from "./utils.js";
/**
 * Submit audio and text both:
 * model gives transcript from audioInput and compares it with textInput
 */
export class AudioTextSubmitter {
  constructor(
    //audioUploadId,
    submitButtonId,
    textInputId,
    apiUrl,
    transcriptionUI
  ) {
    //this.audioUpload = document.getElementById(audioUploadId);
    this.submitButton = document.getElementById(submitButtonId);
    this.apiUrl = apiUrl;
    this.textInput = document.getElementById(textInputId);
    this.transcriptionUI = transcriptionUI;
    console.log('inside submit-audio-text class')

    if (
      //   !this.audioUpload||
      !this.submitButton ||
      !this.textInput
    ) {
      console.error("Error: Required DOM elements for audioText submission not found.");
      return;
    }

    this.initEvents();
  }

  initEvents() {
    this.submitButton.addEventListener("click", () => this.submitAudioText());
  }

  async submitAudioText() {
    console.log("inside text+audio upload");
    if (!this.submitButton.classList.contains("enabled")) return;

    // create FormData { audio: File, text: textInput }
    const formData = new FormData();
    const audioFile = window.recordedBlob;
    if (!audioFile) {
      console.error("No audio file available for submission!");
      return;
    }
    formData.append("audio", audioFile);
    const textInput = this.textInput.value;
    formData.append("text", textInput);

    // changes in UI elements
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
      //disable button at last regardless of sucess/failure
      this.submitButton.textContent = "Submit Audio";
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
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
  }
}
