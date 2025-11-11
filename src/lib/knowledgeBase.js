/**
 * Hardcoded Knowledge Base untuk TanyaBKN
 * Dengan citations ke dokumen resmi SSCASN/CASN
 */

export const knowledgeBase = {
  // Kategori: Pendaftaran CPNS
  pendaftaran_cpns: {
    keywords: ["daftar", "registrasi", "pendaftaran", "cpns", "sscasn"],
    responses: [
      {
        question: "Bagaimana cara mendaftar CPNS?",
        answer: `Berikut langkah-langkah pendaftaran CPNS 2024:

1. **Buka portal SSCASN**: https://sscasn.bkn.go.id
2. **Registrasi akun**: Gunakan NIK dan email aktif
3. **Lengkapi data diri**: Unggah pas foto dan informasi pribadi
4. **Pilih formasi**: Sesuaikan dengan kualifikasi dan minat Anda
4. **Buat akun SSCASN**: Daftar di portal sscasn.bkn.go.id
5. **Upload dokumen**: KTP, Ijazah, Transkrip, Surat Lamaran, Surat Pernyataan, dan dokumen lainnya
6. **Verifikasi dokumen**: Sistem akan melakukan verifikasi otomatis
7. **Submit pendaftaran**: Tunggu konfirmasi dan verifikasi

⏱️ **Timeline**: Pendaftaran biasanya dibuka selama 2-3 minggu
💡 **Tips**: Persiapkan semua dokumen sebelum memulai pendaftaran`,
        source: "BUKU PENDAFTARAN SELEKSI CPNS 2024",
        link: "https://sscasn.bkn.go.id"
      },
      {
        question: "Apa itu SSCASN?",
        answer: `SSCASN adalah **Sistem Seleksi CASN** (Calon Aparatur Sipil Negara) yang merupakan platform online untuk:

✓ Pendaftaran CPNS (Calon Pegawai Negeri Sipil)
✓ Pendaftaran PPPK (Pegawai Pemerintah dengan Perjanjian Kerja)
✓ Verifikasi dokumen otomatis dengan AI
✓ Ujian Seleksi Kompetensi Dasar (SKD)

**Website resmi**: https://sscasn.bkn.go.id
**Pengelola**: Badan Kepegawaian Negara (BKN)`,
        source: "Portal Resmi SSCASN",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  },

  // Kategori: Syarat Pendaftaran
  syarat_pendaftaran: {
    keywords: ["syarat", "persyaratan", "kualifikasi", "requirements", "ijazah", "umur"],
    responses: [
      {
        question: "Apa saja syarat pendaftaran CPNS?",
        answer: `**SYARAT UMUM PENDAFTARAN CPNS 2024:**

📋 **Persyaratan Umum:**
✓ Warga Negara Indonesia (WNI)
✓ Usia: Minimal 18 tahun, Maksimal 35-40 tahun (tergantung formasi)
✓ Tidak pernah dipidana dengan pidana penjara
✓ Tidak pernah dipecat dari PNS/CPNS/TNI/Polri
✓ Sehat jasmani dan rohani
✓ Tidak memiliki tunggakan pajak
✓ Bersedia ditempatkan di seluruh Indonesia

📚 **Persyaratan Pendidikan:**
✓ Minimal SMA/Sederajat untuk formasi tertentu
✓ Ijazah dan Transkrip Nilai sesuai formasi
✓ IPK minimal 2.00 (untuk S1/S2/S3)

📄 **Dokumen yang Dibutuhkan:**
• KTP yang masih berlaku
• Kartu Keluarga (KK)
• Ijazah & Transkrip Nilai
• Sertifikat Kompetensi (jika ada)
• Surat Lamaran bermaterai Rp 10.000
• Surat Pernyataan 5 poin bermaterai Rp 10.000
• Pas foto 4x6 berwarna

⚠️ **Catatan**: Setiap formasi memiliki syarat khusus yang berbeda.`,
        source: "BUKU PENDAFTARAN SELEKSI CPNS 2024",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  },

  // Kategori: Verifikasi Dokumen
  verifikasi_dokumen: {
    keywords: ["verifikasi", "dokumen", "status", "lolos", "ditolak", "perbaikan"],
    responses: [
      {
        question: "Bagaimana cara mengecek status verifikasi dokumen?",
        answer: `**CARA CEK STATUS VERIFIKASI:**

1. Login ke akun SSCASN Anda di https://sscasn.bkn.go.id
2. Buka menu **"Dashboard"** atau **"Status Lamaran"**
3. Pilih formasi yang Anda daftarkan
4. Lihat status verifikasi dokumen

**STATUS VERIFIKASI:**
✅ **Lolos Verifikasi** - Dokumen valid dan lengkap, lanjut ke tahap ujian
⏳ **Dalam Proses** - Sedang diverifikasi oleh sistem/verifikator
⚠️ **Perlu Perbaikan** - Ada dokumen yang kurang/tidak sesuai, segera perbaiki
❌ **Tidak Lolos** - Tidak memenuhi persyaratan, tidak bisa lanjut

**WAKTU VERIFIKASI**: Biasanya 1-3 hari kerja

💡 **Tips**: 
- Gunakan sistem SIVANA untuk deteksi dokumen lebih cepat
- Upload dokumen dengan jelas dan tidak blur
- Pastikan format file sesuai (PDF, JPG)`,
        source: "BUKU PENDAFTARAN SELEKSI CPNS 2024",
        link: "https://sscasn.bkn.go.id"
      },
      {
        question: "Dokumen saya ditolak, apa yang harus saya lakukan?",
        answer: `**JIKA DOKUMEN TIDAK LOLOS VERIFIKASI:**

1. **Baca alasan penolakan** di portal SSCASN
2. **Siapkan dokumen yang benar**:
   - Pastikan format sesuai (PDF, JPG)
   - Ukuran file tidak terlalu besar
   - Kualitas gambar jelas dan tidak blur
   - Semua informasi terlihat lengkap

3. **Upload ulang dokumen** melalui portal
4. **Tunggu proses verifikasi ulang** (1-3 hari kerja)

**DOKUMEN YANG SERING DITOLAK:**
⚠️ Foto pas foto tidak jelas
⚠️ Ijazah/transkrip tidak lengkap atau blur
⚠️ KTP sudah expired
⚠️ Surat lamaran/pernyataan tidak bermaterai
⚠️ Nama di dokumen tidak konsisten
⚠️ Format file tidak sesuai

❓ **JIKA MASIH BERMASALAH:**
Hubungi customer service SSCASN melalui:
📧 Email: support@sscasn.bkn.go.id
📞 Telepon: (021) XXXX-XXXX
💬 Chat: Tersedia di portal SSCASN`,
        source: "BUKU PENDAFTARAN SELEKSI CPNS 2024",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  },

  // Kategori: Verifikasi Wajah
  verifikasi_wajah: {
    keywords: ["wajah", "face", "recognition", "biometrik", "sivana", "video"],
    responses: [
      {
        question: "Apa itu verifikasi wajah (Face Recognition)?",
        answer: `**VERIFIKASI WAJAH DENGAN SIVANA:**

Verifikasi wajah adalah proses menggunakan teknologi AI (Artificial Intelligence) untuk memastikan peserta pendaftaran adalah orang yang sebenarnya.

**TUJUAN:**
✓ Memverifikasi identitas peserta
✓ Mencegah fraud/identitas palsu
✓ Mempercepat proses verifikasi

**CARA MELAKUKAN:**
1. Persiapkan **smartphone/webcam** dengan pencahayaan baik
2. Login ke SSCASN
3. Buka menu **"Verifikasi Wajah"**
4. Ikuti panduan on-screen
5. Ambil foto selfie sesuai instruksi
6. Tunggu proses verifikasi (real-time atau 1x24 jam)

**TIPS SUKSES VERIFIKASI:**
✅ Pencahayaan terang (jangan backlight)
✅ Wajah terlihat jelas dan penuh
✅ Tidak menggunakan masker/kacamata tebal
✅ Background netral/tidak ramai
✅ Gunakan kamera depan smartphone
✅ Pastikan koneksi internet stabil`,
        source: "Panduan SIVANA - Sistem Verifikasi Wajah",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  },

  // Kategori: Ujian & Jadwal
  ujian_jadwal: {
    keywords: ["jadwal", "ujian", "skd", "tes", "kapan", "tanggal"],
    responses: [
      {
        question: "Kapan jadwal ujian SKD?",
        answer: `**INFORMASI JADWAL UJIAN SKD:**

Jadwal ujian SKD (Seleksi Kompetensi Dasar) diumumkan secara berkala.

📅 **TIMELINE PENGUMUMAN:**
- Biasanya diumumkan 7-14 hari sebelum ujian dimulai
- Pengumuman melalui email, SMS, dan portal SSCASN

📢 **CARA CEK JADWAL:**
1. Login ke https://sscasn.bkn.go.id
2. Buka menu **"Jadwal Ujian"** atau **"Dashboard"**
3. Lihat jadwal ujian untuk formasi Anda

📧 **NOTIFIKASI:**
✓ Email ke alamat yang terdaftar
✓ SMS ke nomor HP Anda
✓ Pengumuman di portal SSCASN
✓ Website BKN resmi

💡 **TIPS:**
- Cek email secara rutin (termasuk folder spam)
- Aktifkan notifikasi di SSCASN
- Cetak kartu ujian setelah diumumkan
- Persiapkan dokumen yang diperlukan saat ujian`,
        source: "BUKU PENDAFTARAN SELEKSI CPNS 2024",
        link: "https://sscasn.bkn.go.id"
      },
      {
        question: "Apa itu SKD dan apa yang diuji?",
        answer: `**SKD (SELEKSI KOMPETENSI DASAR):**

Ujian pertama dalam proses seleksi CPNS yang mengukur kemampuan dasar peserta.

**MATERI UJIAN SKD:**

1️⃣ **TWK (Tes Wawasan Kebangsaan)** - 30 soal
   - Pancasila & UUD 1945
   - Sejarah Indonesia
   - Sistem pemerintahan
   - Bela negara

2️⃣ **TIU (Tes Intelegensia Umum)** - 30 soal
   - Analogi & Penalaran
   - Kemampuan numerik
   - Persamaan kata
   - Logika

3️⃣ **TKP (Tes Kompetensi Pribadi)** - 15 soal
   - Integritas diri
   - Profesionalisme
   - Kolaborasi

**TOTAL**: 75 soal, waktu 100 menit
**FORMAT**: Computer-Based Test (CBT) online

**NILAI KELULUSAN**: Tergantung formasi dan passing grade yang ditetapkan

📚 **TIPS PERSIAPAN:**
✓ Pelajari kisi-kisi SKD dari BKN
✓ Gunakan aplikasi latihan soal
✓ Perbanyak simulasi tes
✓ Istirahat yang cukup sebelum tes`,
        source: "BUKU PENDAFTARAN SELEKSI CPNS 2024",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  },

  // Kategori: PPPK (PNS Kontrak)
  pppk: {
    keywords: ["pppk", "guru", "teknis", "kontrak", "pns kontrak"],
    responses: [
      {
        question: "Apa itu PPPK dan apa bedanya dengan CPNS?",
        answer: `**PPPK (PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA):**

PPPK adalah tenaga kontrak pemerintah dengan status yang berbeda dari CPNS.

**PERBEDAAN PPPK vs CPNS:**

| Aspek | CPNS | PPPK |
|-------|------|------|
| **Status** | Pegawai Negeri Sipil | Pegawai Kontrak |
| **Masa Kerja** | Permanen | 1-3 tahun (dapat diperpanjang) |
| **Tunjangan** | Lebih banyak | Lebih sedikit |
| **Pension** | Ada | Terbatas |
| **Promosi** | Jalur dinas | Lebih terbatas |
| **Kesempatan** | Lebih sulit | Lebih terbuka |

**KEUNTUNGAN PPPK:**
✅ Peluang lolos lebih tinggi
✅ Proses seleksi lebih cepat
✅ Kesempatan untuk jadi CPNS setelah beberapa tahun
✅ Bisa mengumpulkan pengalaman

**SYARAT UMUM PPPK:**
- Warga Negara Indonesia
- Usia 18-35 tahun (bisa berbeda per formasi)
- Pendidikan minimal SMA/D1/S1 (sesuai formasi)
- Sehat jasmani dan rohani

📝 **FORMASI PPPK UMUM:**
- Guru (berbagai mata pelajaran)
- Tenaga medis
- Tenaga teknis
- Tenaga administrasi`,
        source: "BUKU PENDAFTARAN PPPK - SISTEM SELEKSI CASN 2024",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  },

  // Kategori: Akun & Login
  akun_login: {
    keywords: ["password", "lupa", "login", "akun", "reset", "username"],
    responses: [
      {
        question: "Lupa password SSCASN, bagaimana cara reset?",
        answer: `**CARA RESET PASSWORD SSCASN:**

1. **Buka halaman login** SSCASN: https://sscasn.bkn.go.id
2. **Klik tombol "Lupa Password?"**
3. **Masukkan NIK** Anda
4. **Masukkan email** yang terdaftar
5. **Klik "Kirim Link Reset"**
6. **Cek email Anda** (termasuk folder spam)
7. **Klik link reset** dalam email
8. **Buat password baru** yang kuat
9. **Simpan password** Anda dengan aman

**TIPS KEAMANAN PASSWORD:**
✅ Gunakan kombinasi huruf besar & kecil
✅ Tambahkan angka dan simbol (!@#$%^&*)
✅ Minimal 8 karakter
✅ Jangan gunakan tanggal lahir atau nama
✅ Jangan bagikan ke siapapun
✅ Ganti secara berkala

**JIKA TIDAK MENERIMA EMAIL:**
1. Cek folder **"Spam"** atau **"Junk"**
2. Tambahkan email SSCASN ke kontak aman
3. Tunggu 5-10 menit sebelum retry
4. Gunakan email yang berbeda jika tersedia
5. Hubungi support jika tetap bermasalah

❓ **MASIH BERMASALAH?**
📧 Email: support@sscasn.bkn.go.id
💬 Chat: Portal SSCASN
📞 Telp: Customer Service BKN`,
        source: "SSCASN - Bantuan Akun",
        link: "https://sscasn.bkn.go.id"
      },
      {
        question: "Akun saya tidak bisa login, apa yang harus dilakukan?",
        answer: `**TROUBLESHOOTING LOGIN GAGAL:**

**LANGKAH 1: CEK KONEKSI INTERNET**
✓ Pastikan koneksi internet stabil
✓ Coba refresh halaman browser
✓ Gunakan browser berbeda (Chrome, Firefox, Safari)

**LANGKAH 2: CEK USERNAME & PASSWORD**
✓ Username: NIK atau email yang terdaftar
✓ Password: Gunakan yang benar
✓ Perhatikan huruf besar/kecil
✓ Jangan ada spasi sebelum/sesudah

**LANGKAH 3: CLEAR BROWSER CACHE**
✓ Buka "Settings" browser → "Clear browsing data"
✓ Pilih "Cookies and cached images"
✓ Klik "Clear data"
✓ Coba login lagi

**LANGKAH 4: CEK AKUN STATUS**
✓ Akun belum diaktivasi?
✓ Akun terblokir karena login gagal berkali-kali?
✓ Email belum diverifikasi?

**JIKA MASIH GAGAL:**
1. Reset password dengan "Lupa Password"
2. Coba device/browser lain
3. Hubungi support SSCASN

❓ **HUBUNGI SUPPORT:**
📧 Email: support@sscasn.bkn.go.id
💬 Live Chat: Tersedia di portal (jam kerja)
📞 Telp: (021) XXXX-XXXX`,
        source: "SSCASN - FAQ Login",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  },

  // Kategori: Error & Troubleshooting
  troubleshooting: {
    keywords: ["error", "masalah", "gagal", "tidak bisa", "problem", "issue"],
    responses: [
      {
        question: "Upload dokumen tidak bisa, apa yang harus dilakukan?",
        answer: `**SOLUSI UPLOAD DOKUMEN GAGAL:**

**PENYEBAB UMUM & SOLUSI:**

❌ **File terlalu besar**
✓ Ukuran maksimal: 5 MB per file
✓ Kompresi file menggunakan aplikasi (WinRAR, 7-Zip)
✓ Atau gunakan https://tinypdf.com/ atau https://imagecompressor.com/

❌ **Format file tidak sesuai**
✓ Format yang diterima: PDF, JPG, PNG
✓ Jangan upload file: DOC, XLS, atau format lain
✓ Konversi file dengan tools online jika perlu

❌ **Koneksi internet putus**
✓ Gunakan internet yang stabil (WiFi)
✓ Hindari upload saat internet lemah
✓ Jangan refresh halaman saat upload

❌ **Browser cache penuh**
✓ Clear browser cache & cookies
✓ Coba browser berbeda
✓ Coba mode "Incognito" di browser

❌ **Sistem sedang maintenance**
✓ Coba lagi beberapa jam kemudian
✓ Cek jadwal maintenance di portal

**TIPS UPLOAD SUKSES:**
✅ Gunakan Wi-Fi yang kuat
✅ Persiapkan file sebelum upload
✅ Jangan tutup browser saat upload
✅ Upload pada jam-jam sepi (pagi/malam)
✅ Pastikan file jelas dan tidak blur

❓ **MASIH BERMASALAH?**
Hubungi support SSCASN dengan SS error yang Anda alami`,
        source: "SSCASN - FAQ Upload",
        link: "https://sscasn.bkn.go.id"
      }
    ]
  }
};

/**
 * Fungsi untuk mencari jawaban berdasarkan keyword
 */
export function searchKnowledge(userQuery) {
  const query = userQuery.toLowerCase();
  
  for (const category of Object.values(knowledgeBase)) {
    // Cek apakah keyword cocok
    const keywordMatch = category.keywords.some(keyword => 
      query.includes(keyword)
    );
    
    if (keywordMatch) {
      return category.responses;
    }
  }
  
  return null;
}

/**
 * Fungsi untuk mendapatkan format jawaban dengan citation
 */
export function formatResponseWithCitation(response) {
  return `${response.answer}

---
📚 **Sumber**: ${response.source}
🔗 **Link**: ${response.link}`;
}

/**
 * Fungsi untuk mendapatkan semua kategori
 */
export function getAllCategories() {
  return Object.keys(knowledgeBase);
}

export default knowledgeBase;
