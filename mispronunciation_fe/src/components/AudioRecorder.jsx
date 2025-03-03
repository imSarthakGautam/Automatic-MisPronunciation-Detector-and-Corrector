import React, { useRef, useEffect, useState } from "react";
import { useAudioContext } from "../contexts/AudioContext";
import { Mic } from "lucide-react";

function AudioRecorder() {
  const { isRecording, setIsRecording, setAudioFile } = useAudioContext();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const startTimeRef = useRef(null);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Microphone not supported by this browser.");
        return;
      }

      // Stop any existing recording if accidentally triggered
      if (mediaRecorderRef.current && isRecording) {
        stopRecording();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioFile(audioBlob);
        audioChunksRef.current = [];
      };

      // Reset recording time
      setRecordingTime(0);

      // Set start time reference
      startTimeRef.current = Date.now();

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      alert(
        "Unable to access microphone. Please check permissions or ensure HTTPS is enabled."
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      startTimeRef.current = null;
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Use effect to update the timer
  useEffect(() => {
    let timerInterval = null;

    if (isRecording && startTimeRef.current) {
      // Create an interval to update the timer every second
      timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        setRecordingTime(elapsedSeconds);
      }, 1000);
    }

    // Cleanup function to clear the interval
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isRecording]);

  // Component cleanup
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-4 mt-2 rounded-full text-white ${
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-[#73A1B2] hover:bg-[#588798]"
        } focus:outline-none focus:ring-2 focus:ring-[#73A1B2]`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        <Mic className="w-8 h-8" />
      </button>
      {!isRecording && (
        <>
          <span className="text-sm font-medium text-gray-700">Speak Here</span>
          <p className="text-xs text-gray-500">Click to start recording</p>
        </>
      )}
      {isRecording && (
        <div className="flex flex-col items-center">
          <span className="text-gray-600 text-sm">Recording...</span>
          <span className="text-gray-800 font-medium text-base mt-1">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
