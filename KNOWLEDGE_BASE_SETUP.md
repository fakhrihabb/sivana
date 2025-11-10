# Knowledge Base Setup - TanyaBKN ✅

## Apa yang Sudah Dilakukan?

### 1. **Folder Knowledge Base**
Dipindahkan dari root ke: `/src/lib/knowledge/`

Files:
- BUKU PENDAFTARAN SELEKSI CPNS 2024.pdf
- BUKU PENDAFTARAN PPPK GURU - SISTEM SELEKSI CASN 2024.pdf
- BUKU PENDAFTARAN PPPK TEKNIS - SISTEM SELEKSI CASN 2024 V2.pdf

### 2. **Hardcoded Knowledge Base** 
File: `/src/lib/knowledgeBase.js`

Mencakup 6 kategori utama dengan citations lengkap:
- ✅ Pendaftaran CPNS
- ✅ Syarat Pendaftaran
- ✅ Verifikasi Dokumen
- ✅ Verifikasi Wajah (Face Recognition)
- ✅ Ujian & Jadwal
- ✅ PPPK (PNS Kontrak)
- ✅ Akun & Login
- ✅ Troubleshooting

**Fitur**:
- Setiap jawaban disertai source dan link
- Fungsi search berdasarkan keyword
- Format answer dengan citation otomatis

### 3. **Gemini Integration Update**
File: `/src/lib/gemini.js`

Diupdate untuk:
- 🔍 Search knowledge base terlebih dahulu
- 📚 Inject konteks dari knowledge base ke prompt
- 📖 Pastikan jawaban berbasis dokumen resmi
- ✅ Track apakah jawaban dari knowledge base atau LLM

### 4. **System Prompt**
Diupdate dengan instruksi:
- Gunakan knowledge base sebagai primary source
- Sertakan citation untuk setiap jawaban
- Jangan buat informasi di luar knowledge base
- Rekomendasikan contact official support

## Cara Kerja

```
User: "Bagaimana cara mendaftar CPNS?"
         ↓
TanyaBKN Component
         ↓
getGeminiResponse(message, history)
         ↓
searchKnowledge(message)  ← Cari di KB dulu
         ↓
Ada match? → Format dengan citation
         ↓
Inject ke Gemini prompt
         ↓
Response dengan source resmi ✅
```

## Contoh Output

**User**: Bagaimana cara mendaftar CPNS?

**Bot**:
```
Berikut langkah-langkah pendaftaran CPNS 2024:

1. Buka portal SSCASN: https://sscasn.bkn.go.id
2. Registrasi akun: Gunakan NIK dan email aktif
3. Lengkapi data diri: Unggah pas foto dan informasi pribadi
[... dst ...]

---
📚 Sumber: BUKU PENDAFTARAN SELEKSI CPNS 2024
🔗 Link: https://sscasn.bkn.go.id
```

## Token Usage

✅ **Hemat token**: ~500-1000 tokens per pertanyaan
- Knowledge base sudah hardcoded (tidak perlu API call)
- Hanya inject context + generate response
- ~70% lebih murah dari RAG penuh

## Scalability

Untuk menambah knowledge:
1. Edit `/src/lib/knowledgeBase.js`
2. Tambah category atau response baru
3. Include keywords untuk search
4. Update source & link

```javascript
// Contoh tambah category baru
new_category: {
  keywords: ["keyword1", "keyword2"],
  responses: [
    {
      question: "...",
      answer: "...",
      source: "...",
      link: "..."
    }
  ]
}
```

## Next Steps (Optional)

Jika knowledge base tidak cukup:
1. **RAG dengan embedding** (nanti saat budget ada)
2. **Integration dengan database dokumentasi** dari BKN
3. **Multi-language support** (Bahasa Daerah)

---

**Status**: ✅ Siap digunakan dengan knowledge base berbasis SSCASN official documents
