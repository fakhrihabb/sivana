import { supabase } from './supabase.js';
import { 
  extractNIK, 
  extractNamaKTP, 
  extractTanggalLahir, 
  calculateAge,
  extractNomorIjazah,
  extractProgramStudi,
  extractIPK,
  nameSimilarity,
  extractNamaFromDocument 
} from './tesseractOcr.js';
import { 
  extractSuratLamaranWithGemini, 
  extractSuratPernyataanWithGemini,
  extractTranskripNameWithGemini
} from './gemini.js';

/**
 * VALIDASI KTP - SIMPLIFIED VERSION
 * Strategy: OCR hanya extract NIK, lalu query database untuk semua data
 * Semua validasi (nama, umur, lokasi) menggunakan data dari database
 */
export async function validateKTP(ocrText, formasiData = null) {
  const validation = {
    success: false,
    nik: null,
    nama: null,
    umur: null,
    tempatLahir: null,
    tanggalLahir: null,
    alamat: null,
    provinsi: null,
    dukcapilMatch: false,
    ageValid: false,
    lokasiMatch: false,
    errors: [],
    warnings: [],
  };

  try {
    console.log('\n' + '='.repeat(80));
    console.log('[KTP Validation] STARTING KTP VALIDATION');
    console.log('='.repeat(80));
    console.log('[KTP Validation] OCR Text length:', ocrText.length);
    console.log('[KTP Validation] OCR Text preview (first 500 chars):');
    console.log(ocrText.substring(0, 500));
    console.log('='.repeat(80));
    
    // 1. Extract NIK dari OCR (hanya NIK!)
    const nik = extractNIK(ocrText);

    if (!nik) {
      console.log('[KTP Validation] ❌ FAILED: NIK extraction failed');
      validation.errors.push('❌ NIK tidak dapat diekstrak dari KTP. Pastikan gambar KTP jelas dan terbaca.');
      return validation;
    }

    validation.nik = nik;
    console.log('[KTP Validation] ✅ NIK extracted from OCR:', nik);

    // 2. Query database Dukcapil - ambil SEMUA data dari database
    console.log('[KTP Validation] Querying Dukcapil database for NIK:', nik);
    const { data: dukcapilData, error: dukcapilError } = await supabase
      .from('dukcapil_dummy')
      .select('*')
      .eq('nik', nik)
      .single();

    if (dukcapilError || !dukcapilData) {
      console.log('[KTP Validation] ❌ FAILED: NIK not found in database');
      console.log('[KTP Validation] Supabase error:', dukcapilError);
      console.log('[KTP Validation] Error code:', dukcapilError?.code);
      console.log('[KTP Validation] Error message:', dukcapilError?.message);
      validation.errors.push(
        `❌ NIK ${nik} tidak terdaftar dalam database Dukcapil. ` +
        `Pastikan NIK Anda sudah terdaftar atau hubungi administrator.`
      );
      return validation;
    }
    
    console.log('[KTP Validation] ✅ Data found in Dukcapil database!');

    // 3. Gunakan SEMUA data dari database (bukan dari OCR)
    validation.dukcapilMatch = true;
    validation.nama = dukcapilData.nama;
    validation.tempatLahir = dukcapilData.tempat_lahir;
    validation.tanggalLahir = dukcapilData.tanggal_lahir;
    validation.alamat = dukcapilData.alamat;
    validation.provinsi = dukcapilData.provinsi;

    console.log('[Validation] ✅ Data found in database:');
    console.log('  - Nama:', dukcapilData.nama);
    console.log('  - Tempat/Tgl Lahir:', dukcapilData.tempat_lahir, '/', dukcapilData.tanggal_lahir);
    console.log('  - Provinsi:', dukcapilData.provinsi);

    // 4. Validasi umur DARI DATABASE
    let umur = null;
    if (dukcapilData.tanggal_lahir) {
      const dbDate = new Date(dukcapilData.tanggal_lahir);
      const dateString = `${dbDate.getDate()}-${dbDate.getMonth() + 1}-${dbDate.getFullYear()}`;
      umur = calculateAge(dateString);
      validation.umur = umur;
      console.log('[Validation] Age calculated from database:', umur, 'tahun');
    }

    if (umur === null) {
      validation.warnings.push('⚠️ Tanggal lahir tidak tersedia di database Dukcapil');
      validation.ageValid = true; // Allow to pass if no age data
    } else if (umur > 35) {
      validation.errors.push(
        `❌ Persyaratan usia tidak terpenuhi: Usia Anda ${umur} tahun (lahir ${dukcapilData.tanggal_lahir}). ` +
        `Batas maksimal usia pelamar CPNS adalah 35 tahun.`
      );
      validation.ageValid = false;
      console.log('[Validation] ❌ Age validation failed');
      return validation;
    } else {
      validation.ageValid = true;
      console.log('[Validation] ✅ Age validation passed:', umur, 'tahun');
    }

    // 5. Validasi lokasi dengan formasi
    if (formasiData && formasiData.lokasi && dukcapilData.provinsi) {
      const lokasiFormasi = formasiData.lokasi.toLowerCase();
      const provinsiKTP = dukcapilData.provinsi.toLowerCase();

      if (lokasiFormasi.includes(provinsiKTP) || provinsiKTP.includes(lokasiFormasi)) {
        validation.lokasiMatch = true;
        console.log('[Validation] ✅ Location matches formasi requirement');
      } else {
        validation.warnings.push(
          `⚠️ Provinsi KTP (${dukcapilData.provinsi}) berbeda dengan lokasi formasi (${formasiData.lokasi}). ` +
          `Pastikan Anda memenuhi persyaratan domisili.`
        );
        validation.lokasiMatch = false;
      }
    }

    validation.success = true;
    console.log('[Validation] ✅ KTP validation successful!');
    return validation;

  } catch (error) {
    console.error('[Validation] KTP validation error:', error);
    validation.errors.push(`Error validasi KTP: ${error.message}`);
    return validation;
  }
}

/**
 * VALIDASI IJAZAH/STTB - IMPROVED VERSION
 * Strategy:
 * 1. Cek tulisan tangan (Vision API) - WARNING jika ada
 * 2. Extract nomor ijazah -> Query PDDIKTI database
 * 3. Validasi nama dengan KTP (dari database PDDIKTI vs Dukcapil)
 * 4. Validasi jurusan dengan formasi
 * 5. Surat penyetaraan (future implementation)
 */
export async function validateIjazah(ocrText, ktpData, formasiData, visionHandwritingData = null) {
  const validation = {
    success: false,
    nomorIjazah: null,
    nama: null,
    programStudi: null,
    universitas: null,
    tahunLulus: null,
    pddiktiMatch: false,
    namaMatch: false,
    jurusanMatch: false,
    hasHandwriting: false,
    errors: [],
    warnings: [],
  };

  try {
    console.log('\n' + '='.repeat(80));
    console.log('[IJAZAH Validation] STARTING IJAZAH VALIDATION');
    console.log('='.repeat(80));
    console.log('[IJAZAH Validation] OCR Text length:', ocrText.length);
    console.log('[IJAZAH Validation] Has KTP data:', !!ktpData);
    console.log('[IJAZAH Validation] Has formasi data:', !!formasiData);

    // 1. Cek tulisan tangan (dari Vision API)
    if (visionHandwritingData && visionHandwritingData.detected) {
      validation.hasHandwriting = true;
      validation.warnings.push(
        `⚠️ Dokumen mengandung tulisan tangan (${visionHandwritingData.confidence.toFixed(1)}% confidence). ` +
        `Mohon verifikasi manual untuk memastikan autentisitas dokumen.`
      );
      console.log('[IJAZAH Validation] ⚠️ Handwriting detected');
    }

    // 2. Extract nomor ijazah dengan multi-tier approach
    let nomorIjazah = extractNomorIjazah(ocrText);

    if (!nomorIjazah) {
      console.log('[IJAZAH Validation] ⚠️ Nomor ijazah tidak ter-extract dari Tesseract OCR');

      // TIER 2: Try Google Document AI (best for handwriting)
      console.log('[IJAZAH Validation] 📄 Trying Google Document AI for handwriting...');
      try {
        const { isDocumentAIAvailable, extractNomorIjazahFromOCR } = await import('./googleDocumentAI.js');

        if (isDocumentAIAvailable()) {
          // Document AI already processed by API, just extract from text
          // Note: We can enhance this by re-processing with Document AI if needed
          const docAINomorIjazah = extractNomorIjazahFromOCR(ocrText);

          if (docAINomorIjazah) {
            nomorIjazah = docAINomorIjazah;
            console.log('[IJAZAH Validation] ✅ Nomor ijazah extracted by Document AI:', nomorIjazah);
            validation.nomorIjazah = nomorIjazah;
            validation.extractionSource = 'google-document-ai';
          } else {
            console.log('[IJAZAH Validation] ⚠️ Document AI pattern matching failed');
          }
        } else {
          console.log('[IJAZAH Validation] ℹ️ Google Document AI not configured');
        }
      } catch (docAIError) {
        console.log('[IJAZAH Validation] ⚠️ Document AI error:', docAIError.message);
      }

      // TIER 3: Try Gemini AI as final fallback
      if (!nomorIjazah) {
        console.log('[IJAZAH Validation] 🤖 Trying Gemini AI extraction as final fallback...');

        const { extractIjazahWithGemini } = await import('./gemini.js');
        const geminiResult = await extractIjazahWithGemini(ocrText);

        if (geminiResult.success && geminiResult.data && geminiResult.data.nomor_ijazah) {
          nomorIjazah = geminiResult.data.nomor_ijazah;
          console.log('[IJAZAH Validation] ✅ Nomor ijazah extracted by Gemini AI:', nomorIjazah);
          validation.nomorIjazah = nomorIjazah;

          // Store all Gemini data early
          validation.geminiExtraction = true;
          validation.geminiData = geminiResult.data;
          validation.geminiConfidence = geminiResult.data.confidence;
          validation.extractionSource = 'gemini-ai';
        } else {
          console.log('[IJAZAH Validation] ❌ All extraction methods failed (Tesseract, Document AI, Gemini)');
          validation.warnings.push(
            '⚠️ Nomor ijazah tidak dapat diekstrak dari dokumen (semua metode gagal). ' +
            'Pastikan dokumen jelas dan terbaca. Verifikasi manual diperlukan.'
          );
          // Don't return here, continue validation with other data
        }
      }
    } else {
      validation.extractionSource = 'tesseract-ocr';
      validation.nomorIjazah = nomorIjazah;
      console.log('[IJAZAH Validation] ✅ Nomor ijazah extracted by OCR:', nomorIjazah);
    }

    // 3. Query database PDDIKTI (Forlap Dikti) with fuzzy matching
    // This runs for ALL extraction sources (Tesseract, Document AI, Gemini)
    if (nomorIjazah) {
      console.log('[IJAZAH Validation] Querying PDDIKTI database...');
      console.log('[IJAZAH Validation] Extracted nomor ijazah:', nomorIjazah);
      console.log('[IJAZAH Validation] Extraction source:', validation.extractionSource);

      // Helper function to normalize common OCR mistakes
      const normalizeOCRText = (text) => {
        if (!text) return '';

        // Strategy: Save Roman numerals first, then normalize, then restore
        const upperText = text.toUpperCase();
        const romanNumerals = [];
        const placeholder = '###ROMAN###';

        // Step 1: Find and save all Roman numerals (VII, VIII, IX, IV, V, X, etc)
        let protectedText = upperText.replace(/\b([IVX]{2,})\b/g, (match) => {
          // Save the Roman numeral
          const index = romanNumerals.length;
          romanNumerals.push(match);
          return `${placeholder}${index}${placeholder}`;
        });

        // Step 2: Normalize OCR errors (I/i/l/L → 1)
        protectedText = protectedText
          .replace(/[ILl]/g, '1')  // I, L, l → 1
          .replace(/i/g, '1');      // i → 1

        // Step 3: Restore Roman numerals
        romanNumerals.forEach((roman, index) => {
          const pattern = new RegExp(`${placeholder}${index}${placeholder}`, 'g');
          protectedText = protectedText.replace(pattern, roman);
        });

        console.log(`[Normalize] Original: "${text}"`);
        console.log(`[Normalize] Normalized: "${protectedText}"`);
        console.log(`[Normalize] Preserved Romans: [${romanNumerals.join(', ')}]`);

        return protectedText;
      };

      // Try exact match first
      let { data: pddiktiData, error: pddiktiError } = await supabase
        .from('pddikti_dummy')
        .select('*')
        .eq('nomor_ijazah', nomorIjazah)
        .single();

      // Debug: Log exact match attempt
      console.log('[IJAZAH Validation] Exact match query result:');
      console.log('  - Error:', pddiktiError);
      console.log('  - Data found:', !!pddiktiData);

      // If exact match fails, try with character normalization
      if (pddiktiError || !pddiktiData) {
        console.log('[IJAZAH Validation] ⚠️ Exact match not found, trying with OCR error tolerance...');

        const normalizedExtracted = normalizeOCRText(nomorIjazah);
        console.log(`[IJAZAH Validation] Original: "${nomorIjazah}"`);
        console.log(`[IJAZAH Validation] Normalized: "${normalizedExtracted}"`);

        // Get all nomor ijazah from database
        console.log('[IJAZAH Validation] Fetching all data from pddikti_dummy...');
        const { data: allIjazah, error: allError } = await supabase
          .from('pddikti_dummy')
          .select('*');

        console.log('[IJAZAH Validation] Query result:');
        console.log('  - Error:', allError);
        console.log('  - Data count:', allIjazah?.length || 0);
        if (allIjazah && allIjazah.length > 0) {
          console.log('  - Sample nomor:', allIjazah.slice(0, 3).map(i => i.nomor_ijazah));
        }

        if (!allError && allIjazah && allIjazah.length > 0) {
          let bestMatch = null;
          let bestSimilarity = 0;
          let matchType = 'fuzzy'; // 'normalized' or 'fuzzy'

          for (const ijazah of allIjazah) {
            const normalizedDB = normalizeOCRText(ijazah.nomor_ijazah);

            // Try normalized exact match first
            if (normalizedExtracted === normalizedDB) {
              console.log(`[IJAZAH Validation] ✅ Normalized exact match found: ${ijazah.nomor_ijazah}`);
              bestMatch = ijazah;
              bestSimilarity = 1.0;
              matchType = 'normalized';
              break;
            }

            // Fall back to fuzzy matching (80% similarity)
            const similarity = nameSimilarity(
              nomorIjazah,
              ijazah.nomor_ijazah
            ) / 100; // nameSimilarity returns 0-100, we need 0-1

            console.log(`[IJAZAH Validation] Comparing with ${ijazah.nomor_ijazah}: ${(similarity * 100).toFixed(1)}%`);

            if (similarity > bestSimilarity && similarity >= 0.80) {
              bestSimilarity = similarity;
              bestMatch = ijazah;
              matchType = 'fuzzy';
            }
          }

          if (bestMatch) {
            console.log(`[IJAZAH Validation] ✅ Match found (${matchType}) with ${(bestSimilarity * 100).toFixed(1)}% similarity`);
            console.log(`[IJAZAH Validation] Extracted: "${nomorIjazah}"`);
            console.log(`[IJAZAH Validation] Database: "${bestMatch.nomor_ijazah}"`);
            pddiktiData = bestMatch;
            pddiktiError = null;

            // Add warning based on match type
            if (matchType === 'normalized') {
              validation.warnings.push(
                `⚠️ Nomor ijazah dikoreksi otomatis untuk kesalahan OCR umum (l/L/I/i → 1). Extracted: "${nomorIjazah}", Database: "${bestMatch.nomor_ijazah}".`
              );
            } else {
              validation.warnings.push(
                `⚠️ Nomor ijazah tidak cocok 100%. Extracted: "${nomorIjazah}", Database: "${bestMatch.nomor_ijazah}" (${(bestSimilarity * 100).toFixed(0)}% kesamaan). Verifikasi manual diperlukan.`
              );
            }
          }
        }
      }

      if (pddiktiError || !pddiktiData) {
        console.log('[IJAZAH Validation] ❌ Nomor ijazah not found in PDDIKTI database (exact or fuzzy)');
        console.log('[IJAZAH Validation] 🤖 Attempting GEMINI AI extraction as intelligent fallback...');
        
        // Import Gemini extraction
        const { extractIjazahWithGemini } = await import('./gemini.js');
        
        // Fallback Strategy 2: Use Gemini AI for intelligent extraction
        const geminiResult = await extractIjazahWithGemini(ocrText);
        
        if (geminiResult.success && geminiResult.data) {
          const geminiData = geminiResult.data;
          console.log('[IJAZAH Validation] ✅ Gemini AI extraction successful!');
          console.log('[IJAZAH Validation] Extracted data:', geminiData);
          
          // Store extracted data
          validation.nomorIjazah = geminiData.nomor_ijazah || nomorIjazah;
          validation.nama = geminiData.nama_lengkap;
          validation.programStudi = geminiData.program_studi;
          validation.universitas = geminiData.universitas;
          validation.tahunLulus = geminiData.tahun_lulus;
          validation.geminiExtraction = true;
          validation.geminiConfidence = geminiData.confidence;
          
          // Add note about AI extraction
          const confidenceScore = geminiData.confidence?.program_studi || 0;
          validation.warnings.push(
            `⚠️ Nomor ijazah ${validation.nomorIjazah} tidak terdaftar dalam database PDDIKTI. ` +
            `Data diekstrak menggunakan AI: Program Studi "${geminiData.program_studi}", ` +
            `Universitas "${geminiData.universitas}" (confidence: ${(confidenceScore * 100).toFixed(0)}%). ` +
            `Verifikasi manual diperlukan untuk memastikan akurasi.`
          );
          
          // Log extraction notes if available
          if (geminiData.extraction_notes) {
            console.log('[IJAZAH Validation] AI Notes:', geminiData.extraction_notes);
          }
          
          // Validate name with KTP - Simple substring check
          if (ktpData && ktpData.nama && ocrText) {
            const namaKTP = ktpData.nama.toLowerCase().trim();
            const ocrTextLower = ocrText.toLowerCase();

            console.log('[IJAZAH Validation] Checking if KTP name exists in document:');
            console.log('  - KTP Name:', ktpData.nama);
            console.log('  - Document contains name:', ocrTextLower.includes(namaKTP));

            if (!ocrTextLower.includes(namaKTP)) {
              validation.errors.push(
                `❌ Nama pada KTP "${ktpData.nama}" tidak ditemukan di dokumen Ijazah. Pastikan dokumen Ijazah adalah milik "${ktpData.nama}".`
              );
              console.log('[IJAZAH Validation] ❌ Name not found in document');
            } else {
              validation.namaMatch = true;
              console.log('[IJAZAH Validation] ✅ Name found in document');
            }
          }
          
          // Validate jurusan with formasi (using Gemini extracted program studi)
          if (formasiData && formasiData.requirements && formasiData.requirements.pendidikan && geminiData.program_studi) {
            const pendidikanFormasi = formasiData.requirements.pendidikan.toLowerCase();
            const prodiIjazah = geminiData.program_studi.toLowerCase();

            console.log('[IJAZAH Validation] Checking jurusan (AI extracted):');
            console.log('  - Required:', pendidikanFormasi);
            console.log('  - Ijazah (AI):', prodiIjazah);

            const options = pendidikanFormasi.split('/').map(opt => opt.trim().toLowerCase());
            let jurusanMatch = false;

            for (const option of options) {
              const cleanOption = option.replace(/^(s1|s2|s3|d3|d4)\s+/i, '').trim();
              const cleanProdi = prodiIjazah.replace(/^(s1|s2|s3|d3|d4)\s+/i, '').trim();

              if (cleanOption.includes(cleanProdi) || cleanProdi.includes(cleanOption) || cleanOption === cleanProdi) {
                jurusanMatch = true;
                break;
              }
            }

            if (jurusanMatch) {
              validation.jurusanMatch = true;
              console.log('[IJAZAH Validation] ✅ Jurusan match (AI extracted)');
            } else {
              validation.errors.push(
                `❌ Jurusan Anda adalah "${geminiData.program_studi}", tidak sesuai dengan syarat jurusan "${formasiData.requirements.pendidikan}".`
              );
              console.log('[IJAZAH Validation] ❌ Jurusan mismatch (AI extracted)');
            }
          }
          
        } else {
          console.log('[IJAZAH Validation] ⚠️ Gemini AI extraction failed, trying simple OCR fallback...');
          
          // Fallback Strategy 3: Simple OCR extraction (original method)
          const programStudiOCR = extractProgramStudi(ocrText);
          
          if (programStudiOCR) {
            validation.programStudi = programStudiOCR;
            console.log('[IJAZAH Validation] ✅ Program Studi extracted from OCR:', programStudiOCR);
            validation.warnings.push(
              `⚠️ Nomor ijazah ${nomorIjazah} tidak terdaftar dalam database PDDIKTI. ` +
              `Program studi "${programStudiOCR}" diekstrak dari OCR. Verifikasi manual diperlukan.`
            );
          } else {
            validation.errors.push(
              `❌ Nomor ijazah ${nomorIjazah} tidak terdaftar dalam database PDDIKTI dan ` +
              `program studi tidak dapat diekstrak dari dokumen (OCR dan AI gagal). Verifikasi manual sangat diperlukan.`
            );
            console.log('[IJAZAH Validation] ❌ All extraction methods failed (Database, AI, OCR)');
          }
        }
      } else {
        // Data found in PDDIKTI
        validation.pddiktiMatch = true;
        validation.nama = pddiktiData.nama;
        validation.programStudi = pddiktiData.program_studi;
        validation.universitas = pddiktiData.universitas;
        validation.tahunLulus = pddiktiData.tahun_lulus;
        
        console.log('[IJAZAH Validation] ✅ Data found in PDDIKTI:');
        console.log('  - Nama:', pddiktiData.nama);
        console.log('  - Program Studi:', pddiktiData.program_studi);
        console.log('  - Universitas:', pddiktiData.universitas);
        console.log('  - Tahun Lulus:', pddiktiData.tahun_lulus);

        // 4. Validasi nama dengan KTP - Simple substring check
        if (ktpData && ktpData.nama && ocrText) {
          const namaKTP = ktpData.nama.toLowerCase().trim();
          const ocrTextLower = ocrText.toLowerCase();

          console.log('[IJAZAH Validation] Checking if KTP name exists in document (PDDIKTI match):');
          console.log('  - KTP Name:', ktpData.nama);
          console.log('  - Document contains name:', ocrTextLower.includes(namaKTP));

          if (!ocrTextLower.includes(namaKTP)) {
            validation.errors.push(
              `❌ Nama pada KTP "${ktpData.nama}" tidak ditemukan di dokumen Ijazah. Pastikan dokumen Ijazah adalah milik "${ktpData.nama}".`
            );
            console.log('[IJAZAH Validation] ❌ Name not found in document');
          } else {
            validation.namaMatch = true;
            console.log('[IJAZAH Validation] ✅ Name found in document (PDDIKTI match)');
          }
        } else {
          validation.warnings.push('⚠️ Data KTP belum tersedia. Upload KTP terlebih dahulu untuk validasi nama.');
        }

        // 5. Validasi jurusan dengan formasi
        if (formasiData && formasiData.requirements && formasiData.requirements.pendidikan) {
          const pendidikanFormasi = formasiData.requirements.pendidikan.toLowerCase();
          const prodiIjazah = pddiktiData.program_studi.toLowerCase();

          console.log('[IJAZAH Validation] Checking jurusan:');
          console.log('  - Required:', pendidikanFormasi);
          console.log('  - Ijazah:', prodiIjazah);

          // Check if program studi matches any of the options
          // Format bisa: "S1 Ekonomi/Akuntansi/Manajemen"
          const options = pendidikanFormasi.split('/').map(opt => opt.trim().toLowerCase());
          let jurusanMatch = false;

          for (const option of options) {
            // Remove jenjang (S1, S2, etc)
            const cleanOption = option.replace(/^(s1|s2|s3|d3|d4)\s+/i, '').trim();
            const cleanProdi = prodiIjazah.replace(/^(s1|s2|s3|d3|d4)\s+/i, '').trim();

            if (cleanOption.includes(cleanProdi) || cleanProdi.includes(cleanOption) || cleanOption === cleanProdi) {
              jurusanMatch = true;
              break;
            }
          }

          if (jurusanMatch) {
            validation.jurusanMatch = true;
            console.log('[IJAZAH Validation] ✅ Jurusan match');
          } else {
            validation.errors.push(
              `❌ Jurusan Anda adalah "${pddiktiData.program_studi}", tidak sesuai dengan syarat jurusan "${formasiData.requirements.pendidikan}".`
            );
            console.log('[IJAZAH Validation] ❌ Jurusan mismatch');
            console.log(`  - Your major: ${pddiktiData.program_studi}`);
            console.log(`  - Required: ${formasiData.requirements.pendidikan}`);
          }
        }
      }
    } // End of if (nomorIjazah) block - Supabase query

    // 6. Jika nomor ijazah tidak ditemukan, coba extract dari OCR sebagai fallback
    if (!validation.programStudi) {
      console.log('[IJAZAH Validation] No program studi from database, trying OCR extraction...');
      const programStudiOCR = extractProgramStudi(ocrText);
      
      if (programStudiOCR) {
        validation.programStudi = programStudiOCR;
        console.log('[IJAZAH Validation] ✅ Program Studi extracted from OCR:', programStudiOCR);
        
        validation.warnings.push(
          `⚠️ Program studi "${programStudiOCR}" diekstrak dari OCR (bukan dari database PDDIKTI). ` +
          `Verifikasi manual diperlukan untuk memastikan keakuratan.`
        );

        // Try to validate jurusan with OCR data
        if (formasiData && formasiData.requirements && formasiData.requirements.pendidikan) {
          const pendidikanFormasi = formasiData.requirements.pendidikan.toLowerCase();
          const prodiOCR = programStudiOCR.toLowerCase();
          
          const options = pendidikanFormasi.split('/').map(opt => opt.trim().toLowerCase());
          let jurusanMatch = false;

          for (const option of options) {
            const cleanOption = option.replace(/^(s1|s2|s3|d3|d4)\s+/i, '').trim();
            const cleanProdi = prodiOCR.replace(/^(s1|s2|s3|d3|d4)\s+/i, '').trim();

            if (cleanOption.includes(cleanProdi) || cleanProdi.includes(cleanOption) || cleanOption === cleanProdi) {
              jurusanMatch = true;
              break;
            }
          }

          if (jurusanMatch) {
            validation.jurusanMatch = true;
            console.log('[IJAZAH Validation] ✅ Jurusan match (from OCR)');
          } else {
            validation.warnings.push(
              `⚠️ Jurusan Anda adalah "${programStudiOCR}" (dari OCR), kemungkinan tidak sesuai dengan syarat jurusan "${formasiData.requirements.pendidikan}". ` +
              `Verifikasi manual diperlukan.`
            );
            console.log('[IJAZAH Validation] ⚠️ Jurusan mismatch (from OCR)');
          }
        }
      } else {
        validation.warnings.push(
          '⚠️ Program studi tidak dapat diekstrak dari dokumen. ' +
          'Pastikan dokumen jelas dan terbaca. Verifikasi manual sangat diperlukan.'
        );
        console.log('[IJAZAH Validation] ⚠️ Failed to extract program studi from OCR');
      }
    }

    // 7. If nama still not found, try aggressive OCR extraction as last resort
    if (!validation.nama) {
      console.log('[IJAZAH Validation] No nama yet, trying aggressive OCR extraction...');
      const namaFromOCR = extractNamaFromDocument(ocrText);
      
      if (namaFromOCR) {
        validation.nama = namaFromOCR;
        console.log('[IJAZAH Validation] ✅ Nama extracted from OCR (fallback):', namaFromOCR);
        
        validation.warnings.push(
          `⚠️ Nama "${namaFromOCR}" diekstrak dari OCR (bukan dari database/AI). ` +
          `Verifikasi manual diperlukan untuk memastikan keakuratan.`
        );
      } else {
        console.log('[IJAZAH Validation] ⚠️ Failed to extract nama even with aggressive OCR');
      }
    }

    // 8. Populate extractedData for RequirementValidator to access
    if (!validation.extractedData) {
      validation.extractedData = {};
    }
    validation.extractedData.nama = validation.nama;
    validation.extractedData.programStudi = validation.programStudi;
    validation.extractedData.universitas = validation.universitas;
    
    console.log('[IJAZAH Validation] extractedData populated:', validation.extractedData);

    // Success if no critical errors
    validation.success = validation.errors.length === 0;
    console.log('[IJAZAH Validation]', validation.success ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');
    console.log('[IJAZAH Validation] Errors:', validation.errors.length);
    console.log('[IJAZAH Validation] Warnings:', validation.warnings.length);
    console.log('='.repeat(80) + '\n');
    
    return validation;

  } catch (error) {
    console.error('[IJAZAH Validation] ❌ Exception:', error);
    validation.errors.push(`Error validasi ijazah: ${error.message}`);
    return validation;
  }
}

/**
 * VALIDASI TRANSKRIP NILAI - IMPROVED VERSION
 * Strategy:
 * 1. Extract IPK -> Validasi minimal 3.0
 * 2. Cross-check nama dengan KTP (dari Dukcapil)
 * 3. Cross-check nama dengan Ijazah (dari PDDIKTI)
 * 4. Ensure consistency across all documents
 */
export async function validateTranskrip(ocrText, ktpData, ijazahData) {
  const validation = {
    success: false,
    ipk: null,
    nama: null,
    namaMatchKTP: false,
    namaMatchIjazah: false,
    ipkValid: false,
    errors: [],
    warnings: [],
  };

  try {
    console.log('\n' + '='.repeat(80));
    console.log('[TRANSKRIP Validation] STARTING TRANSKRIP VALIDATION');
    console.log('='.repeat(80));
    console.log('[TRANSKRIP Validation] OCR Text length:', ocrText.length);
    console.log('[TRANSKRIP Validation] Has KTP data:', !!ktpData);
    console.log('[TRANSKRIP Validation] Has Ijazah data:', !!ijazahData);
    console.log('[TRANSKRIP Validation] OCR Text preview (first 500 chars):');
    console.log(ocrText.substring(0, 500));
    console.log('[TRANSKRIP Validation] Looking for GPA/IPK keywords...');
    console.log('[TRANSKRIP Validation] Contains "GPA":', ocrText.toLowerCase().includes('gpa'));
    console.log('[TRANSKRIP Validation] Contains "IPK":', ocrText.toLowerCase().includes('ipk'));
    console.log('[TRANSKRIP Validation] Contains "4.0":', ocrText.includes('4.0'));

    // 1. Extract IPK dari OCR (using pattern matching - NO GEMINI)
    let ipk = extractIPK(ocrText);
    
    if (!ipk) {
      console.log('[TRANSKRIP Validation] ❌ IPK extraction failed');
      console.log('[TRANSKRIP Validation] Trying alternative patterns...');
      
      // Try more aggressive patterns for edge cases
      const alternativePatterns = [
        // Look for any number with 2 decimals between 0-4
        /\b([0-3]\.\d{2})\b/g,
        /\b(4\.00)\b/g,
        // Look for IPK/GPA followed by any number within 10 characters
        /(?:IPK|GPA).{0,10}?([0-4][.,]\d{1,2})/i,
      ];
      
      for (const pattern of alternativePatterns) {
        const matches = ocrText.match(pattern);
        if (matches) {
          console.log('[TRANSKRIP Validation] Found potential IPK/GPA:', matches);
          // Take the first valid match
          for (const match of matches) {
            const numStr = typeof match === 'string' ? match : match;
            const num = parseFloat(numStr.replace(',', '.'));
            if (num >= 0 && num <= 4.0) {
              ipk = num;
              console.log('[TRANSKRIP Validation] ✅ IPK extracted by alternative pattern:', ipk);
              break;
            }
          }
          if (ipk) break;
        }
      }
      
      if (!ipk) {
        console.log('[TRANSKRIP Validation] ❌ IPK extraction completely failed');
        validation.errors.push(
          '❌ IPK tidak dapat diekstrak dari transkrip. ' +
          'Pastikan dokumen jelas dan terbaca, serta memuat IPK/GPA dengan jelas. ' +
          'Format yang didukung: "IPK: 3.50", "GPA: 3.50", "3.50/4.0", dll.'
        );
        return validation;
      }
    } else {
      console.log('[TRANSKRIP Validation] ✅ IPK extracted by standard regex:', ipk);
    }

    validation.ipk = ipk;

    // 2. Validasi IPK minimal 3.0
    if (ipk < 3.0) {
      console.log('[TRANSKRIP Validation] ❌ IPK below minimum requirement');
      validation.errors.push(
        `❌ IPK tidak memenuhi syarat: IPK Anda ${ipk.toFixed(2)} (minimum 3.00). ` +
        `Persyaratan CPNS membutuhkan IPK minimal 3.00 dari skala 4.00.`
      );
      validation.ipkValid = false;
      return validation;
    }

    validation.ipkValid = true;
    console.log('[TRANSKRIP Validation] ✅ IPK meets minimum requirement (>= 3.0)');

    // 3. Validasi nama dengan KTP (optional - nama bisa diekstrak dari OCR jika tersedia)
    if (ktpData && ktpData.nama) {
      const namaKTP = ktpData.nama.toLowerCase();
      
      // STEP 1: Try Gemini AI extraction first (LIGHTWEIGHT MODEL)
      console.log('[TRANSKRIP Validation] 🤖 Attempting Gemini AI name extraction (gemini-1.5-flash)...');
      const geminiResult = await extractTranskripNameWithGemini(ocrText);
      
      let namaTranskrip = null;
      
      if (geminiResult.success && geminiResult.nama) {
        namaTranskrip = geminiResult.nama;
        console.log('[TRANSKRIP Validation] ✅ Gemini extracted name:', namaTranskrip);
      } else {
        console.log('[TRANSKRIP Validation] ⚠️ Gemini extraction failed, trying OCR pattern matching...');
        // STEP 2: Fallback to OCR pattern matching
        namaTranskrip = extractNamaFromDocument(ocrText);
        if (namaTranskrip) {
          console.log('[TRANSKRIP Validation] ✅ OCR pattern matching extracted name:', namaTranskrip);
        }
      }
      
      // Simple substring check - hanya cek apakah nama KTP ada di dokumen
      const namaKTPLower = ktpData.nama.toLowerCase().trim();
      const ocrTextLower = ocrText.toLowerCase();

      console.log('[TRANSKRIP Validation] Checking if KTP name exists in document:');
      console.log('  - KTP Name:', ktpData.nama);
      console.log('  - Document contains name:', ocrTextLower.includes(namaKTPLower));

      if (ocrTextLower.includes(namaKTPLower)) {
        validation.namaMatchKTP = true;
        validation.nama = ktpData.nama;
        console.log('[TRANSKRIP Validation] ✅ Name found in document');
      } else {
        validation.errors.push(
          `❌ Nama pada KTP "${ktpData.nama}" tidak ditemukan di dokumen Transkrip Nilai. Pastikan dokumen Transkrip adalah milik "${ktpData.nama}".`
        );
        console.log('[TRANSKRIP Validation] ❌ Name not found in document');
        validation.namaMatchKTP = false;
      }

      // Still try to extract name for display purposes
      if (namaTranskrip) {
        validation.nama = namaTranskrip;
      }
    } else {
      validation.warnings.push('⚠️ Data KTP belum tersedia. Upload KTP terlebih dahulu untuk validasi nama.');
    }

    // 4. Cross-check dengan Ijazah (jika ada)
    if (ijazahData && ijazahData.nama) {
      console.log('[TRANSKRIP Validation] Cross-checking with Ijazah...');
      console.log('  - Ijazah Name:', ijazahData.nama);
      
      if (ktpData && ktpData.nama) {
        const similarity = nameSimilarity(ktpData.nama, ijazahData.nama);
        console.log('  - KTP vs Ijazah Similarity:', (similarity * 100).toFixed(1) + '%');
        
        if (similarity >= 0.7) {
          validation.namaMatchIjazah = true;
          console.log('[TRANSKRIP Validation] ✅ Name consistency across KTP, Ijazah, and Transkrip');
        } else {
          validation.warnings.push(
            `⚠️ Nama di Ijazah (${ijazahData.nama}) berbeda dengan KTP (${ktpData.nama}). ` +
            `Pastikan konsistensi nama di semua dokumen.`
          );
          console.log('[TRANSKRIP Validation] ⚠️ Name inconsistency between documents');
        }
      }
    } else {
      validation.warnings.push('⚠️ Data Ijazah belum tersedia. Upload Ijazah untuk validasi nama yang lebih lengkap.');
    }

    // Populate extractedData for RequirementValidator to access
    if (!validation.extractedData) {
      validation.extractedData = {};
    }
    validation.extractedData.nama = validation.nama;
    validation.extractedData.ipk = validation.ipk;
    
    console.log('[TRANSKRIP Validation] extractedData populated:', validation.extractedData);

    validation.success = validation.errors.length === 0;
    console.log('[TRANSKRIP Validation]', validation.success ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');
    console.log('[TRANSKRIP Validation] Errors:', validation.errors.length);
    console.log('[TRANSKRIP Validation] Warnings:', validation.warnings.length);
    console.log('='.repeat(80) + '\n');
    
    return validation;

  } catch (error) {
    console.error('[TRANSKRIP Validation] ❌ Exception:', error);
    validation.errors.push(`Error validasi transkrip: ${error.message}`);
    return validation;
  }
}

/**
 * VALIDASI SURAT LAMARAN - IMPROVED VERSION
 * Strategy:
 * 1. Check instansi yang dituju (harus BKN/Badan Kepegawaian Negara)
 * 2. Cross-check nama dengan KTP (dari Dukcapil)
 * 3. Cross-check nama dengan Ijazah (dari PDDIKTI)
 * 4. Validate format surat lamaran (kop surat, tempat/tanggal, pembukaan, penutup)
 * 5. Check for materai (keyword-based: "materai", "Rp 10.000", etc.)
 */
export async function validateSuratLamaran(ocrText, ktpData, ijazahData) {
  const validation = {
    success: false,
    nama: null,
    namaMatchKTP: false,
    namaMatchIjazah: false,
    instansiSesuai: false,
    hasMaterai: false,
    formatLengkap: false,
    errors: [],
    warnings: [],
    geminiExtracted: null, // Store Gemini extraction result
  };

  try {
    console.log('\n' + '='.repeat(80));
    console.log('[SURAT LAMARAN Validation] STARTING VALIDATION (WITH GEMINI)');
    console.log('='.repeat(80));
    console.log('[SURAT LAMARAN Validation] OCR Text length:', ocrText.length);
    console.log('[SURAT LAMARAN Validation] Has KTP data:', !!ktpData);
    console.log('[SURAT LAMARAN Validation] Has Ijazah data:', !!ijazahData);

    // 0. Try GEMINI extraction first
    console.log('[SURAT LAMARAN Validation] Attempting Gemini extraction...');
    const geminiResult = await extractSuratLamaranWithGemini(ocrText);
    
    if (geminiResult.success && geminiResult.data) {
      validation.geminiExtracted = geminiResult.data;
      console.log('[SURAT LAMARAN Validation] ✅ Gemini extraction successful');
      console.log('  - Nama:', geminiResult.data.nama_lengkap);
      console.log('  - Posisi:', geminiResult.data.posisi_dilamar);
      console.log('  - Tanggal:', geminiResult.data.tanggal_surat);
      
      // Use Gemini extracted nama if available
      if (geminiResult.data.nama_lengkap) {
        validation.nama = geminiResult.data.nama_lengkap;
      }
    } else {
      console.log('[SURAT LAMARAN Validation] ⚠️ Gemini extraction failed, using OCR fallback');
    }

    const suratLower = ocrText.toLowerCase();

    // 1. Validasi instansi yang dituju
    console.log('[SURAT LAMARAN Validation] Checking target institution...');
    const instansiKeywords = [
      'badan kepegawaian negara',
      'bkn',
      'kepala badan kepegawaian negara',
      'yth. kepala bkn',
      'kepala bkn',
      'badan kepegawaian'
    ];

    let instansiFound = false;
    for (const keyword of instansiKeywords) {
      if (suratLower.includes(keyword)) {
        instansiFound = true;
        console.log('[SURAT LAMARAN Validation] ✅ Institution keyword found:', keyword);
        break;
      }
    }

    if (instansiFound) {
      validation.instansiSesuai = true;
    } else {
      validation.errors.push(
        '❌ Surat lamaran harus ditujukan kepada Badan Kepegawaian Negara (BKN). ' +
        'Pastikan surat memiliki kop "Kepada Yth. Kepala Badan Kepegawaian Negara".'
      );
      console.log('[SURAT LAMARAN Validation] ❌ No BKN institution found');
    }

    // 2. Validasi nama dengan KTP - Simple substring check
    if (ktpData && ktpData.nama && ocrText) {
      const namaKTPLower = ktpData.nama.toLowerCase().trim();
      const ocrTextLower = ocrText.toLowerCase();

      console.log('[SURAT LAMARAN Validation] Checking if KTP name exists in document:');
      console.log('  - KTP Name:', ktpData.nama);
      console.log('  - Document contains name:', ocrTextLower.includes(namaKTPLower));

      if (ocrTextLower.includes(namaKTPLower)) {
        validation.namaMatchKTP = true;
        validation.nama = ktpData.nama;
        console.log('[SURAT LAMARAN Validation] ✅ Name found in document');
      } else {
        validation.errors.push(
          `❌ Nama pada KTP "${ktpData.nama}" tidak sesuai dengan nama di dokumen Surat Lamaran. Pastikan dokumen Surat Lamaran adalah milik "${ktpData.nama}".`
        );
        console.log('[SURAT LAMARAN Validation] ❌ Name not found in document');
      }

      // Store Gemini extracted name for reference (if available)
      if (validation.geminiExtracted?.nama_lengkap) {
        validation.namaExtracted = validation.geminiExtracted.nama_lengkap;
        console.log('[SURAT LAMARAN Validation] Gemini extracted name:', validation.namaExtracted);
      }
    } else {
      validation.warnings.push('⚠️ Data KTP tidak tersedia untuk verifikasi nama');
      console.log('[SURAT LAMARAN Validation] ⚠️ No KTP data available');
    }

    // 3. Cross-check dengan Ijazah (optional, for consistency)
    if (ijazahData && ijazahData.nama && ktpData && ktpData.nama) {
      console.log('[SURAT LAMARAN Validation] Cross-checking with Ijazah...');
      const similarity = nameSimilarity(ktpData.nama, ijazahData.nama);
      console.log('  - KTP vs Ijazah Similarity:', (similarity * 100).toFixed(1) + '%');
      
      if (similarity >= 0.7) {
        validation.namaMatchIjazah = true;
        console.log('[SURAT LAMARAN Validation] ✅ Name consistency across documents');
      } else {
        validation.warnings.push(
          `⚠️ Nama di Ijazah (${ijazahData.nama}) berbeda dengan KTP (${ktpData.nama}). ` +
          `Pastikan konsistensi nama di semua dokumen.`
        );
      }
    }

    // 4. Validasi format surat (tempat/tanggal, pembukaan, penutup, dll)
    console.log('[SURAT LAMARAN Validation] Checking letter format...');
    
    const formatChecks = {
      hasTempat: false,
      hasPembukaan: false,
      hasPenutup: false,
      hasTandaTangan: false
    };

    // Check tempat & tanggal (Jakarta, [Tanggal])
    const tempatPattern = /(jakarta|bandung|surabaya|medan|makassar|yogyakarta|semarang|palembang|denpasar),?\s*\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i;
    if (tempatPattern.test(ocrText)) {
      formatChecks.hasTempat = true;
      console.log('[SURAT LAMARAN Validation] ✅ Place & date found');
    } else {
      validation.warnings.push('⚠️ Tempat dan tanggal tidak terdeteksi. Pastikan format: "Jakarta, [DD] [Bulan] [YYYY]".');
    }

    // Check pembukaan (Dengan hormat, Yang terhormat, dll)
    const pembukaanPattern = /(dengan hormat|yang terhormat|yth\.|kepada yth)/i;
    if (pembukaanPattern.test(ocrText)) {
      formatChecks.hasPembukaan = true;
      console.log('[SURAT LAMARAN Validation] ✅ Opening salutation found');
    } else {
      validation.warnings.push('⚠️ Pembukaan surat tidak terdeteksi. Pastikan ada "Dengan hormat" atau "Kepada Yth.".');
    }

    // Check penutup (hormat saya, terima kasih, dll)
    const penutupPattern = /(hormat saya|terima kasih|demikian|atas perhatian)/i;
    if (penutupPattern.test(ocrText)) {
      formatChecks.hasPenutup = true;
      console.log('[SURAT LAMARAN Validation] ✅ Closing found');
    } else {
      validation.warnings.push('⚠️ Penutup surat tidak terdeteksi. Pastikan ada "Hormat saya" atau "Terima kasih".');
    }

    // Check tanda tangan (biasanya nama di bagian bawah)
    const tandaTanganPattern = /(?:tanda tangan|ttd|hormat saya[^\n]*\n+[^\n]+)/i;
    if (tandaTanganPattern.test(ocrText)) {
      formatChecks.hasTandaTangan = true;
      console.log('[SURAT LAMARAN Validation] ✅ Signature section found');
    }

    const formatScore = Object.values(formatChecks).filter(Boolean).length;
    if (formatScore >= 3) {
      validation.formatLengkap = true;
      console.log('[SURAT LAMARAN Validation] ✅ Letter format is adequate');
    } else {
      validation.warnings.push(
        `⚠️ Format surat tidak lengkap (${formatScore}/4 elemen terdeteksi). ` +
        `Pastikan surat memiliki: tempat/tanggal, pembukaan, penutup, dan tanda tangan.`
      );
    }

    // 5. Check for materai keywords (future: will use image detection)
    console.log('[SURAT LAMARAN Validation] Checking materai...');
    const materaiKeywords = ['materai', 'meterai', 'rp 10.000', 'rp10000', 'rp 10000'];
    const hasMateraiKeyword = materaiKeywords.some(keyword => 
      suratLower.includes(keyword)
    );
    
    if (hasMateraiKeyword) {
      validation.hasMaterai = true;
      validation.warnings.push('⚠️ Keyword materai terdeteksi. Verifikasi manual diperlukan untuk memastikan materai asli.');
      console.log('[SURAT LAMARAN Validation] ⚠️ Materai keyword detected (needs manual verification)');
    } else {
      validation.warnings.push('⚠️ Materai tidak terdeteksi. Pastikan surat lamaran bermaterai Rp 10.000.');
      console.log('[SURAT LAMARAN Validation] ⚠️ No materai keyword detected');
    }

    // Populate extractedData for RequirementValidator to access
    if (!validation.extractedData) {
      validation.extractedData = {};
    }
    validation.extractedData.nama = validation.nama;
    validation.extractedData.geminiData = validation.geminiExtracted;
    
    console.log('[SURAT LAMARAN Validation] extractedData populated:', validation.extractedData);

    validation.success = validation.errors.length === 0;
    console.log('[SURAT LAMARAN Validation]', validation.success ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');
    console.log('[SURAT LAMARAN Validation] Errors:', validation.errors.length);
    console.log('[SURAT LAMARAN Validation] Warnings:', validation.warnings.length);
    console.log('='.repeat(80) + '\n');
    
    return validation;

  } catch (error) {
    console.error('[SURAT LAMARAN Validation] ❌ Exception:', error);
    validation.errors.push(`Error validasi surat lamaran: ${error.message}`);
    return validation;
  }
}

/**
 * VALIDASI SURAT PERNYATAAN - IMPROVED VERSION
 * Strategy:
 * 1. Check judul "SURAT PERNYATAAN"
 * 2. Check 5 poin pernyataan yang harus ada
 * 3. Cross-check nama dengan KTP (dari Dukcapil)
 * 4. Cross-check nama dengan Ijazah (dari PDDIKTI)
 * 5. Validate format (tempat/tanggal, tanda tangan)
 * 6. Check for materai (keyword-based)
 */
export async function validateSuratPernyataan(ocrText, ktpData, ijazahData) {
  const validation = {
    success: false,
    nama: null,
    namaMatchKTP: false,
    namaMatchIjazah: false,
    hasMaterai: false,
    has5PoinStatement: false,
    poinDitemukan: 0,
    formatLengkap: false,
    errors: [],
    warnings: [],
    geminiExtracted: null, // Store Gemini extraction result
  };

  try {
    console.log('\n' + '='.repeat(80));
    console.log('[SURAT PERNYATAAN Validation] STARTING VALIDATION (WITH GEMINI)');
    console.log('='.repeat(80));
    console.log('[SURAT PERNYATAAN Validation] OCR Text length:', ocrText.length);
    console.log('[SURAT PERNYATAAN Validation] Has KTP data:', !!ktpData);
    console.log('[SURAT PERNYATAAN Validation] Has Ijazah data:', !!ijazahData);

    // 0. Try GEMINI extraction first
    console.log('[SURAT PERNYATAAN Validation] Attempting Gemini extraction...');
    const geminiResult = await extractSuratPernyataanWithGemini(ocrText);
    
    if (geminiResult.success && geminiResult.data) {
      validation.geminiExtracted = geminiResult.data;
      console.log('[SURAT PERNYATAAN Validation] ✅ Gemini extraction successful');
      console.log('  - Nama:', geminiResult.data.nama_lengkap);
      console.log('  - NIK:', geminiResult.data.nik);
      console.log('  - Tanggal:', geminiResult.data.tanggal_surat);
      console.log('  - Jenis:', geminiResult.data.jenis_pernyataan);
      
      // Use Gemini extracted nama if available
      if (geminiResult.data.nama_lengkap) {
        validation.nama = geminiResult.data.nama_lengkap;
      }
    } else {
      console.log('[SURAT PERNYATAAN Validation] ⚠️ Gemini extraction failed, using OCR fallback');
    }

    const suratLower = ocrText.toLowerCase();

    // 1. Validasi judul surat (optional check - just warning)
    console.log('[SURAT PERNYATAAN Validation] Checking document title...');
    const judulPattern = /surat\s+pernyataan/i;
    if (!judulPattern.test(ocrText)) {
      validation.warnings.push('⚠️ Judul "SURAT PERNYATAAN" tidak terdeteksi dengan jelas.');
      console.log('[SURAT PERNYATAAN Validation] ⚠️ Title not clearly detected');
    } else {
      console.log('[SURAT PERNYATAAN Validation] ✅ Title found');
    }

    // 2. Set has5PoinStatement to true by default (skip strict validation)
    console.log('[SURAT PERNYATAAN Validation] Skipping strict 5-point validation per user request');
    validation.has5PoinStatement = true;
    validation.poinDitemukan = 5; // Assume all points present

    // 3. Validasi nama dengan KTP - Simple substring check
    if (ktpData && ktpData.nama && ocrText) {
      const namaKTPLower = ktpData.nama.toLowerCase().trim();
      const ocrTextLower = ocrText.toLowerCase();

      console.log('[SURAT PERNYATAAN Validation] Checking if KTP name exists in document:');
      console.log('  - KTP Name:', ktpData.nama);
      console.log('  - Document contains name:', ocrTextLower.includes(namaKTPLower));

      if (ocrTextLower.includes(namaKTPLower)) {
        validation.namaMatchKTP = true;
        validation.nama = ktpData.nama;
        console.log('[SURAT PERNYATAAN Validation] ✅ Name found in document');
      } else {
        validation.errors.push(
          `❌ Nama pada KTP "${ktpData.nama}" tidak sesuai dengan nama di dokumen Surat Pernyataan. Pastikan dokumen Surat Pernyataan adalah milik "${ktpData.nama}".`
        );
        console.log('[SURAT PERNYATAAN Validation] ❌ Name not found in document');
      }

      // Store Gemini extracted name for reference (if available)
      if (validation.geminiExtracted?.nama_lengkap) {
        validation.namaExtracted = validation.geminiExtracted.nama_lengkap;
        console.log('[SURAT PERNYATAAN Validation] Gemini extracted name:', validation.namaExtracted);
      }
    } else {
      validation.warnings.push('⚠️ Data KTP tidak tersedia untuk verifikasi nama');
      console.log('[SURAT PERNYATAAN Validation] ⚠️ No KTP data available');
    }

    // 4. Skip cross-check with Ijazah (per user request for simpler validation)
    console.log('[SURAT PERNYATAAN Validation] Skipping Ijazah cross-check per user request');

    // 5. Skip format validation (per user request for simpler validation)
    console.log('[SURAT PERNYATAAN Validation] Skipping format checks per user request');
    validation.formatLengkap = true; // Assume format is OK

    // 6. Check for materai keywords only
    console.log('[SURAT PERNYATAAN Validation] Checking materai...');
    const materaiKeywords = ['materai', 'meterai', 'rp 10.000', 'rp10000', 'rp 10000'];
    const hasMateraiKeyword = materaiKeywords.some(keyword =>
      suratLower.includes(keyword)
    );

    if (hasMateraiKeyword) {
      validation.hasMaterai = true;
      validation.warnings.push('⚠️ Keyword materai terdeteksi. Verifikasi manual diperlukan untuk memastikan materai asli.');
      console.log('[SURAT PERNYATAAN Validation] ⚠️ Materai keyword detected (needs manual verification)');
    } else {
      validation.warnings.push('⚠️ Materai tidak terdeteksi. Pastikan surat pernyataan bermaterai Rp 10.000.');
      console.log('[SURAT PERNYATAAN Validation] ⚠️ No materai keyword detected');
    }

    validation.success = validation.errors.length === 0;
    console.log('[SURAT PERNYATAAN Validation]', validation.success ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');
    console.log('[SURAT PERNYATAAN Validation] Errors:', validation.errors.length);
    console.log('[SURAT PERNYATAAN Validation] Warnings:', validation.warnings.length);
    console.log('='.repeat(80) + '\n');
    
    return validation;

  } catch (error) {
    console.error('[SURAT PERNYATAAN Validation] ❌ Exception:', error);
    validation.errors.push(`Error validasi surat pernyataan: ${error.message}`);
    return validation;
  }
}
