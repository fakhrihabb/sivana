import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchKnowledge, formatResponseWithCitation } from "./knowledgeBase.js";
import { sendMessageWithRetry, executeWithRateLimitAndRetry } from "./geminiRetry.js";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Initialize Supabase client for formasi data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Model configuration with fallback options
const PRIMARY_MODEL = "gemini-2.0-flash-exp";
const FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-1.5-flash-8b"];

// Initialize Gemini model with latest version
const model = genAI.getGenerativeModel({
  model: PRIMARY_MODEL,
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
- **PENTING**: Tahun sekarang adalah 2025. Jangan menyebut tahun 2024 dalam jawaban Anda. Gunakan tahun 2025 untuk semua referensi terkini.
- Jika knowledge base menyebutkan "2024", ganti dengan "2025" dalam jawaban Anda

JANGAN:
- Membuat informasi yang tidak ada di knowledge base
- Memberikan saran yang tidak berdasarkan dokumen resmi
- Mengklaim sebagai official support (kamu hanya chatbot bantu)
- Menyebut tahun 2024 dalam jawaban (gunakan 2025)`
});

/**
 * Search formasi data from Supabase based on user query
 * Extracts provinsi, program_studi, or lembaga from query
 */
async function searchFormasiData(userMessage) {
  try {
    const lowerMessage = userMessage.toLowerCase();

    // Check if query is about formasi/positions
    const isFormasiQuery =
      lowerMessage.includes('formasi') ||
      lowerMessage.includes('lowongan') ||
      lowerMessage.includes('berapa jumlah') ||
      lowerMessage.includes('ada berapa') ||
      lowerMessage.includes('jabatan') ||
      lowerMessage.includes('posisi');

    if (!isFormasiQuery) {
      return null; // Not a formasi query
    }

    console.log('[Formasi Search] Detected formasi query, searching Supabase...');

    // Build query
    let query = supabase
      .from('formasi')
      .select(`
        id,
        name,
        lembaga,
        kantor_pusat,
        jenjang_pendidikan,
        program_studi,
        formasi_provinces (
          provinces (
            name
          )
        )
      `);

    // Extract province from query (e.g., "formasi di aceh", "lowongan di jakarta")
    const provinceMatch = lowerMessage.match(/(?:di|provinsi|daerah)\s+([a-z\s]+)/i);
    if (provinceMatch) {
      const provinceName = provinceMatch[1].trim();
      console.log('[Formasi Search] Province filter:', provinceName);

      // Join with provinces table to filter
      const { data: matchedFormasi, error } = await query;

      if (error) {
        console.error('[Formasi Search] Error:', error);
        return null;
      }

      // Filter by province name
      const filtered = matchedFormasi.filter(f =>
        f.formasi_provinces?.some(fp =>
          fp.provinces?.name.toLowerCase().includes(provinceName)
        )
      );

      if (filtered.length > 0) {
        return {
          formasi: filtered,
          filter: `provinsi ${provinceName}`,
          total: filtered.length
        };
      }
    }

    // Extract program studi (e.g., "formasi ekonomi", "lowongan akuntansi")
    const programStudiMatch = lowerMessage.match(/(?:formasi|jurusan|program studi|lulusan)\s+([a-z\s]+)/i);
    if (programStudiMatch) {
      const programStudi = programStudiMatch[1].trim();
      console.log('[Formasi Search] Program studi filter:', programStudi);

      query = query.ilike('program_studi', `%${programStudi}%`);
    }

    // Execute query
    const { data, error } = await query.limit(20);

    if (error) {
      console.error('[Formasi Search] Error:', error);
      return null;
    }

    if (data && data.length > 0) {
      return {
        formasi: data,
        filter: programStudiMatch ? `program studi ${programStudiMatch[1]}` : 'semua formasi',
        total: data.length
      };
    }

    return null;
  } catch (error) {
    console.error('[Formasi Search] Exception:', error);
    return null;
  }
}

/**
 * Format formasi data for chatbot response
 */
function formatFormasiContext(formasiData) {
  const { formasi, filter, total } = formasiData;

  let context = `\n\n=== DATA FORMASI DARI DATABASE ===\n`;
  context += `Total formasi ditemukan untuk ${filter}: ${total}\n\n`;

  formasi.slice(0, 10).forEach((f, index) => {
    context += `${index + 1}. ${f.name}\n`;
    context += `   Instansi: ${f.lembaga}\n`;
    context += `   Kantor Pusat: ${f.kantor_pusat}\n`;
    context += `   Pendidikan: ${f.jenjang_pendidikan} ${f.program_studi}\n`;

    if (f.formasi_provinces && f.formasi_provinces.length > 0) {
      const provinces = f.formasi_provinces
        .map(fp => fp.provinces?.name)
        .filter(Boolean)
        .join(', ');
      context += `   Lokasi: ${provinces}\n`;
    }

    context += '\n';
  });

  if (total > 10) {
    context += `(dan ${total - 10} formasi lainnya)\n`;
  }

  context += '\n=== INSTRUKSI ===\n';
  context += 'Berikan ringkasan data formasi di atas kepada user dengan format yang mudah dibaca.\n';
  context += 'Sebutkan total jumlah formasi, instansi-instansi yang tersedia, dan lokasi penempatan.\n';

  return context;
}

export async function getGeminiResponse(userMessage, conversationHistory = []) {
  try {
    // 1. Search formasi data from Supabase (priority)
    const formasiData = await searchFormasiData(userMessage);

    // 2. Search knowledge base terlebih dahulu
    const knowledgeResults = searchKnowledge(userMessage);

    let context = "";
    let usedKnowledge = false;
    let usedFormasiData = false;

    // Prioritize formasi data if found
    if (formasiData) {
      context = formatFormasiContext(formasiData);
      usedFormasiData = true;
      usedKnowledge = true;
      console.log('[Gemini] Using formasi data from Supabase');
    } else if (knowledgeResults && knowledgeResults.length > 0) {
      // Jika ada match di knowledge base, gunakan yang paling relevan
      const bestMatch = knowledgeResults[0];
      context = `
KNOWLEDGE BASE CONTEXT:
${formatResponseWithCitation(bestMatch)}

User adalah peserta SSCASN yang menanyakan hal terkait. Berikan jawaban berdasarkan context di atas dengan sumber yang jelas.`;
      usedKnowledge = true;
      console.log('[Gemini] Using static knowledge base');
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

    // 5. Send user message with retry logic
    const response = await sendMessageWithRetry(chat, userMessage, {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 15000,
      onRetry: (attempt, maxAttempts, delay) => {
        console.log(`[Gemini] Retry ${attempt}/${maxAttempts} in ${Math.round(delay)}ms...`);
      }
    });

    const responseText = response.text();

    return {
      success: true,
      message: responseText,
      error: null,
      usedKnowledge: usedKnowledge,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Check if it's an overload error
    const isOverload = error?.message?.includes('503') || error?.message?.includes('overloaded');

    return {
      success: false,
      message: null,
      error: isOverload
        ? "AI sedang sibuk. Mohon tunggu beberapa saat dan coba lagi."
        : (error.message || "Terjadi kesalahan saat menghubungi AI"),
      usedKnowledge: false,
      isOverload: isOverload,
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
    // Check if it's a rate limit error (suppress detailed logging)
    if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
      console.log('[Gemini Extractor] ⚠️ API rate limit - will use fallback OCR extraction');
      return {
        success: false,
        data: null,
        source: 'RATE_LIMIT',
        error: 'rate_limit',
      };
    }
    
    // For other errors, log but don't crash
    console.error('[Gemini Extractor] ❌ Error:', error.message);
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

/**
 * GEMINI PROGRAM STUDI MATCHER - Intelligent Major/Field Matching
 * Uses Gemini AI to determine if two majors/fields are compatible
 */
export async function matchProgramStudiWithGemini(extractedMajor, requiredMajor) {
  try {
    console.log('[Gemini Matcher] Matching program studi...');
    console.log(`[Gemini Matcher] Extracted: "${extractedMajor}"`);
    console.log(`[Gemini Matcher] Required: "${requiredMajor}"`);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY not found');
    }
    
    const matcherGenAI = new GoogleGenerativeAI(apiKey);
    const matcherModel = matcherGenAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `Anda adalah AI expert dalam menilai kecocokan program studi/jurusan untuk penerimaan CPNS.

TUGAS:
Tentukan apakah dua program studi berikut COCOK/COMPATIBLE atau TIDAK COCOK untuk persyaratan CPNS.

PROGRAM STUDI DI IJAZAH PELAMAR:
"${extractedMajor}"

PROGRAM STUDI YANG DIBUTUHKAN:
"${requiredMajor}"

ATURAN PENILAIAN:
1. EXACT MATCH (100% similarity):
   - Nama persis sama
   - Contoh: "Akuntansi" = "Akuntansi"

2. VERY CLOSE MATCH (90-95% similarity):
   - Nama hampir sama dengan variasi kecil
   - Contoh: "Akuntansi Syariah" ≈ "Akuntansi" (95%)
   - Contoh: "Teknik Informatika" ≈ "Informatika" (95%)
   - Contoh: "Manajemen Bisnis" ≈ "Manajemen" (90%)

3. SAME FIELD/COMPATIBLE (75-85% similarity):
   - Masih dalam bidang yang sama dan relevan
   - **PENTING**: Akuntansi, Ilmu Ekonomi, Manajemen, Ekonomi Pembangunan = SEMUA EKONOMI (80%)
   - Contoh: "Teknik Informatika" ≈ "Sistem Informasi" (80%)
   - Contoh: "Ilmu Komunikasi" ≈ "Komunikasi" (85%)
   - Contoh: "Pendidikan Matematika" ≈ "Matematika" (75%)

4. RELATED BUT DIFFERENT (50-70% similarity):
   - Masih ada keterkaitan tapi berbeda fokus
   - Contoh: "Ekonomi" vs "Akuntansi" jika persyaratan sangat spesifik (60%)

5. NOT COMPATIBLE (0-40% similarity):
   - Bidang berbeda total
   - Contoh: "Teknik Informatika" vs "Ekonomi" (0%)
   - Contoh: "Hukum" vs "Kedokteran" (0%)

CONTEXT INDONESIA:
- Ekonomi = bidang luas yang mencakup Akuntansi, Manajemen, Ekonomi Pembangunan
- Teknik = mencakup berbagai cabang (Sipil, Elektro, Informatika, dll)
- Pendidikan X biasanya compatible dengan X
- Perhatikan jenjang: S-1/S1/Sarjana itu sama

OUTPUT FORMAT: JSON dengan struktur berikut:
{
  "matched": true/false,
  "similarity": 0-100 (integer),
  "category": "exact"|"very_close"|"same_field"|"related"|"not_compatible",
  "reasoning": "Penjelasan singkat mengapa cocok/tidak cocok (1-2 kalimat)",
  "recommendation": "accept"|"review"|"reject"
}

RECOMMENDATION LOGIC:
- accept: similarity >= 75% (cocok untuk formasi)
- review: similarity 50-74% (butuh review manual)
- reject: similarity < 50% (tidak cocok)

RESPOND WITH JSON ONLY:`;

    const result = await matcherModel.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log('[Gemini Matcher] Raw response length:', jsonText.length);
    console.log('[Gemini Matcher] Raw response:', jsonText);

    // Parse JSON with better error handling
    let matchResult;
    try {
      // Remove markdown code blocks if present
      let cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Check if response is too short or empty
      if (!cleanJson || cleanJson.length < 20) {
        console.error('[Gemini Matcher] Response too short or empty:', cleanJson);
        throw new Error('Gemini response is empty or incomplete');
      }
      
      // Try to extract JSON if surrounded by other text
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      } else {
        console.error('[Gemini Matcher] No JSON found in response');
        throw new Error('No valid JSON found in Gemini response');
      }
      
      matchResult = JSON.parse(cleanJson);
      
      // Validate required fields
      if (!matchResult.hasOwnProperty('matched') || 
          !matchResult.hasOwnProperty('similarity') || 
          !matchResult.hasOwnProperty('recommendation')) {
        console.error('[Gemini Matcher] Missing required fields in response:', matchResult);
        throw new Error('Gemini response missing required fields');
      }
      
    } catch (parseError) {
      console.error('[Gemini Matcher] JSON parse error:', parseError);
      console.error('[Gemini Matcher] Failed text:', jsonText.substring(0, 500));
      
      // Return a safe fallback with "review" recommendation
      return {
        success: false,
        matched: false,
        similarity: 0,
        category: 'error',
        reasoning: 'Error parsing Gemini response. Silakan review manual.',
        recommendation: 'review',
        source: 'GEMINI_AI_ERROR',
        error: parseError.message,
      };
    }

    console.log('[Gemini Matcher] ✅ Match result:');
    console.log(`  - Matched: ${matchResult.matched}`);
    console.log(`  - Similarity: ${matchResult.similarity}%`);
    console.log(`  - Category: ${matchResult.category}`);
    console.log(`  - Recommendation: ${matchResult.recommendation}`);
    console.log(`  - Reasoning: ${matchResult.reasoning}`);

    return {
      success: true,
      matched: matchResult.matched,
      similarity: matchResult.similarity,
      category: matchResult.category,
      reasoning: matchResult.reasoning,
      recommendation: matchResult.recommendation,
      source: 'GEMINI_AI',
      error: null,
    };

  } catch (error) {
    // Check if it's a rate limit error (suppress detailed logging)
    if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
      console.log('[Gemini Matcher] ⚠️ API rate limit - using fallback algorithm');
      return {
        success: false,
        matched: false,
        similarity: 0,
        category: 'rate_limit',
        reasoning: 'Menggunakan algoritma manual',
        recommendation: 'review',
        source: 'RATE_LIMIT',
        error: 'rate_limit',
      };
    }
    
    // For other errors, log but don't crash
    console.error('[Gemini Matcher] ❌ Error:', error.message);
    
    return {
      success: false,
      matched: false,
      similarity: 0,
      category: 'error',
      reasoning: 'Sistem menggunakan algoritma manual',
      recommendation: 'review',
      source: 'ERROR',
      error: error.message,
    };
  }
}

/**
 * GEMINI SURAT LAMARAN EXTRACTOR - Lightweight extraction for job application letter
 * Uses Gemini Flash 1.5 (fastest, most cost-effective)
 */
export async function extractSuratLamaranWithGemini(ocrText) {
  try {
    console.log('[Gemini Surat Lamaran] Starting extraction...');
    console.log('[Gemini Surat Lamaran] OCR Text length:', ocrText.length);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY not found');
    }
    
    const extractorGenAI = new GoogleGenerativeAI(apiKey);
    
    // Use LIGHTWEIGHT MODEL: gemini-1.5-flash (fastest & cheapest)
    const extractorModel = extractorGenAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Lightweight model
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 512, // Reduced tokens for faster response
      },
    });

    const prompt = `Ekstrak data berikut dari surat lamaran. TEKS MUNGKIN TERPISAH-PISAH ATAU DALAM FORMAT COLON-SEPARATED.

DATA:
1. nama_lengkap: Nama pelamar lengkap
   - Bisa di bagian "Nama:" atau setelah kolon pertama
   - Bisa di bagian bawah setelah "Hormat saya," atau di signature
   - Contoh format: "RAHMAN GUNAWAN: BEKASI..." berarti nama = "RAHMAN GUNAWAN"
   - Jika ada kolon (:), nama biasanya SEBELUM kolon pertama
   - Jangan ambil data setelah kolon (tempat lahir, NIK, dll)

2. posisi_dilamar: Posisi/formasi yang dilamar
   - Cari setelah "Jabatan yang dilamar:", "posisi", "melamar sebagai"
   - Bisa dalam format colon-separated setelah beberapa field

3. tanggal_surat: Tanggal surat (format YYYY-MM-DD)
   - Parse dari format Indonesia jika perlu
   - Contoh: "11 November 2024" → "2024-11-11"

ATURAN PENTING:
- TEKS MUNGKIN TERPISAH OLEH COLON (:) - ekstrak dengan hati-hati
- Format seperti "RAHMAN GUNAWAN: BEKASI: 327508..." berarti:
  * nama_lengkap = "RAHMAN GUNAWAN" (sebelum kolon pertama)
  * JANGAN ambil "BEKASI" atau "327508" sebagai nama
- Jika nama ada di beberapa tempat, pilih yang paling lengkap
- Jangan buat data yang tidak ada
- Jika tidak ditemukan, beri null

OUTPUT JSON:
{
  "nama_lengkap": "string or null",
  "posisi_dilamar": "string or null",
  "tanggal_surat": "YYYY-MM-DD or null"
}

TEKS SURAT LAMARAN (FULL TEXT):
${ocrText}

JSON:`;

    const result = await extractorModel.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log('[Gemini Surat Lamaran] Raw response:', jsonText.substring(0, 200));

    // Parse JSON
    let extractedData;
    try {
      let cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      if (!cleanJson || cleanJson.length < 10) {
        throw new Error('Response too short');
      }
      
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('[Gemini Surat Lamaran] Parse error:', parseError);
      throw new Error('Failed to parse Gemini response');
    }

    console.log('[Gemini Surat Lamaran] ✅ Extracted:', extractedData);

    return {
      success: true,
      data: extractedData,
      source: 'GEMINI_AI',
      error: null,
    };

  } catch (error) {
    // Rate limit handling
    if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
      console.log('[Gemini Surat Lamaran] ⚠️ Rate limit - fallback to OCR');
      return {
        success: false,
        data: null,
        source: 'RATE_LIMIT',
        error: 'rate_limit',
      };
    }
    
    console.error('[Gemini Surat Lamaran] ❌ Error:', error.message);
    return {
      success: false,
      data: null,
      source: null,
      error: error.message,
    };
  }
}

/**
 * GEMINI SURAT PERNYATAAN EXTRACTOR - Lightweight extraction for declaration letter
 * Uses Gemini Flash 1.5 (fastest, most cost-effective)
 */
export async function extractSuratPernyataanWithGemini(ocrText) {
  try {
    console.log('[Gemini Surat Pernyataan] Starting extraction...');
    console.log('[Gemini Surat Pernyataan] OCR Text length:', ocrText.length);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY not found');
    }
    
    const extractorGenAI = new GoogleGenerativeAI(apiKey);
    
    // Use LIGHTWEIGHT MODEL: gemini-1.5-flash
    const extractorModel = extractorGenAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Lightweight model
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 512,
      },
    });

    const prompt = `Ekstrak data berikut dari surat pernyataan:

DATA:
1. nama_lengkap: Nama yang membuat pernyataan (biasanya setelah "Yang bertanda tangan di bawah ini," atau di signature)
2. nik: NIK/Nomor KTP (16 digit)
3. tanggal_surat: Tanggal surat (format YYYY-MM-DD)
4. jenis_pernyataan: Jenis pernyataan (contoh: "tidak pernah dihukum", "tidak terlibat narkoba", dll)

ATURAN:
- Jangan buat data yang tidak ada
- Jika tidak ditemukan, beri null
- Nama biasanya di awal atau bagian bawah

OUTPUT JSON:
{
  "nama_lengkap": "string or null",
  "nik": "string or null",
  "tanggal_surat": "YYYY-MM-DD or null",
  "jenis_pernyataan": "string or null"
}

TEKS SURAT PERNYATAAN:
${ocrText}

JSON:`;

    const result = await extractorModel.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log('[Gemini Surat Pernyataan] Raw response:', jsonText.substring(0, 200));

    // Parse JSON
    let extractedData;
    try {
      let cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      if (!cleanJson || cleanJson.length < 10) {
        throw new Error('Response too short');
      }
      
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('[Gemini Surat Pernyataan] Parse error:', parseError);
      throw new Error('Failed to parse Gemini response');
    }

    console.log('[Gemini Surat Pernyataan] ✅ Extracted:', extractedData);

    return {
      success: true,
      data: extractedData,
      source: 'GEMINI_AI',
      error: null,
    };

  } catch (error) {
    // Rate limit handling
    if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
      console.log('[Gemini Surat Pernyataan] ⚠️ Rate limit - fallback to OCR');
      return {
        success: false,
        data: null,
        source: 'RATE_LIMIT',
        error: 'rate_limit',
      };
    }
    
    console.error('[Gemini Surat Pernyataan] ❌ Error:', error.message);
    return {
      success: false,
      data: null,
      source: null,
      error: error.message,
    };
  }
}

/**
 * GEMINI TRANSKRIP NAME EXTRACTOR - Lightweight extraction for transcript name only
 * Uses Gemini Flash 1.5 (fastest, most cost-effective)
 * ONLY extracts name, not IPK (IPK uses manual pattern matching)
 */
export async function extractTranskripNameWithGemini(ocrText) {
  try {
    console.log('[Gemini Transkrip Name] Starting name extraction...');
    console.log('[Gemini Transkrip Name] OCR Text length:', ocrText.length);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY not found');
    }
    
    const extractorGenAI = new GoogleGenerativeAI(apiKey);
    
    // Use LIGHTWEIGHT MODEL: gemini-1.5-flash
    const extractorModel = extractorGenAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Lightweight model
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 256, // Very small, only need name
      },
    });

    const prompt = `Ekstrak HANYA nama mahasiswa dari transkrip nilai ini. TEKS MUNGKIN TERPISAH-PISAH ATAU DALAM FORMAT COLON-SEPARATED.

ATURAN:
- Hanya ekstrak nama lengkap mahasiswa
- Jangan ekstrak nama universitas, fakultas, program studi, atau data lain
- Jika tidak ditemukan, beri null
- Nama biasanya ada setelah "Nama:", "Name:", atau di bagian atas dokumen

FORMAT COLON-SEPARATED:
- Jika teks dalam format "NAMA: DATA LAIN: DATA LAIN..."
  * Ambil bagian SEBELUM kolon pertama sebagai nama
  * Contoh: "RAHMAN GUNAWAN: BEKASI: 327508..." → nama = "RAHMAN GUNAWAN"
  * JANGAN ambil data setelah kolon (tempat, NIM, dll)

PENTING:
- TEKS MUNGKIN TERPISAH OLEH COLON (:) - ekstrak dengan hati-hati
- Nama mahasiswa TIDAK mengandung kolon, angka NIM, atau tempat lahir
- Jika ada beberapa kemungkinan nama, pilih yang paling lengkap dan paling masuk akal sebagai nama orang

OUTPUT JSON:
{
  "nama_lengkap": "string or null"
}

TEKS TRANSKRIP (FULL TEXT):
${ocrText}

JSON:`;

    const result = await extractorModel.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log('[Gemini Transkrip Name] Raw response:', jsonText.substring(0, 200));

    // Parse JSON
    let extractedData;
    try {
      let cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      if (!cleanJson || cleanJson.length < 10) {
        throw new Error('Response too short');
      }
      
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('[Gemini Transkrip Name] Parse error:', parseError);
      throw new Error('Failed to parse Gemini response');
    }

    console.log('[Gemini Transkrip Name] ✅ Extracted:', extractedData);

    return {
      success: true,
      nama: extractedData.nama_lengkap,
      source: 'GEMINI_AI',
      error: null,
    };

  } catch (error) {
    // Rate limit handling
    if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
      console.log('[Gemini Transkrip Name] ⚠️ Rate limit - fallback to OCR');
      return {
        success: false,
        nama: null,
        source: 'RATE_LIMIT',
        error: 'rate_limit',
      };
    }
    
    console.error('[Gemini Transkrip Name] ❌ Error:', error.message);
    return {
      success: false,
      nama: null,
      source: null,
      error: error.message,
    };
  }
}

export default {
  getGeminiResponse,
  getGeminiQuickResponse,
  analyzeDocumentWithGemini,
  extractIjazahWithGemini,
  extractTranskripWithGemini,
  matchProgramStudiWithGemini,
  extractSuratLamaranWithGemini,
  extractSuratPernyataanWithGemini,
  extractTranskripNameWithGemini,
};
