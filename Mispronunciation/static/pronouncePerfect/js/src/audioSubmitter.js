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
  constructor(
    audioUploadId,
    submitButtonId,
    apiUrl,
    transcriptionUI,
    parentElement = document
  ) {
    this.parentElement = parentElement;
    this.audioUpload = parentElement.querySelector(`#${audioUploadId}`);
    this.submitButton = parentElement.querySelector(`#${submitButtonId}`);
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

  // whenever <input> is changed: Note this is not changed in audioRecord: hence this is a reusuable Class
  handleFileUpload() {
    console.log("inside file upload");

    const audioPlayback = this.parentElement.getElementById("audioPlayback");
    if (!audioPlayback) {
      console.error("Error::: audioPlayback element not found in the DOM.");
      return;
    }

    // stop existing recordings.
    const recorderInstance = window.audioRecorderInstance;
    if (recorderInstance?.mediaRecorder?.state === "recording") {
      recorderInstance.mediaRecorder.stop();
    }

    // Debug File Selection
    console.log("Checking file selection...");
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
    // appends audioFile with key audio in formdata
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
    return this.parentElement.querySelector("[name=csrfmiddlewaretoken]").value;
  }
}

/**
 * @notes : .files in <input> element 
 * specific to <input type="file">
 * returns array FileList object that contains one or more files selected by user
 
 * console.log(fileInput.files);  // Logs FileList object : 
  @logs : FileList { 0: File, length: 1 }
 * console.log(typeof fileInput.files); // "object"
  @logs : "object"
 * You can access files using fileInput.files[0], similar to an array.
 
 * other things that can be attached : .change .input .focus .blur
 */
