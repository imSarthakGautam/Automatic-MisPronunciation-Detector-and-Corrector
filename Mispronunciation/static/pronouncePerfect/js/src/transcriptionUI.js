export class TranscriptionUI {
  /**
   * Initializes the TranscriptionUI with scoped DOM elements.
   * @param {string} sectionId - The ID of the transcription section element (e.g., "practiceTranscriptionSection").
   * @param {string} textId - The ID of the transcription text element (e.g., "practiceTranscriptionText").
   * @param {string} copyId - The ID of the copy button (e.g., "practiceCopyTranscription").
   * @param {string} editId - The ID of the edit button (e.g., "practiceEditTranscription").
   * @param {string} removeId - The ID of the remove button (e.g., "practiceRemoveTranscription").
   * @param {HTMLElement} parentElement - The parent element (e.g., [data-task="audio-practice"]) to scope queries within.
   */
  constructor(
    sectionId,
    textId,
    copyId,
    editId,
    removeId,
    parentElement = document
  ) {
    /**
     * Scope DOM queries within the parent element.
     */
    this.transcriptionSection = parentElement.querySelector(`#${sectionId}`);
    this.transcriptionText = parentElement.querySelector(`#${textId}`);
    this.copyButton = parentElement.querySelector(`#${copyId}`);
    this.editButton = parentElement.querySelector(`#${editId}`);
    this.removeButton = parentElement.querySelector(`#${removeId}`);

    // Detailed error logging for missing elements
    if (!this.transcriptionSection)
      console.error(`Transcription section not found: ${sectionId}`);
    if (!this.transcriptionText)
      console.error(`Transcription text not found: ${textId}`);
    if (!this.copyButton) console.error(`Copy button not found: ${copyId}`);
    if (!this.editButton) console.error(`Edit button not found: ${editId}`);
    if (!this.removeButton)
      console.error(`Remove button not found: ${removeId}`);

    // Check if critical elements exist before proceeding
    if (
      !this.transcriptionSection ||
      !this.transcriptionText ||
      !this.copyButton ||
      !this.editButton ||
      !this.removeButton
    ) {
      console.error("Error: Required transcription elements not found.");
      return; // Exit early if any critical element is missing
    }

    this.initEvents();
  }

  initEvents() {
    // Add event listeners with null checks to prevent errors
    if (this.copyButton)
      this.copyButton.addEventListener("click", () => this.copyText());
    if (this.editButton)
      this.editButton.addEventListener("click", () => this.toggleEdit());
    if (this.removeButton)
      this.removeButton.addEventListener("click", () => this.removeText());
  }

  /**
   * Displays the transcription text and shows the section.
   * @param {string} text - The transcription text to display.
   */
  showTranscription(text) {
    if (this.transcriptionText && this.transcriptionSection) {
      this.transcriptionSection.hidden = false; // Make sure section is visible
      this.transcriptionSection.style.display = "block"; // Ensure visibility
      this.transcriptionText.innerHTML = text;
    } else {
      console.error(
        "Cannot show transcription: Text or section element not found."
      );
    }
  }

  /**
   * Copies the transcription text to the clipboard.
   */
  copyText() {
    if (this.transcriptionText) {
      const plainText = this.transcriptionText.innerText; // Extract text without formatting
      navigator.clipboard
        .writeText(plainText)
        .then(() => {
          alert("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy to clipboard:", err);
        });
    } else {
      console.error("Cannot copy text: Transcription text element not found.");
    }
  }

  /**
   * Toggles the edit state of the transcription text.
   */
  toggleEdit() {
    if (this.transcriptionText && this.editButton) {
      if (this.transcriptionText.isContentEditable) {
        this.transcriptionText.contentEditable = "false";
        this.editButton.textContent = "[Edit]";
      } else {
        this.transcriptionText.contentEditable = "true";
        this.transcriptionText.focus();
        this.editButton.textContent = "[Copy]";
        this.transcriptionText.innerHTML = this.transcriptionText.innerText;
      }
    } else {
      console.error(
        "Cannot toggle edit: Transcription text or edit button not found."
      );
    }
  }

  /**
   * Removes the transcription text and hides the section.
   */
  removeText() {
    if (this.transcriptionText && this.transcriptionSection) {
      this.transcriptionText.innerHTML = "Your transcription will appear here.";
      this.transcriptionSection.style.display = "none";
    } else {
      console.error(
        "Cannot remove text: Transcription text or section not found."
      );
    }
  }
}
