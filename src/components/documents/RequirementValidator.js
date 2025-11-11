/**
 * Requirement Validator
 * Validates uploaded documents against formasi requirements
 * Checks: IPK, Jurusan, Usia, Surat Lamaran validity, etc.
 */

export function validateRequirements(uploadedDocs, requirements) {
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

  // 2. Validate Jurusan/Program Studi from ijazah
  if (uploadedDocs.ijazah && requirements.pendidikan) {
    validationResults.totalChecks++;
    const extractedProdi =
      uploadedDocs.ijazah.result.extractedData?.programStudi || "";
    const requiredProdi = requirements.pendidikan;

    // Check if program studi matches
    const isMatch = checkProgramStudiMatch(extractedProdi, requiredProdi);

    if (isMatch.matched) {
      validationResults.checks.push({
        category: "Jurusan",
        status: "passed",
        label: "Program Studi Sesuai",
        detail: `${extractedProdi} sesuai dengan ${requiredProdi}`,
        extractedValue: extractedProdi,
        requiredValue: requiredProdi,
        similarity: isMatch.similarity,
      });
      validationResults.score++;
    } else if (isMatch.similarity >= 50) {
      validationResults.checks.push({
        category: "Jurusan",
        status: "warning",
        label: "Program Studi Perlu Ditinjau",
        detail: `${extractedProdi} mungkin sesuai dengan ${requiredProdi} (${isMatch.similarity}% kecocokan)`,
        extractedValue: extractedProdi,
        requiredValue: requiredProdi,
        similarity: isMatch.similarity,
      });
      if (validationResults.overall !== "failed") {
        validationResults.overall = "warning";
      }
    } else {
      validationResults.checks.push({
        category: "Jurusan",
        status: "failed",
        label: "Program Studi Tidak Sesuai",
        detail: `${extractedProdi} tidak sesuai dengan ${requiredProdi}`,
        extractedValue: extractedProdi,
        requiredValue: requiredProdi,
        similarity: isMatch.similarity,
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

  // 5. Validate Konsistensi Data (Nama across documents)
  if (uploadedDocs.ktp && uploadedDocs.ijazah && uploadedDocs.transkrip) {
    validationResults.totalChecks++;
    const namaKTP = uploadedDocs.ktp.result.extractedData?.nama || "";
    const namaIjazah = uploadedDocs.ijazah.result.extractedData?.nama || "";
    const namaTranskrip = uploadedDocs.transkrip.result.extractedData?.nama || "";

    const nameSimilarity = checkNameConsistency([
      namaKTP,
      namaIjazah,
      namaTranskrip,
    ]);

    if (nameSimilarity >= 90) {
      validationResults.checks.push({
        category: "Konsistensi Data",
        status: "passed",
        label: "Nama Konsisten di Semua Dokumen",
        detail: "Nama di KTP, Ijazah, dan Transkrip konsisten",
        extractedValue: "Konsisten",
        requiredValue: "Data konsisten",
      });
      validationResults.score++;
    } else if (nameSimilarity >= 70) {
      validationResults.checks.push({
        category: "Konsistensi Data",
        status: "warning",
        label: "Nama Perlu Ditinjau",
        detail: "Ada perbedaan kecil pada nama di beberapa dokumen",
        extractedValue: "Mirip",
        requiredValue: "Data konsisten",
      });
      if (validationResults.overall !== "failed") {
        validationResults.overall = "warning";
      }
    } else {
      validationResults.checks.push({
        category: "Konsistensi Data",
        status: "failed",
        label: "Nama Tidak Konsisten",
        detail: "Nama di dokumen tidak konsisten, mohon periksa kembali",
        extractedValue: "Tidak Konsisten",
        requiredValue: "Data konsisten",
      });
      validationResults.overall = "failed";
    }
  }

  // 6. Validate Transkrip consistency with Ijazah
  if (uploadedDocs.transkrip && uploadedDocs.ijazah) {
    validationResults.totalChecks++;
    const prodiTranskrip =
      uploadedDocs.transkrip.result.extractedData?.programStudi || "";
    const prodiIjazah = uploadedDocs.ijazah.result.extractedData?.programStudi || "";

    if (prodiTranskrip && prodiIjazah && prodiTranskrip === prodiIjazah) {
      validationResults.checks.push({
        category: "Konsistensi Akademik",
        status: "passed",
        label: "Program Studi Konsisten",
        detail: "Program Studi di Ijazah dan Transkrip sama",
        extractedValue: prodiTranskrip,
        requiredValue: prodiIjazah,
      });
      validationResults.score++;
    } else {
      validationResults.checks.push({
        category: "Konsistensi Akademik",
        status: "warning",
        label: "Program Studi Berbeda",
        detail: `Transkrip: ${prodiTranskrip}, Ijazah: ${prodiIjazah}`,
        extractedValue: prodiTranskrip,
        requiredValue: prodiIjazah,
      });
      if (validationResults.overall !== "failed") {
        validationResults.overall = "warning";
      }
    }
  }

  return validationResults;
}

// Helper functions
function checkProgramStudiMatch(extracted, required) {
  // Handle undefined/null values
  if (!extracted || !required) {
    return { matched: false, similarity: 0 };
  }

  // Normalize strings
  const norm1 = String(extracted).toLowerCase().trim();
  const norm2 = String(required).toLowerCase().trim();

  // Exact match
  if (norm1 === norm2) {
    return { matched: true, similarity: 100 };
  }

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return { matched: true, similarity: 90 };
  }

  // Check for common variations
  const keywords1 = norm1.split(/[\s\/]+/);
  const keywords2 = norm2.split(/[\s\/]+/);

  let matchCount = 0;
  keywords1.forEach((kw1) => {
    keywords2.forEach((kw2) => {
      if (kw1.includes(kw2) || kw2.includes(kw1)) {
        matchCount++;
      }
    });
  });

  const similarity = (matchCount / Math.max(keywords1.length, keywords2.length)) * 100;

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
