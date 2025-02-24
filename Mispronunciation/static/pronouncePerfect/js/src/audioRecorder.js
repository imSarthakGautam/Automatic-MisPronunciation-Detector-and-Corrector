import { enableButton, resetAudioState } from "./utils.js";

export class AudioRecorder {
  /**
   * Constructor initializes the DOM Elements recordButtton, AudioPlayback and SubmitButton
   * It returns if it doesnt find respective DOM Element
   */
  constructor(recordButtonId, playbackId, submitButtonId) {
    /**
     * @mediaRecorder
     *  built-in browser, WebAPI to record media (audio/video)
     *  properties: state (inactive, recording, paused), mimeType (audio/webm), stream, audioBitsPerSecond
     *  functions: start(), stop(), pause(), resume()
     *  events: onstart, onstop, onresume, onerror, ondatavailable
     *
     * @audioBlob
     * Blob (binary large Object) that stores recorded audio
     * when mediaRecorder stops, output is stored as Blob.
     * This blob can be played, converted to file, uploaded and downloaded
     */
    this.mediaRecorder = null;
    this.audioBlob = null;

    this.recordButton = document.getElementById(recordButtonId);
    this.audioPlayback = document.getElementById(playbackId);
    this.submitButton = document.getElementById(submitButtonId);

    if (!this.recordButton || !this.audioPlayback || !this.submitButton) {
      console.error("Error: Required DOM elements for recording not found.");
      return;
    }
    /* constructor method to initialize the event Listner for button */
    this.initEvents();
  }

  initEvents() {
    this.recordButton.addEventListener("click", () => this.toggleRecording());
  }

  async toggleRecording() {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
      console.log("🎙️ Starting recording...");

      /**
       * requests microphone access.
       * create a new instance of MediaRecorder Object using stream
       * start recording
       * project starting of recording in Frontend
       */
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.recordButton.textContent = "Stop Speaking";
      this.recordButton.classList.add("recording");

      /**
       * Collects recorded data in an array chunks via this.mediaRecorder.ondataavailable
       * convert the chunks to Blob
       * generate temporary URL for browser to play & give source to <audio> element
       * controls=> enable play, pause in playback
       */
      let chunks = [];
      this.mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

      this.mediaRecorder.onstop = () => {
        // mediaRecorder.state= 'inactive;
        console.log("Recording stopped...");
        this.audioBlob = new Blob(chunks, { type: "audio/webm" });

        console.log("Generated audioBlob:", this.audioBlob, this.audioBlob.size, this.audioBlob.type);
        if (!this.audioBlob) {
          console.error("Audio blob is undefined!");
        }
        // Convert to File (Django requires named files)
        window.recordedBlob = new File([this.audioBlob], "recording.webm", {
          type: "audio/webm",
        });

        console.log("Converted recordedBlob:", window.recordedBlob);
        const audioURL = URL.createObjectURL(this.audioBlob);

        this.audioPlayback.src = audioURL;
        this.audioPlayback.hidden = false;
        this.audioPlayback.controls = true;

        enableButton(this.submitButton);
      };
    } else {
      console.log("Stopping recording...");
      this.mediaRecorder.stop();
      this.recordButton.textContent = "Start Speaking";
      this.recordButton.classList.remove("recording");
    }
  }

  getAudioBlob() {
    return this.audioBlob;
  }
}

/**
 * when you create a new instance of this class 'AudioRecorder'
 *  i.e. when you want to start recording logic
 * @ClassInstance : new AudioRecorder("recordBtn", "audioPlay", "submitBtn").
 * It sets up the initial state and immediately ensures you have all the elements you need.
 */
