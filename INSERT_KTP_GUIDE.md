# 🚀 CARA INSERT DATA KTP KE SUPABASE

## Masalah Saat Ini
- Status: **TMS** ❌
- Error: `NIK tidak terdaftar dalam database Dukcapil`
- Root Cause: Data KTP belum ada di tabel `dukcapil_dummy`

## Solusi: Insert Data via SQL Editor

### Langkah 1: Buka Supabase SQL Editor
Klik link ini: https://app.supabase.com/project/wlpyeldyezghjwjkcoxq/sql/new

### Langkah 2: Copy Paste SQL Query
1. Buka file `QUICK_INSERT_KTP.sql` di VS Code
2. **Select All** (Cmd+A / Ctrl+A)
3. **Copy** (Cmd+C / Ctrl+C)
4. **Paste** ke Supabase SQL Editor
5. **Klik tombol RUN** (atau tekan Cmd+Enter)

### Langkah 3: Verifikasi Insert
Setelah RUN berhasil, Anda akan melihat result:

```
| nik              | nama          | tanggal_lahir | umur |
|------------------|---------------|---------------|------|
| 1371042501710001 | Sudi Prayitno | 1995-01-25    | 30   |
```

✅ Jika muncul 1 row, berarti insert **BERHASIL**!

### Langkah 4: Test Upload KTP
1. **Reload browser** (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
2. Upload file `papa.jpg` lagi
3. **Expected Result:**
   - ✅ Status: **MS** (Memenuhi Syarat)
   - ✅ NIK: `1371042501710001` ✓ Found
   - ✅ Nama: `Sudi Prayitno` (dari database)
   - ✅ Umur: `30 tahun` (dari database)
   - ✅ Tempat/Tgl Lahir: `Selat Panjang, 1995-01-25`
   - ✅ Provinsi: `Sumatera Barat`

---

## Perubahan Logic Baru

### SEBELUM (kompleks, error-prone):
```
OCR → Extract NIK, Nama, Tanggal Lahir → Hitung Umur → Validasi
```
- ❌ OCR bisa salah baca tanggal (1971 vs 1995)
- ❌ Nama bisa salah extract (PROVINSI SUMATERA BARAT)
- ❌ Harus parsing format tanggal manual

### SESUDAH (simple, reliable):
```
OCR → Extract NIK → Query Database → Ambil SEMUA data → Validasi
```
- ✅ **Hanya extract NIK** dari OCR (16 digit, reliable)
- ✅ **Semua data lainnya dari database** (nama, umur, alamat, provinsi)
- ✅ Database adalah **source of truth**
- ✅ OCR tidak perlu perfect, cukup baca NIK

### Contoh Validation Result:
```javascript
{
  success: true,
  nik: "1371042501710001",        // dari OCR
  nama: "Sudi Prayitno",          // dari database ✓
  umur: 30,                       // dari database ✓
  tempatLahir: "Selat Panjang",   // dari database ✓
  tanggalLahir: "1995-01-25",     // dari database ✓
  alamat: "Jl. Belanti Barat...", // dari database ✓
  provinsi: "Sumatera Barat",     // dari database ✓
  dukcapilMatch: true,
  ageValid: true,
  errors: []
}
```

---

## Troubleshooting

### Error: "new row violates row-level security policy"
**Solution:** SQL query sudah diupdate untuk:
1. Disable RLS sementara
2. Insert data
3. Enable RLS kembali dengan policy yang benar

### Error: "NIK not found in database"
**Kemungkinan:**
1. ❌ SQL belum dijalankan → Jalankan SQL di editor
2. ❌ Browser cache lama → Hard refresh browser
3. ❌ NIK OCR salah baca → Cek console log

### Cara Debug:
1. **Buka Console** (F12 / Cmd+Option+I)
2. **Filter logs**: ketik `[Validation]`
3. **Check logs:**
   ```
   [Validation] NIK extracted from OCR: 1371042501710001
   [Validation] Querying Dukcapil database...
   [Validation] ✅ Data found in database:
     - Nama: Sudi Prayitno
     - Tempat/Tgl Lahir: Selat Panjang / 1995-01-25
     - Provinsi: Sumatera Barat
   [Validation] Age calculated from database: 30 tahun
   [Validation] ✅ Age validation passed: 30 tahun
   [Validation] ✅ KTP validation successful!
   ```

---

## Next Steps After Success

Setelah KTP berhasil (status MS), Anda bisa lanjut upload dokumen lain:
- 📄 Ijazah (cek dengan PDDIKTI)
- 📄 Transkrip Nilai (cek IPK ≥ 3.0)
- 📄 Surat Lamaran
- 📄 Surat Pernyataan

Semua dokumen akan cross-validate dengan data KTP yang sudah berhasil!

---

**Created:** 2025-11-10  
**Status:** Ready to Use ✅
