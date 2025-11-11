# Debug: Name Consistency Detection Across All Documents

## 🔍 Problem Report

User melaporkan: **"Nama yang tidak cocok ada di semua dokumen, kenapa yang berhasil dideteksi hanya Surat Lamaran?"**

Screenshot menunjukkan:
- ❌ Surat Lamaran Tidak Valid: "Nama di surat lamaran tidak sesuai dengan KTP"
- ✅ IPK, Program Studi, dan checks lain passed
- **Missing**: Warning untuk Ijazah dan Transkrip

## 🐛 Possible Root Causes

### 1. **Nama Tidak Ter-Extract dari Ijazah/Transkrip**
Kemungkinan:
- Gemini gagal extract nama dari Ijazah
- OCR fallback juga gagal
- Nama field kosong → check di-skip

### 2. **Nama Ter-Extract Tapi Mirip (>= 90%)**
Kemungkinan:
- Nama di Ijazah/Transkrip ter-extract dengan benar
- Kebetulan similarity >= 90% dengan KTP
- Tidak ada warning karena dianggap "konsisten"

### 3. **Code Logic Error**
Kemungkinan:
- Ada bug di RequirementValidator.js
- nameInconsistencies object tidak di-populate dengan benar
- DocumentUpload.js tidak render warning untuk ijazah/transkrip

## ✅ Solution: Enhanced Logging & Debugging

### Changes Made in `RequirementValidator.js`

#### Before (Minimal Logging):
```javascript
const namaIjazah = uploadedDocs.ijazah.result.validation?.nama || 
                   uploadedDocs.ijazah.result.extractedData?.nama || "";

console.log("[RequirementValidator] Ijazah Name (used):", namaIjazah);

if (namaKTP && namaIjazah) {
  // Calculate similarity
}
```

**Problem**: Hard to tell WHERE the name comes from (Gemini or OCR)

#### After (Detailed Logging):
```javascript
// Try validation first (Gemini), then extractedData (OCR)
const namaIjazahFromGemini = uploadedDocs.ijazah.result.validation?.nama || "";
const namaIjazahFromOCR = uploadedDocs.ijazah.result.extractedData?.nama || "";
const namaIjazah = namaIjazahFromGemini || namaIjazahFromOCR;

console.log("[RequirementValidator] === IJAZAH NAME CHECK ===");
console.log("[RequirementValidator] Ijazah Name (from Gemini):", namaIjazahFromGemini);
console.log("[RequirementValidator] Ijazah Name (from OCR):", namaIjazahFromOCR);
console.log("[RequirementValidator] Ijazah Name (final used):", namaIjazah);
console.log("[RequirementValidator] KTP Name (reference):", namaKTP);

if (namaKTP && namaIjazah) {
  const similarity = calculateStringSimilarity(...);
  console.log("[RequirementValidator] 📊 Ijazah vs KTP Similarity:", Math.round(similarity) + "%");
  
  if (similarity < 90) {
    // Flag inconsistency
    console.log("[RequirementValidator] ❌ Ijazah name inconsistency detected!");
  } else {
    console.log("[RequirementValidator] ✅ Ijazah name consistent (similarity >= 90%)");
  }
} else {
  console.log("[RequirementValidator] ⚠️ SKIPPING Ijazah check:");
  console.log("   - KTP name empty?", !namaKTP);
  console.log("   - Ijazah name empty?", !namaIjazah);
}
```

**Benefits**:
- ✅ Clear separation: Gemini vs OCR extraction
- ✅ Shows which source was used (Gemini fallback to OCR)
- ✅ Shows similarity percentage even if >= 90%
- ✅ Shows exact reason if check is skipped

## 📊 Enhanced Console Logs

### What You'll See Now:

#### Case 1: Ijazah Name Not Extracted (SKIPPED)
```
[RequirementValidator] === IJAZAH NAME CHECK ===
[RequirementValidator] Ijazah Name (from Gemini): 
[RequirementValidator] Ijazah Name (from OCR): 
[RequirementValidator] Ijazah Name (final used): 
[RequirementValidator] KTP Name (reference): BUDI SANTOSO
[RequirementValidator] ⚠️ SKIPPING Ijazah check:
   - KTP name empty? false
   - Ijazah name empty? true
```

**Diagnosis**: Gemini dan OCR gagal extract nama dari Ijazah → **NOT A BUG, extraction issue!**

#### Case 2: Ijazah Name Similar to KTP (>= 90%)
```
[RequirementValidator] === IJAZAH NAME CHECK ===
[RequirementValidator] Ijazah Name (from Gemini): BUDI SANTOSO
[RequirementValidator] Ijazah Name (from OCR): 
[RequirementValidator] Ijazah Name (final used): BUDI SANTOSO
[RequirementValidator] KTP Name (reference): BUDI SANTOSO
[RequirementValidator] 📊 Ijazah vs KTP Similarity: 100%
[RequirementValidator] ✅ Ijazah name consistent (similarity >= 90%)
```

**Diagnosis**: Nama di Ijazah SAMA dengan KTP → **NOT A BUG, names are actually consistent!**

#### Case 3: Ijazah Name Different from KTP (< 90%)
```
[RequirementValidator] === IJAZAH NAME CHECK ===
[RequirementValidator] Ijazah Name (from Gemini): BUDI SANTOSA
[RequirementValidator] Ijazah Name (from OCR): 
[RequirementValidator] Ijazah Name (final used): BUDI SANTOSA
[RequirementValidator] KTP Name (reference): BUDI SANTOSO
[RequirementValidator] 📊 Ijazah vs KTP Similarity: 85%
[RequirementValidator] ❌ Ijazah name inconsistency detected!
```

**Diagnosis**: Nama berbeda, warning AKAN MUNCUL → **Expected behavior!**

## 🧪 How to Debug User's Issue

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these logs:

```
[RequirementValidator] 👤 NAME VALIDATION CHECK
[RequirementValidator] KTP Name (used): ...

[RequirementValidator] === IJAZAH NAME CHECK ===
[RequirementValidator] === TRANSKRIP NAME CHECK ===
[RequirementValidator] === SURAT LAMARAN NAME CHECK ===
```

### Step 2: Identify Which Case Applies

| Log Pattern | Diagnosis | Solution |
|-------------|-----------|----------|
| "SKIPPING Ijazah check" + "Ijazah name empty? true" | **Extraction failed** | Improve Gemini prompt or OCR patterns |
| "Similarity: 95%" + "✅ consistent" | **Names actually similar** | Expected behavior, no bug |
| "Similarity: 70%" + "❌ inconsistency detected!" | **Warning should appear** | Check UI rendering (DocumentUpload.js) |

### Step 3: Check Final Output
```
[RequirementValidator] Final nameInconsistencies: {
  surat_lamaran: { documentName: "Surat Lamaran", namaDoc: "...", namaKTP: "...", similarity: 85 }
  // Should also have ijazah and transkrip here if they're inconsistent
}
```

If `ijazah` or `transkrip` is **missing** from this object, then they either:
1. Were skipped (extraction failed)
2. Had similarity >= 90% (considered consistent)

## 📝 Testing Scenarios

### Scenario A: All Names Different
```
Upload:
- KTP: BUDI SANTOSO
- Ijazah: BUDI SANTOSA
- Transkrip: BUDI S
- Surat Lamaran: BUDI

Expected Console:
- Ijazah: 85% similarity → ❌ inconsistency
- Transkrip: 60% similarity → ❌ inconsistency
- Surat Lamaran: 40% similarity → ❌ inconsistency

Expected UI:
- 3 red warning boxes (one below each document)
```

### Scenario B: Only Surat Lamaran Different
```
Upload:
- KTP: BUDI SANTOSO
- Ijazah: BUDI SANTOSO (Gemini extracted correctly)
- Transkrip: BUDI SANTOSO (OCR extracted correctly)
- Surat Lamaran: ANDI WIJAYA

Expected Console:
- Ijazah: 100% similarity → ✅ consistent
- Transkrip: 100% similarity → ✅ consistent
- Surat Lamaran: 30% similarity → ❌ inconsistency

Expected UI:
- 1 red warning box (only below Surat Lamaran)
```

### Scenario C: Ijazah/Transkrip Extraction Failed
```
Upload:
- KTP: BUDI SANTOSO
- Ijazah: (Gemini extraction failed)
- Transkrip: (OCR extraction failed)
- Surat Lamaran: ANDI WIJAYA (Gemini extracted)

Expected Console:
- Ijazah: ⚠️ SKIPPING (name empty)
- Transkrip: ⚠️ SKIPPING (name empty)
- Surat Lamaran: 30% similarity → ❌ inconsistency

Expected UI:
- 1 red warning box (only below Surat Lamaran)

Diagnosis:
- NOT A BUG! Extraction quality issue.
- Solution: Improve image quality or extraction algorithms
```

## 🎯 Next Steps for User

1. **Refresh page** and **upload documents again**
2. **Open DevTools Console** (F12)
3. **Look for the enhanced logs**:
   - `=== IJAZAH NAME CHECK ===`
   - `=== TRANSKRIP NAME CHECK ===`
   - `=== SURAT LAMARAN NAME CHECK ===`
4. **Share the console output** with us

This will reveal the EXACT reason why only Surat Lamaran shows warning!

## 🔧 Possible Outcomes & Solutions

### Outcome 1: Names Actually Consistent (>= 90%)
```
Console: "✅ Ijazah name consistent (similarity >= 90%)"
```

**Explanation**: System is working correctly! Names are similar enough.

**If user disagrees**: Lower the threshold from 90% to 85%

### Outcome 2: Extraction Failed
```
Console: "⚠️ SKIPPING Ijazah check: Ijazah name empty? true"
```

**Explanation**: Gemini and OCR both failed to extract name from Ijazah.

**Solutions**:
- Improve document image quality
- Enhance Gemini prompt for Ijazah
- Add more OCR patterns

### Outcome 3: Code Bug (Unlikely)
```
Console: "❌ Ijazah name inconsistency detected!"
UI: No warning shown
```

**Explanation**: nameInconsistencies populated but UI not rendering.

**Solutions**:
- Check DocumentUpload.js rendering logic
- Check if requirementValidation prop is passed correctly

## 📊 Summary

**Enhanced Logging Now Shows**:
- ✅ Name source (Gemini vs OCR)
- ✅ Both extraction attempts (Gemini + OCR)
- ✅ Final name used for comparison
- ✅ Similarity percentage (even if >= 90%)
- ✅ Exact reason if check is skipped

**User Should**:
1. Refresh & re-upload
2. Check console logs
3. Share findings

**Most Likely Diagnosis**:
- Ijazah/Transkrip names are actually >= 90% similar to KTP
- OR extraction failed for those documents
- NOT a code bug!

---

**Date**: November 11, 2025
**Status**: ✅ Enhanced logging implemented
**Next**: Wait for user's console output to confirm diagnosis

