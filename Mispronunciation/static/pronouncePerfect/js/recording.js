document.addEventListener("DOMContentLoaded", function () {
    let mediaRecorder;
    let audioBlob = null;

    const recordButton = document.getElementById("recordButton");
    const audioPlayback = document.getElementById("audioPlayback");
    const submitButton = document.getElementById("submitAudioButton");

    if (!recordButton || !submitButton) {
        console.error("Error: Required buttons not found in the DOM");
        return;
    }

    function enableSubmitButton() {
        submitButton.classList.add("enabled");
        submitButton.disabled = false;
    }

    function disableSubmitButton() {
        submitButton.classList.remove("enabled");
        submitButton.disabled = true;
    }

    recordButton.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            console.log("Starting recording...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            recordButton.textContent = "Stop Speaking";
            recordButton.classList.add("recording");

            let chunks = [];
            mediaRecorder.ondataavailable = event => chunks.push(event.data);

            mediaRecorder.onstop = () => {
                console.log("Recording stopped.");
                audioBlob = new Blob(chunks, { type: "audio/webm" });
                const audioURL = URL.createObjectURL(audioBlob);

                audioPlayback.src = audioURL;
                audioPlayback.hidden = false;
                audioPlayback.controls = true;

                enableSubmitButton();
            };
        } else {
            console.log("Stopping recording...");
            mediaRecorder.stop();
            recordButton.textContent = "Start Speaking";
            recordButton.classList.remove("recording");
        }
    });

    window.getAudioBlob = () => audioBlob; // Expose to other scripts
});
