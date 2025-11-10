"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getGeminiResponse } from "@/lib/gemini";

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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
        className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-brand-blue rounded-full animate-ping opacity-20"></div>

          {/* Main button */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-pink rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
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

          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              Ada yang bisa dibantu?
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Chatbot Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-pink p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-brand-blue"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold">TanyaBKN</h3>
                <p className="text-white/80 text-xs">Asisten Virtual • Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
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
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </p>
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
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className={`px-4 py-2.5 rounded-full font-medium transition-all ${
                  inputValue.trim() && !isTyping
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
