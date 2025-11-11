-- QUICK INSERT KTP DATA TO SUPABASE
-- Copy paste this into Supabase SQL Editor: https://app.supabase.com/project/wlpyeldyezghjwjkcoxq/sql/new

-- Step 1: Create table if not exists
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

-- Step 2: Disable RLS temporarily for insert (enable after data inserted)
ALTER TABLE dukcapil_dummy DISABLE ROW LEVEL SECURITY;

-- Step 4: Insert KTP data (with ON CONFLICT to avoid duplicates)
INSERT INTO dukcapil_dummy (nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt, rw, kelurahan, kecamatan, kabupaten_kota, provinsi, agama, status_perkawinan, pekerjaan) 
VALUES 
-- KTP 1: Sudi Prayitno (papa.jpg) - Umur 30 tahun
('1371042501710001', 'Sudi Prayitno', 'Selat Panjang', '1995-01-25', 'Laki-laki', 'Jl. Belanti Barat No. 19', '003', '004', 'Lolong Belanti', 'Padang Utara', 'Padang', 'Sumatera Barat', 'Islam', 'Kawin', 'Pengacara'),

-- KTP 2: Abdul Zacky - NIK yang benar (real data)
('1371042904040002', 'Abdul Zacky', 'Padang', '2004-09-29', 'Laki-laki', 'Jl. Belanti Barat No. 19', '003', '004', 'Lolong Belanti', 'Padang Utara', 'Padang', 'Sumatera Barat', 'Islam', 'Belum Kawin', 'Pelajar/Mahasiswa'),

-- KTP 3: Abdul Zacky - NIK yang OCR baca (typo OCR: 0904 → 0909)
-- Ini untuk handle OCR error pada digit ke-8 dan ke-9
('1371042909040002', 'Abdul Zacky', 'Padang', '2004-09-29', 'Laki-laki', 'Jl. Belanti Barat No. 19', '003', '004', 'Lolong Belanti', 'Padang Utara', 'Padang', 'Sumatera Barat', 'Islam', 'Belum Kawin', 'Pelajar/Mahasiswa')

ON CONFLICT (nik) DO UPDATE 
SET 
  nama = EXCLUDED.nama,
  tanggal_lahir = EXCLUDED.tanggal_lahir,
  tempat_lahir = EXCLUDED.tempat_lahir,
  jenis_kelamin = EXCLUDED.jenis_kelamin,
  alamat = EXCLUDED.alamat,
  rt = EXCLUDED.rt,
  rw = EXCLUDED.rw,
  kelurahan = EXCLUDED.kelurahan,
  kecamatan = EXCLUDED.kecamatan,
  kabupaten_kota = EXCLUDED.kabupaten_kota,
  provinsi = EXCLUDED.provinsi,
  agama = EXCLUDED.agama,
  status_perkawinan = EXCLUDED.status_perkawinan,
  pekerjaan = EXCLUDED.pekerjaan;

-- Step 5: Enable RLS and create policy
ALTER TABLE dukcapil_dummy ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON dukcapil_dummy;

-- Create policy: Allow read for all (anon + authenticated)
CREATE POLICY "Enable read access for all users" ON dukcapil_dummy
  FOR SELECT
  USING (true);

-- Step 6: Verify data
SELECT 
  nik, 
  nama, 
  tempat_lahir,
  tanggal_lahir,
  EXTRACT(YEAR FROM AGE(tanggal_lahir)) as umur,
  provinsi,
  pekerjaan
FROM dukcapil_dummy 
ORDER BY tanggal_lahir DESC;
