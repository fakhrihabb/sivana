"use client";

import { useState, useRef, useEffect } from "react";
import { getGeminiResponse } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Halo! 👋 Saya adalah chatbot AI SIVANA. Ada yang bisa saya bantu tentang SIPASN?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter((msg) => msg.type === "user" || msg.type === "bot")
        .map((msg) => ({
          role: msg.type === "user" ? "user" : "bot",
          content: msg.content,
        }));

      // Get response from Gemini
      const response = await getGeminiResponse(
        inputValue,
        conversationHistory
      );

      if (response.success) {
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: messages.length + 2,
          type: "bot",
          content: `❌ ${response.error}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        content:
          "❌ Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Chat telah dihapus. Halo! 👋 Ada yang bisa saya bantu?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-brand-blue text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-110"
          title="Buka Chatbot"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2h-2.93l-1.286 1.071A1 1 0 008 14.25V12H4a2 2 0 01-2-2V5z" />
              <path d="M15 13l.447.894.894.447.447-.894.894-.447-.447-.894-.894-.447-.447.894z" />
            </svg>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col z-40 h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-pink text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold">SIVANA Chatbot 🤖</h3>
              <p className="text-xs text-blue-100">Powered by Gemini AI</p>
            </div>
            <button
              onClick={clearChat}
              className="text-white hover:text-blue-200 transition-all"
              title="Clear chat"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === "user"
                      ? "bg-brand-blue text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                  }`}
                >
                  <div className={`text-sm prose prose-sm max-w-none ${
                    msg.type === "user"
                      ? "prose-invert prose-p:text-white prose-strong:text-white prose-headings:text-white prose-li:text-white prose-a:text-white"
                      : "prose-gray"
                  }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 rounded-lg rounded-bl-none border border-gray-200 px-4 py-2">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-3 flex gap-2 bg-white rounded-b-2xl"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tanya sesuatu..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-brand-blue text-white p-2 rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.353-1.956.353 3.507a1 1 0 001.967 0l.353-3.507 5.353 1.956a1 1 0 001.169-1.409l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
