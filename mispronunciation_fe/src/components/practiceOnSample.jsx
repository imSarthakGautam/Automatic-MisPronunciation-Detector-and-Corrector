import React, { useState, useEffect } from "react";
import AudioRecorder from "./AudioRecorder";
import SubmitButton from "./SubmitButton";
import { useAudioContext } from "../contexts/AudioContext";
import { getCSRFToken } from "../utils/csrf";

function PracticeOnSample() {
  const {
    audioFile,
    isRecording,
    setAudioFile,
    setTranscription,
    language,
    model,
  } = useAudioContext();
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [textToSpeak, setTextToSpeak] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch samples on mount or language change, pre-select first sample
  useEffect(() => {
    async function fetchPracticeSamples() {
      try {
        const response = await fetch(`/api/get-practice-samples/`, {
          method: "GET",
          headers: { "X-CSRFToken": getCSRFToken() },
        });
        if (response.ok) {
          const data = await response.json();
          const fetchedSamples = data.samples || [];
          setSamples(fetchedSamples);
          // Pre-select the first sample if available
          if (fetchedSamples.length > 0) {
            setSelectedSample(fetchedSamples[0]);
            setTextToSpeak(fetchedSamples[0].text);
          }
        } else {
          setError("Failed to fetch samples.");
        }
      } catch (err) {
        setError("Network error while fetching samples.");
      }
    }
    fetchPracticeSamples();
  }, [language]);

  // Handle sample selection
  const handleSampleSelect = (e) => {
    const sampleId = e.target.value;
    const sample = samples.find((s) => s.id === parseInt(sampleId)) || null;
    setSelectedSample(sample);
    setTextToSpeak(sample?.text || "");
    setAudioFile(null);
    setTranscription(null);
  };

  // Handle text adjustment
  const handleTextChange = (e) => setTextToSpeak(e.target.value);

  // Handle form submission
  const handleSubmit = async () => {
    if (!audioFile || !selectedSample) {
      setError("Please record audio and select a sample.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("text", textToSpeak || selectedSample.text);
      formData.append("language", language);
      formData.append("model", model);

      const response = await fetch("/api/process-audio-text/", {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": getCSRFToken() },
      });

      if (response.ok) {
        const result = await response.json();
        const formattedTranscription =
          result.result
            ?.map(([word, status]) => {
              const color = status === "correct" ? "green" : "red";
              return `<span style="color: ${color}">${word}</span>`;
            })
            .join(" ") || "No transcription available";
        setTranscription(formattedTranscription);
      } else {
        setError("Submission failed.");
      }
    } catch (err) {
      setError("Error during submission.");
    } finally {
      setIsSubmitting(false);
      setAudioFile(null);
    }
  };

  // Reset the interface
  const handleReset = () => {
    setSelectedSample(null);
    setTextToSpeak("");
    setAudioFile(null);
    setTranscription(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#EFE9E1] rounded-lg shadow-md">
      

      
        

        {/* Dropdown Selector */}
        <div className="mb-4 pl-1">
          <label className="block text-lg font-bold  text-gray-800 mb-2">
            Select a Sample to Practice
          </label>
          <select
            value={selectedSample?.id || ""}
            onChange={handleSampleSelect}
            className="w-2/3 justify-center align-middle  border border-[#73A1B2] rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#73A1B2] transition-all duration-300"
          >
            <option value="" disabled>
              Select a sample...
            </option>
            {samples.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.title}
              </option>
            ))}
          </select>
        

       
      </div>

      {/* Audio & Submission Controls */}
      <div className="space-y-4">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            Selected Sample
          </h4>
         
          <textarea
            value={textToSpeak}
            onChange={handleTextChange}
            placeholder="Adjust text to practice (optional)..."
            className="w-full p-3 border bg-white border-[#D0D5CE] rounded-lg  focus:outline-none focus:ring-2 focus:ring-[#73A1B2] resize-y min-h-[100px]"
            aria-label="Adjust practice text"
          />
        </div>
        <div className="p-4 bg-[#EFE9E1] rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
          <AudioRecorder />
        </div>
        </div>
        
        {audioFile && !isRecording && (
          <audio controls className="mt-4 w-64 mx-auto">
            <source src={URL.createObjectURL(audioFile)} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        )}
        <SubmitButton
          onSubmit={handleSubmit}
          disabled={!audioFile || isRecording || isSubmitting}
          isLoading={isSubmitting}
          className="w-full py-3 bg-[#73A1B2] text-white rounded-md hover:bg-[#588798] disabled:bg-gray-400 transition-all duration-300"
        />
        <button
          onClick={handleReset}
          className="w-full py-3 bg-[#D0D5CE] text-gray-800 rounded-md hover:bg-[#6E8658] hover:text-white focus:ring-2 focus:ring-[#73A1B2] transition-all duration-300"
          aria-label="Reset practice session"
        >
          Reset
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

     
    </div>
  );
}

export default PracticeOnSample;