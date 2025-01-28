document.addEventListener("DOMContentLoaded", function () {
    const transcriptionSection = document.getElementById("transcriptionSection");
    const transcriptionText = document.getElementById("transcriptionText");
    const copyButton = document.getElementById("copyTranscription");
    const editButton = document.getElementById("editTranscription");
    const removeButton = document.getElementById("removeTranscription");

    function handleAudioSubmissionResponse(response) {
        if (!transcriptionSection || !transcriptionText) {
            console.error("Error: Transcription elements not found");
            return;
        }

        if (response.success) {
            transcriptionText.textContent = response.success;
            transcriptionSection.hidden = false;
            transcriptionSection.style.display = "block";
        } else if (response.error) {
            transcriptionText.textContent = "Error: " + response.error;
            transcriptionSection.hidden = false;
            transcriptionSection.style.display = "block";
        }
    }

    // Copy Transcription Text
    copyButton.addEventListener("click", function () {
        navigator.clipboard.writeText(transcriptionText.textContent).then(() => {
            alert("Copied to clipboard!");
        }).catch(err => console.error("Copy failed:", err));
    });

    // Edit Transcription Text
    editButton.addEventListener("click", function () {
        if (transcriptionText.isContentEditable) {
            transcriptionText.contentEditable = "false";
            editButton.textContent = "✏️"; // Change icon back
        } else {
            transcriptionText.contentEditable = "true";
            editButton.textContent = "💾"; // Change icon to save
        }
    });

    // Remove Transcription Text
    removeButton.addEventListener("click", function () {
        transcriptionText.textContent = "Your transcription will appear here.";
        transcriptionSection.style.display = "none";
    });
});
