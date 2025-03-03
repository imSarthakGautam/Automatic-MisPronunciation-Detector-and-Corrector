import React from "react";
import CheckPronunciation from "../components/CheckPronunciations";
import Transcription from "../components/Transcription";
import { useAudioContext } from "../contexts/AudioContext";

function CheckPronunciations() {
  const { transcription } = useAudioContext();
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Check your Pronunciations</h2>
      {transcription && <Transcription />}
      <CheckPronunciation />
    </div>
  );
}

export default CheckPronunciations;
