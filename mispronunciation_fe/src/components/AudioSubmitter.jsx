import React, { useState } from 'react';
import { useAudioContext } from '../contexts/AudioContext';
import { Upload } from 'lucide-react';

function AudioSubmitter() {
  const { setAudioFile } = useAudioContext();
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setFileName(file.name);
      setAudioFile(file);
      setError(null);
    } else {
      setError('Please select an audio file (MP3, WAV, etc.).');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setFileName(file.name);
      setAudioFile(file);
      setError(null);
    } else {
      setError('Please drop an audio file (MP3, WAV, etc.).');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`relative p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${
        isDragging
          ? 'border-[#73A1B2] bg-[#EFE9E1] shadow-lg'
          : 'border-[#D0D5CE] bg-[#EFE9E1] hover:border-[#73A1B2] hover:shadow-md'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        id="audio-upload"
        aria-label="Upload audio file"
      />
      <label
        htmlFor="audio-upload"
        className="flex flex-col items-center justify-center space-y-2 cursor-pointer text-gray-700"
      >
        <Upload className="w-8 h-8 text-[#73A1B2]" />
        <span className="text-sm font-medium">Upload Audio</span>
        <p className="text-xs text-gray-500">Click to select an audio file</p>
      </label>
      {fileName && (
        <p className="mt-2 text-sm text-gray-700">Selected: {fileName}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export default AudioSubmitter;