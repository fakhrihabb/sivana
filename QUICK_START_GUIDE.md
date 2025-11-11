# Quick Start Guide - Document Verification System

## 🚀 Setup Database (WAJIB!)

### 1. Setup Dukcapil Database (KTP Verification)

1. Login ke Supabase Dashboard: https://supabase.com
2. Pilih project Anda
3. Klik "SQL Editor" di sidebar kiri
4. Click "New Query"
5. Copy seluruh isi file `supabase_dukcapil_dummy.sql`
6. Paste ke SQL Editor
7. Klik "Run" (atau tekan Ctrl/Cmd + Enter)
8. Verifikasi: Buka "Table Editor" → cek tabel `dukcapil_dummy` → harus ada 50 rows

### 2. Setup PDDIKTI Database (Ijazah Verification)

1. Masih di SQL Editor, klik "New Query" lagi
2. Copy seluruh isi file `supabase_pddikti_dummy.sql`
3. Paste ke SQL Editor
4. Klik "Run"
5. Verifikasi: Buka "Table Editor" → cek tabel `pddikti_dummy` → harus ada 50 rows

---

## 🧪 Testing Document Upload

### Test Data Available:

#### KTP Test Cases (dari dukcapil_dummy):
```
NIK: 3171012301850001
Nama: Ahmad Fauzi
Tanggal Lahir: 23-01-1985
Umur: 40 tahun → ❌ REJECTED (>35)

NIK: 3172014502900002
Nama: Siti Nurhaliza
Tanggal Lahir: 05-02-1990
Umur: 35 tahun → ✅ VALID

NIK: 3173021508950003
Nama: Budi Santoso
Tanggal Lahir: 15-08-1995
Umur: 30 tahun → ✅ VALID
```

#### Ijazah Test Cases (dari pddikti_dummy):
```
Nomor: UI-2020-001234
Nama: Ahmad Fauzi
Prodi: Ilmu Ekonomi
Universitas: Universitas Indonesia
IPK: 3.65

Nomor: ITB-2020-012345
Nama: Dian Sastro
Prodi: Teknik Informatika
Universitas: Institut Teknologi Bandung
IPK: 3.88

Nomor: UGM-2020-112233
Nama: Bambang Pamungkas
Prodi: Manajemen
Universitas: Universitas Gadjah Mada
IPK: 3.66
```

---

## 📝 Upload Flow

### 1. Untuk Test KTP:

**Buat gambar KTP dummy dengan informasi:**
- NIK: 3173021508950003
- Nama: BUDI SANTOSO
- Tempat/Tgl Lahir: JAKARTA, 15-08-1995
- (atau gunakan KTP asli yang NIK-nya ada di database)

**Expected Result:**
```json
{
  "validation": {
    "success": true,
    "nik": "3173021508950003",
    "nama": "Budi Santoso",
    "umur": 30,
    "dukcapilMatch": true,
    "ageValid": true,
    "errors": [],
    "warnings": []
  }
}
```

### 2. Untuk Test Ijazah:

**Buat gambar ijazah dummy dengan informasi:**
- Nomor Ijazah: ITB-2020-012345
- Nama: Dian Sastro
- Program Studi: Teknik Informatika
- Universitas: Institut Teknologi Bandung

**Expected Result:**
```json
{
  "validation": {
    "success": true,
    "nomorIjazah": "ITB-2020-012345",
    "nama": "Dian Sastro",
    "programStudi": "Teknik Informatika",
    "pddiktiMatch": true,
    "namaMatch": true,  // jika KTP sudah diupload
    "jurusanMatch": true, // jika formasi butuh Teknik Informatika
    "hasHandwriting": false,
    "errors": [],
    "warnings": []
  }
}
```

### 3. Untuk Test Transkrip:

**Buat gambar transkrip dummy dengan informasi:**
- Nama: Budi Santoso (sama dengan KTP)
- IPK: 3.75

**Expected Result:**
```json
{
  "validation": {
    "success": true,
    "ipk": 3.75,
    "namaMatch": true,
    "ipkValid": true,
    "errors": [],
    "warnings": []
  }
}
```

---

## 🔍 Validation Rules Summary

| Document | Tesseract | Vision API | Database Check | Age Check | IPK Check | Name Match |
|----------|-----------|------------|----------------|-----------|-----------|------------|
| KTP | ✅ | ❌ | ✅ Dukcapil | ✅ Max 35 | ❌ | ❌ |
| Ijazah | ❌ | ✅ | ✅ PDDIKTI | ❌ | ❌ | ✅ vs KTP |
| Transkrip | ✅ | ❌ | ❌ | ❌ | ✅ Min 3.0 | ✅ vs KTP |
| Surat Lamaran | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ vs KTP |
| Surat Pernyataan | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ vs KTP |

---

## 🐛 Common Issues & Solutions

### Issue 1: "NIK tidak ditemukan dalam database Dukcapil"
**Cause:** NIK di KTP tidak ada di database dummy
**Solution:** 
- Gunakan salah satu NIK dari `supabase_dukcapil_dummy.sql` (50 NIK tersedia)
- Atau tambahkan NIK baru ke database

### Issue 2: "Nomor ijazah tidak ditemukan dalam database PDDIKTI"
**Cause:** Nomor ijazah tidak ada di database dummy
**Solution:**
- Gunakan salah satu nomor dari `supabase_pddikti_dummy.sql` (50 nomor tersedia)
- Format harus: KODE-YYYY-NNNNNN (e.g., UI-2020-001234)

### Issue 3: "Nama di ijazah tidak sesuai dengan nama di KTP"
**Cause:** Nama tidak match (similarity < 70%)
**Solution:**
- Pastikan nama di ijazah dan KTP sama persis
- Sistem menggunakan Levenshtein distance (toleransi typo kecil)

### Issue 4: "IPK tidak dapat diekstrak dari transkrip"
**Cause:** OCR gagal membaca IPK atau format IPK tidak standar
**Solution:**
- Pastikan IPK tertulis jelas: "IPK: 3.75" atau "Indeks Prestasi Kumulatif: 3,75"
- Gunakan font yang jelas dan tidak blur

### Issue 5: "Umur melebihi batas maksimal 35 tahun"
**Cause:** Tanggal lahir membuat umur > 35 tahun
**Solution:**
- Gunakan NIK dengan tahun lahir 1990 atau lebih muda
- Contoh: 3172014502900002 (Siti Nurhaliza, lahir 1990, umur 35 tahun)

---

## 📊 Console Logs untuk Debugging

Saat upload dokumen, cek console browser dan server terminal:

### Browser Console:
```javascript
[Frontend] 📦 API RESPONSE RECEIVED
[Frontend] Response data: {...}
[Frontend] OCR Text Length: 1245
[Frontend] OCR Text Sample: REPUBLIK INDONESIA PROVINSI DKI JAKARTA...
[Frontend] Content Detection: { detectedType: "ktp", confidence: 0.92 }
```

### Server Terminal:
```bash
[API] 🔍 DOCUMENT UPLOAD START
[API] Document Type: ktp
[API] Using Tesseract OCR for ktp
[Tesseract] Starting OCR for: /path/to/file
[Tesseract] Progress: 100%
[Tesseract] OCR completed
[Extract] Found NIK: 3173021508950003
[Extract] Found Nama: BUDI SANTOSO
[Validation] Checking NIK in Dukcapil database: 3173021508950003
[Validation] Dukcapil match successful
[Validation] Age validation passed: 30 tahun
[API] KTP Validation Result: { success: true, ... }
```

---

## 🎯 Testing Checklist

- [ ] KTP upload → NIK ditemukan di Dukcapil
- [ ] KTP upload → Umur <= 35 tahun
- [ ] Ijazah upload → Nomor ijazah ditemukan di PDDIKTI
- [ ] Ijazah upload → Nama match dengan KTP
- [ ] Ijazah upload → Prodi match dengan formasi
- [ ] Transkrip upload → IPK >= 3.0
- [ ] Transkrip upload → Nama match dengan KTP
- [ ] Surat Lamaran → Nama match dengan KTP
- [ ] Surat Pernyataan → Nama match dengan KTP
- [ ] Test tulisan tangan pada ijazah → warning muncul

---

## 💡 Tips

1. **Untuk testing cepat**, gunakan text editor untuk membuat "fake document":
   ```
   REPUBLIK INDONESIA
   PROVINSI DKI JAKARTA
   KARTU TANDA PENDUDUK
   
   NIK: 3173021508950003
   Nama: BUDI SANTOSO
   Tempat/Tgl Lahir: JAKARTA, 15-08-1995
   ```
   Simpan sebagai gambar (screenshot) dan upload.

2. **OCR works best dengan:**
   - Gambar beresolusi tinggi
   - Teks hitam di background putih
   - Font yang jelas (tidak blur)
   - Tidak ada rotasi/skewed

3. **Database dummy:**
   - 50 NIK valid dari 10 kota
   - 50 ijazah dari 10 universitas ternama
   - Semua data Indonesia-realistic

---

## 🚨 Production Considerations

1. **Replace dummy databases dengan real API:**
   - Dukcapil: Integrate dengan API Dukcapil resmi
   - PDDIKTI: Integrate dengan API Forlap Dikti resmi

2. **Rate limiting:**
   - Tesseract: No limit (self-hosted)
   - Vision API: 1800 requests/minute (free tier)

3. **Error handling:**
   - Implement retry logic untuk OCR failures
   - Queue system untuk batch processing
   - Manual review dashboard untuk edge cases

4. **Security:**
   - Encrypt uploaded documents
   - Auto-delete temporary files
   - Audit logs untuk all verifications
