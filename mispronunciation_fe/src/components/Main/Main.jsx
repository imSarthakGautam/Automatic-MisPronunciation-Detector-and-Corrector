import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Transcription from '../Transcription';

const Main = () => {
  const [transcription, setTranscription] = useState(null); // Manage transcription state here

  // Function to update transcription (passed to child components)
  const handleTranscriptionReceived = (newTranscription) => {
    setTranscription(newTranscription);
  };

  return (
    <main className="p-6 flex-1 max-w-4xl mx-auto">
      {/* Transcription at the top, only when available */}
      {transcription && <Transcription text={transcription} />}
      
      {/* Render the current page (Home, CheckPronunciations, etc.) */}
      <Outlet context={{ setTranscription: handleTranscriptionReceived }} />
    </main>
  );
};

export default Main;