# PDF to Image Conversion & OCR Fix

## Masalah
Vision AI tidak bisa mendeteksi PDF secara langsung. Untuk dokumen PDF yang di-scan (scanned PDF), OCR gagal karena tidak ada konversi dari PDF ke gambar.

## Solusi
Implementasi konversi PDF ke gambar menggunakan `pdf-to-png-converter` untuk memungkinkan OCR pada scanned PDF.

## Fitur Baru

### 1. Konversi PDF ke Gambar
File: `src/lib/pdfParser.js`

**Function: `convertPDFToImages(pdfPath)`**
```javascript
// Mengkonversi PDF ke array gambar PNG
const result = await convertPDFToImages('./path/to/file.pdf');

// Result:
{
  success: true,
  imagePaths: [
    '/path/to/pdf-12345-page-1.png',
    '/path/to/pdf-12345-page-2.png'
  ],
  pageCount: 2
}
```

**Konfigurasi:**
- **viewportScale**: 2.0 (200% zoom untuk kualitas lebih baik)
- **Format**: PNG (mendukung transparansi)
- **Output folder**: `tmp/pdf-images/`

### 2. Cleanup Function
**Function: `cleanupPDFImages(imagePaths)`**
```javascript
// Menghapus file gambar hasil konversi
await cleanupPDFImages(result.imagePaths);
```

### 3. Flow Proses di API

**File: `src/app/api/documents/route.js`**

#### Alur Proses PDF:
1. **Cek tipe file** - Apakah PDF?
2. **Extract text dengan pdf-parse** - Coba extract text dari PDF
3. **Validasi hasil**:
   - Jika text > 100 karakter → ✅ PDF berbasis text, gunakan hasil
   - Jika text < 100 karakter → 📸 Scanned PDF, lanjut ke step 4
4. **Convert PDF to Images** - Konversi semua halaman ke PNG
5. **OCR per halaman** - Jalankan Vision API OCR pada setiap gambar
6. **Gabungkan hasil** - Combine text dari semua halaman
7. **Cleanup** - Hapus file gambar temporary
8. **Return hasil** - Kirim kombinasi text ke validator

#### Contoh Log Output:
```
[API] 📄 PDF detected, using PDF parser
[PDF Parser] Reading PDF file: /tmp/28457-2.pdf
[PDF Parser] ✅ PDF parsed successfully
[PDF Parser] Pages: 3
[PDF Parser] Text length: 45
[API] ⚠️ PDF parsing failed or insufficient text (likely scanned PDF)
[API] 🖼️ Converting PDF to images for OCR...
[PDF Converter] Converting PDF to images: /tmp/28457-2.pdf
[PDF Converter] ✅ Converted 3 pages
[PDF Converter] ✅ Saved page 1: /tmp/pdf-images/pdf-1234-page-1.png
[API] 📸 OCR on page 1/3...
[OCR] DOCUMENT_TEXT_DETECTION succeeded, text length: 1234
[API] ✅ Page 1 OCR completed (confidence: 0.89)
[API] ✅ Combined OCR result: 3567 characters
[PDF Converter] 🧹 Cleaning up 3 temporary images
```

## Dependencies

### Package yang Diinstall:
```json
{
  "pdf-to-png-converter": "^3.4.0"  // Konversi PDF ke PNG
}
```

### Cara Install:
```bash
npm install pdf-to-png-converter
```

**Keuntungan library ini:**
- ✅ Tidak perlu GraphicsMagick/ImageMagick
- ✅ Pure JavaScript, cross-platform
- ✅ Support multi-page PDF
- ✅ High quality output (configurable scale)
- ✅ Promise-based API

## Testing

### Test File: `testPdfToImage.js`

**Cara menggunakan:**
```bash
# Test dengan file default
node testPdfToImage.js

# Test dengan file spesifik
node testPdfToImage.js ./tmp/transkrip.pdf
```

**Output yang diharapkan:**
```
🧪 Testing PDF to Image Conversion
============================================================
📄 Test PDF: ./tmp/test.pdf
============================================================

🔄 Step 1: Converting PDF to images...
[PDF Converter] ✅ Converted 3 pages

✅ Conversion successful!
📊 Converted 3 pages
🖼️  Image paths:
   1. pdf-1731312345-page-1.png
   2. pdf-1731312345-page-2.png
   3. pdf-1731312345-page-3.png

============================================================
🔄 Step 2: Testing OCR on first page...

✅ OCR Result:
  - Success: true
  - Confidence: 89.5%
  - Text length: 1234 characters

📝 Text preview (first 500 chars):
────────────────────────────────────────────────────────────
TRANSKRIP NILAI
UNIVERSITAS INDONESIA
...
────────────────────────────────────────────────────────────

============================================================
🔄 Step 3: Cleaning up converted images...
✅ Cleanup complete

============================================================
🎉 TEST PASSED - All steps completed successfully!
============================================================
```

## Error Handling

### 1. PDF Conversion Gagal
```javascript
if (!conversionResult.success) {
  // Fallback: Gunakan text dari pdf-parse (walau minimal)
  ocrResult = {
    success: false,
    text: "Document image received but OCR could not extract readable text",
    confidence: 0.1
  };
}
```

### 2. OCR Gagal pada Satu Halaman
```javascript
// Continue dengan halaman lain, tidak stop
try {
  const pageOcrResult = await performOCR(imagePath);
  // ... process result
} catch (pageOcrError) {
  console.error(`Page ${i + 1} failed, continuing...`);
  // Lanjut ke halaman berikutnya
}
```

### 3. Cleanup Gagal
```javascript
// Cleanup dijalankan di finally block
// Jika gagal, warning saja (tidak error)
await cleanupPDFImages(convertedImages).catch(err => {
  console.warn('Could not cleanup:', err.message);
});
```

## Performance

### Optimasi:
1. **Parallel OCR tidak digunakan** - Sequential untuk menghindari rate limit Vision API
2. **Viewport Scale 2.0** - Balance antara quality dan size
3. **PNG Format** - Lebih baik untuk OCR dibanding JPEG
4. **Immediate Cleanup** - Hapus file setelah selesai untuk menghemat disk space

### Estimasi Waktu:
- Convert 1 page: ~1-2 detik
- OCR 1 page: ~2-3 detik
- Total untuk 3 halaman: ~15-20 detik

## Troubleshooting

### Issue: "Cannot find module 'pdf-to-png-converter'"
```bash
npm install pdf-to-png-converter
```

### Issue: Kualitas OCR buruk
Tingkatkan `viewportScale` di `pdfParser.js`:
```javascript
viewportScale: 3.0,  // Dari 2.0 ke 3.0 (warning: file lebih besar)
```

### Issue: PDF terlalu besar
Tambahkan size check di route.js:
```javascript
if (file.size > 10 * 1024 * 1024) {  // 10MB
  return Response.json({ error: 'PDF terlalu besar' });
}
```

## Next Steps

1. ✅ Implement PDF to image conversion
2. ✅ Integrate dengan Vision API OCR
3. ✅ Add cleanup function
4. ✅ Create test file
5. 🔄 Test dengan real PDF files
6. 🔄 Monitor performance di production
7. 🔄 Add progress indicator untuk multi-page PDF

## Related Files

- `src/lib/pdfParser.js` - PDF conversion functions
- `src/app/api/documents/route.js` - Main API route
- `src/lib/visionApi.js` - OCR functions
- `testPdfToImage.js` - Test file
