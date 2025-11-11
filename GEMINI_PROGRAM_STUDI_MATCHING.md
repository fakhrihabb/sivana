# 🤖 Gemini AI - Program Studi Matching

## Overview

Sistem matching program studi sekarang menggunakan **Gemini 2.5 Flash AI** untuk menilai kecocokan jurusan dengan lebih akurat dan kontekstual.

## Mengapa Gemini?

### Masalah dengan Algoritma Manual:
❌ Hanya bisa exact match atau keyword matching
❌ Tidak memahami konteks Indonesia (Akuntansi ≈ Ilmu Ekonomi)
❌ Tidak bisa menangani sinonim dan variasi nama
❌ Harus maintain list keywords yang besar
❌ Tidak bisa reasoning

### Keuntungan Menggunakan Gemini AI:
✅ Memahami konteks dan relationship antar jurusan
✅ Bisa reasoning: "Akuntansi dan Ilmu Ekonomi sama-sama bidang ekonomi"
✅ Menangani berbagai format: "S-1/Sarjana Ilmu Ekonomi" vs "Akuntansi"
✅ Memberikan penjelasan (reasoning) untuk setiap keputusan
✅ Self-updating: Gemini sudah dilatih dengan data terbaru
✅ Lebih akurat untuk edge cases

## Cara Kerja

### 1. Extract Program Studi
Program studi sudah diekstrak dari Ijazah menggunakan Gemini:
```javascript
extractIjazahWithGemini(ocrText)
// Returns: { program_studi: "Akuntansi", ... }
```

### 2. Match dengan Gemini
Saat validasi requirement:
```javascript
const geminiMatch = await matchProgramStudiWithGemini(
  "Akuntansi",                    // From ijazah
  "S-1/Sarjana Ilmu Ekonomi"     // From formasi requirement
);
```

### 3. Gemini Response
```json
{
  "matched": true,
  "similarity": 80,
  "category": "same_field",
  "reasoning": "Akuntansi dan Ilmu Ekonomi sama-sama merupakan bidang ilmu ekonomi yang saling terkait",
  "recommendation": "accept"
}
```

### 4. Display Result
UI menampilkan:
- Similarity: 80%
- Status: ✅ Sesuai
- Reasoning: "Akuntansi dan Ilmu Ekonomi sama-sama merupakan bidang ilmu ekonomi yang saling terkait"

## Similarity Levels (Defined in Prompt)

### 100% - Exact Match
- Nama persis sama
- Contoh: "Akuntansi" = "Akuntansi"

### 90-95% - Very Close Match
- Nama hampir sama, variasi kecil
- Contoh: 
  - "Akuntansi Syariah" ≈ "Akuntansi" (95%)
  - "Teknik Informatika" ≈ "Informatika" (95%)

### 75-85% - Same Field/Compatible
- Masih dalam bidang yang sama
- **KEY**: Akuntansi, Ilmu Ekonomi, Manajemen = SEMUA EKONOMI (80%)
- Contoh:
  - "Teknik Informatika" ≈ "Sistem Informasi" (80%)
  - "Ilmu Komunikasi" ≈ "Komunikasi" (85%)

### 50-70% - Related but Different
- Ada keterkaitan tapi fokus berbeda
- Butuh review manual
- Contoh: Ekonomi vs Akuntansi (jika requirement sangat spesifik)

### 0-40% - Not Compatible
- Bidang berbeda total
- Contoh:
  - "Teknik Informatika" vs "Ekonomi" (0%)
  - "Hukum" vs "Kedokteran" (0%)

## Recommendation Logic

```
similarity >= 75%  → recommendation: "accept"  → Status: ✅ Passed
similarity 50-74%  → recommendation: "review"  → Status: ⚠️ Warning
similarity < 50%   → recommendation: "reject"  → Status: ❌ Failed
```

## Implementation

### File: `/src/lib/gemini.js`

```javascript
export async function matchProgramStudiWithGemini(extractedMajor, requiredMajor) {
  // Create Gemini model with low temperature (0.2) for consistency
  const matcherModel = matcherGenAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,  // Low temperature = more deterministic
      topP: 0.8,
      topK: 20,
    },
  });

  // Detailed prompt with Indonesian context
  const prompt = `...aturan penilaian untuk CPNS Indonesia...`;
  
  // Get response
  const result = await matcherModel.generateContent(prompt);
  
  // Parse JSON response
  const matchResult = JSON.parse(cleanJson);
  
  return {
    matched: matchResult.matched,
    similarity: matchResult.similarity,
    category: matchResult.category,
    reasoning: matchResult.reasoning,
    recommendation: matchResult.recommendation,
  };
}
```

### File: `/src/components/documents/RequirementValidator.js`

```javascript
// BEFORE: Manual algorithm
const isMatch = checkProgramStudiMatch(extractedProdi, requiredProdi);

// AFTER: Gemini AI
const geminiMatch = await matchProgramStudiWithGemini(extractedProdi, requiredProdi);

if (geminiMatch.recommendation === "accept") {
  // Status: Passed
  validationResults.checks.push({
    category: "Jurusan",
    status: "passed",
    detail: `${extractedProdi} sesuai dengan ${requiredProdi}. ${geminiMatch.reasoning}`,
    similarity: geminiMatch.similarity,
  });
}
```

## Console Logs (untuk Debugging)

```
[RequirementValidator] 🎓 Validating Program Studi with GEMINI...
[RequirementValidator] Extracted: "Akuntansi"
[RequirementValidator] Required: "S-1/Sarjana Ilmu Ekonomi"

[Gemini Matcher] Matching program studi...
[Gemini Matcher] Extracted: "Akuntansi"
[Gemini Matcher] Required: "S-1/Sarjana Ilmu Ekonomi"
[Gemini Matcher] ✅ Match result:
  - Matched: true
  - Similarity: 80%
  - Category: same_field
  - Recommendation: accept
  - Reasoning: Akuntansi dan Ilmu Ekonomi sama-sama merupakan bidang ilmu ekonomi yang saling terkait

[RequirementValidator] Gemini Result: 80% - same_field
[RequirementValidator] Reasoning: Akuntansi dan Ilmu Ekonomi sama-sama merupakan bidang ilmu ekonomi yang saling terkait
```

## Test Cases

### Case 1: Akuntansi vs Ilmu Ekonomi
```javascript
Input:
  extracted: "Akuntansi"
  required: "S-1/Sarjana Ilmu Ekonomi"

Output:
  matched: true
  similarity: 80%
  category: "same_field"
  reasoning: "Akuntansi dan Ilmu Ekonomi sama-sama merupakan bidang ilmu ekonomi yang saling terkait"
  recommendation: "accept"

Status: ✅ PASSED
```

### Case 2: Teknik Informatika vs Sistem Informasi
```javascript
Input:
  extracted: "Teknik Informatika"
  required: "Sistem Informasi"

Output:
  matched: true
  similarity: 80%
  category: "same_field"
  reasoning: "Kedua program studi berada dalam bidang ilmu komputer dan teknologi informasi"
  recommendation: "accept"

Status: ✅ PASSED
```

### Case 3: Teknik Informatika vs Ekonomi
```javascript
Input:
  extracted: "Teknik Informatika"
  required: "Ekonomi"

Output:
  matched: false
  similarity: 0%
  category: "not_compatible"
  reasoning: "Teknik Informatika dan Ekonomi adalah dua bidang yang berbeda total"
  recommendation: "reject"

Status: ❌ FAILED
```

## Benefits

### 1. Lebih Akurat
- Memahami konteks Indonesia
- Tahu bahwa Akuntansi ⊂ Ekonomi
- Bisa handle format kompleks

### 2. Self-Documenting
- Setiap keputusan ada reasoning
- Mudah di-audit
- User bisa lihat alasan

### 3. Maintainable
- Tidak perlu maintain keyword list
- Update prompt lebih mudah
- Gemini model terus di-improve

### 4. Scalable
- Bisa handle semua jurusan
- Tidak perlu hard-code
- Works out of the box

## API Cost (Estimasi)

Gemini 2.5 Flash pricing:
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

Per matching (estimasi):
- Input: ~400 tokens (prompt + data)
- Output: ~100 tokens (JSON response)
- Cost per match: ~$0.00006 (kurang dari 1 cent)

Sangat murah untuk akurasi yang didapat!

## Future Improvements

1. **Caching**: Cache hasil matching yang sama
2. **Batch Processing**: Process multiple matches sekaligus
3. **Fallback**: Jika Gemini gagal, gunakan algoritma manual
4. **A/B Testing**: Compare Gemini vs manual untuk improve prompt
5. **Fine-tuning**: Train model khusus untuk jurusan Indonesia

## Migration Notes

### Old System (Manual Algorithm)
```javascript
// Manual keyword groups
const PROGRAM_STUDI_GROUPS = {
  ekonomi: ["ekonomi", "akuntansi", "manajemen", ...],
  teknik: ["teknik", "informatika", ...],
  // ... must maintain this list
};

function checkProgramStudiMatch(extracted, required) {
  // Complex logic with keyword matching
  // Hard to maintain
  // Limited understanding
}
```

### New System (Gemini AI)
```javascript
// Just call Gemini
const match = await matchProgramStudiWithGemini(extracted, required);
// Gemini understands context
// No need to maintain keywords
// Automatic reasoning
```

## Conclusion

Menggunakan Gemini untuk program studi matching adalah **game changer**:
- ✅ Lebih akurat
- ✅ Lebih mudah maintain
- ✅ Self-documenting (reasoning)
- ✅ Scalable
- ✅ Cost-effective

**Akuntansi vs Ilmu Ekonomi sekarang 80% match!** 🎉

