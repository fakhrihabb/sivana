/**
 * Requirement Validator
 * Validates uploaded documents against formasi requirements
 * Checks: IPK, Jurusan, Usia, Surat Lamaran validity, etc.
 */

import { matchProgramStudiWithGemini } from '@/lib/gemini';

export async function validateRequirements(uploadedDocs, requirements) {
  const validationResults = {
    overall: "passed", // passed, warning, failed
    checks: [],
    score: 0,
    totalChecks: 0,
  };

  // 1. Validate IPK from transkrip
  if (uploadedDocs.transkrip && requirements.ipk) {
    validationResults.totalChecks++;
    const extractedIPK = parseFloat(
      uploadedDocs.transkrip.result.extractedData?.ipk || "0"
    );
    const requiredIPK = parseFloat(requirements.ipk);

    if (extractedIPK > 0 && extractedIPK >= requiredIPK) {
      validationResults.checks.push({
        category: "IPK",
        status: "passed",
        label: "IPK Memenuhi Syarat",
        detail: `IPK Anda: ${extractedIPK} (min. ${requiredIPK})`,
        extractedValue: extractedIPK,
        requiredValue: requiredIPK,
      });
      validationResults.score++;
    } else if (extractedIPK === 0) {
      validationResults.checks.push({
        category: "IPK",
        status: "warning",
        label: "IPK Tidak Terdeteksi",
        detail: `IPK tidak dapat diekstrak dari dokumen, perlu ditinjau manual`,
        extractedValue: extractedIPK,
        requiredValue: requiredIPK,
      });
      if (validationResults.overall !== "failed") {
        validationResults.overall = "warning";
      }
    } else {
      validationResults.checks.push({
        category: "IPK",
        status: "failed",
        label: "IPK Tidak Memenuhi Syarat",
        detail: `IPK Anda: ${extractedIPK}, dibutuhkan minimal ${requiredIPK}`,
        extractedValue: extractedIPK,
        requiredValue: requiredIPK,
      });
      validationResults.overall = "failed";
    }
  }

  // 2. Validate Jurusan/Program Studi from ijazah - HYBRID (GEMINI + FALLBACK)
  if (uploadedDocs.ijazah && requirements.pendidikan) {
    validationResults.totalChecks++;
    const extractedProdi =
      uploadedDocs.ijazah.result.extractedData?.programStudi || "";
    const requiredProdi = requirements.pendidikan;

    console.log("[RequirementValidator] 🎓 Validating Program Studi...");
    console.log(`[RequirementValidator] Extracted: "${extractedProdi}"`);
    console.log(`[RequirementValidator] Required: "${requiredProdi}"`);

    let matchResult;
    let useGemini = true;

    // Try GEMINI AI first
    try {
      console.log("[RequirementValidator] Trying GEMINI AI...");
      const geminiMatch = await matchProgramStudiWithGemini(extractedProdi, requiredProdi);
      
      if (geminiMatch.success) {
        matchResult = {
          matched: geminiMatch.recommendation === "accept",
          similarity: geminiMatch.similarity,
          reasoning: geminiMatch.reasoning,
          source: 'GEMINI_AI',
        };
        console.log(`[RequirementValidator] ✅ Gemini Success: ${matchResult.similarity}%`);
      } else {
        // Gemini failed (parse error, etc)
        console.log("[RequirementValidator] ⚠️ Gemini failed, using fallback algorithm");
        useGemini = false;
      }
    } catch (error) {
      // Gemini error (rate limit, network, etc)
      console.log("[RequirementValidator] ⚠️ Gemini error:", error.message);
      console.log("[RequirementValidator] Using fallback algorithm");
      useGemini = false;
    }

    // FALLBACK: Manual algorithm if Gemini fails
    if (!useGemini) {
      const manualMatch = checkProgramStudiMatch(extractedProdi, requiredProdi);
      matchResult = {
        matched: manualMatch.matched,
        similarity: manualMatch.similarity,
        reasoning: manualMatch.matched 
          ? `${extractedProdi} dan ${requiredProdi} berada dalam bidang yang sama`
          : `${extractedProdi} tidak sesuai dengan ${requiredProdi}`,
        source: 'MANUAL_ALGORITHM',
      };
      console.log(`[RequirementValidator] ✅ Manual Algorithm: ${matchResult.similarity}%`);
    }

    console.log(`[RequirementValidator] Final Result: ${matchResult.similarity}% (${matchResult.source})`);

    // Build validation result based on similarity
    if (matchResult.similarity >= 75 && matchResult.matched) {
      validationResults.checks.push({
        category: "Jurusan",
        status: "passed",
        label: "Program Studi Sesuai",
        detail: `${extractedProdi} sesuai dengan ${requiredProdi}. ${matchResult.reasoning}`,
        extractedValue: extractedProdi,
        requiredValue: requiredProdi,
        similarity: matchResult.similarity,
        validationSource: matchResult.source,
      });
      validationResults.score++;
    } else if (matchResult.similarity >= 50) {
      validationResults.checks.push({
        category: "Jurusan",
        status: "warning",
        label: "Program Studi Perlu Ditinjau",
        detail: `${extractedProdi} mungkin sesuai dengan ${requiredProdi} (${matchResult.similarity}% kecocokan). ${matchResult.reasoning}`,
        extractedValue: extractedProdi,
        requiredValue: requiredProdi,
        similarity: matchResult.similarity,
        validationSource: matchResult.source,
      });
      if (validationResults.overall !== "failed") {
        validationResults.overall = "warning";
      }
    } else {
      validationResults.checks.push({
        category: "Jurusan",
        status: "failed",
        label: "Program Studi Tidak Sesuai",
        detail: `${extractedProdi} tidak sesuai dengan ${requiredProdi}. ${matchResult.reasoning}`,
        extractedValue: extractedProdi,
        requiredValue: requiredProdi,
        similarity: matchResult.similarity,
        validationSource: matchResult.source,
      });
      validationResults.overall = "failed";
    }
  }

  // 3. Validate Usia from KTP (use validation result from database, not OCR)
  if (uploadedDocs.ktp && requirements.usia) {
    validationResults.totalChecks++;
    
    // Get age from validation result (from database, not OCR)
    const ktpValidation = uploadedDocs.ktp.result.validation;
    const age = ktpValidation?.umur || null;
    const maxAge = extractMaxAge(requirements.usia);

    if (age === null) {
      // Age not available from database
      validationResults.checks.push({
        category: "Usia",
        status: "failed",
        label: "Usia Tidak Tersedia",
        detail: `Data usia tidak dapat diverifikasi. Pastikan NIK terdaftar di database.`,
        extractedValue: null,
        requiredValue: maxAge,
      });
      validationResults.overall = "failed";
    } else if (age <= maxAge) {
      validationResults.checks.push({
        category: "Usia",
        status: "passed",
        label: "Usia Memenuhi Syarat",
        detail: `Usia Anda: ${age} tahun (max. ${maxAge} tahun) - dari database Dukcapil`,
        extractedValue: age,
        requiredValue: maxAge,
      });
      validationResults.score++;
    } else {
      validationResults.checks.push({
        category: "Usia",
        status: "failed",
        label: "Usia Melebihi Batas",
        detail: `Usia Anda: ${age} tahun (max. ${maxAge} tahun) - dari database Dukcapil`,
        extractedValue: age,
        requiredValue: maxAge,
      });
      validationResults.overall = "failed";
    }
  }

  // 4. Validate Surat Lamaran (Kelengkapan Dokumen)
  if (uploadedDocs.surat_lamaran) {
    validationResults.totalChecks++;
    const suratData = uploadedDocs.surat_lamaran.result.extractedData;
    const validation = uploadedDocs.surat_lamaran.result.validation;
    const namaSesuai = validation?.namaMatchKTP || false;

    if (namaSesuai) {
      validationResults.checks.push({
        category: "Kelengkapan Dokumen",
        status: "passed",
        label: "Surat Lamaran Valid",
        detail: `Nama sesuai dengan KTP: ${suratData.nama || 'terdeteksi'}`,
        extractedValue: "Valid",
        requiredValue: "Surat lamaran yang sesuai",
      });
      validationResults.score++;
    } else {
      validationResults.checks.push({
        category: "Kelengkapan Dokumen",
        status: "failed",
        label: "Surat Lamaran Tidak Valid",
        detail: "Nama di surat lamaran tidak sesuai dengan KTP",
        extractedValue: "Tidak sesuai",
        requiredValue: "Surat lamaran dengan nama yang sesuai",
      });
      validationResults.overall = "failed";
    }
  }

  // 5. NAME VALIDATION - REMOVED
  // Name validation is now handled directly in documentValidator.js
  // It uses simple "contains" check instead of similarity scoring
  // Warning messages are shown directly in document validation errors
  validationResults.nameInconsistencies = {};

  console.log("[RequirementValidator] ℹ️ Name validation skipped - handled by documentValidator.js");

  // NOTE: Transkrip vs Ijazah program studi consistency check has been REMOVED
  // Only check required program studi vs Ijazah (done in step 2 above)

  return validationResults;
}

// Helper functions

// Program Studi Mapping - Related fields/majors
const PROGRAM_STUDI_GROUPS = {
  ekonomi: [
    "ekonomi", "akuntansi", "manajemen", "keuangan", "perbankan", 
    "bisnis", "administrasi bisnis", "ilmu ekonomi", "ekonomi pembangunan",
    "ekonomi syariah", "akuntansi syariah"
  ],
  teknik: [
    "teknik", "engineering", "sipil", "mesin", "elektro", "industri",
    "informatika", "komputer", "sistem informasi", "teknologi informasi"
  ],
  pendidikan: [
    "pendidikan", "keguruan", "pgsd", "paud", "bimbingan konseling",
    "pendidikan guru", "teacher", "education"
  ],
  kesehatan: [
    "kesehatan", "kedokteran", "keperawatan", "farmasi", "gizi",
    "kesehatan masyarakat", "kebidanan", "medical", "health"
  ],
  hukum: [
    "hukum", "law", "ilmu hukum", "syariah"
  ],
  sains: [
    "matematika", "fisika", "kimia", "biologi", "sains", "science",
    "statistika", "actuarial"
  ],
  sosial: [
    "sosiologi", "komunikasi", "ilmu komunikasi", "hubungan internasional",
    "ilmu politik", "administrasi publik", "administrasi negara"
  ]
};

function checkProgramStudiMatch(extracted, required) {
  // Handle undefined/null values
  if (!extracted || !required) {
    return { matched: false, similarity: 0 };
  }

  // Normalize strings
  const norm1 = String(extracted).toLowerCase().trim();
  const norm2 = String(required).toLowerCase().trim();

  console.log("[checkProgramStudiMatch] Comparing:", norm1, "vs", norm2);

  // Exact match
  if (norm1 === norm2) {
    console.log("[checkProgramStudiMatch] ✓ Exact match!");
    return { matched: true, similarity: 100 };
  }

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    console.log("[checkProgramStudiMatch] ✓ Partial match (contains)!");
    return { matched: true, similarity: 95 };
  }

  // Check for related fields in the same group
  for (const [group, keywords] of Object.entries(PROGRAM_STUDI_GROUPS)) {
    const inGroup1 = keywords.some(kw => norm1.includes(kw));
    const inGroup2 = keywords.some(kw => norm2.includes(kw));
    
    if (inGroup1 && inGroup2) {
      console.log(`[checkProgramStudiMatch] ✓ Both in same group: ${group}`);
      // Same group but not exact match = 80% similarity
      return { matched: true, similarity: 80 };
    }
  }

  // Check for common variations (split by / or space)
  const keywords1 = norm1.split(/[\s\/\-]+/).filter(k => k.length > 2);
  const keywords2 = norm2.split(/[\s\/\-]+/).filter(k => k.length > 2);

  let matchCount = 0;
  keywords1.forEach((kw1) => {
    keywords2.forEach((kw2) => {
      if (kw1.includes(kw2) || kw2.includes(kw1)) {
        matchCount++;
      }
    });
  });

  const similarity = (matchCount / Math.max(keywords1.length, keywords2.length)) * 100;
  console.log(`[checkProgramStudiMatch] Keyword similarity: ${Math.round(similarity)}%`);

  return {
    matched: similarity >= 70,
    similarity: Math.round(similarity),
  };
}

function parseTanggalLahir(dateStr) {
  // Format: DD-MM-YYYY
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function extractMaxAge(usiaStr) {
  // Format: "Maksimal 35 tahun"
  const match = usiaStr.match(/\d+/);
  return match ? parseInt(match[0]) : 100;
}

function checkNameConsistency(names) {
  // Simple similarity check - can be improved with better algorithm
  const normalized = names
    .filter((name) => name && name.trim().length > 0)
    .map((name) =>
      String(name).toLowerCase().trim().replace(/\s+/g, " ")
    );

  // If less than 2 names, can't check consistency
  if (normalized.length < 2) {
    return 100;
  }

  // Check if all names are similar
  const firstName = normalized[0];
  let totalSimilarity = 100;

  for (let i = 1; i < normalized.length; i++) {
    const similarity = calculateStringSimilarity(firstName, normalized[i]);
    totalSimilarity = Math.min(totalSimilarity, similarity);
  }

  return totalSimilarity;
}

function calculateStringSimilarity(str1, str2) {
  // Levenshtein distance for string similarity
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
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

  const maxLen = Math.max(len1, len2);
  const distance = matrix[len1][len2];
  return ((maxLen - distance) / maxLen) * 100;
}
