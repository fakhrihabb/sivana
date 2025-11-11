import { createWorker } from 'tesseract.js';
import fs from 'fs';

/**
 * TESSERACT OCR
 * OCR gratis untuk dokumen tercetak (KTP, transkrip, surat lamaran, surat pernyataan)
 */
export async function performTesseractOCR(imagePath) {
  let worker = null;
  
  try {
    console.log('[Tesseract] Starting OCR for:', imagePath);
    
    // Create worker instance
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Read image
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Perform OCR
    const { data } = await worker.recognize(imageBuffer);

    const extractedText = data.text;
    const confidence = data.confidence / 100; // Convert to 0-1 scale

    console.log('[Tesseract] OCR completed');
    console.log('[Tesseract] Text length:', extractedText.length);
    console.log('[Tesseract] Confidence:', confidence.toFixed(2));
    console.log('[Tesseract] Text preview:', extractedText.substring(0, 200));

    // Terminate worker
    await worker.terminate();

    return {
      success: true,
      text: extractedText,
      confidence,
      words: data.words?.length || 0,
      error: null,
    };
  } catch (error) {
    console.error('[Tesseract] OCR Error:', error);
    
    // Try to terminate worker even on error
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        console.error('[Tesseract] Worker termination error:', e);
      }
    }
    
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message,
    };
  }
}

/**
 * Extract NIK dari teks KTP
 */
export function extractNIK(text) {
  console.log('[Extract NIK] Starting NIK extraction...');
  console.log('[Extract NIK] Input text length:', text.length);
  
  // Strategy 1: Find exact 16 digits (most reliable)
  const nikPattern = /\b\d{16}\b/g;
  const matches = text.match(nikPattern);
  
  if (matches && matches.length > 0) {
    console.log('[Extract NIK] ✅ Found NIK (exact match):', matches[0]);
    return matches[0];
  }
  
  // Strategy 2: Look for pattern with spaces between digits
  const cleanedText = text.replace(/\s+/g, '');
  const nikWithSpaces = cleanedText.match(/\d{16}/);
  if (nikWithSpaces) {
    console.log('[Extract NIK] ✅ Found NIK (after removing spaces):', nikWithSpaces[0]);
    return nikWithSpaces[0];
  }
  
  // Strategy 3: Look for NIK after label "NIK" or "NIK:"
  const nikLabelPatterns = [
    /NIK[\s:]*(\d{16})/i,
    /NIK[\s:]*(\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d[\s\-]*\d)/i,
  ];
  
  for (const pattern of nikLabelPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const nik = match[1].replace(/[\s\-]/g, '');
      if (nik.length === 16) {
        console.log('[Extract NIK] ✅ Found NIK (after label):', nik);
        return nik;
      }
    }
  }
  
  // Strategy 4: Find any 16-digit sequence (even with OCR errors like l→1, O→0)
  const allNumbers = text.match(/\d+/g);
  if (allNumbers) {
    console.log('[Extract NIK] All number sequences found:', allNumbers);
    for (const num of allNumbers) {
      if (num.length === 16) {
        console.log('[Extract NIK] ✅ Found NIK (sequence scan):', num);
        return num;
      }
    }
  }
  
  console.log('[Extract NIK] ❌ No NIK found');
  return null;
}

/**
 * Extract nama dari teks KTP
 */
export function extractNamaKTP(text) {
  // Cari pattern yang lebih spesifik: ":NAMA" atau "Nama :" diikuti nama
  const namaPatterns = [
    // Pattern 1: ":NAMA_LENGKAP" (paling umum di KTP)
    /:([A-Z\s]+?)\s*(?:Tempat|NIK|Jenis)/,
    // Pattern 2: "Nama :" atau "NAMA :" diikuti nama di baris yang sama atau berikutnya
    /(?:NAMA|Nama)\s*:?\s*:?\s*([A-Z][A-Z\s]+?)(?:\n|Tempat\/Tgl|Jenis)/i,
    // Pattern 3: Cari setelah NIK 16 digit
    /\d{16}\s*:?([A-Z\s]+?)(?:\n|Tempat)/,
  ];
  
  for (const pattern of namaPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let nama = match[1].trim();
      // Remove common false positives
      if (!nama.includes('PROVINSI') && !nama.includes('KOTA') && !nama.includes('KABUPATEN')) {
        console.log('[Extract] Found Nama:', nama);
        return nama;
      }
    }
  }
  
  return null;
}

/**
 * Extract nama from Ijazah/Transkrip using OCR patterns
 * More aggressive patterns for extracting names from academic documents
 */
export function extractNamaFromDocument(text) {
  console.log('[Extract] Extracting nama from academic document...');
  
  // FIRST: Handle colon-separated format (e.g., "RAHMAN GUNAWAN: BEKASI: 327508...")
  // This is common when OCR outputs data in a structured format
  const colonSeparatedPattern = /(?:^|\n|Nama|NAMA|Name)\s*:?\s*([A-Z][A-Z\s]{3,40}?)\s*:\s*(?:[A-Z]|\d)/;
  const colonMatch = text.match(colonSeparatedPattern);
  if (colonMatch && colonMatch[1]) {
    let nama = colonMatch[1].trim();
    
    // Clean up colon-separated name
    nama = nama.replace(/\s+/g, ' '); // Normalize spaces
    nama = nama.replace(/[:\.,;]+$/, ''); // Remove trailing punctuation
    
    // Validation: must be at least 2 words, reasonable length
    const words = nama.split(' ').filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 6 && nama.length > 5 && nama.length < 100) {
      // Additional false positive filters
      const falsePositives = [
        'PROVINSI', 'KOTA', 'KABUPATEN', 'UNIVERSITAS', 'INSTITUT', 'SEKOLAH',
        'FAKULTAS', 'JURUSAN', 'PROGRAM', 'INDONESIA', 'REPUBLIK', 'NEGERI',
        'SURAT', 'IJAZAH', 'TRANSKRIP', 'NILAI', 'STTB', 'DEKAN', 'REKTOR',
        'BEKASI', 'JAKARTA', 'BANDUNG', 'SURABAYA' // Common cities that might appear
      ];
      
      if (!falsePositives.some(fp => nama.toUpperCase().includes(fp))) {
        console.log('[Extract] ✅ Found Nama from colon-separated format:', nama);
        return nama;
      }
    }
  }
  
  // SECOND: Try standard patterns (original logic)
  const namaPatterns = [
    // Pattern 1: "Nama :" atau "NAMA :" diikuti nama (before colon or newline)
    /(?:NAMA|Nama|Name)\s*:?\s*([A-Z][A-Za-z\s\.]+?)(?:\s*:\s*[A-Z]|\n|NIM|NPM|Tempat|Tanggal|Program|Fakultas|$)/i,
    // Pattern 2: Cari ALL CAPS name (common in formal documents) - before colon
    /(?:^|\n)([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s*(?:\s*:\s*[A-Z]|\n|NIM|NPM)/m,
    // Pattern 3: After "telah menyelesaikan" or "has completed"
    /(?:telah menyelesaikan|has completed|yang bertanda tangan|Yang bertanda tangan)\s+.*?(?:atas nama|saudara|saudari|yakni|namely)?\s*:?\s*([A-Z][A-Za-z\s\.]+?)(?:\s*:\s*[A-Z]|\n|Program|telah|dengan|pada)/i,
    // Pattern 4: Before "telah lulus" or "has graduated"
    /([A-Z][A-Za-z\s\.]+?)\s+(?:telah lulus|telah menyelesaikan|has graduated|has completed)/i,
    // Pattern 5: Any capitalized name-like pattern (2-4 words, each starting with capital) - but not followed by colon and city/data
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b(?:\s*:)?(?!\s*[A-Z]{4,}|\s*\d)/,
  ];
  
  for (const pattern of namaPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let nama = match[1].trim();
      
      // Clean up
      nama = nama.replace(/\s+/g, ' '); // Normalize spaces
      nama = nama.replace(/[:\.,;]+$/, ''); // Remove trailing punctuation
      
      // Validation: must be at least 2 words, reasonable length
      const words = nama.split(' ').filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 6 && nama.length > 5 && nama.length < 100) {
        // Additional false positive filters
        const falsePositives = [
          'PROVINSI', 'KOTA', 'KABUPATEN', 'UNIVERSITAS', 'INSTITUT', 'SEKOLAH',
          'FAKULTAS', 'JURUSAN', 'PROGRAM', 'INDONESIA', 'REPUBLIK', 'NEGERI',
          'SURAT', 'IJAZAH', 'TRANSKRIP', 'NILAI', 'STTB', 'DEKAN', 'REKTOR',
          'BEKASI', 'JAKARTA', 'BANDUNG', 'SURABAYA' // Common cities
        ];
        
        if (!falsePositives.some(fp => nama.toUpperCase().includes(fp))) {
          console.log('[Extract] ✅ Found Nama from document (pattern match):', nama);
          return nama;
        }
      }
    }
  }
  
  console.log('[Extract] ⚠️ No valid nama found in document');
  return null;
}

/**
 * Extract tanggal lahir dari teks KTP
 */
export function extractTanggalLahir(text) {
  // Format: DD-MM-YYYY atau DD/MM/YYYY atau DD MM YYYY
  const datePatterns = [
    /(?:Lahir|lahir|LAHIR)\s*:?\s*\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{4}/i,
    /\b(\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{4})\b/,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      console.log('[Extract] Found Tanggal Lahir:', match[0]);
      return match[0];
    }
  }
  
  return null;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateString) {
  // Parse various date formats
  const dateParts = dateString.match(/(\d{1,2})[-\/\s](\d{1,2})[-\/\s](\d{4})/);
  if (!dateParts) return null;
  
  const [, day, month, year] = dateParts;
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  console.log('[Calculate] Age:', age);
  return age;
}

/**
 * Extract nomor ijazah dari teks
 * Supports multiple formats:
 * 1. Format dengan separator: UI-2020-001234, UB-2022-123456
 * 2. Format angka panjang: 542452022000179 (15+ digit)
 * 3. Format dengan label: "Nomor Ijazah: 542452022000179"
 */
export function extractNomorIjazah(text) {
  console.log('[Extract] Extracting Nomor Ijazah from text...');
  
  // Strategy 1: Format dengan separator (KODE-YYYY-NNNNNN)
  const ijazahPatternWithSeparator = /\b([A-Z]{2,10}[-]\d{4}[-]\d{6})\b/g;
  const matchesWithSeparator = text.match(ijazahPatternWithSeparator);
  
  if (matchesWithSeparator && matchesWithSeparator.length > 0) {
    console.log('[Extract] ✅ Found Nomor Ijazah (with separator):', matchesWithSeparator[0]);
    return matchesWithSeparator[0];
  }
  
  // Strategy 2: Look for "Nomor Ijazah" label followed by number
  const labelPatterns = [
    /(?:Nomor\s+Ijazah|Certificate\s+Number|Nomor\s+Sertifikat)\s*[:;]?\s*(\d{12,20})/i,
    /\bNomor\s+Ijazah\s*[:;]?\s*(\d{12,20})/i
  ];
  
  for (const pattern of labelPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      console.log('[Extract] ✅ Found Nomor Ijazah (with label):', match[1]);
      return match[1];
    }
  }
  
  // Strategy 3: Find long number sequence (15-20 digits) that's NOT NIK
  // NIK biasanya 16 digit, nomor ijazah bisa 15-20 digit
  const allNumbers = text.match(/\b\d{15,20}\b/g);
  
  if (allNumbers && allNumbers.length > 0) {
    // Filter out NIK (16 digit yang dimulai dengan kode provinsi)
    const nonNIKNumbers = allNumbers.filter(num => {
      // NIK selalu 16 digit
      if (num.length === 16) {
        return false; // Kemungkinan NIK
      }
      return true;
    });
    
    if (nonNIKNumbers.length > 0) {
      // Prioritaskan nomor yang lebih panjang (lebih mungkin nomor ijazah)
      const sorted = nonNIKNumbers.sort((a, b) => b.length - a.length);
      console.log('[Extract] ✅ Found Nomor Ijazah (long number):', sorted[0]);
      return sorted[0];
    }
  }
  
  console.log('[Extract] ⚠️ No Nomor Ijazah found');
  return null;
}

/**
 * Extract program studi/jurusan dari ijazah
 * Supports multiple formats and labels
 */
export function extractProgramStudi(text) {
  console.log('[Extract] Extracting Program Studi from text...');
  
  // Strategy 1: Look for common labels
  const labelPatterns = [
    /(?:Program\s+Studi|Field\s+of\s+Study)\s*[:;]?\s*([A-Za-z\s]+?)(?:\n|$|dalam)/i,
    /(?:Jurusan|Major|Department)\s*[:;]?\s*([A-Za-z\s]+?)(?:\n|$|dalam)/i,
    /(?:Program\s+Studi)\s*[:;]?\s*([^\n]{5,50})/i
  ];
  
  for (const pattern of labelPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const programStudi = match[1].trim();
      // Filter out common false positives
      if (programStudi.length > 3 && !programStudi.match(/^\d+$/)) {
        console.log('[Extract] ✅ Found Program Studi (with label):', programStudi);
        return programStudi;
      }
    }
  }
  
  // Strategy 2: Look for specific known programs (case insensitive)
  const knownPrograms = [
    'Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer',
    'Teknik Komputer', 'Manajemen', 'Akuntansi', 'Ekonomi',
    'Hukum', 'Kedokteran', 'Farmasi', 'Keperawatan',
    'Agrobisnis Perikanan', 'Perikanan', 'Agribisnis',
    'Budidaya Perairan', 'Teknologi Hasil Perikanan',
    'Teknik Elektro', 'Teknik Mesin', 'Teknik Sipil',
    'Psikologi', 'Pendidikan', 'Matematika', 'Fisika', 'Kimia',
    'Biologi', 'Arsitektur', 'Desain'
  ];
  
  const textLower = text.toLowerCase();
  for (const program of knownPrograms) {
    if (textLower.includes(program.toLowerCase())) {
      console.log('[Extract] ✅ Found Program Studi (known program):', program);
      return program;
    }
  }
  
  console.log('[Extract] ⚠️ No Program Studi found');
  return null;
}

/**
 * Extract IPK dari transkrip
 */
export function extractIPK(text) {
  console.log('[Extract IPK] Starting IPK extraction...');
  console.log('[Extract IPK] Text length:', text.length);
  console.log('[Extract IPK] Text sample:', text.substring(0, 200).toLowerCase());
  
  // Enhanced patterns for both Indonesian and English transcripts
  const ipkPatterns = [
    // Indonesian formats
    /(?:IPK|Indeks Prestasi Kumulatif)\s*:?\s*([0-4][.,]\d{1,2})/i,
    
    // English formats - more comprehensive
    /GPA\s*:?\s*([0-4][.,]\d{1,2})/i,
    /Grade Point Average\s*:?\s*([0-4][.,]\d{1,2})/i,
    /Cumulative GPA\s*:?\s*([0-4][.,]\d{1,2})/i,
    /Overall GPA\s*:?\s*([0-4][.,]\d{1,2})/i,
    
    // Format with "4.0 scale"
    /([0-4][.,]\d{1,2})\s*\/?\s*4\.0/i,
    /([0-4][.,]\d{1,2})\s*out of\s*4\.0/i,
    /([0-4][.,]\d{1,2})\s*on\s*(?:a\s*)?4\.0\s*scale/i,
    
    // Format in parentheses
    /\(GPA:?\s*([0-4][.,]\d{1,2})\)/i,
    /\(([0-4][.,]\d{1,2})\s*\/\s*4\.0\)/i,
    
    // Converted GPA format (common in international transcripts)
    /converted.*GPA.*:?\s*([0-4][.,]\d{1,2})/i,
    /GPA.*converted.*:?\s*([0-4][.,]\d{1,2})/i,
    
    // Generic 4-point scale number (last resort)
    /\b([0-4][.,]\d{2})\b/,
  ];
  
  for (let i = 0; i < ipkPatterns.length; i++) {
    const pattern = ipkPatterns[i];
    const match = text.match(pattern);
    if (match && match[1]) {
      const ipk = parseFloat(match[1].replace(',', '.'));
      
      // Validate IPK is in reasonable range (0.0 - 4.0)
      if (ipk >= 0.0 && ipk <= 4.0) {
        console.log(`[Extract IPK] ✅ Found IPK (pattern ${i + 1}):`, ipk);
        console.log(`[Extract IPK] Matched text:`, match[0]);
        return ipk;
      } else {
        console.log(`[Extract IPK] ⚠️ Found number but out of range (pattern ${i + 1}):`, ipk);
      }
    }
  }
  
  // Last resort: Try to find GPA/IPK keyword followed by any number within next 50 chars
  console.log('[Extract IPK] Trying last resort: keyword proximity search...');
  const keywordProximityPatterns = [
    /(?:GPA|IPK|grade point)[\s\S]{0,50}?([0-4][.,]\d{1,2})/i,
    /([0-4][.,]\d{1,2})[\s\S]{0,50}?(?:scale|out of|\/)\s*4/i,
  ];
  
  for (let i = 0; i < keywordProximityPatterns.length; i++) {
    const pattern = keywordProximityPatterns[i];
    const match = text.match(pattern);
    if (match && match[1]) {
      const ipk = parseFloat(match[1].replace(',', '.'));
      if (ipk >= 0.0 && ipk <= 4.0) {
        console.log(`[Extract IPK] ✅ Found IPK (proximity pattern ${i + 1}):`, ipk);
        console.log(`[Extract IPK] Matched text:`, match[0]);
        return ipk;
      }
    }
  }
  
  console.log('[Extract IPK] ❌ No IPK found in text after all attempts');
  return null;
}

/**
 * Similarity check untuk nama (Levenshtein distance)
 */
export function nameSimilarity(name1, name2) {
  if (!name1 || !name2) return 0;
  
  const str1 = name1.toLowerCase().trim();
  const str2 = name2.toLowerCase().trim();
  
  // Exact match
  if (str1 === str2) return 1.0;
  
  // Contains check
  if (str1.includes(str2) || str2.includes(str1)) return 0.9;
  
  // Levenshtein distance
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - (distance / maxLength);
  
  console.log(`[Similarity] "${name1}" vs "${name2}": ${similarity.toFixed(2)}`);
  return similarity;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Check if text contains handwriting indicators (low confidence areas)
 */
export function detectHandwriting(tesseractData) {
  // Tesseract confidence < 60 might indicate handwriting
  const lowConfidenceWords = tesseractData.words?.filter(w => w.confidence < 60) || [];
  const handwritingPercentage = (lowConfidenceWords.length / (tesseractData.words?.length || 1)) * 100;
  
  console.log('[Handwriting Detection] Low confidence words:', lowConfidenceWords.length);
  console.log('[Handwriting Detection] Percentage:', handwritingPercentage.toFixed(2), '%');
  
  return {
    detected: handwritingPercentage > 30, // If >30% low confidence, likely handwriting
    confidence: handwritingPercentage,
  };
}
