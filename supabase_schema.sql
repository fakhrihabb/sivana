-- =====================================================
-- SIVANA - Supabase Database Schema
-- Tabel untuk menyimpan data formasi CASN
-- =====================================================

-- Buat tabel formasi
CREATE TABLE IF NOT EXISTS formasi (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  lembaga VARCHAR(255) NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  description TEXT,
  quota VARCHAR(50),
  periode INTEGER NOT NULL,
  jenjang_pendidikan VARCHAR(100),
  program_studi VARCHAR(255),
  jenis_pengadaan VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat index untuk query yang sering dipakai
CREATE INDEX idx_formasi_periode ON formasi(periode);
CREATE INDEX idx_formasi_lembaga ON formasi(lembaga);
CREATE INDEX idx_formasi_jenis_pengadaan ON formasi(jenis_pengadaan);
CREATE INDEX idx_formasi_lokasi ON formasi(lokasi);

-- Enable Row Level Security (RLS)
ALTER TABLE formasi ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa read (public access)
CREATE POLICY "Enable read access for all users" ON formasi
  FOR SELECT
  USING (true);

-- Policy: Hanya authenticated users yang bisa insert/update/delete
CREATE POLICY "Enable insert for authenticated users only" ON formasi
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON formasi
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON formasi
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert data formasi (populate database)
INSERT INTO formasi (id, name, lembaga, lokasi, description, quota, periode, jenjang_pendidikan, program_studi, jenis_pengadaan) VALUES
(1, 'Analis Kebijakan', 'Kementerian Keuangan', 'Jakarta Pusat', 'Melakukan analisis dan evaluasi kebijakan fiskal serta memberikan rekomendasi strategis untuk pembangunan ekonomi nasional.', '10 Pendaftar', 2025, 'S-1/Sarjana', 'Ilmu Ekonomi', 'CPNS'),
(2, 'Auditor', 'Badan Pemeriksa Keuangan', 'Jakarta Selatan', 'Melaksanakan pemeriksaan pengelolaan dan tanggung jawab keuangan negara untuk memastikan akuntabilitas dan transparansi.', '15 Pendaftar', 2025, 'S-1/Sarjana', 'Akuntansi', 'CPNS'),
(3, 'Pengawas Sekolah', 'Dinas Pendidikan', 'Jakarta Timur', 'Melakukan pengawasan, pembinaan, dan evaluasi terhadap penyelenggaraan pendidikan di sekolah-sekolah negeri.', '8 Pendaftar', 2025, 'S-2', 'Administrasi Pendidikan', 'PPPK Guru'),
(4, 'Tenaga Kesehatan', 'Dinas Kesehatan', 'Jakarta Barat', 'Memberikan pelayanan kesehatan masyarakat dan melaksanakan program promosi kesehatan di tingkat puskesmas.', '20 Pendaftar', 2025, 'Diploma III/Sarjana Muda', 'Keperawatan', 'PPPK Tenaga Kesehatan'),
(5, 'Pranata Komputer', 'Kementerian Komunikasi dan Informatika', 'Jakarta Pusat', 'Mengembangkan dan memelihara sistem informasi serta infrastruktur teknologi untuk mendukung transformasi digital pemerintahan.', '12 Pendaftar', 2025, 'S-1/Sarjana', 'Ilmu Komputer', 'CPNS'),
(6, 'Analis Sumber Daya Manusia', 'Badan Kepegawaian Negara', 'Jakarta Selatan', 'Melakukan analisis kebutuhan, perencanaan, dan pengembangan kompetensi aparatur sipil negara untuk meningkatkan kinerja organisasi.', '6 Pendaftar', 2025, 'S-1/Sarjana', 'Manajemen', 'CPNS'),
(7, 'Guru Matematika', 'Dinas Pendidikan', 'Jakarta Utara', 'Mengajar mata pelajaran Matematika di sekolah menengah atas dan membimbing siswa dalam kompetisi akademik.', '25 Pendaftar', 2025, 'S-1/Sarjana', 'Pendidikan Matematika', 'PPPK Guru'),
(8, 'Dokter Umum', 'Rumah Sakit Umum Daerah', 'Bandung', 'Memberikan pelayanan kesehatan dasar dan rujukan medis di fasilitas kesehatan tingkat pertama.', '18 Pendaftar', 2025, 'S-1/Sarjana', 'Kedokteran', 'PPPK Tenaga Kesehatan'),
(9, 'Analis Data', 'Badan Pusat Statistik', 'Jakarta Pusat', 'Melakukan pengolahan dan analisis data statistik untuk mendukung perumusan kebijakan berbasis data.', '10 Pendaftar', 2024, 'S-1/Sarjana', 'Statistika', 'CPNS'),
(10, 'Pengelola Keuangan', 'Kementerian Dalam Negeri', 'Jakarta Selatan', 'Mengelola dan mengawasi pelaksanaan anggaran serta pelaporan keuangan instansi pemerintah.', '14 Pendaftar', 2025, 'Diploma IV', 'Akuntansi', 'CPNS'),
(11, 'Teknisi Laboratorium', 'Kementerian Kesehatan', 'Surabaya', 'Melakukan pemeriksaan laboratorium dan pemeliharaan peralatan medis untuk mendukung diagnosis penyakit.', '22 Pendaftar', 2025, 'Diploma III/Sarjana Muda', 'Analis Kesehatan', 'PPPK Teknis'),
(12, 'Guru Bahasa Inggris', 'Dinas Pendidikan', 'Semarang', 'Mengajar Bahasa Inggris di sekolah menengah pertama dan mengembangkan kurikulum pembelajaran bahasa.', '30 Pendaftar', 2025, 'S-1/Sarjana', 'Pendidikan Bahasa Inggris', 'PPPK Guru'),
(13, 'Penyuluh Pertanian', 'Dinas Pertanian', 'Yogyakarta', 'Memberikan penyuluhan dan pendampingan kepada petani untuk meningkatkan produktivitas pertanian.', '16 Pendaftar', 2024, 'S-1/Sarjana', 'Agronomi', 'PPPK Teknis'),
(14, 'Arsiparis', 'Arsip Nasional Republik Indonesia', 'Jakarta Timur', 'Mengelola, melestarikan, dan menyediakan akses terhadap arsip dan dokumen penting negara.', '7 Pendaftar', 2025, 'Diploma IV', 'Kearsipan', 'CPNS'),
(15, 'Apoteker', 'Dinas Kesehatan', 'Medan', 'Mengelola pelayanan kefarmasian dan memberikan konsultasi penggunaan obat yang rasional.', '12 Pendaftar', 2025, 'S-1/Sarjana', 'Farmasi', 'PPPK Tenaga Kesehatan'),
(16, 'Network Administrator', 'Kementerian Komunikasi dan Informatika', 'Jakarta Pusat', 'Mengelola infrastruktur jaringan dan memastikan keamanan sistem informasi pemerintah.', '9 Pendaftar', 2025, 'Diploma III/Sarjana Muda', 'Teknik Informatika', 'PPPK Teknis');

-- Reset sequence untuk ID
SELECT setval('formasi_id_seq', (SELECT MAX(id) FROM formasi));

-- Tambahkan trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_formasi_updated_at 
  BEFORE UPDATE ON formasi
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Buat view untuk statistik formasi
CREATE OR REPLACE VIEW formasi_stats AS
SELECT 
  periode,
  jenis_pengadaan,
  COUNT(*) as jumlah_formasi,
  SUM(CAST(REGEXP_REPLACE(quota, '[^0-9]', '', 'g') AS INTEGER)) as total_kuota
FROM formasi
GROUP BY periode, jenis_pengadaan
ORDER BY periode DESC, jenis_pengadaan;
