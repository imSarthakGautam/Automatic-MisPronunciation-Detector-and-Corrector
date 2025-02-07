import { AudioRecorder } from "./src/audioRecorder.js";
import { AudioSubmitter } from "./src/audioSubmitter.js";
import { TranscriptionUI } from "./src/transcriptionUI.js";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Handle Audio Only Section
  const audioOnlySection = document.querySelector('[data-task="audio-only"]');
  if (audioOnlySection) {
    new AudioOnlyApp(audioOnlySection);
  }

  // Handle Audio + Text Section
  const audioTextSection = document.querySelector('[data-task="audio-text"]');
  if (audioTextSection) {
    new AudioTextApp(audioTextSection);
  }

  console.log("App initialized");
});

class AudioOnlyApp {
  constructor() {
    const recorder = new AudioRecorder(
      "recordButton",
      "audioPlayback",
      "submitAudioButton"
    );

    const transcriptionUI = new TranscriptionUI(
      "transcriptionSection",
      "transcriptionText",
      "copyTranscription",
      "editTranscription",
      "removeTranscription"
    );

    const submitter = new AudioSubmitter(
      "audioUpload",
      "submitAudioButton",
      "/process-audio/",
      transcriptionUI
    );

    console.log("App initialized!");
  }
}

class AudioTextApp {
  constructor() {
    this.recorder = new AudioRecorder(
      "recordButton",
      "audioPlayback",
      "submitAudioButton"
    );

    this.transcriptionUI = new TranscriptionUI(
      "transcriptionSection",
      "transcriptionText",
      "copyTranscription",
      "editTranscription",
      "removeTranscription"
    );

    this.submitter = new AudioTextSubmitter(
      "audioUpload",
      "submitAudioButton",
      "textInput",
      "/process-audio-text/",
      this.transcriptionUI
    );
  }
}
