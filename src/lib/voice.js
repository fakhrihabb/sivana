import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Convert speech to text using Google Cloud Speech-to-Text
 * @param {Blob} audioBlob - The audio blob to transcribe
 * @param {string} languageCode - Language code (default: id-ID for Indonesian)
 * @returns {Promise<Object>} - { success, transcript, confidence }
 */
export async function speechToText(audioBlob, languageCode = "id-ID") {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("languageCode", languageCode);

    const response = await fetch("/api/speech-to-text", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Gagal mentranskripsikan audio");
    }

    return {
      success: true,
      transcript: result.transcript,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Clean text for text-to-speech by removing markdown and special symbols
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text suitable for TTS
 */
export function cleanTextForSpeech(text) {
  let cleaned = text;

  // Remove markdown formatting
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, "$1"); // Bold **text**
  cleaned = cleaned.replace(/\*(.+?)\*/g, "$1"); // Italic *text*
  cleaned = cleaned.replace(/~~(.+?)~~/g, "$1"); // Strikethrough ~~text~~
  cleaned = cleaned.replace(/`(.+?)`/g, "$1"); // Inline code `text`
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ""); // Code blocks

  // Remove markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // Remove bullet points and list markers
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, ""); // Unordered lists
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ""); // Ordered lists

  // Remove emojis (optional - keep common ones for natural speech)
  // Keep: 👋 ✅ ❌ ⏱️ 💡 📝 🎯 etc.
  // Remove: Complex emojis that might confuse TTS

  // Remove special characters that don't contribute to speech
  cleaned = cleaned.replace(/[#*_~`>|]/g, ""); // Markdown symbols
  cleaned = cleaned.replace(/\[|\]/g, ""); // Brackets
  cleaned = cleaned.replace(/---+/g, ""); // Horizontal rules

  // Clean up multiple spaces and newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n"); // Max 2 newlines
  cleaned = cleaned.replace(/\s{2,}/g, " "); // Multiple spaces to single
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Convert text to speech using Google Cloud Text-to-Speech
 * @param {string} text - The text to convert to speech
 * @param {string} languageCode - Language code (default: id-ID for Indonesian)
 * @param {string} voiceName - Voice name (default: id-ID-Standard-A)
 * @param {boolean} autoClean - Automatically clean text for TTS (default: true)
 * @returns {Promise<Object>} - { success, audioUrl, filename }
 */
export async function textToSpeech(
  text,
  languageCode = "id-ID",
  voiceName = "id-ID-Standard-A",
  autoClean = true
) {
  try {
    // Clean text for better TTS output
    const textForSpeech = autoClean ? cleanTextForSpeech(text) : text;

    const response = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textForSpeech,
        languageCode,
        voiceName,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Gagal menghasilkan audio");
    }

    return {
      success: true,
      audioUrl: result.audioUrl,
      filename: result.filename,
    };
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload audio file to Supabase storage
 * @param {Blob} audioBlob - The audio blob to upload
 * @param {string} filename - Optional filename
 * @returns {Promise<Object>} - { success, url, path }
 */
export async function uploadAudio(audioBlob, filename = null) {
  try {
    const name = filename || `recording-${Date.now()}.webm`;

    const { data, error } = await supabase.storage
      .from("audio-messages")
      .upload(name, audioBlob, {
        contentType: audioBlob.type || "audio/webm",
        cacheControl: "3600",
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("audio-messages")
      .getPublicUrl(name);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload audio error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Record audio using MediaRecorder API
 * @returns {Object} - Recording controller with start, stop, and getBlob methods
 */
export function createAudioRecorder() {
  let mediaRecorder = null;
  let audioChunks = [];
  let stream = null;

  return {
    async start() {
      try {
        // Request microphone access
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create MediaRecorder
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        audioChunks = [];

        // Collect audio data
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        // Start recording
        mediaRecorder.start();

        return { success: true };
      } catch (error) {
        console.error("Start recording error:", error);
        return { success: false, error: error.message };
      }
    },

    async stop() {
      return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
          resolve({ success: false, error: "Tidak ada recording aktif" });
          return;
        }

        mediaRecorder.onstop = () => {
          // Create blob from chunks
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

          // Stop all tracks
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }

          resolve({ success: true, blob: audioBlob });
        };

        mediaRecorder.stop();
      });
    },

    isRecording() {
      return mediaRecorder && mediaRecorder.state === "recording";
    },
  };
}
