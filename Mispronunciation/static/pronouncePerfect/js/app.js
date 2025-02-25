import { AudioRecorder } from "./src/audioRecorder.js";
import { AudioSubmitter } from "./src/audioSubmitter.js";
import { TranscriptionUI } from "./src/transcriptionUI.js";
import { AudioTextSubmitter } from "./src/audioTextSubmitter.js";

/** Sets up event listeners and initializes the app when DOM content is fully loaded
 *  Code runs after the HTML document is fully loaded
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
   * For example: Handle Audio Only Section
   * Looks for an element with data-task="audio-only".
   * If found, creates an instance of AudioOnlyApp to handle this section.
   */

  // Handle Audio Only Section
  const audioOnlySection = document.querySelector('[data-task="audio-only"]');
  if (audioOnlySection) {
    new AudioOnlyApp(audioOnlySection);
  } else {
    console.error("Audio-only section not found in HTML!");
  }

  // Handle Audio + Text Section
  const audioTextSection = document.querySelector('[data-task="audio-text"]');
  if (audioTextSection) {
    console.log("component: audio-text");
    new AudioTextApp(audioTextSection);
  } else {
    console.error("Audio-text section not found in HTML!");
  }

  // Handle Audio Practice Section
  const audioPracticeSection = document.querySelector(
    '[data-task="audio-practice"]'
  );
  if (audioPracticeSection) {
    console.log("component: audio-practice");
    new AudioPracticeApp(audioPracticeSection);
  } else {
    console.error("Audio-practice section not found in HTML!");
  }

  console.log("App initialized");
});

// ---| APPLICATION CLASSES |----
class AudioOnlyApp {
  constructor(parentElement) {
    const recorder = new AudioRecorder(
      this.getElementId(parentElement, "recordButton"),
      this.getElementId(parentElement, "audioPlayback"),
      this.getElementId(parentElement, "submitAudioOnlyButton"),
      parentElement
    );

    const transcriptionUI = new TranscriptionUI(
      this.getElementId(parentElement, "audioOnlyTranscriptionSection"),
      this.getElementId(parentElement, "audioOnlyTranscriptionText"),
      this.getElementId(parentElement, "audioOnlyCopyTranscription"),
      this.getElementId(parentElement, "audioOnlyEditTranscription"),
      this.getElementId(parentElement, "audioOnlyRemoveTranscription"),
      parentElement
    );

    const submitter = new AudioSubmitter(
      this.getElementId(parentElement, "audioUpload"),
      this.getElementId(parentElement, "submitAudioOnlyButton"),
      "/process-audio/",
      transcriptionUI,
      parentElement
    );

    console.log("Audio Only App initialized!");
  }

  getElementId(parentElement, id) {
    const element = parentElement.querySelector(`#${id}`);
    if (!element) {
      console.error(`Element with ID '${id}' not found within parent element.`);
      return null;
    }
    return id; // Return the ID for use in constructors
  }
}

class AudioTextApp {
  constructor(parentElement) {
    console.log("inside AudioTextApp constructor--");
    this.recorder = new AudioRecorder(
      this.getElementId(parentElement, "recordButton"),
      this.getElementId(parentElement, "audioPlayback"),
      this.getElementId(parentElement, "submitAudioTextButton"),
      parentElement
    );

    this.transcriptionUI = new TranscriptionUI(
      this.getElementId(parentElement, "audioTextTranscriptionSection"),
      this.getElementId(parentElement, "audioTextTranscriptionText"),
      this.getElementId(parentElement, "audioTextCopyTranscription"),
      this.getElementId(parentElement, "audioTextEditTranscription"),
      this.getElementId(parentElement, "audioTextRemoveTranscription"),
      parentElement
    );

    this.submitter = new AudioTextSubmitter(
      this.getElementId(parentElement, "submitAudioTextButton"),
      this.getElementId(parentElement, "textInputForm"),
      "/process-audio-text/",
      this.transcriptionUI,
      false,
      parentElement
    );

    console.log("Audio_text App initialized!");
  }

  getElementId(parentElement, id) {
    const element = parentElement.querySelector(`#${id}`);
    if (!element) {
      console.error(`Element with ID '${id}' not found within parent element.`);
      return null;
    }
    return id; // Return the ID for use in constructors
  }
}

class AudioPracticeApp {
  constructor(parentElement) {
    console.log("inside AudioPracticeApp constructor--");
    this.recorder = new AudioRecorder(
      this.getElementId(parentElement, "practiceRecordButton"),
      this.getElementId(parentElement, "practiceAudioPlayback"),
      this.getElementId(parentElement, "practiceSubmitButton"),
      parentElement
    );

    this.transcriptionUI = new TranscriptionUI(
      this.getElementId(parentElement, "practiceTranscriptionSection"),
      this.getElementId(parentElement, "practiceTranscriptionText"),
      this.getElementId(parentElement, "practiceCopyTranscription"),
      this.getElementId(parentElement, "practiceEditTranscription"),
      this.getElementId(parentElement, "practiceRemoveTranscription"),
      parentElement
    );

    this.submitter = new AudioTextSubmitter(
      this.getElementId(parentElement, "practiceSubmitButton"),
      this.getElementId(parentElement, "practiceSampleSelector"),
      "/process-audio-text/",
      this.transcriptionUI,
      true, // Indicate it's for practice
      parentElement
    );

    this.fetchPracticeSamples(parentElement);
    this.practiceTextInput = parentElement.querySelector("#practiceTextInput");
  }

  getElementId(parentElement, id) {
    const element = parentElement.querySelector(`#${id}`);
    if (!element) {
      console.error(`Element with ID '${id}' not found within parent element.`);
      return null;
    }
    return id; // Return the ID for use in constructors
  }

  async fetchPracticeSamples(parentElement) {
    const csrfToken = this.getCSRFToken();
    const sampleSelector = parentElement.querySelector(
      "#practiceSampleSelector"
    );

    try {
      const response = await fetch("/get-practice-samples/", {
        method: "GET",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      const samples = await response.json();

      if (sampleSelector) {
        // Clear existing options (except the default)
        const defaultOption = sampleSelector.querySelector('option[value=""]');
        sampleSelector.innerHTML = defaultOption
          ? defaultOption.outerHTML
          : '<option value="" disabled selected>Select a sample...</option>';

        // Populate with database samples
        samples.forEach((sample) => {
          const option = document.createElement("option");
          option.value = sample.text; // Full text for submission
          option.textContent = sample.title || sample.text.slice(0, 20) + "..."; // Use title or truncate text for display
          option.dataset.id = sample.id; // Optionally store ID for future use
          sampleSelector.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error fetching practice samples:", error);
    }
  }

  getCSRFToken() {
    const csrfElement = document.querySelector("[name=csrfmiddlewaretoken]");
    if (!csrfElement) {
      console.error("CSRF token element not found.");
      return "";
    }
    return csrfElement.value;
  }
}
