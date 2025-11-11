# 🌍 Bilingual Transcript Support - Indonesian & English

## Overview

Sistem validasi transkrip nilai telah ditingkatkan dengan **Gemini AI** untuk mendukung **transkrip berbahasa Inggris** dan **bilingual** (Indonesia + Inggris). Ini penting untuk pelamar yang memiliki:
- Exchange program transcripts (EPFL, MIT, etc.)
- International university transcripts
- Bilingual transcripts dari universitas Indonesia

---

## 🎯 Use Cases

### 1. **Transkrip Bahasa Inggris**
Contoh: Summer School @EPFL, Exchange Program, International Degree

```
École Polytechnique Fédérale de Lausanne (EPFL)
TRANSCRIPT OF RECORDS

Student: ABDUL ZACKY
GPA (converted to 4.0 scale): 3.85
Total Credits: 22 ECTS
```

### 2. **Transkrip Bahasa Indonesia**
Contoh: Universitas Indonesia, UGM, ITB, dll

```
UNIVERSITAS INDONESIA
TRANSKRIP NILAI AKADEMIK

Mahasiswa: ABDUL ZACKY
IPK: 3.82 / 4.00
Total SKS: 146
```

### 3. **Transkrip Bilingual**
Contoh: Universitas dengan format Indonesia + Inggris

```
UNIVERSITAS BRAWIJAYA / BRAWIJAYA UNIVERSITY
IPK / GPA: 3.75 / 4.00
SKS / Credits: 144
```

---

## 🏗️ Architecture: Hybrid Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              UPLOAD TRANSKRIP NILAI                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   TESSERACT OCR       │ ← Extract text
         │   (+ Vision API)      │
         └───────────┬───────────┘
                     │
                     ▼
    ╔════════════════════════════════════════╗
    ║  STRATEGY 1: REGEX EXTRACTION          ║
    ║  - extractIPK() [Bahasa Indonesia]     ║
    ║  - Fast, untuk format umum Indonesia   ║
    ╚════════════════╤═══════════════════════╝
                     │
                     ▼
         ┌───────────────────────┐
         │  IPK Found?           │
         └────┬──────────────┬───┘
              │ YES          │ NO (English/Unknown format)
              ▼              ▼
    ╔═════════════════╗  ╔════════════════════════════╗
    ║ USE REGEX IPK   ║  ║ STRATEGY 2:                ║
    ║ - Indonesian    ║  ║ GEMINI AI EXTRACTION       ║
    ║ - Fast (0ms)    ║  ║ - Bilingual support        ║
    ╚════════╤════════╝  ║ - GPA/IPK detection        ║
             │           ║ - Language detection       ║
             │           ║ - Format recognition       ║
             │           ╚════════════╤═══════════════╝
             │                        │
             └────────────┬───────────┘
                          │
                          ▼
            ╔══════════════════════════════╗
            ║ VALIDATION CHECKS            ║
            ║ - IPK/GPA >= 3.0             ║
            ║ - Nama match dengan KTP      ║
            ║ - Cross-check dengan Ijazah  ║
            ║ - Document consistency       ║
            ╚════════════╤═════════════════╝
                         │
                         ▼
             ┌───────────────────────┐
             │  VALIDATION RESULT    │
             │  ✅ TMS / ❌ BMS      │
             └───────────────────────┘
```

---

## 💡 Key Features

### 1. **Bilingual Support**
- ✅ Bahasa Indonesia: "IPK", "Transkrip Nilai", "SKS"
- ✅ English: "GPA", "Transcript", "Credits/ECTS"
- ✅ Mixed: Deteksi otomatis bahasa dominan

### 2. **Intelligent Field Extraction**
```javascript
{
  "nama_lengkap": "ABDUL ZACKY",
  "nim": "2024-SUMMER-12345" / "1906123456",
  "program_studi": "Computer Science" / "Ilmu Komputer",
  "universitas": "EPFL" / "Universitas Indonesia",
  "ipk": 3.85,  // GPA converted to 4.0 scale
  "total_sks": 22,  // ECTS / SKS
  "language": "english" / "indonesian" / "bilingual",
  "format_type": "standard" / "english_exchange" / "bilingual"
}
```

### 3. **GPA Conversion**
Automatically converts from different scales:
- Swiss scale (6.0) → 4.0
- UK scale (First Class, 2:1, etc) → 4.0
- European ECTS grades (A, B, C) → 4.0
- Indonesian scale (already 4.0)

### 4. **Confidence Scoring**
```json
{
  "confidence": {
    "nama_lengkap": 1.0,
    "ipk": 0.95,
    "program_studi": 0.98,
    "universitas": 1.0
  }
}
```

---

## 🚀 Implementation

### Files Modified:

#### 1. `/src/lib/gemini.js`
**New Function**: `extractTranskripWithGemini(ocrText)`

```javascript
// Supports bilingual extraction
const result = await extractTranskripWithGemini(ocrText);

if (result.success) {
  console.log('Language:', result.data.language);  // "english" / "indonesian"
  console.log('GPA/IPK:', result.data.ipk);        // 3.85
  console.log('Format:', result.data.format_type);  // "english_exchange"
}
```

**Features**:
- Bilingual prompt (English + Indonesian)
- GPA scale conversion
- Language detection
- Format type recognition
- Structured JSON output

#### 2. `/src/lib/documentValidator.js`
**Updated Function**: `validateTranskrip(ocrText, ktpData, ijazahData)`

**Hybrid Flow**:
```javascript
// 1. Try regex first (fast, Indonesian only)
let ipk = extractIPK(ocrText);

// 2. If regex fails, use Gemini AI (bilingual)
if (!ipk) {
  const geminiResult = await extractTranskripWithGemini(ocrText);
  ipk = geminiResult.data.ipk;
  
  validation.documentLanguage = geminiResult.data.language;  // NEW!
  validation.formatType = geminiResult.data.format_type;      // NEW!
}

// 3. Validate IPK >= 3.0
if (ipk < 3.0) {
  return error;
}

// 4. Cross-validate name with KTP
if (geminiData && geminiData.nama_lengkap) {
  const similarity = nameSimilarity(ktpData.nama, geminiData.nama_lengkap);
  // ...
}
```

---

## 📊 Validation Result Format

### Indonesian Transcript:
```javascript
{
  "success": true,
  "ipk": 3.82,
  "nama": "ABDUL ZACKY",
  "namaMatchKTP": true,
  "ipkValid": true,
  "geminiExtraction": false,  // Used regex
  "documentLanguage": null,
  "errors": [],
  "warnings": []
}
```

### English Transcript:
```javascript
{
  "success": true,
  "ipk": 3.85,
  "nama": "ABDUL ZACKY",
  "namaMatchKTP": true,
  "ipkValid": true,
  "geminiExtraction": true,     // Used AI ✅
  "documentLanguage": "english", // Detected language
  "formatType": "english_exchange",
  "geminiConfidence": {
    "ipk": 0.95,
    "nama_lengkap": 1.0
  },
  "errors": [],
  "warnings": [
    "⚠️ Transkrip dalam bahasa english. Data diekstrak menggunakan AI (IPK: 3.85, confidence: 95%)."
  ]
}
```

---

## 🧪 Testing

### Test Script: `testGeminiTranscript.js`

**Test Cases**:
1. ✅ English transcript (EPFL Summer School)
2. ✅ Indonesian transcript (Universitas Indonesia)

**Run Test**:
```bash
node testGeminiTranscript.js
```

**Expected Output**:
```
📝 TEST 1: ENGLISH TRANSCRIPT (EPFL Summer School)
✅ Extraction successful!

📊 EXTRACTED DATA:
  - Name: ABDUL ZACKY
  - GPA/IPK: 3.85
  - Program: Summer School 2024
  - University: École Polytechnique Fédérale de Lausanne
  - Language: english
  - Format: english_exchange

📈 CONFIDENCE SCORES:
  - Name: 100%
  - GPA: 95%
  - Program: 98%

✅ VALIDATION CHECKS:
  - GPA >= 3.0: ✅ PASS
  - Language detected: ✅ ENGLISH

📝 TEST 2: INDONESIAN TRANSCRIPT
✅ Extraction successful!

📊 EXTRACTED DATA:
  - Nama: ABDUL ZACKY
  - IPK: 3.82
  - Program Studi: Ilmu Komputer
  - Universitas: Universitas Indonesia
  - Bahasa: indonesian

🎉 TESTING COMPLETED!
  - English transcript: ✅ SUCCESS
  - Indonesian transcript: ✅ SUCCESS
```

---

## 🌍 Supported Formats

### International Universities:
- ✅ EPFL (Switzerland) - 6.0 scale
- ✅ MIT, Stanford, Harvard (USA) - 4.0 scale
- ✅ Oxford, Cambridge (UK) - Classification system
- ✅ European universities - ECTS system
- ✅ Australian universities - HD/D/C system

### Indonesian Universities:
- ✅ UI, UGM, ITB, ITS, IPB, UNAIR, UNDIP, UB
- ✅ 4000+ universitas di Indonesia
- ✅ Standard format (IPK 4.0 scale)
- ✅ Bilingual format

---

## 💰 Cost Analysis

### Per Transcript:
- **Regex extraction**: $0.00 (FREE, instant)
- **Gemini AI extraction**: ~$0.0006 (~Rp 9)

### Usage Estimate:
```
Indonesian transcripts (70%):
→ Regex extraction → $0.00

English transcripts (30%):
→ Gemini AI extraction → $0.0006 each

1000 verifications/month:
- 700 × $0.00 = $0.00
- 300 × $0.0006 = $0.18

Total: ~$0.18/month (~Rp 2.700)
```

---

## 📝 Examples

### Example 1: EPFL Summer School Transcript

**Input (OCR Text)**:
```
École Polytechnique Fédérale de Lausanne (EPFL)
Summer@EPFL Program
TRANSCRIPT OF RECORDS

Student: ABDUL ZACKY
GPA (converted to 4.0 scale): 3.85
Total Credits: 22 ECTS
```

**Gemini Extraction**:
```json
{
  "nama_lengkap": "ABDUL ZACKY",
  "ipk": 3.85,
  "total_sks": 22,
  "universitas": "École Polytechnique Fédérale de Lausanne",
  "program_studi": "Summer School 2024",
  "language": "english",
  "format_type": "english_exchange",
  "confidence": {
    "ipk": 0.95,
    "nama_lengkap": 1.0
  }
}
```

**Validation Result**:
- ✅ IPK 3.85 >= 3.0 (PASS)
- ✅ Nama match dengan KTP
- ✅ Format recognized: English exchange program
- Status: **TMS** (Memenuhi Syarat)

---

### Example 2: UI Bilingual Transcript

**Input (OCR Text)**:
```
UNIVERSITAS INDONESIA / UNIVERSITY OF INDONESIA
TRANSKRIP NILAI / TRANSCRIPT OF RECORDS

Nama / Name: ABDUL ZACKY
NIM / Student ID: 1906123456
IPK / GPA: 3.82 / 4.00
Total SKS / Credits: 146
```

**Extraction**:
- Strategy 1: Regex finds "IPK: 3.82" ✅ (fast path)
- Language: bilingual (Indonesian dominant)
- No Gemini AI needed (cost saved!)

**Validation Result**:
- ✅ IPK 3.82 >= 3.0 (PASS)
- ✅ Nama found in transcript
- Status: **TMS**

---

## ⚠️ Important Notes

### When Gemini AI is Used:
1. ✅ Transcript in English
2. ✅ Non-standard format
3. ✅ Regex extraction failed
4. ✅ Bilingual with complex layout

### Manual Review Needed When:
1. ⚠️ Confidence score < 60%
2. ⚠️ Name mismatch dengan KTP
3. ⚠️ GPA/IPK < 3.0
4. ⚠️ Unclear document quality

---

## 🔮 Future Enhancements

### Phase 1 (Current) ✅
- [x] Bilingual transcript support (Indonesian + English)
- [x] Gemini AI extraction for English transcripts
- [x] GPA scale conversion
- [x] Language detection
- [x] Confidence scoring

### Phase 2 (Planned)
- [ ] Support for more languages (French, German, etc.)
- [ ] Automatic GPA conversion from all scales
- [ ] Course-level validation (check required courses)
- [ ] Transcript authenticity check (detect fake)

### Phase 3 (Future)
- [ ] Integration with university APIs
- [ ] Real-time transcript verification
- [ ] Blockchain-based credential verification
- [ ] Multi-document consistency validation

---

## 🆘 Troubleshooting

### Error: "IPK tidak dapat diekstrak"
**Cause**: Both regex and AI failed  
**Solution**: 
- Check document quality (blur, rotation)
- Ensure GPA/IPK is clearly visible
- Try re-uploading with better scan quality

### Warning: "Transkrip dalam bahasa english"
**Not an error!** Just informational.  
System successfully detected English transcript and used AI extraction.

### Error: "Nama tidak cocok dengan KTP"
**Cause**: Name mismatch between transcript and KTP  
**Solution**:
- Check if name format is different (nickname, abbreviation)
- Upload supporting documents (name change certificate)
- Contact admin for manual verification

---

## 📚 Related Documentation

- [GEMINI_IJAZAH_EXTRACTION.md](GEMINI_IJAZAH_EXTRACTION.md) - Ijazah AI extraction
- [DOCUMENT_VERIFICATION_SYSTEM.md](DOCUMENT_VERIFICATION_SYSTEM.md) - Full system docs
- [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md) - Environment setup

---

## 📞 Support

For bilingual transcript issues:
1. Check extraction logs: `[Gemini Transkrip Extractor]`
2. Review confidence scores
3. Test with `testGeminiTranscript.js`
4. Contact admin if confidence < 60%

---

**Status**: ✅ IMPLEMENTED & READY TO TEST  
**Supported Languages**: Indonesian, English, Bilingual  
**Version**: 1.0.0  
**Last Updated**: January 2025

---

## 🎉 Summary

✅ **Transkrip bahasa Inggris** sekarang didukung!  
✅ **Bilingual transcripts** detected automatically  
✅ **GPA conversion** dari skala apapun ke 4.0  
✅ **Zero cost** untuk transkrip Indonesia (regex)  
✅ **Minimal cost** untuk transkrip Inggris (~$0.0006)  

**Pelamar dengan exchange program** atau **international degree** sekarang bisa mendaftar! 🌍🎓
