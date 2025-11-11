"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AudioMessage({ audioUrl, transcript, isUser = false, autoplay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Autoplay when audio is loaded (for bot responses)
  useEffect(() => {
    if (autoplay && audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.log("Autoplay prevented by browser:", error);
          // Browser prevented autoplay - user needs to click play
        }
      };

      // Wait for metadata to load before playing
      if (audioRef.current.readyState >= 2) {
        playAudio();
      } else {
        audioRef.current.addEventListener("loadeddata", playAudio, { once: true });
      }
    }
  }, [autoplay]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="space-y-2">
      {/* Audio Player */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isUser
              ? "bg-white/20 hover:bg-white/30"
              : "bg-brand-blue/10 hover:bg-brand-blue/20"
          }`}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm8 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>

        {/* Waveform / Progress Bar */}
        <div className="flex-1 space-y-1">
          <div
            onClick={handleSeek}
            className="h-1 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all ${
                isUser ? "bg-white" : "bg-brand-blue"
              }`}
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Download Button */}
        <a
          href={audioUrl}
          download
          className={`flex-shrink-0 p-2 rounded-full transition-all ${
            isUser
              ? "hover:bg-white/20"
              : "hover:bg-brand-blue/10"
          }`}
          title="Download audio"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Transcript Toggle */}
      {transcript && (
        <div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`flex items-center gap-2 text-xs transition-all ${
              isUser
                ? "text-white/80 hover:text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <svg
              className={`w-3 h-3 transition-transform ${showTranscript ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{showTranscript ? "Sembunyikan" : "Lihat"} transkrip</span>
          </button>

          {/* Collapsible Transcript */}
          {showTranscript && (
            <div
              className={`mt-2 p-3 rounded-lg text-xs leading-relaxed prose prose-xs max-w-none ${
                isUser
                  ? "bg-white/10 text-white/90 prose-invert prose-p:text-white/90 prose-strong:text-white prose-headings:text-white prose-li:text-white prose-a:text-white prose-ul:text-white prose-ol:text-white"
                  : "bg-gray-50 text-gray-700 prose-gray prose-a:text-brand-blue hover:prose-a:text-brand-pink"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                  ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 space-y-1" />,
                  ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 space-y-1" />,
                  li: ({node, ...props}) => <li {...props} className="ml-2" />
                }}
              >
                {transcript}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
