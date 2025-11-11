# DOCUMENT VERIFICATION SYSTEM - SIVANA

## 📋 Requirement Dokumen (Updated)

### Dokumen yang Dibutuhkan:

1. **KTP (Kartu Tanda Penduduk)** ✅
2. **Ijazah/STTB** ✅
3. **Transkrip Nilai** ✅
4. **Surat Lamaran** ✅
5. **Surat Pernyataan 5 Poin** ✅

### Dokumen yang Dihapus:
- ❌ SKCK
- ❌ STR
- ❌ Sertifikat Kompetensi

---

## 🔍 Validation Rules Per Dokumen

### 1. KTP (Kartu Tanda Penduduk)
**OCR Method:** Tesseract (Free, untuk dokumen tercetak)

**Validasi:**
1. ✅ Cek nama dan NIK di database Dukcapil (Supabase)
   - Query: `SELECT * FROM dukcapil_dummy WHERE nik = ?`
   - Validasi nama dengan similarity matching (min. 70%)

2. ✅ Cek umur maksimal 35 tahun
   - Extract tanggal lahir dari OCR
   - Calculate age dari tanggal lahir
   - Reject jika umur > 35 tahun

3. ⏳ Cek rekomendasi lokasi formasi (implementasi nanti)
   - TODO: Match provinsi KTP dengan lokasi formasi

**Database:** `dukcapil_dummy` (50 records)
- Kolom: nik, nama, tempat_lahir, tanggal_lahir, alamat, provinsi, dll

---

### 2. Ijazah/STTB
**OCR Method:** Vision API (Dapat detect tulisan tangan)

**Validasi:**
1. ✅ Cek tulisan tangan
   - Vision API confidence < 70% → handwriting detected
   - Warning jika ada tulisan tangan → verifikasi manual

2. ✅ Cek dengan nama KTP
   - Similarity matching antara nama di ijazah vs KTP
   - Min. 70% similarity

3. ✅ Cek dengan nomor ijazah PDDIKTI
   - Query: `SELECT * FROM pddikti_dummy WHERE nomor_ijazah = ?`
   - Format: KODE-YYYY-NNNNNN (e.g., UI-2020-001234)

4. ⏳ Surat penyetaraan ijazah (implementasi nanti)
   - TODO: Upload terpisah untuk ijazah luar negeri

5. ✅ Cek jurusan apakah sesuai dengan formasi
   - Match program_studi di ijazah vs program_studi di formasi
   - String similarity atau contains check

**Database:** `pddikti_dummy` (50 records)
- Kolom: nomor_ijazah, nama, nim, program_studi, universitas, tahun_lulus, ipk, gelar

---

### 3. Transkrip Nilai
**OCR Method:** Tesseract (Free, untuk dokumen tercetak)

**Validasi:**
1. ✅ Cek dengan nama KTP dan ijazah
   - Nama harus match dengan KTP (partial matching allowed)
   - Contains check dalam teks transkrip

2. ✅ Cek IPK minimal 3.0
   - Extract IPK dari OCR text
   - Regex pattern: /IPK\s*:?\s*([0-4][.,]\d{1,2})/i
   - Reject jika IPK < 3.0

**Output:**
- `ipk`: float (e.g., 3.75)
- `ipkValid`: boolean
- `namaMatch`: boolean

---

### 4. Surat Lamaran
**OCR Method:** Tesseract (Free, untuk dokumen tercetak)

**Validasi:**
1. ✅ Cek dengan nama KTP dan ijazah
   - Nama harus ditemukan dalam teks surat
   - Partial matching allowed (min. 50% kata nama)

**Output:**
- `namaMatch`: boolean
- Warnings jika partial match

---

### 5. Surat Pernyataan 5 Poin
**OCR Method:** Tesseract (Free, untuk dokumen tercetak)

**Validasi:**
1. ✅ Cek dengan nama KTP dan ijazah
   - Nama harus ditemukan dalam teks surat
   - Partial matching allowed (min. 50% kata nama)

**Output:**
- `namaMatch`: boolean
- Warnings jika partial match

---

## 💰 Cost Optimization

### Old System:
- All documents → Vision API
- Cost: 5M users × 4 docs × $1.50/1000 = **$30,000**

### New System:
| Document | OCR Method | Cost per 1000 |
|----------|------------|---------------|
| KTP | Tesseract | **$0** |
| Ijazah | Vision API | $1.50 |
| Transkrip | Tesseract | **$0** |
| Surat Lamaran | Tesseract | **$0** |
| Surat Pernyataan | Tesseract | **$0** |

**New Cost:** 5M users × 1 doc (ijazah) × $1.50/1000 = **$7,500**

**Savings: 75% ($22,500 saved)**

---

## 🗄️ Database Structure

### Supabase Tables:

#### 1. dukcapil_dummy (Civil Registry)
```sql
CREATE TABLE dukcapil_dummy (
  nik VARCHAR(16) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20),
  alamat TEXT,
  provinsi VARCHAR(100),
  ...
);
```
**RLS:** Authenticated read-only access
**Data:** 50 valid NIK records (10 cities)

#### 2. pddikti_dummy (Higher Education)
```sql
CREATE TABLE pddikti_dummy (
  nomor_ijazah VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nim VARCHAR(20),
  program_studi VARCHAR(255) NOT NULL,
  universitas VARCHAR(255) NOT NULL,
  tahun_lulus INTEGER NOT NULL,
  ipk DECIMAL(3,2),
  gelar VARCHAR(50),
  ...
);
```
**RLS:** Authenticated read-only access
**Data:** 50 ijazah records (10 universitas)

---

## 🔧 Technical Implementation

### Files Created/Modified:

1. **`/src/lib/tesseractOcr.js`** (NEW)
   - `performTesseractOCR()`: OCR dengan Tesseract
   - `extractNIK()`: Extract 16-digit NIK
   - `extractNamaKTP()`: Extract nama dari KTP
   - `extractTanggalLahir()`: Extract birthdate
   - `calculateAge()`: Calculate age from date
   - `extractNomorIjazah()`: Extract ijazah number
   - `extractIPK()`: Extract GPA from transkrip
   - `nameSimilarity()`: Levenshtein distance matching

2. **`/src/lib/documentValidator.js`** (NEW)
   - `validateKTP()`: KTP validation with Dukcapil
   - `validateIjazah()`: Ijazah validation with PDDIKTI
   - `validateTranskrip()`: Transkrip IPK validation
   - `validateSuratLamaran()`: Application letter validation
   - `validateSuratPernyataan()`: Statement letter validation

3. **`/src/app/api/documents/route.js`** (UPDATED)
   - Switch OCR method berdasarkan document type
   - Ijazah → Vision API (detect handwriting)
   - Others → Tesseract (cost-effective)
   - Call appropriate validator per document type
   - Return comprehensive validation result

4. **`/src/components/documents/DocumentUpload.js`** (UPDATED)
   - Update DOCUMENT_KEYWORDS (removed SKCK, STR, Sertifikat)
   - Added surat_lamaran, surat_pernyataan
   - Handle validation response from API

### Dependencies:
```bash
npm install tesseract.js  # ✅ Installed
npm install @supabase/supabase-js  # ✅ Installed
```

---

## 📊 API Response Format

```json
{
  "success": true,
  "data": {
    "ocr": {
      "success": true,
      "text": "extracted text...",
      "confidence": 0.85
    },
    "contentDetection": {
      "detectedType": "ktp",
      "confidence": 0.92
    },
    "validation": {
      "success": true,
      "nik": "3171012301850001",
      "nama": "Ahmad Fauzi",
      "umur": 28,
      "dukcapilMatch": true,
      "ageValid": true,
      "errors": [],
      "warnings": []
    }
  }
}
```

---

## ✅ Next Steps

1. **Test dengan dokumen asli:**
   - Upload KTP → verify NIK dengan Dukcapil
   - Upload Ijazah → verify nomor ijazah dengan PDDIKTI
   - Upload Transkrip → check IPK >= 3.0

2. **Frontend Integration:**
   - Update DocumentVerification.js untuk handle validation errors/warnings
   - Show validation messages per document
   - Block submission jika ada critical errors

3. **Future Implementations:**
   - Lokasi formasi matching (KTP provinsi vs formasi lokasi)
   - Surat penyetaraan ijazah (untuk ijazah luar negeri)
   - Admin dashboard untuk manual review (handwriting cases)

---

## 🚀 Usage

### Deploy to Supabase:
```bash
# 1. Copy supabase_dukcapil_dummy.sql
# 2. Paste in Supabase SQL Editor
# 3. Run query

# 4. Copy supabase_pddikti_dummy.sql
# 5. Paste in Supabase SQL Editor
# 6. Run query
```

### Test Locally:
```bash
npm run dev
# Navigate to /formasi/[id]
# Upload documents
# Check console logs for validation results
```

---

## 📝 Notes

- **Tesseract Accuracy:** 85-95% for printed documents (Indonesian)
- **Vision API Accuracy:** 90-95% including handwriting detection
- **NIK Format:** 16 digits (2 province + 2 city + 2 district + 6 birthdate + 4 sequence)
- **Ijazah Format:** KODE-YYYY-NNNNNN (e.g., UI-2020-001234)
- **Name Similarity Threshold:** 70% (adjustable in code)
- **IPK Minimum:** 3.0 (hardcoded, should be from formasi requirements)
