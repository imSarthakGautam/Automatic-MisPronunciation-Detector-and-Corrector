import { enableButton, disableButton, resetAudioState } from "./utils.js";

export class AudioSubmitter {
  /**
   * Constructor initailizes the DOM elements using IDs passed
   * @audioUploadId : <input id='audioUpload >
   * @submitButtonId : <submit id='submitAudioButton'>
   *
   * @apiUrl : apiEndpoint to hit /process-audio
   * @transcriptionUI : instance of Transcription class
   */
  constructor(audioUploadId, submitButtonId, apiUrl, transcriptionUI) {
    this.audioUpload = document.getElementById(audioUploadId);
    this.submitButton = document.getElementById(submitButtonId);
    this.apiUrl = apiUrl;
    this.transcriptionUI = transcriptionUI;

    if (!this.audioUpload || !this.submitButton) {
      console.error("Error: Required DOM elements for submission not found.");
      return;
    }

    this.initEvents();
  }

  initEvents() {
    this.audioUpload.addEventListener("change", () => this.handleFileUpload());
    this.submitButton.addEventListener("click", () => this.submitAudio());
  }

  handleFileUpload() {
    console.log("inside file upload");

    const audioPlayback = document.getElementById("audioPlayback");
    if (!audioPlayback) {
      console.error("❌ Error: audioPlayback element not found in the DOM.");
      return;
    }

    const recorderInstance = window.audioRecorderInstance;
    if (recorderInstance?.mediaRecorder?.state === "recording") {
      recorderInstance.mediaRecorder.stop();
    }

    // Debug File Selection
    console.log("🧐 Checking file selection...");
    console.log("audioUpload.files:", this.audioUpload.files);
    console.log("audioUpload.files.length:", this.audioUpload.files.length);

    if (this.audioUpload.files.length > 0) {
      const audioFile = this.audioUpload.files[0];
      console.log("File selected:", audioFile.name);

      //audioPlayback from temporary URL
      const audioURL = URL.createObjectURL(audioFile);
      audioPlayback.src = audioURL;
      audioPlayback.hidden = false;
      audioPlayback.controls = true;

      enableButton(this.submitButton);
      console.log("Submit button enabled");
    } else {
      disableButton(this.submitButton);
      console.log("Submit button disabled because no file was selected");
    }
  }

  async submitAudio() {
    if (!this.submitButton.classList.contains("enabled")) return;

    // create FormData object to mimic form submission with the form field name for server side : audio
    const formData = new FormData();
    const audioFile = window.recordedBlob || this.audioUpload.files[0];
    if (!audioFile) {
      console.error("No audio file available for submission!");
      return;
    }
    console.log("Using audio file:", audioFile, "recording.webm");
    formData.append("audio", audioFile);

    // changes in UI elements
    this.submitButton.textContent = "Submitting...";
    this.submitButton.disabled = true;

    /**
     * Asynchronous request to serverEndpoint recieved from params
     * If response is sucessful (status: 200-299) JSON is parsed for result
     */
    try {
      //For Debugging
      console.log("submission1");
      console.log("apiURL", this.apiUrl);
      console.log("FormData keys:", [...formData.keys()]);
      console.log("FormData values:", [...formData.values()]);
      console.log("CSRF Token:", this.getCSRFToken());

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": this.getCSRFToken() },
      });
      console.log("back from be");

      if (response.ok) {
        const result = await response.json();
        console.log("Transcription received:", result);
        this.transcriptionUI.showTranscription(result.transcription);

        resetAudioState();
      } else {
        console.error("Server error:", response.status);
      }
    } catch (error) {
      console.error("Error submitting audio:", error);
    } finally {
      //disable button at last regardless of sucess/failure
      this.submitButton.textContent = "Submit Audio";
      disableButton(this.submitButton);
    }
  }

  getCSRFToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
  }
}
