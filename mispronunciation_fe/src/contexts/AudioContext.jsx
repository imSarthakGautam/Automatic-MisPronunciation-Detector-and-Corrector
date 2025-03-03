import React, { createContext, useContext, useState } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [language, setLanguage] = useState('eng'); // Default to English
  const [model, setModel] = useState('wav2vec2'); // Default model

  const value = {
    isRecording,
    setIsRecording,
    audioFile,
    setAudioFile,
    transcription,
    setTranscription,
    language,
    setLanguage,
    model,
    setModel,
  };


  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudioContext must be used within AudioProvider');
  return context;
}