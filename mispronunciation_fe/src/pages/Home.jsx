import React from "react";
import SubmitOrUploadAudio from "../components/SubmitOrUploadAudio";
import Transcription from "../components/Transcription";
import { useAudioContext } from "../contexts/AudioContext";


function Home() {
  const {transcription}= useAudioContext();
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Mispronunciation Detector</h2>
      {transcription && <Transcription />}
      <SubmitOrUploadAudio />
    </div>
  );
}

export default Home;
