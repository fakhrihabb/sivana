# Debug Guide - Name Validation & Program Studi Matching

## ⚠️ IMPORTANT: Buka Browser Console untuk Debug!

**Cara membuka Console:**
1. Tekan F12 atau Cmd+Option+I (Mac)
2. Pilih tab "Console"
3. Refresh halaman dan upload dokumen
4. Lihat semua log debug yang muncul

## Perubahan yang Dilakukan

### 1. RequirementValidator.js
- ✅ Menambahkan logika validasi nama per dokumen
- ✅ Menyimpan hasil inkonsistensi dalam `validationResults.nameInconsistencies`
- ✅ Menambahkan console.log untuk debugging
- ✅ **IMPROVED**: Program Studi Matching dengan grouping (Akuntansi + Ilmu Ekonomi = 80% match!)

### 2. DocumentUpload.js
- ✅ Menambahkan tampilan warning langsung di bawah dokumen
- ✅ Warning ditampilkan dalam kotak merah
- ✅ Menambahkan console.log untuk debugging

### 3. RequirementChecklist.js
- ✅ Filter kategori "Konsistensi Data" dari checklist umum

### 4. page.js
- ✅ Menambahkan debug log di useEffect validation
- ✅ Menampilkan uploaded docs dan validation results

## Cara Testing

### Step 1: Buka Browser Console
1. Buka aplikasi di browser
2. Buka Developer Tools (F12)
3. Pergi ke tab Console

### Step 2: Upload Dokumen dengan Nama Berbeda
1. Upload KTP dengan nama: "BUDI SANTOSO"
2. Upload Ijazah dengan nama: "AHMAD WIJAYA"
3. Upload Transkrip dengan nama: "CITRA DEWI"

### Step 3: Cek Console Logs
Anda harus melihat log seperti ini:

```
================================================================================
[PAGE] VALIDATING REQUIREMENTS
================================================================================
[PAGE] Uploaded Docs: [ 'ktp', 'ijazah', 'transkrip' ]
[PAGE] Formasi Requirements: { ... }

[RequirementValidator] KTP Name: BUDI SANTOSO
[RequirementValidator] Ijazah Name: AHMAD WIJAYA
[RequirementValidator] Ijazah vs KTP Similarity: 0%
[RequirementValidator] ❌ Ijazah name inconsistency detected!
[RequirementValidator] Transkrip Name: CITRA DEWI
[RequirementValidator] Transkrip vs KTP Similarity: 17%
[RequirementValidator] ❌ Transkrip name inconsistency detected!
[RequirementValidator] Final nameInconsistencies: {
  ijazah: {
    documentName: "Ijazah",
    namaDoc: "AHMAD WIJAYA",
    namaKTP: "BUDI SANTOSO",
    similarity: 0
  },
  transkrip: {
    documentName: "Transkrip Nilai",
    namaDoc: "CITRA DEWI",
    namaKTP: "BUDI SANTOSO",
    similarity: 17
  }
}

[PAGE] Validation Result: { ... }
[PAGE] Name Inconsistencies: { ijazah: {...}, transkrip: {...} }
================================================================================

[DocumentUpload-ijazah] Checking name inconsistency...
[DocumentUpload-ijazah] requirementValidation: { ... }
[DocumentUpload-ijazah] nameInconsistencies: { ijazah: {...}, transkrip: {...} }
[DocumentUpload-ijazah] For this doc: {
  documentName: "Ijazah",
  namaDoc: "AHMAD WIJAYA",
  namaKTP: "BUDI SANTOSO",
  similarity: 0
}
```

### Step 4: Verifikasi Tampilan UI
Di bawah setiap dokumen yang namanya berbeda, harus muncul kotak merah dengan:
- ❌ Nama KTP dan [Dokumen] Tidak Sesuai
- Nama di KTP: ...
- Nama di Dokumen: ...
- Tingkat kesamaan: ...%

## Troubleshooting

### Jika Warning Tidak Muncul

1. **Cek Console Logs**
   - Apakah `[RequirementValidator]` logs muncul?
   - Apakah similarity dihitung dengan benar?
   - Apakah `nameInconsistencies` object terisi?

2. **Cek Data Flow**
   - Apakah nama diekstrak dengan benar dari OCR?
   - Apakah `requirementValidation` dikirim ke `DocumentUpload`?
   - Apakah `documentId` cocok dengan key di `nameInconsistencies`?

3. **Cek Kondisi**
   - Apakah similarity < 90%? (threshold)
   - Apakah nama tidak kosong?
   - Apakah KTP sudah diupload sebelum dokumen lain?

### Log yang Harus Dicari

**Jika tidak ada log `[RequirementValidator]`:**
- `validateRequirements()` tidak dipanggil
- Cek di `page.js` apakah useEffect untuk validation berjalan

**Jika log ada tapi `nameInconsistencies` kosong:**
- Similarity mungkin >= 90%
- Nama mungkin kosong
- Cek spelling nama yang diupload

**Jika log ada dan object terisi tapi UI tidak muncul:**
- Cek apakah `requirementValidation` dikirim ke `DocumentUpload`
- Cek apakah `documentId` match dengan key
- Cek React DevTools untuk props

## Expected Behavior

### Kasus 1: Nama Berbeda Total
```
KTP: BUDI SANTOSO
Ijazah: AHMAD WIJAYA
→ Similarity: 0%
→ WARNING MUNCUL ✅
```

### Kasus 2: Nama Sama
```
KTP: BUDI SANTOSO
Ijazah: BUDI SANTOSO
→ Similarity: 100%
→ TIDAK ADA WARNING ✅
```

### Kasus 3: Nama dengan Gelar
```
KTP: BUDI SANTOSO
Ijazah: BUDI SANTOSO S.KOM
→ Similarity: ~67%
→ WARNING MUNCUL ✅
```

### Kasus 4: Nama Mirip (typo kecil)
```
KTP: BUDI SANTOSO
Ijazah: BUDI SANTOS
→ Similarity: ~92%
→ TIDAK ADA WARNING ✅
```

## Program Studi Matching - IMPROVED ✨

### Perubahan
Sekarang menggunakan **grouping system** untuk mendeteksi jurusan yang related:

### Groups:
1. **Ekonomi**: Ekonomi, Akuntansi, Manajemen, Keuangan, Bisnis, dll
2. **Teknik**: Teknik Informatika, Sistem Informasi, Teknik Sipil, dll
3. **Pendidikan**: Pendidikan, Keguruan, PGSD, dll
4. **Kesehatan**: Kedokteran, Keperawatan, Farmasi, dll
5. **Hukum**: Hukum, Syariah, dll
6. **Sains**: Matematika, Fisika, Kimia, Biologi, dll
7. **Sosial**: Sosiologi, Komunikasi, Administrasi Publik, dll

### Similarity Levels:
- **100%**: Exact match (Akuntansi = Akuntansi)
- **95%**: Contains (Akuntansi Syariah ⊃ Akuntansi)
- **80%**: Same group (Akuntansi + Ilmu Ekonomi = both in "ekonomi")
- **70%+**: Keyword match
- **<70%**: Not matched

### Example Console Logs:
```
[checkProgramStudiMatch] Comparing: akuntansi vs s-1/sarjana ilmu ekonomi
[checkProgramStudiMatch] ✓ Both in same group: ekonomi
Result: { matched: true, similarity: 80 }
```

### Test Cases yang Sudah Lulus:
✅ Akuntansi vs Ilmu Ekonomi = 80% (FIXED!)
✅ Manajemen vs Ekonomi = 80%
✅ Teknik Informatika vs Sistem Informasi = 80%
✅ Akuntansi Syariah vs Akuntansi = 95%
✅ Exact match = 100%

## Next Steps

Setelah testing:
1. **WAJIB**: Buka browser console dan cek log
2. Jika warning muncul: Hapus console.log untuk production
3. Jika warning tidak muncul: Screenshot console dan kirim ke developer
4. Adjust threshold jika perlu:
   - Nama: 90% (saat ini)
   - Program Studi: 70% (saat ini)

## File Locations

- `/src/components/documents/RequirementValidator.js` - Line 179-269
- `/src/components/documents/DocumentUpload.js` - Line 765-800
- `/src/components/documents/RequirementChecklist.js` - Line 139-140

