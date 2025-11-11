# 🧪 Testing Guide - Name Validation & Program Studi Matching

## ⚠️ SANGAT PENTING: BUKA BROWSER CONSOLE!

Sistem sekarang memiliki **debugging yang sangat robust** dengan console logs di setiap step.

### Cara Membuka Console:
- **Chrome/Edge**: Tekan `F12` atau `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Tekan `F12` atau `Ctrl+Shift+K`
- **Safari**: `Cmd+Option+C`

Kemudian pilih tab **Console**

---

## 🎯 Test 1: Name Validation

### Objective
Memastikan warning muncul saat nama di KTP berbeda dengan nama di dokumen lain.

### Steps:
1. **Refresh halaman** (Ctrl+R atau Cmd+R)
2. **Buka Console** (lihat di atas)
3. Upload dokumen dengan **nama yang berbeda-beda**:
   - KTP: "BUDI SANTOSO"
   - Ijazah: "AHMAD WIJAYA"
   - Transkrip: "CITRA DEWI"

### Expected Results:

#### A. Console Logs
Anda HARUS melihat log seperti ini (full detailed):

```
================================================================================
[PAGE] VALIDATING REQUIREMENTS
================================================================================
[PAGE] Uploaded Docs: [ 'ktp', 'ijazah', 'transkrip' ]

[RequirementValidator] KTP Name: BUDI SANTOSO

[RequirementValidator] Ijazah Name: AHMAD WIJAYA
[RequirementValidator] Ijazah vs KTP Similarity: 0%
[RequirementValidator] ❌ Ijazah name inconsistency detected!

[RequirementValidator] Transkrip Name: CITRA DEWI
[RequirementValidator] Transkrip vs KTP Similarity: 17%
[RequirementValidator] ❌ Transkrip name inconsistency detected!

[RequirementValidator] Final nameInconsistencies: {
  ijazah: { documentName: "Ijazah", namaDoc: "AHMAD WIJAYA", ... },
  transkrip: { documentName: "Transkrip Nilai", namaDoc: "CITRA DEWI", ... }
}

[PAGE] Name Inconsistencies: { ijazah: {...}, transkrip: {...} }
================================================================================

[DocumentUpload-ijazah] Checking name inconsistency...
[DocumentUpload-ijazah] For this doc: { documentName: "Ijazah", ... }

[DocumentUpload-transkrip] Checking name inconsistency...
[DocumentUpload-transkrip] For this doc: { documentName: "Transkrip Nilai", ... }
```

#### B. UI (Visual)
**Di bawah field Ijazah**, harus muncul kotak MERAH:

```
┌──────────────────────────────────────────────────┐
│ ❌ Nama KTP dan Ijazah Tidak Sesuai             │
│                                                  │
│ Nama di KTP: BUDI SANTOSO                       │
│ Nama di Ijazah: AHMAD WIJAYA                    │
│ Tingkat kesamaan: 0%                            │
└──────────────────────────────────────────────────┘
```

**Di bawah field Transkrip**, harus muncul kotak MERAH:

```
┌──────────────────────────────────────────────────┐
│ ❌ Nama KTP dan Transkrip Nilai Tidak Sesuai    │
│                                                  │
│ Nama di KTP: BUDI SANTOSO                       │
│ Nama di Transkrip Nilai: CITRA DEWI             │
│ Tingkat kesamaan: 17%                           │
└──────────────────────────────────────────────────┘
```

### ❌ Troubleshooting

#### Problem 1: Tidak ada log `[PAGE]` di console
**Penyebab**: useEffect tidak dijalankan
**Solusi**: 
- Refresh halaman
- Pastikan minimal 1 dokumen sudah diupload
- Cek apakah ada error di console

#### Problem 2: Log ada, tapi `nameInconsistencies` kosong `{}`
**Penyebab**: Nama tidak diekstrak atau similarity >= 90%
**Solusi**:
- Cek apakah nama benar-benar diekstrak dari OCR
- Lihat log `[RequirementValidator] KTP Name:` dan `Ijazah Name:`
- Pastikan nama berbeda signifikan

#### Problem 3: Log ada, object terisi, tapi UI tidak muncul
**Penyebab**: React props tidak sampai ke component
**Solusi**:
- Lihat log `[DocumentUpload-ijazah] For this doc:`
- Jika log ini ada: Component menerima data
- Jika log ini tidak ada: Problem di React rendering
- Cek React DevTools

---

## 🎯 Test 2: Program Studi Matching

### Objective
Memastikan Akuntansi dan Ilmu Ekonomi dideteksi sebagai jurusan yang related (80% match).

### Steps:
1. Upload Ijazah dengan jurusan: **"Akuntansi"**
2. Formasi meminta: **"S-1/Sarjana Ilmu Ekonomi"**

### Expected Results:

#### A. Console Logs
```
[checkProgramStudiMatch] Comparing: akuntansi vs s-1/sarjana ilmu ekonomi
[checkProgramStudiMatch] ✓ Both in same group: ekonomi
```

#### B. UI
Di bagian **"Verifikasi Persyaratan Formasi"**:

```
⚠️ Program Studi Berbeda
Transkrip: , Ijazah: Akuntansi
Tingkat Kecocokan: 80%   [Progress bar kuning/hijau]
```

### Similarity Table:

| Ijazah           | Formasi Required | Similarity | Status |
|------------------|------------------|------------|--------|
| Akuntansi        | Ilmu Ekonomi     | 80%        | ✅ Pass |
| Manajemen        | Ekonomi          | 80%        | ✅ Pass |
| Teknik Informatika | Sistem Informasi | 80%      | ✅ Pass |
| Akuntansi Syariah | Akuntansi       | 95%        | ✅ Pass |
| Teknik Informatika | Ekonomi         | 0%         | ❌ Fail |

---

## 📋 Full Test Checklist

### Before Testing:
- [ ] Refresh halaman
- [ ] Buka Browser Console
- [ ] Bersihkan console (klik icon 🚫 atau ketik `clear()`)

### Test Name Validation:
- [ ] Upload KTP dengan nama A
- [ ] Upload Ijazah dengan nama B (berbeda)
- [ ] Cek console: Log `[PAGE] VALIDATING REQUIREMENTS` muncul
- [ ] Cek console: Log `[RequirementValidator] ❌ name inconsistency detected!` muncul
- [ ] Cek console: Object `nameInconsistencies` terisi
- [ ] Cek UI: Kotak merah warning muncul di bawah Ijazah
- [ ] Screenshot hasil jika ada masalah

### Test Program Studi:
- [ ] Upload Ijazah: Akuntansi
- [ ] Formasi: Ilmu Ekonomi
- [ ] Cek console: Log `[checkProgramStudiMatch]` muncul
- [ ] Cek console: Similarity = 80%
- [ ] Cek UI: Status "Program Studi Berbeda" dengan 80%
- [ ] Screenshot hasil

### If Everything Works:
- [ ] Warning nama muncul dengan benar ✅
- [ ] Program studi matching akurat ✅
- [ ] Console logs sangat detailed ✅
- [ ] Siap untuk production (hapus console.log)

### If Problems Occur:
1. **Screenshot console log** (full)
2. **Screenshot UI**
3. **Copy paste console log** ke text file
4. Kirim ke developer

---

## 🚀 Quick Debug Commands

Paste di console untuk debug manual:

```javascript
// Check current validation state
console.log("Validation:", window.requirementValidation);

// Check uploaded docs
console.log("Uploaded Docs:", window.uploadedDocs);

// Force re-render (jika perlu)
location.reload();
```

---

## 📞 Support

Jika setelah mengikuti guide ini masih ada masalah:
1. Pastikan semua console logs di-screenshot
2. Pastikan UI di-screenshot
3. Cek file: `DEBUG_NAME_VALIDATION.md` untuk detail lebih lanjut
4. Contact developer dengan bukti screenshot

**Remember**: Console logs adalah kunci debugging! Tanpa console logs, debugging sangat sulit! 🔑

