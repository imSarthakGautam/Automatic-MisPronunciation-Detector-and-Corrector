import { AudioRecorder } from "./src/audioRecorder.js";
import { AudioSubmitter } from "./src/audioSubmitter.js";
import { TranscriptionUI } from "./src/transcriptionUI.js";

document.addEventListener("DOMContentLoaded", () => {
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
});
