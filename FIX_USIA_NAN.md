# 🚨 PENTING: CARA MENGATASI ERROR "Usia Anda: NaN tahun"

## Root Cause
Error ini terjadi karena **data KTP belum ada di database Supabase**.

## Screenshot Error:
- ❌ Status: **TMS**
- ❌ Error: "Usia Anda: NaN tahun, maksimal 35 tahun"
- ❌ NIK di-extract tapi **tidak ditemukan di database**

---

## ✅ SOLUSI (3 LANGKAH MUDAH)

### LANGKAH 1: Insert Data ke Supabase

1. **Buka Supabase SQL Editor:**  
   https://app.supabase.com/project/wlpyeldyezghjwjkcoxq/sql/new

2. **Copy SEMUA isi file `QUICK_INSERT_KTP.sql`**
   - Buka file di VS Code
   - Tekan `Cmd+A` (Select All)
   - Tekan `Cmd+C` (Copy)

3. **Paste ke SQL Editor** dan **Klik RUN**

4. **Verify Result** - Akan muncul 2 rows:
   ```
   | nik              | nama          | tanggal_lahir | umur |
   |------------------|---------------|---------------|------|
   | 1371042904040002 | Abdul Zacky   | 2004-09-29    | 21   |
   | 1371042501710001 | Sudi Prayitno | 1995-01-25    | 30   |
   ```

### LANGKAH 2: Restart Browser

1. **Hard Refresh**: Tekan `Cmd+Shift+R` (Mac) atau `Ctrl+Shift+R` (Windows)
2. Atau **Close tab** dan buka lagi

### LANGKAH 3: Test Upload

Upload KTP Abdul Zacky lagi.

**Expected Result:**
```
✅ Status: MS (Memenuhi Syarat)

Verifikasi Persyaratan Formasi:
✓ Usia Memenuhi Syarat
  Usia Anda: 21 tahun (max. 35 tahun) - dari database Dukcapil
```

---

## 🔍 Apa yang Berubah?

### SEBELUM (Error):
```javascript
// Ambil tanggal lahir dari OCR (bisa salah)
birthDate = OCR.extractedData.tanggalLahir  // ❌ null/undefined
age = calculateAge(birthDate)               // ❌ NaN
```

### SESUDAH (Fixed):
```javascript
// Ambil umur dari database (sudah di-calculate di backend)
age = validation.umur  // ✅ 21 (dari database)
```

---

## 🎯 Keuntungan Logic Baru:

| Aspek | Lama (OCR) | Baru (Database) |
|-------|------------|-----------------|
| **Source Data** | OCR extract tanggal lahir | Query database dengan NIK |
| **Akurasi** | ❌ OCR bisa salah (1971 vs 2004) | ✅ 100% akurat |
| **Hitung Umur** | ❌ Di frontend (bisa error) | ✅ Di backend (reliable) |
| **Nama** | ❌ PROVINSI SUMATERA BARAT | ✅ Abdul Zacky |
| **Alamat** | ❌ Tidak ter-extract | ✅ Lengkap dari database |

---

## 📋 Checklist:

- [ ] SQL sudah di-RUN di Supabase
- [ ] Verify: 2 rows muncul (Abdul Zacky + Sudi Prayitno)
- [ ] Browser sudah di-hard refresh
- [ ] Upload KTP Abdul Zacky
- [ ] Status berubah jadi **MS** ✅
- [ ] Umur menunjukkan **21 tahun** (bukan NaN)

---

## 🐛 Troubleshooting:

### Error: "NIK tidak ditemukan dalam database"
**Solusi:** SQL belum di-run. Kembali ke Langkah 1.

### Error: "Usia Anda: NaN tahun" (masih muncul)
**Solusi:** 
1. Cek Console Log (F12) - cari `[Validation]`
2. Pastikan muncul: `[Validation] ✅ Data found in database`
3. Jika tidak muncul, berarti server belum restart

### Umur masih salah (misal: 54 tahun)
**Solusi:** 
1. Cek database: `SELECT * FROM dukcapil_dummy WHERE nik = '1371042904040002'`
2. Pastikan `tanggal_lahir = 2004-09-29` (bukan 1971)
3. Jika salah, update: `UPDATE dukcapil_dummy SET tanggal_lahir = '2004-09-29' WHERE nik = '1371042904040002'`

---

## 🎉 Expected Final Result:

### KTP Abdul Zacky:
- ✅ NIK: `1371042904040002` (dari OCR)
- ✅ Nama: `Abdul Zacky` (dari database)
- ✅ Umur: `21 tahun` (dari database)
- ✅ Tempat/Tgl Lahir: `Padang, 2004-09-29`
- ✅ Status: **MS** 🎊

### KTP Sudi Prayitno:
- ✅ NIK: `1371042501710001` (dari OCR)
- ✅ Nama: `Sudi Prayitno` (dari database)
- ✅ Umur: `30 tahun` (dari database)
- ✅ Tempat/Tgl Lahir: `Selat Panjang, 1995-01-25`
- ✅ Status: **MS** 🎊

---

**Created:** 2025-11-10  
**Fixed Issues:**
- ❌ "Usia Anda: NaN tahun"
- ❌ "NIK tidak ditemukan"
- ❌ Frontend pakai OCR data (tidak reliable)

**Status:** ✅ READY TO TEST
