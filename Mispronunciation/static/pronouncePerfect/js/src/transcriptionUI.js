// transcriptionUI.js
export class TranscriptionUI {
  constructor(sectionId, textId, copyId, editId, removeId) {
    /**
     * DOM Elements initialization.
     */
    this.transcriptionSection = document.getElementById(sectionId);
    //text Section
    this.transcriptionText = document.getElementById(textId);
    //Action Buttons
    this.copyButton = document.getElementById(copyId);
    this.editButton = document.getElementById(editId);
    this.removeButton = document.getElementById(removeId);

    if (!this.transcriptionSection || !this.transcriptionText) {
      console.error("Error: Transcription elements not found.");
      return;
    }

    this.initEvents();
  }

  initEvents() {
    this.copyButton.addEventListener("click", () => this.copyText());
    this.editButton.addEventListener("click", () => this.toggleEdit());
    this.removeButton.addEventListener("click", () => this.removeText());
  }

  showTranscription(text) {
    this.transcriptionSection.hidden = false; // Make sure section is visible
    this.transcriptionSection.style.display = "block"; // or remove 'hidden' attribute
    this.transcriptionText.innerHTML = text;
  }

  copyText() {
    const plainText = this.transcriptionText.innerText; // Extract text without formatting
    navigator.clipboard.writeText(plainText).then(() => {
      alert("Copied to clipboard!");
    });
  }

  toggleEdit() {
    if (this.transcriptionText.isContentEditable) {
      this.transcriptionText.contentEditable = "false";
      this.editButton.textContent = "Edit";
    } else {
      this.transcriptionText.contentEditable = "true";
      this.transcriptionText.focus();
      this.editButton.textContent = "Copy";
      this.transcriptionText.innerHTML = this.transcriptionText.innerText;
    }
  }

  removeText() {
    this.transcriptionText.innerHTML = "Your transcription will appear here.";
    this.transcriptionSection.style.display = "none";
  }
}
