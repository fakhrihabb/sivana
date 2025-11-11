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

/**
 * GEMINI DOCUMENT EXTRACTOR - For Intelligent Ijazah Extraction
 * Uses Gemini AI to extract structured data from various ijazah formats
 */
export async function extractIjazahWithGemini(ocrText) {
  try {
    console.log('[Gemini Extractor] Starting intelligent ijazah extraction...');
    console.log('[Gemini Extractor] OCR Text length:', ocrText.length);

    // Create new GoogleGenerativeAI instance (don't reuse global genAI)
    // This ensures API key is read at runtime, not at module load time
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY not found in environment variables');
    }
    
    const extractorGenAI = new GoogleGenerativeAI(apiKey);
    
    // Create a specialized model for structured extraction
    const extractorModel = extractorGenAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Use gemini-2.5-flash (latest stable model)
      generationConfig: {
        temperature: 0.1, // Low temperature for factual extraction
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 2048,
        // Note: responseMimeType might not be supported, we'll parse JSON manually
      },
    });

    const prompt = `Anda adalah AI expert dalam mengekstrak data dari ijazah universitas Indonesia.

TUGAS:
Ekstrak data berikut dari teks ijazah di bawah ini dengan sangat teliti. Jika ada data yang tidak ditemukan atau tidak jelas, berikan nilai null.

DATA YANG HARUS DIEKSTRAK:
1. nomor_ijazah: Nomor unik ijazah (bisa berupa angka panjang atau format dengan kode universitas)
2. nama_lengkap: Nama lengkap pemegang ijazah (cari di bagian identitas, setelah "nama" atau sebelum "telah menyelesaikan")
3. nik: NIK/Nomor Induk Kependudukan (16 digit)
4. tempat_lahir: Tempat lahir
5. tanggal_lahir: Tanggal lahir (format YYYY-MM-DD, parse dari format Indonesia jika perlu)
6. program_studi: Program studi/jurusan (nama lengkap dan formal, misal: "Agrobisnis Perikanan", "Teknik Informatika")
7. jenjang: Jenjang pendidikan (S1/S2/S3/D3/D4/Sarjana/Magister/Doktor)
8. fakultas: Nama fakultas lengkap
9. universitas: Nama universitas lengkap (cari di header/kop surat)
10. tahun_lulus: Tahun kelulusan (YYYY)
11. tanggal_lulus: Tanggal kelulusan lengkap (YYYY-MM-DD)
12. kota_ijazah: Kota penerbitan ijazah (biasanya di bagian bawah, sebelum tanggal)
13. gelar: Gelar yang diberikan (S.Kom, S.E., S.T., M.Kom, dll)

CONFIDENCE:
Berikan confidence score (0.0 - 1.0) untuk setiap field yang diekstrak. 
- 1.0 = sangat yakin, data jelas tertulis
- 0.8 = yakin, ada small ambiguity
- 0.6 = cukup yakin, butuh verifikasi
- 0.4 = kurang yakin, data unclear
- 0.0 = tidak ditemukan

ATURAN PENTING:
- Jangan membuat data yang tidak ada
- Jika ragu, lebih baik null daripada salah
- Perhatikan format tanggal Indonesia (DD Month YYYY → YYYY-MM-DD)
- Program studi biasanya ada setelah kata "Program Studi" atau sebelum fakultas
- Nama lengkap biasanya ALL CAPS atau title case

OUTPUT FORMAT: JSON dengan struktur berikut:
{
  "nomor_ijazah": "string or null",
  "nama_lengkap": "string or null",
  "nik": "string or null",
  "tempat_lahir": "string or null",
  "tanggal_lahir": "YYYY-MM-DD or null",
  "program_studi": "string or null",
  "jenjang": "string or null",
  "fakultas": "string or null",
  "universitas": "string or null",
  "tahun_lulus": number or null,
  "tanggal_lulus": "YYYY-MM-DD or null",
  "kota_ijazah": "string or null",
  "gelar": "string or null",
  "confidence": {
    "nomor_ijazah": 0.0-1.0,
    "nama_lengkap": 0.0-1.0,
    "program_studi": 0.0-1.0,
    "universitas": 0.0-1.0,
    "tahun_lulus": 0.0-1.0
  },
  "extraction_notes": "string - catatan tambahan jika ada ambiguitas"
}

TEKS IJAZAH:
${ocrText}

EKSTRAK DATA SEKARANG:`;

    const result = await extractorModel.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log('[Gemini Extractor] Raw response length:', jsonText.length);
    console.log('[Gemini Extractor] Raw response preview:', jsonText.substring(0, 300) + '...');

    // Parse JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      let cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // If response is empty or too short, it's likely incomplete
      if (!cleanJson || cleanJson.length < 10) {
        console.error('[Gemini Extractor] Response too short or empty:', cleanJson);
        throw new Error('Gemini response is empty or too short');
      }
      
      // Try to extract JSON if surrounded by other text
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('[Gemini Extractor] JSON parse error:', parseError);
      console.error('[Gemini Extractor] Failed to parse text:', jsonText.substring(0, 500));
      throw new Error('Failed to parse Gemini response as JSON: ' + parseError.message);
    }

    // Validate and log results
    console.log('[Gemini Extractor] ✅ Extraction completed:');
    console.log('  - Nomor Ijazah:', extractedData.nomor_ijazah || 'NOT FOUND');
    console.log('  - Nama:', extractedData.nama_lengkap || 'NOT FOUND');
    console.log('  - Program Studi:', extractedData.program_studi || 'NOT FOUND');
    console.log('  - Universitas:', extractedData.universitas || 'NOT FOUND');
    console.log('  - Confidence (Program Studi):', extractedData.confidence?.program_studi || 0);

    return {
      success: true,
      data: extractedData,
      source: 'GEMINI_AI',
      error: null,
    };

  } catch (error) {
    console.error('[Gemini Extractor] ❌ Error:', error);
    return {
      success: false,
      data: null,
      source: null,
      error: error.message || 'Terjadi kesalahan saat ekstraksi dengan Gemini',
    };
  }
}

/**
 * GEMINI TRANSKRIP EXTRACTOR - For Bilingual Transcript Extraction
 * Handles both Indonesian and English transcripts
 */
export async function extractTranskripWithGemini(ocrText) {
  try {
    console.log('[Gemini Transkrip Extractor] Starting intelligent transcript extraction...');
    console.log('[Gemini Transkrip Extractor] OCR Text length:', ocrText.length);

    // Create new GoogleGenerativeAI instance
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY not found in environment variables');
    }
    
    const extractorGenAI = new GoogleGenerativeAI(apiKey);
    
    // Create a specialized model for transcript extraction
    const extractorModel = extractorGenAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `You are an AI expert in extracting data from academic transcripts (Indonesian and English).

TASK:
Extract the following data from the transcript text below. If any data is not found or unclear, return null.

DATA TO EXTRACT:
1. nama_lengkap: Full name of the student (look for "Nama"/"Name"/"Student Name")
2. nim: Student ID number (look for "NIM"/"Student ID"/"Matriculation Number")
3. program_studi: Study program/major (look for "Program Studi"/"Major"/"Program"/"Course of Study")
4. fakultas: Faculty (look for "Fakultas"/"Faculty"/"School")
5. universitas: University name (look in header/logo area)
6. ipk: GPA/IPK on 4.0 scale (look for "IPK"/"GPA"/"Cumulative GPA")
7. total_sks: Total credits earned (look for "SKS"/"Credits"/"ECTS")
8. semester_count: Number of semesters
9. tahun_masuk: Year of enrollment (look for "Tahun Masuk"/"Year of Entry")
10. tahun_lulus: Year of graduation (look for "Tahun Lulus"/"Year of Graduation")
11. language: Document language ("indonesian" or "english")
12. format_type: Transcript format ("standard", "english_exchange", "bilingual", "international")

SPECIAL NOTES:
- For bilingual transcripts, extract from EITHER language
- GPA/IPK must be on 4.0 scale (convert if needed)
- Look for keywords in BOTH Indonesian and English
- Student name can be in various formats (UPPERCASE, Title Case, etc)
- For English transcripts, look for "Transcript of Records", "Academic Transcript"

CONFIDENCE SCORING (0.0 - 1.0):
- 1.0 = Very confident, clearly written
- 0.8 = Confident, small ambiguity
- 0.6 = Moderately confident
- 0.4 = Low confidence
- 0.0 = Not found

OUTPUT FORMAT: JSON with this structure:
{
  "nama_lengkap": "string or null",
  "nim": "string or null",
  "program_studi": "string or null",
  "fakultas": "string or null",
  "universitas": "string or null",
  "ipk": number or null,
  "total_sks": number or null,
  "semester_count": number or null,
  "tahun_masuk": number or null,
  "tahun_lulus": number or null,
  "language": "indonesian" or "english" or "bilingual",
  "format_type": "string",
  "confidence": {
    "nama_lengkap": 0.0-1.0,
    "ipk": 0.0-1.0,
    "program_studi": 0.0-1.0,
    "universitas": 0.0-1.0
  },
  "extraction_notes": "string - any additional observations"
}

TRANSCRIPT TEXT:
${ocrText}

EXTRACT DATA NOW (respond with JSON only):`;

    const result = await extractorModel.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log('[Gemini Transkrip Extractor] Raw response length:', jsonText.length);
    console.log('[Gemini Transkrip Extractor] Raw response preview:', jsonText.substring(0, 300) + '...');

    // Parse JSON response
    let extractedData;
    try {
      let cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      if (!cleanJson || cleanJson.length < 10) {
        console.error('[Gemini Transkrip Extractor] Response too short or empty:', cleanJson);
        throw new Error('Gemini response is empty or too short');
      }
      
      // Try to extract JSON if surrounded by other text
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('[Gemini Transkrip Extractor] JSON parse error:', parseError);
      console.error('[Gemini Transkrip Extractor] Failed to parse text:', jsonText.substring(0, 500));
      throw new Error('Failed to parse Gemini response as JSON: ' + parseError.message);
    }

    // Validate and log results
    console.log('[Gemini Transkrip Extractor] ✅ Extraction completed:');
    console.log('  - Nama:', extractedData.nama_lengkap || 'NOT FOUND');
    console.log('  - IPK/GPA:', extractedData.ipk || 'NOT FOUND');
    console.log('  - Program Studi:', extractedData.program_studi || 'NOT FOUND');
    console.log('  - Universitas:', extractedData.universitas || 'NOT FOUND');
    console.log('  - Language:', extractedData.language || 'UNKNOWN');
    console.log('  - Confidence (IPK):', extractedData.confidence?.ipk || 0);

    return {
      success: true,
      data: extractedData,
      source: 'GEMINI_AI',
      error: null,
    };

  } catch (error) {
    console.error('[Gemini Transkrip Extractor] ❌ Error:', error);
    return {
      success: false,
      data: null,
      source: null,
      error: error.message || 'Terjadi kesalahan saat ekstraksi transkrip dengan Gemini',
    };
  }
}

export default {
  getGeminiResponse,
  getGeminiQuickResponse,
  analyzeDocumentWithGemini,
  extractIjazahWithGemini,
  extractTranskripWithGemini,
};
