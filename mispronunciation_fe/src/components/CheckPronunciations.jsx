import React, { useState, useEffect } from "react";
import AudioRecorder from "./AudioRecorder";
import SubmitButton from "./SubmitButton";
import { useAudioContext } from "../contexts/AudioContext";
import { getCSRFToken } from "../utils/csrf";

function CheckPronunciation() {
  const {
    audioFile,
    isRecording,
    setAudioFile,
    setTranscription,
    language,
    model,
  } = useAudioContext();
  const [textToSpeak, setTextToSpeak] = useState(""); // Text for comparison
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleTextChange = (e) => {
    setTextToSpeak(e.target.value);
  };

  useEffect(() => {
    fetch(`/api/csrf-token/`, { credentials: "include" })
      .then((response) => response.json())
      .catch((err) => console.error("Error fetching CSRF:", err));
  }, []);

  const handleSubmit = async () => {
    if (!audioFile || !textToSpeak) {
      setError("Please record audio and enter text to speak.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("text", textToSpeak); // Text for comparison
      formData.append("language", language); // Include language
      formData.append("model", model); // Include model

      const csrfToken = getCSRFToken();
      if (!csrfToken) {
        console.error("CSRF token not found. Please ensure the cookie is set.");
        setTranscription(
          "Error: CSRF token missing. Please refresh and try again."
        );
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/process-audio-text/`, {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies (necessary for CSRF)
        headers: {
          "X-CSRFToken": csrfToken, // Add CSRF token
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Response received:", result);

        if (result.result && Array.isArray(result.result)) {
          const formattedTranscription = result.result
            .map(([word, status]) => {
              const color = status === "correct" ? "green" : "red";
              return `<span style="color: ${color}; font-weight: bold;">${word}</span>`;
            })
            .join(" ");
          setTranscription(formattedTranscription);
        } else {
          console.error("Invalid result format:", result);
          setError("Invalid response from server.");
        }
      } else {
        console.error("Server error:", response.status);
        setError("Server error. Please try again.");
      }
    } catch (error) {
      console.error("Error while submitting audio and text:", error);
      setError("Error submitting request. Check console for details.");
    } finally {
      setIsSubmitting(false);
      setAudioFile(null); // Reset after submission
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#EFE9E1] rounded-lg shadow-[0_2px_8px_rgba(115,161,178,0.2)] space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Check Pronunciations</h2>
      <div className="space-y-4">
        <textarea
          value={textToSpeak}
          onChange={handleTextChange}
          placeholder="Type your text to speak here..."
          className="w-full p-3 border border-[#D0D5CE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73A1B2]"
          rows="3"
          aria-label="Enter text for pronunciation check"
        />
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
          <AudioRecorder />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <SubmitButton
        onSubmit={handleSubmit}
        disabled={!audioFile || isRecording || !textToSpeak || isSubmitting}
        isLoading={isSubmitting}
        className="w-48 mx-auto"
      />
    </div>
  );
}

export default CheckPronunciation;
