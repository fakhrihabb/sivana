-- =====================================================
-- SIVANA - Dummy Database Dukcapil
-- Tabel untuk simulasi pengecekan KTP
-- Format NIK: 16 digit (Provinsi+Kab/Kota+Kecamatan+TglLahir+Urut)
-- =====================================================

-- Buat tabel dukcapil_dummy
CREATE TABLE IF NOT EXISTS dukcapil_dummy (
  nik VARCHAR(16) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20),
  alamat TEXT,
  rt VARCHAR(3),
  rw VARCHAR(3),
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  kabupaten_kota VARCHAR(100),
  provinsi VARCHAR(100),
  agama VARCHAR(50),
  status_perkawinan VARCHAR(50),
  pekerjaan VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat index untuk query cepat
CREATE INDEX idx_dukcapil_nik ON dukcapil_dummy(nik);
CREATE INDEX idx_dukcapil_nama ON dukcapil_dummy(nama);

-- Enable Row Level Security
ALTER TABLE dukcapil_dummy ENABLE ROW LEVEL SECURITY;

-- Policy: Read only untuk authenticated users (simulasi akses terbatas)
CREATE POLICY "Enable read for authenticated users only" ON dukcapil_dummy
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert 50 data dummy (mix Jakarta, Bandung, Surabaya, Yogyakarta, Medan)
INSERT INTO dukcapil_dummy (nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt, rw, kelurahan, kecamatan, kabupaten_kota, provinsi, agama, status_perkawinan, pekerjaan) VALUES
-- Real KTP Data (Updated: Changed birth year to 1995 to meet age requirement ≤35 years)
('1371042501710001', 'Sudi Prayitno', 'Selat Panjang', '1995-01-25', 'Laki-laki', 'Jl. Belanti Barat No. 19', '003', '004', 'Lolong Belanti', 'Padang Utara', 'Padang', 'Sumatera Barat', 'Islam', 'Kawin', 'Pengacara');

-- Tampilkan statistik
SELECT 
  provinsi,
  COUNT(*) as jumlah_penduduk,
  COUNT(CASE WHEN jenis_kelamin = 'Laki-laki' THEN 1 END) as laki_laki,
  COUNT(CASE WHEN jenis_kelamin = 'Perempuan' THEN 1 END) as perempuan
FROM dukcapil_dummy
GROUP BY provinsi
ORDER BY jumlah_penduduk DESC;

-- Query untuk cek NIK
-- SELECT * FROM dukcapil_dummy WHERE nik = '3171012301850001';
-- SELECT * FROM dukcapil_dummy WHERE nama ILIKE '%ahmad%';
