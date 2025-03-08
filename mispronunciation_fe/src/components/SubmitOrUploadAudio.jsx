import React from "react";
import AudioRecorder from "./AudioRecorder";
import AudioSubmitter from "./AudioSubmitter";
import SubmitButton from "./SubmitButton";
import { useAudioContext } from "../contexts/AudioContext";
import { useState, useEffect } from "react";
import { getCSRFToken } from "../utils/csrf"; // Import the utility

function SubmitOrUploadAudio() {
  const {
    audioFile,
    isRecording,
    setTranscription,
    language,
    model,
    setAudioFile,
  } = useAudioContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch(`/api/csrf-token/`, { credentials: "include" })
      .then((response) => {
        // Log the response status
        console.log("Response Status:", response.status);

        // Convert response to JSON and log the actual content
        return response.json();
      })
      .then((data) => {
        console.log("CSRF Token Data:", data); // Log the data received from the server
      })
      .catch((err) => console.error("Error fetching CSRF:", err));
  }, []);

  const handleSubmit = async () => {
    if (!audioFile) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("language", language); // Include language
      formData.append("model", model); // Include model

      const csrfToken = getCSRFToken(); // Get the CSRF token from the cookie
      console.log("csrf token:", csrfToken);
      if (!csrfToken) {
        console.error("CSRF token not found. Please ensure the cookie is set.");
        setTranscription(
          "Error: CSRF token missing. Please refresh and try again."
        );
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/process-audio/`, {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies (necessary for CSRF)
        headers: {
          "X-CSRFToken": csrfToken, // Add CSRF token
        },
      });
      if (!response.ok) {
        const errorText = await response.text(); // Get error details
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log(
        "Backend response:",
        result,
        "result.transcription--",
        result.transcription
      );

      if (result.transcription) {
        setTranscription(result.transcription); // here state should update with re-render
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        throw new Error(
          "Invalid response format: No transcription or error provided."
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      setTranscription("Error processing transcription. Please try again.");
    } finally {
      setIsSubmitting(false);
      setAudioFile(null); // Reset after submission
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#EFE9E1] rounded-lg shadow-[0_2px_8px_rgba(115,161,178,0.2)] space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-800">
        Speak or Upload Audio
      </h2>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
        <AudioRecorder />
        <AudioSubmitter />
      </div>
      {audioFile && !isRecording && (
        <audio controls className="mt-4 w-64 mx-auto">
          <source src={URL.createObjectURL(audioFile)} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      <SubmitButton
        onSubmit={handleSubmit}
        disabled={!audioFile || isRecording}
        isLoading={isSubmitting}
        className="w-48 mx-auto"
      />
    </div>
  );
}

export default SubmitOrUploadAudio;
