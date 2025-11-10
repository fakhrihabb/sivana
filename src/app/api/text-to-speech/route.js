import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { createClient } from "@supabase/supabase-js";

// Initialize Text-to-Speech client with credentials
let ttsClient;
try {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    : undefined;

  ttsClient = new TextToSpeechClient({
    credentials,
    ...(process.env.GOOGLE_APPLICATION_CREDENTIALS && {
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    }),
  });
} catch (error) {
  console.error("Failed to initialize TTS client:", error);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    if (!ttsClient) {
      return Response.json(
        {
          error: "Text-to-Speech service tidak tersedia. Silakan konfigurasi Google Cloud credentials.",
          success: false,
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, languageCode = "id-ID", voiceName = "id-ID-Standard-A" } = body;

    if (!text || text.trim().length === 0) {
      return Response.json(
        { error: "Teks tidak boleh kosong", success: false },
        { status: 400 }
      );
    }

    // Validate text length (max 5000 characters for cost efficiency)
    if (text.length > 5000) {
      return Response.json(
        { error: "Teks terlalu panjang (max 5000 karakter)", success: false },
        { status: 400 }
      );
    }

    console.log("[Text-to-Speech] Generating audio for text:", text.substring(0, 100) + "...");
    console.log("[Text-to-Speech] Language:", languageCode, "Voice:", voiceName);

    // Configure the synthesis request
    const synthesisRequest = {
      input: { text: text },
      voice: {
        languageCode: languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: "MP3", // MP3 for better compatibility and smaller size
        speakingRate: 1.0, // Normal speed
        pitch: 0.0, // Normal pitch
      },
    };

    // Call Google Cloud Text-to-Speech API
    const [response] = await ttsClient.synthesizeSpeech(synthesisRequest);
    const audioContent = response.audioContent;

    console.log("[Text-to-Speech] Audio generated, size:", audioContent.length, "bytes");

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `tts-${timestamp}.mp3`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-messages")
      .upload(filename, audioContent, {
        contentType: "audio/mpeg",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("[Text-to-Speech] Upload error:", uploadError);
      // Return audio directly if upload fails
      return new Response(audioContent, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioContent.length.toString(),
        },
      });
    }

    console.log("[Text-to-Speech] Uploaded to storage:", uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("audio-messages")
      .getPublicUrl(filename);

    return Response.json({
      success: true,
      audioUrl: urlData.publicUrl,
      filename: filename,
      size: audioContent.length,
    });
  } catch (error) {
    console.error("Text-to-Speech error:", error);
    return Response.json(
      {
        error: "Gagal menghasilkan audio: " + error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
