"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getGeminiResponse } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AudioMessage from "@/components/AudioMessage";
import { createAudioRecorder, speechToText, textToSpeech, uploadAudio } from "@/lib/voice";

export default function TanyaBKN() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Halo! Saya TanyaBKN, asisten virtual yang siap membantu Anda. Apa yang bisa saya bantu hari ini?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const audioRecorderRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Don't render on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const quickReplies = [
    "Cara mendaftar CPNS",
    "Status verifikasi dokumen",
    "Jadwal ujian SKD",
    "Syarat pendaftaran",
    "Lupa password SSCASN",
  ];

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsProcessingVoice(true);
      const result = await audioRecorderRef.current.stop();
      setIsRecording(false);

      if (result.success && result.blob) {
        // Upload audio to storage
        const uploadResult = await uploadAudio(result.blob);

        if (!uploadResult.success) {
          console.error("Failed to upload audio:", uploadResult.error);
          setIsProcessingVoice(false);
          return;
        }

        // Transcribe audio
        const transcriptResult = await speechToText(result.blob);

        if (transcriptResult.success && transcriptResult.transcript) {
          // Add user voice message
          const userMessage = {
            id: messages.length + 1,
            type: "user",
            text: transcriptResult.transcript,
            audioUrl: uploadResult.url,
            isVoice: true,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, userMessage]);
          setIsProcessingVoice(false);

          // Process the transcript to get bot response
          await handleVoiceMessage(transcriptResult.transcript);
        } else {
          console.error("Failed to transcribe:", transcriptResult.error);
          setIsProcessingVoice(false);
        }
      }
    } else {
      // Start recording
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = createAudioRecorder();
      }

      const result = await audioRecorderRef.current.start();
      if (result.success) {
        setIsRecording(true);
      } else {
        alert("Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin akses mikrofon.");
      }
    }
  };

  const handleVoiceMessage = async (transcript) => {
    setIsTyping(true);

    // Add to conversation history
    const newHistory = [...conversationHistory, { role: "user", content: transcript }];
    setConversationHistory(newHistory);

    try {
      // Get text response from Gemini
      const result = await getGeminiResponse(transcript, newHistory);

      if (result.success && result.message) {
        // Generate voice response
        const ttsResult = await textToSpeech(result.message);

        // Add bot response with voice
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          text: result.message,
          audioUrl: ttsResult.success ? ttsResult.audioUrl : null,
          isVoice: ttsResult.success,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);

        // Update conversation history
        setConversationHistory([...newHistory, { role: "assistant", content: result.message }]);
      } else {
        throw new Error(result.error || "API returned error");
      }
    } catch (error) {
      console.error("Error processing voice message:", error);

      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Maaf, saya sedang mengalami kesulitan dalam memproses pertanyaan Anda. Silakan coba lagi.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Add to conversation history
    const newHistory = [...conversationHistory, { role: "user", content: text.trim() }];
    setConversationHistory(newHistory);

    try {
      // Call Gemini API
      const result = await getGeminiResponse(text.trim(), newHistory);

      if (result.success && result.message) {
        // Add bot response
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          text: result.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);

        // Update conversation history with bot response
        setConversationHistory([...newHistory, { role: "assistant", content: result.message }]);
      } else {
        // Error from API
        throw new Error(result.error || "API returned error");
      }
    } catch (error) {
      console.error("Error getting Gemini response:", error);

      // Fallback error message
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Maaf, saya sedang mengalami kesulitan dalam memproses pertanyaan Anda. Silakan coba lagi.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 group transition-all duration-300 ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#239DD7] via-cyan-500 to-[#DE1B5D] rounded-full animate-pulse opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-full animate-pulse opacity-20" style={{animationDelay: '1s'}}></div>

          {/* Main button */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-[#239DD7] to-cyan-500 rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 cursor-pointer border-2 border-white">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>

          {/* Notification badge with animation */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
            <span className="text-white text-xs font-bold">1</span>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:mb-6">
            <div className="bg-gradient-to-r from-[#239DD7] to-cyan-500 text-white text-sm px-4 py-2.5 rounded-xl whitespace-nowrap shadow-2xl font-semibold">
              Ada yang bisa dibantu?
              <div className="absolute top-full right-6 -mt-2">
                <div className="border-4 border-transparent border-t-cyan-500"></div>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Chatbot Window */}
      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#239DD7]/10">
          {/* Header - Gradient Background */}
          <div className="bg-gradient-to-r from-[#239DD7] via-cyan-500 to-[#DE1B5D] p-5 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/30 rounded-full blur-md"></div>
                <div className="relative w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H5.75A2.75 2.75 0 003 4.25v11.5A2.75 2.75 0 005.75 18.5h8.5a2.75 2.75 0 002.75-2.75V10M10.5 1.5v3.25a2.75 2.75 0 002.75 2.75h3.25m-6-6v6m-3-3h6" />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">TanyaBKN</h3>
                <p className="text-white/80 text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Asisten Virtual • Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="group text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-brand-blue to-brand-pink text-white"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100"
                  }`}
                >
                  {/* Voice Message */}
                  {message.isVoice && message.audioUrl ? (
                    <AudioMessage
                      audioUrl={message.audioUrl}
                      transcript={message.text}
                      isUser={message.type === "user"}
                      autoplay={message.type === "bot"}
                    />
                  ) : (
                    /* Text Message */
                    <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${
                      message.type === "user"
                        ? "prose-invert prose-p:text-white prose-strong:text-white prose-headings:text-white prose-li:text-white prose-a:text-white prose-ul:text-white prose-ol:text-white"
                        : "prose-gray prose-a:text-brand-blue hover:prose-a:text-brand-pink"
                    }`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                          ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 space-y-1" />,
                          ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 space-y-1" />,
                          li: ({node, ...props}) => <li {...props} className="ml-2" />
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-white/70"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Topik populer:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.slice(0, 3).map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(reply)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            {isProcessingVoice && (
              <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                <span>Memproses audio...</span>
              </div>
            )}
            <div className="flex gap-2">
              {/* Voice Recording Button */}
              <button
                onClick={handleVoiceRecord}
                disabled={isTyping || isProcessingVoice}
                className={`px-3 py-2.5 rounded-full font-medium transition-all ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${(isTyping || isProcessingVoice) ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isRecording ? "Stop recording" : "Start voice recording"}
              >
                {isRecording ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan Anda..."
                disabled={isRecording || isProcessingVoice}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping || isRecording || isProcessingVoice}
                className={`px-4 py-2.5 rounded-full font-medium transition-all ${
                  inputValue.trim() && !isTyping && !isRecording && !isProcessingVoice
                    ? "bg-gradient-to-r from-brand-blue to-brand-pink text-white hover:shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by SIVANA AI • v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
