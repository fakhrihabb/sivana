import { SpeechClient } from "@google-cloud/speech";

// Initialize Speech client with credentials
let speechClient;
try {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    : undefined;

  speechClient = new SpeechClient({
    credentials,
    ...(process.env.GOOGLE_APPLICATION_CREDENTIALS && {
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    }),
  });
} catch (error) {
  console.error("Failed to initialize Speech client:", error);
}

export async function POST(request) {
  try {
    if (!speechClient) {
      return Response.json(
        {
          error: "Speech-to-Text service tidak tersedia. Silakan konfigurasi Google Cloud credentials.",
          success: false,
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const languageCode = formData.get("languageCode") || "id-ID"; // Indonesian by default

    if (!audioFile) {
      return Response.json(
        { error: "Tidak ada file audio yang di-upload", success: false },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["audio/webm", "audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg"];
    if (!validTypes.some(type => audioFile.type.includes(type))) {
      return Response.json(
        { error: "Format audio tidak didukung", success: false },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "Ukuran file terlalu besar (max 10MB)", success: false },
        { status: 400 }
      );
    }

    console.log("[Speech-to-Text] Processing audio file:", audioFile.name, audioFile.size, "bytes");

    // Convert audio file to base64
    const audioBytes = Buffer.from(await audioFile.arrayBuffer());

    // Determine encoding based on file type
    let encoding = "WEBM_OPUS";
    if (audioFile.type.includes("wav")) {
      encoding = "LINEAR16";
    } else if (audioFile.type.includes("mp3") || audioFile.type.includes("mpeg")) {
      encoding = "MP3";
    } else if (audioFile.type.includes("ogg")) {
      encoding = "OGG_OPUS";
    }

    // Configure request
    const audio = {
      content: audioBytes.toString("base64"),
    };

    const config = {
      encoding: encoding,
      sampleRateHertz: 48000, // Common sample rate for web audio
      languageCode: languageCode,
      alternativeLanguageCodes: ["en-US"], // Fallback to English
      enableAutomaticPunctuation: true,
      model: "default", // Using default model for cost efficiency
    };

    const recognizeRequest = {
      audio: audio,
      config: config,
    };

    // Call Google Cloud Speech-to-Text API
    const [response] = await speechClient.recognize(recognizeRequest);

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join("\n");

    const confidence = response.results.length > 0
      ? response.results[0].alternatives[0].confidence
      : 0;

    console.log("[Speech-to-Text] Transcription:", transcription);
    console.log("[Speech-to-Text] Confidence:", confidence);

    return Response.json({
      success: true,
      transcript: transcription,
      confidence: confidence,
      languageCode: languageCode,
    });
  } catch (error) {
    console.error("Speech-to-Text error:", error);
    return Response.json(
      {
        error: "Gagal mentranskripsikan audio: " + error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
