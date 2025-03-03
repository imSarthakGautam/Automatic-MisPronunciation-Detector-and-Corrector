import React, { useState, useEffect } from "react";
import { useAudioContext } from "../contexts/AudioContext";
import { Copy, FilePenLine, Save, X } from "lucide-react";

const Transcription = () => {
  const { transcription, setTranscription } = useAudioContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcription || "");
  // console.log("Transcription component rendered with:", transcription);

  useEffect(() => {
    setEditedText(transcription || "");
  }, [transcription]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText.replace(/<[^>]+>/g, ""));
    alert("Copied to clipboard!");
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    if (!isEditing && editedText !== transcription) {
      setTranscription(editedText);
    }
  };

  const handleRemove = () => {
    setTranscription(null);
  };

  if (!transcription) {
    // console.log("No transcription available, rendering null");
    return null;
  }

  const isError = transcription?.startsWith("Error processing transcription:");
  // console.log("Is transcription an error?", isError);

  const isHtml = transcription?.includes("<"); // Check if transcription contains HTML
  // console.log("Is transcription HTML?", isHtml);

  const displayText = isError ? transcription : transcription;
  // console.log("Display text to render:", displayText);

  return (
    <div className="p-4 pb-0.5 bg-[#EFE9E1] rounded-lg shadow-[0_2px_8px_rgba(115,161,178,0.2)] max-w-4xl mx-auto mb-6 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {" "}
          Generated Transcription
        </h2>
        <div className="space-x-2">
          <button
            onClick={handleCopy}
            className="bg-[#D0D5CE] text-gray-800 px-3 py-1 rounded-lg hover:bg-[#6E8658] hover:text-white"
          >
            <Copy />
          </button>
          <button
            onClick={handleEditToggle}
            className="bg-[#D0D5CE] text-gray-800 px-3 py-1 rounded-lg hover:bg-[#6E8658] hover:text-white"
          >
            {isEditing ? <Save /> : <FilePenLine />}
          </button>
          <button
            onClick={handleRemove}
            className="bg-[#D0D5CE] text-gray-800 px-3 py-1 rounded-lg hover:bg-[#6E8658] hover:text-white"
          >
            <X />
          </button>
        </div>
      </div>
      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-3 border border-[#D0D5CE] rounded-lg bg-[#EFE9E1] focus:outline-none focus:ring-2 focus:ring-[#73A1B2] resize-y"
          rows="4"
        />
      ) : isError ? (
        <div className="p-4 bg-[#EFE9E1] rounded-lg shadow-sm mb-6">
          <p className="p-4 text-sm text-red-500 bg-white rounded-lg border border-[#D0D5CE]">
            {displayText}
          </p>
        </div>
      ) : isHtml ? (
        <div className="p-1 bg-[#EFE9E1] rounded-lg shadow-sm mb-6">
          <div
            className="p-8 text-lg font-semibold bg-white rounded-lg border border-[#D0D5CE] transition-opacity duration-300"
            dangerouslySetInnerHTML={{ __html: displayText }}
            role="log"
            aria-live="polite"
          />
        </div>
      ) : (
        <p className="p-4 text-gray-800 bg-[#EFE9E1] rounded-lg border border-[#D0D5CE]">
          {displayText}
        </p>
      )}
    </div>
  );
};

export default Transcription;
