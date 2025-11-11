-- =====================================================
-- SIVANA - Dummy Database PDDIKTI (Forlap Dikti)
-- Tabel untuk simulasi pengecekan Ijazah
-- Format Nomor Ijazah: Kode PT + Tahun Lulus + Nomor Urut
-- Contoh: UI-2020-123456 (Universitas Indonesia, Lulus 2020)
-- =====================================================

-- Buat tabel pddikti_dummy
CREATE TABLE IF NOT EXISTS pddikti_dummy (
  nomor_ijazah VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nim VARCHAR(20),
  program_studi VARCHAR(255) NOT NULL,
  jenjang VARCHAR(50) NOT NULL,
  universitas VARCHAR(255) NOT NULL,
  fakultas VARCHAR(255),
  tahun_masuk INTEGER,
  tahun_lulus INTEGER NOT NULL,
  ipk DECIMAL(3,2),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  gelar VARCHAR(50),
  akreditasi VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat index untuk query cepat
CREATE INDEX idx_pddikti_nomor_ijazah ON pddikti_dummy(nomor_ijazah);
CREATE INDEX idx_pddikti_nama ON pddikti_dummy(nama);
CREATE INDEX idx_pddikti_nim ON pddikti_dummy(nim);
CREATE INDEX idx_pddikti_prodi ON pddikti_dummy(program_studi);

-- Enable Row Level Security
ALTER TABLE pddikti_dummy ENABLE ROW LEVEL SECURITY;

-- Policy: Read only untuk authenticated users (simulasi akses terbatas)
CREATE POLICY "Enable read for authenticated users only" ON pddikti_dummy
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert 50 data dummy (berbagai universitas ternama di Indonesia)
INSERT INTO pddikti_dummy (nomor_ijazah, nama, nim, program_studi, jenjang, universitas, fakultas, tahun_masuk, tahun_lulus, ipk, tempat_lahir, tanggal_lahir, gelar, akreditasi) VALUES
-- Universitas Indonesia
('UI-2020-001234', 'Ahmad Fauzi', '1806123456', 'Ilmu Ekonomi', 'S1', 'Universitas Indonesia', 'Fakultas Ekonomi dan Bisnis', 2016, 2020, 3.65, 'Jakarta', '1998-01-15', 'S.E.', 'A'),
('UI-2021-001567', 'Siti Nurhaliza', '1706234567', 'Akuntansi', 'S1', 'Universitas Indonesia', 'Fakultas Ekonomi dan Bisnis', 2017, 2021, 3.82, 'Jakarta', '1999-03-22', 'S.Ak.', 'A'),
('UI-2019-002345', 'Budi Santoso', '1506345678', 'Ilmu Komputer', 'S1', 'Universitas Indonesia', 'Fakultas Ilmu Komputer', 2015, 2019, 3.91, 'Bogor', '1997-08-10', 'S.Kom.', 'A'),
('UI-2022-003456', 'Dewi Lestari', '1806456789', 'Kedokteran', 'S1', 'Universitas Indonesia', 'Fakultas Kedokteran', 2016, 2022, 3.78, 'Jakarta', '1998-05-30', 'dr.', 'A'),
('UI-2020-004567', 'Rizky Ramadan', '1606567890', 'Statistika', 'S1', 'Universitas Indonesia', 'Fakultas MIPA', 2016, 2020, 3.55, 'Tangerang', '1998-11-12', 'S.Stat.', 'A'),

-- Institut Teknologi Bandung
('ITB-2020-012345', 'Dian Sastro', '13516001', 'Teknik Informatika', 'S1', 'Institut Teknologi Bandung', 'Sekolah Teknik Elektro dan Informatika', 2016, 2020, 3.88, 'Bandung', '1998-02-18', 'S.T.', 'A'),
('ITB-2021-023456', 'Andi Wijaya', '13517002', 'Arsitektur', 'S1', 'Institut Teknologi Bandung', 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan', 2017, 2021, 3.72, 'Bandung', '1999-06-25', 'S.Ars.', 'A'),
('ITB-2019-034567', 'Lina Marlina', '13515003', 'Desain Komunikasi Visual', 'S1', 'Institut Teknologi Bandung', 'Fakultas Seni Rupa dan Desain', 2015, 2019, 3.68, 'Bandung', '1997-09-14', 'S.Ds.', 'A'),
('ITB-2022-045678', 'Hendra Gunawan', '13518004', 'Teknik Sipil', 'S1', 'Institut Teknologi Bandung', 'Fakultas Teknik Sipil dan Lingkungan', 2018, 2022, 3.81, 'Cimahi', '2000-01-20', 'S.T.', 'A'),
('ITB-2020-056789', 'Maya Sari', '13516005', 'Farmasi', 'S1', 'Institut Teknologi Bandung', 'Sekolah Farmasi', 2016, 2020, 3.59, 'Bandung', '1998-07-08', 'S.Farm.', 'A'),

-- Universitas Gadjah Mada
('UGM-2020-112233', 'Bambang Pamungkas', '16/394456/PA/17001', 'Manajemen', 'S1', 'Universitas Gadjah Mada', 'Fakultas Ekonomika dan Bisnis', 2016, 2020, 3.66, 'Yogyakarta', '1998-04-12', 'S.E.', 'A'),
('UGM-2021-223344', 'Rina Susanti', '17/405567/PA/18002', 'Ilmu Keperawatan', 'S1', 'Universitas Gadjah Mada', 'Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan', 2017, 2021, 3.75, 'Yogyakarta', '1999-08-05', 'S.Kep.', 'A'),
('UGM-2019-334455', 'Agus Salim', '15/383445/PA/16003', 'Akuntansi', 'S1', 'Universitas Gadjah Mada', 'Fakultas Ekonomika dan Bisnis', 2015, 2019, 3.84, 'Sleman', '1997-12-18', 'S.Ak.', 'A'),
('UGM-2022-445566', 'Fitri Handayani', '18/416678/PA/19004', 'Psikologi', 'S1', 'Universitas Gadjah Mada', 'Fakultas Psikologi', 2018, 2022, 3.71, 'Bantul', '2000-03-28', 'S.Psi.', 'A'),
('UGM-2020-556677', 'Dedi Kurniawan', '16/394567/PA/17005', 'Teknik Elektro', 'S1', 'Universitas Gadjah Mada', 'Fakultas Teknik', 2016, 2020, 3.62, 'Yogyakarta', '1998-09-15', 'S.T.', 'A'),

-- Institut Teknologi Sepuluh Nopember (ITS)
('ITS-2020-201234', 'Raden Ajeng Kartini', '05111640000001', 'Teknik Informatika', 'S1', 'Institut Teknologi Sepuluh Nopember', 'Fakultas Teknologi Elektro dan Informatika Cerdas', 2016, 2020, 3.79, 'Surabaya', '1998-05-21', 'S.Kom.', 'A'),
('ITS-2021-202345', 'Joko Widodo', '05211740000002', 'Sistem Informasi', 'S1', 'Institut Teknologi Sepuluh Nopember', 'Fakultas Teknologi Elektro dan Informatika Cerdas', 2017, 2021, 3.67, 'Surabaya', '1999-07-10', 'S.Kom.', 'A'),
('ITS-2019-203456', 'Sri Mulyani', '02111540000003', 'Teknik Kimia', 'S1', 'Institut Teknologi Sepuluh Nopember', 'Fakultas Teknologi Industri dan Rekayasa Sistem', 2015, 2019, 3.86, 'Sidoarjo', '1997-11-05', 'S.T.', 'A'),
('ITS-2022-204567', 'Bambang Sudibyo', '06111840000004', 'Teknik Mesin', 'S1', 'Institut Teknologi Sepuluh Nopember', 'Fakultas Teknologi Industri dan Rekayasa Sistem', 2018, 2022, 3.58, 'Surabaya', '2000-02-14', 'S.T.', 'A'),
('ITS-2020-205678', 'Ratna Sari Dewi', '08111640000005', 'Desain Produk', 'S1', 'Institut Teknologi Sepuluh Nopember', 'Fakultas Arsitektur, Desain dan Perencanaan', 2016, 2020, 3.73, 'Gresik', '1998-10-22', 'S.Ds.', 'A'),

-- Universitas Airlangga
('UNAIR-2020-301234', 'Chairul Tanjung', '041611333001', 'Ilmu Ekonomi', 'S1', 'Universitas Airlangga', 'Fakultas Ekonomi dan Bisnis', 2016, 2020, 3.64, 'Surabaya', '1998-06-18', 'S.E.', 'A'),
('UNAIR-2021-302345', 'Anita Ratnasari', '041711333002', 'Akuntansi', 'S1', 'Universitas Airlangga', 'Fakultas Ekonomi dan Bisnis', 2017, 2021, 3.77, 'Surabaya', '1999-09-12', 'S.Ak.', 'A'),
('UNAIR-2019-303456', 'Benny Suherman', '011511333003', 'Pendidikan Dokter', 'S1', 'Universitas Airlangga', 'Fakultas Kedokteran', 2015, 2019, 3.82, 'Surabaya', '1997-04-25', 'dr.', 'A'),
('UNAIR-2022-304567', 'Cindy Claudia', '071811333004', 'Psikologi', 'S1', 'Universitas Airlangga', 'Fakultas Psikologi', 2018, 2022, 3.69, 'Surabaya', '2000-08-07', 'S.Psi.', 'A'),
('UNAIR-2020-305678', 'Darmawan Wijaya', '091611333005', 'Teknik Lingkungan', 'S1', 'Universitas Airlangga', 'Fakultas Sains dan Teknologi', 2016, 2020, 3.61, 'Sidoarjo', '1998-12-30', 'S.T.', 'A'),

-- Universitas Diponegoro
('UNDIP-2020-401234', 'Eko Prasetyo', '12010116120001', 'Ilmu Hukum', 'S1', 'Universitas Diponegoro', 'Fakultas Hukum', 2016, 2020, 3.70, 'Semarang', '1998-03-14', 'S.H.', 'A'),
('UNDIP-2021-402345', 'Fitria Yusuf', '12010117120002', 'Ilmu Komunikasi', 'S1', 'Universitas Diponegoro', 'Fakultas Ilmu Sosial dan Ilmu Politik', 2017, 2021, 3.68, 'Semarang', '1999-05-20', 'S.I.Kom.', 'A'),
('UNDIP-2019-403456', 'Guntur Triyoga', '12010115120003', 'Teknik Penerbangan', 'S1', 'Universitas Diponegoro', 'Fakultas Teknik', 2015, 2019, 3.81, 'Semarang', '1997-07-09', 'S.T.', 'A'),
('UNDIP-2022-404567', 'Hani Puspita', '12010118120004', 'Manajemen', 'S1', 'Universitas Diponegoro', 'Fakultas Ekonomika dan Bisnis', 2018, 2022, 3.74, 'Semarang', '2000-11-16', 'S.E.', 'A'),
('UNDIP-2020-405678', 'Indra Gunawan', '12010116120005', 'Statistika', 'S1', 'Universitas Diponegoro', 'Fakultas Sains dan Matematika', 2016, 2020, 3.87, 'Semarang', '1998-01-28', 'S.Si.', 'A'),

-- Universitas Padjadjaran
('UNPAD-2020-501234', 'Jusuf Kalla', '140310160001', 'Ilmu Politik', 'S1', 'Universitas Padjadjaran', 'Fakultas Ilmu Sosial dan Ilmu Politik', 2016, 2020, 3.66, 'Bandung', '1998-02-11', 'S.IP.', 'A'),
('UNPAD-2021-502345', 'Kartika Sari', '260110170002', 'Farmasi', 'S1', 'Universitas Padjadjaran', 'Fakultas Farmasi', 2017, 2021, 3.79, 'Bandung', '1999-04-17', 'S.Farm.', 'A'),
('UNPAD-2019-503456', 'Lukman Hakim', '150415150003', 'Fotografi', 'S1', 'Universitas Padjadjaran', 'Fakultas Ilmu Komunikasi', 2015, 2019, 3.63, 'Sumedang', '1997-06-23', 'S.Sn.', 'A'),
('UNPAD-2022-504567', 'Mega Utami', '150218180004', 'Arsitektur', 'S1', 'Universitas Padjadjaran', 'Fakultas Teknik', 2018, 2022, 3.76, 'Bandung', '2000-09-05', 'S.Ars.', 'A'),
('UNPAD-2020-505678', 'Nugroho Santoso', '220116160005', 'Teknik Geologi', 'S1', 'Universitas Padjadjaran', 'Fakultas Teknik Geologi', 2016, 2020, 3.72, 'Bandung', '1998-12-19', 'S.T.', 'A'),

-- Universitas Hasanuddin
('UNHAS-2020-601234', 'Oki Setiana', 'D01116001', 'Agribisnis', 'S1', 'Universitas Hasanuddin', 'Fakultas Pertanian', 2016, 2020, 3.58, 'Makassar', '1998-03-08', 'S.P.', 'A'),
('UNHAS-2021-602345', 'Prabu Revolusi', 'D01117002', 'Ilmu Kelautan', 'S1', 'Universitas Hasanuddin', 'Fakultas Ilmu Kelautan dan Perikanan', 2017, 2021, 3.71, 'Makassar', '1999-06-14', 'S.Kel.', 'A'),
('UNHAS-2019-603456', 'Qori Sandioriva', 'D01115003', 'Sastra Inggris', 'S1', 'Universitas Hasanuddin', 'Fakultas Ilmu Budaya', 2015, 2019, 3.67, 'Makassar', '1997-08-21', 'S.S.', 'A'),
('UNHAS-2022-604567', 'Reza Rahadian', 'D01118004', 'Ilmu Komunikasi', 'S1', 'Universitas Hasanuddin', 'Fakultas Ilmu Sosial dan Ilmu Politik', 2018, 2022, 3.73, 'Makassar', '2000-10-27', 'S.I.Kom.', 'A'),
('UNHAS-2020-605678', 'Sinta Nuriyah', 'D01116005', 'Hukum', 'S1', 'Universitas Hasanuddin', 'Fakultas Hukum', 2016, 2020, 3.80, 'Makassar', '1998-05-03', 'S.H.', 'A'),

-- Universitas Brawijaya
('UB-2020-701234', 'Tjokorda Bagus', '165100400111001', 'Teknik Informatika', 'S1', 'Universitas Brawijaya', 'Fakultas Ilmu Komputer', 2016, 2020, 3.75, 'Malang', '1998-07-15', 'S.Kom.', 'A'),
('UB-2021-702345', 'Ayu Ting Ting', '165100401111002', 'Sistem Informasi', 'S1', 'Universitas Brawijaya', 'Fakultas Ilmu Komputer', 2017, 2021, 3.69, 'Malang', '1999-09-22', 'S.Kom.', 'A'),
('UB-2019-703456', 'Bima Arya', '165100301111003', 'Perencanaan Wilayah dan Kota', 'S1', 'Universitas Brawijaya', 'Fakultas Teknik', 2015, 2019, 3.78, 'Malang', '1997-11-29', 'S.T.', 'A'),
('UB-2022-704567', 'Citra Scholastika', '165100501111004', 'Manajemen', 'S1', 'Universitas Brawijaya', 'Fakultas Ekonomi dan Bisnis', 2018, 2022, 3.64, 'Malang', '2000-01-06', 'S.E.', 'A'),
('UB-2020-705678', 'Dewa Budjana', '165100201111005', 'Administrasi Publik', 'S1', 'Universitas Brawijaya', 'Fakultas Ilmu Administrasi', 2016, 2020, 3.72, 'Malang', '1998-04-13', 'S.AP.', 'A'),

-- Universitas Sumatera Utara
('USU-2020-801234', 'Eko Bambang', '160801001', 'Teknik Sipil', 'S1', 'Universitas Sumatera Utara', 'Fakultas Teknik', 2016, 2020, 3.68, 'Medan', '1998-08-19', 'S.T.', 'A'),
('USU-2021-802345', 'Fanny Ghassani', '160901002', 'Keperawatan', 'S1', 'Universitas Sumatera Utara', 'Fakultas Keperawatan', 2017, 2021, 3.76, 'Medan', '1999-10-26', 'S.Kep.', 'A'),
('USU-2019-803456', 'Gunawan Dwi Cahyo', '160701003', 'Teknik Perminyakan', 'S1', 'Universitas Sumatera Utara', 'Fakultas Teknik', 2015, 2019, 3.83, 'Medan', '1997-12-02', 'S.T.', 'A'),
('USU-2022-804567', 'Hilda Vitria', '161001004', 'Akuntansi', 'S1', 'Universitas Sumatera Utara', 'Fakultas Ekonomi dan Bisnis', 2018, 2022, 3.71, 'Medan', '2000-02-09', 'S.Ak.', 'A'),
('USU-2020-805678', 'Irwan Setiawan', '160801005', 'Teknik Pertambangan', 'S1', 'Universitas Sumatera Utara', 'Fakultas Teknik', 2016, 2020, 3.65, 'Medan', '1998-06-16', 'S.T.', 'A');

-- Tampilkan statistik
SELECT 
  universitas,
  COUNT(*) as jumlah_lulusan,
  ROUND(AVG(ipk), 2) as rata_rata_ipk,
  COUNT(CASE WHEN jenjang = 'S1' THEN 1 END) as s1,
  COUNT(CASE WHEN jenjang = 'S2' THEN 1 END) as s2
FROM pddikti_dummy
GROUP BY universitas
ORDER BY jumlah_lulusan DESC;

-- Query untuk cek ijazah
-- SELECT * FROM pddikti_dummy WHERE nomor_ijazah = 'UI-2020-001234';
-- SELECT * FROM pddikti_dummy WHERE nama ILIKE '%ahmad%';
-- SELECT * FROM pddikti_dummy WHERE nim = '1806123456';
-- SELECT * FROM pddikti_dummy WHERE program_studi ILIKE '%informatika%';
