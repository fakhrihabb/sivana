# Validasi Konsistensi Nama - Dokumentasi

## Perubahan yang Dilakukan

### Problem
Sebelumnya, sistem menampilkan pesan "Nama konsisten di semua dokumen" meskipun nama di KTP berbeda dengan dokumen lain (Ijazah, Transkrip, Surat Lamaran). Peringatan inkonsistensi ditampilkan dalam satu kotak di bawah halaman, bukan langsung di dokumen yang bermasalah.

### Solusi
1. **Validasi Per Dokumen**: Setiap dokumen sekarang divalidasi secara individual terhadap nama di KTP
2. **Peringatan Langsung**: Peringatan inkonsistensi nama ditampilkan langsung di bawah dokumen yang bermasalah
3. **Tidak Ada Peringatan Gabungan**: Peringatan "Konsistensi Data" tidak lagi ditampilkan di bagian bawah halaman

## File yang Diubah

### 1. `/src/components/documents/RequirementValidator.js`

**Perubahan**:
- Menghapus logika validasi nama gabungan
- Menambahkan validasi individual per dokumen
- Menyimpan hasil inkonsistensi nama dalam `validationResults.nameInconsistencies`

**Logika Baru**:
```javascript
validationResults.nameInconsistencies = {
  ijazah: {
    documentName: "Ijazah",
    namaDoc: "NAMA DI IJAZAH",
    namaKTP: "NAMA DI KTP",
    similarity: 85
  },
  transkrip: { ... },
  surat_lamaran: { ... }
}
```

**Threshold**: Nama dianggap tidak konsisten jika similarity < 90%

### 2. `/src/components/documents/DocumentUpload.js`

**Perubahan**:
- Menambahkan tampilan peringatan inkonsistensi nama di bawah setiap dokumen
- Peringatan ditampilkan dalam kotak merah dengan detail nama di KTP vs nama di dokumen

**Contoh Tampilan**:
```
┌─────────────────────────────────────────────┐
│ ❌ Nama KTP dan Ijazah Tidak Sesuai         │
│                                             │
│ KTP: BUDI SANTOSO                          │
│ Ijazah: AHMAD WIJAYA                       │
│ Kesamaan: 0%                               │
└─────────────────────────────────────────────┘
```

### 3. `/src/components/documents/RequirementChecklist.js`

**Perubahan**:
- Memfilter kategori "Konsistensi Data" dari tampilan checklist
- Validasi konsistensi nama sekarang ditampilkan per dokumen, bukan dalam checklist umum

**Kode**:
```javascript
validationResults.checks
  .filter(check => check.category !== "Konsistensi Data")
  .map((check, index) => ( ... ))
```

## Cara Kerja

1. **Upload KTP**: Nama dari KTP diekstrak dan disimpan
2. **Upload Dokumen Lain**: Saat mengupload Ijazah/Transkrip/Surat Lamaran:
   - Sistem membandingkan nama di dokumen dengan nama di KTP
   - Menghitung similarity menggunakan algoritma Levenshtein Distance
   - Jika similarity < 90%, inkonsistensi disimpan
3. **Tampilan Peringatan**: 
   - Peringatan ditampilkan langsung di bawah dokumen yang bermasalah
   - Menampilkan nama di KTP vs nama di dokumen
   - Menampilkan persentase kesamaan

## Testing

Test dilakukan untuk memverifikasi:
- ✅ Nama sama persis: 100% similarity (konsisten)
- ✅ Nama berbeda total: 0% similarity (tidak konsisten)
- ✅ Nama dengan huruf besar/kecil: 100% similarity (konsisten)
- ✅ Nama sedikit berbeda: ~92% similarity (konsisten)
- ✅ Nama dengan gelar: ~67% similarity (tidak konsisten)

## Contoh Kasus

### Kasus 1: Nama Konsisten
```
KTP: BUDI SANTOSO
Ijazah: BUDI SANTOSO
Transkrip: BUDI SANTOSO
→ Tidak ada peringatan
```

### Kasus 2: Nama Tidak Konsisten
```
KTP: BUDI SANTOSO
Ijazah: AHMAD WIJAYA
Transkrip: CITRA DEWI
→ Peringatan di bawah Ijazah: "Nama KTP dan Ijazah Tidak Sesuai"
→ Peringatan di bawah Transkrip: "Nama KTP dan Transkrip Nilai Tidak Sesuai"
```

### Kasus 3: Nama dengan Gelar
```
KTP: BUDI SANTOSO
Ijazah: BUDI SANTOSO S.KOM
→ Peringatan di bawah Ijazah (similarity 67% < 90%)
```

## Catatan Penting

1. **Threshold 90%**: Disesuaikan untuk menangani variasi kecil seperti spasi atau tanda baca
2. **Case Insensitive**: Perbandingan mengabaikan huruf besar/kecil
3. **Trim Whitespace**: Spasi di awal/akhir nama diabaikan
4. **Per Document**: Setiap dokumen divalidasi terpisah untuk feedback yang jelas

## Future Improvements

1. Tambahkan opsi "Konfirmasi" jika user yakin nama sudah benar
2. Implementasi fuzzy matching yang lebih canggih untuk menangani typo
3. Validasi nama lengkap vs nama panggilan
4. Integrasi dengan database untuk verifikasi nama resmi

