import React from "react";
import Transcription from "../components/Transcription";
import { useAudioContext } from "../contexts/AudioContext";
import PracticeOnSample from "../components/practiceOnSample";

function PracticeOnSamples() {
  const { transcription } = useAudioContext();
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl  text-center font-bold">Practice Session</h2>
      {transcription && <Transcription />}
      <PracticeOnSample />
    </div>
  );
}

export default PracticeOnSamples;
