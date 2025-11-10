import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchKnowledge, formatResponseWithCitation } from "./knowledgeBase.js";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Initialize Gemini 2.5 Flash model
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `Kamu adalah TanyaBKN, chatbot AI helpdesk SIVANA (Sistem Integrasi dan Verifikasi ASN Nasional). 
Tugas kamu adalah membantu calon peserta SIPASN/SSCASN menjawab pertanyaan mereka dengan akurat dan berdasarkan dokumen resmi.

TOPIK YANG BISA DIJAWAB:
1. Proses pendaftaran CPNS & PPPK
2. Persyaratan dokumen dan syarat pendaftaran
3. Verifikasi wajah (Face Recognition)
4. Status verifikasi dokumen
5. Jadwal ujian SKD
6. Troubleshooting masalah teknis SSCASN

ATURAN PENTING:
- SELALU sertakan sumber/citation ke dokumen resmi
- Gunakan knowledge base yang telah disediakan
- Jika tidak yakin, katakan "Maaf, informasi tentang hal tersebut tidak tersedia dalam knowledge base saya"
- Anjurkan contact support SSCASN untuk masalah teknis
- Gunakan emoji yang relevan
- Gunakan bahasa Indonesia yang ramah dan profesional
- Format jawaban dengan jelas menggunakan bullet points

JANGAN:
- Membuat informasi yang tidak ada di knowledge base
- Memberikan saran yang tidak berdasarkan dokumen resmi
- Mengklaim sebagai official support (kamu hanya chatbot bantu)`
});

export async function getGeminiResponse(userMessage, conversationHistory = []) {
  try {
    // 1. Search knowledge base terlebih dahulu
    const knowledgeResults = searchKnowledge(userMessage);
    
    let context = "";
    let usedKnowledge = false;
    
    if (knowledgeResults && knowledgeResults.length > 0) {
      // Jika ada match di knowledge base, gunakan yang paling relevan
      const bestMatch = knowledgeResults[0];
      context = `
KNOWLEDGE BASE CONTEXT:
${formatResponseWithCitation(bestMatch)}

User adalah peserta SSCASN yang menanyakan hal terkait. Berikan jawaban berdasarkan context di atas dengan sumber yang jelas.`;
      usedKnowledge = true;
    }

    // 2. Build chat history dengan context
    const chatHistory = conversationHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 3. Tambahkan context knowledge base jika ada
    if (context) {
      chatHistory.push({
        role: "user",
        parts: [{ text: context }]
      });
      chatHistory.push({
        role: "model",
        parts: [{ text: "Saya telah membaca knowledge base. Saya siap menjawab pertanyaan dengan citation yang akurat." }]
      });
    }

    // 4. Buat chat dengan history
    const chat = model.startChat({
      history: chatHistory,
    });

    // 5. Send user message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const responseText = response.text();
    
    return {
      success: true,
      message: responseText,
      error: null,
      usedKnowledge: usedKnowledge,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      message: null,
      error: error.message || "Terjadi kesalahan saat menghubungi AI",
      usedKnowledge: false,
    };
  }
}

// Function for quick responses (without conversation history)
export async function getGeminiQuickResponse(userMessage) {
  return getGeminiResponse(userMessage, []);
}

// Function to analyze document/requirements
export async function analyzeDocumentWithGemini(documentText) {
  try {
    const chat = model.startChat();
    
    const prompt = `Analisis dokumen berikut untuk SIPASN:\n\n${documentText}\n\nBerikan:
1. Ringkasan informasi yang ditemukan
2. Potensi masalah atau kekurangan
3. Rekomendasi perbaikan`;
    
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    
    return {
      success: true,
      analysis: response.text(),
      error: null,
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      success: false,
      analysis: null,
      error: error.message || "Terjadi kesalahan saat menganalisis dokumen",
    };
  }
}

export default {
  getGeminiResponse,
  getGeminiQuickResponse,
  analyzeDocumentWithGemini,
};
