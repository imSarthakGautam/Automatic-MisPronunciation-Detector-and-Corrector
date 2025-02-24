import { AudioRecorder } from "./src/audioRecorder.js";
import { AudioSubmitter } from "./src/audioSubmitter.js";
import { TranscriptionUI } from "./src/transcriptionUI.js";
import { AudioTextSubmitter } from "./src/audioTextSubmitter.js";

/** Sets up event listners and initializes app when DOM content is fully loaded
 *  Code runs after HTML doc is fully loaded
 */ 

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  /** -----| SECTION INITIALIZATION |--
   * The code checks for specific HTML elements with data-task attributes and initializes corresponding app components
   * 
   * fOR EG: Handle Audio Only Section
   * Looks for an element with data-task="audio-only".
   * If found, creates an instance of AudioOnlyApp to handle this section.
   */
  
  const audioOnlySection = document.querySelector('[data-task="audio-only"]');
  if (audioOnlySection) {
    new AudioOnlyApp(audioOnlySection);
  }

  // Handle Audio + Text Section
  const audioTextSection = document.querySelector('[data-task="audio-text"]');
  if (audioTextSection) {
    console.log("component: audio-text");
    new AudioTextApp(audioTextSection);
  } else {
    console.error("Audio-text section not found in HTML!");
  }

  /*/ Handle audio practice section
  const audioPracticeSection = document.querySelector('[data-task="audio-practice"]');
  if (audioPracticeSection){
    new AudioPracticeApp(audioPracticeSection);
  }
  */

  console.log("App initialized");
});

// ---| APPLICATION CLASSES |----
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
    console.log('inside AudioTextApp constructor--')
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
      "submitAudioButton",
      "textInputForm",
      "/process-audio-text/",
      this.transcriptionUI
    );
  }
}

/*
class AudioPracticeApp {
  constructor(){
    const recorder = new AudioRecorder(
      "recordButton",
      "audioPlayback",
      "submitAudioButton"
    );

    const submitter = new AudioSubmitter(
      //
    )

  }

}
*/
