"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Sample data - fallback jika Supabase gagal
const formasiDataFallback = [
  {
    id: 1,
    name: "Analis Kebijakan",
    lembaga: "Kementerian Keuangan",
    lokasi: "Jakarta Pusat",
    description: "Melakukan analisis dan evaluasi kebijakan fiskal serta memberikan rekomendasi strategis untuk pembangunan ekonomi nasional.",
    quota: "10 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Ilmu Ekonomi",
    jenisPengadaan: "CPNS"
  },
  {
    id: 2,
    name: "Auditor",
    lembaga: "Badan Pemeriksa Keuangan",
    lokasi: "Jakarta Selatan",
    description: "Melaksanakan pemeriksaan pengelolaan dan tanggung jawab keuangan negara untuk memastikan akuntabilitas dan transparansi.",
    quota: "15 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Akuntansi",
    jenisPengadaan: "CPNS"
  },
  {
    id: 3,
    name: "Pengawas Sekolah",
    lembaga: "Dinas Pendidikan",
    lokasi: "Jakarta Timur",
    description: "Melakukan pengawasan, pembinaan, dan evaluasi terhadap penyelenggaraan pendidikan di sekolah-sekolah negeri.",
    quota: "8 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-2",
    programStudi: "Administrasi Pendidikan",
    jenisPengadaan: "PPPK Guru"
  },
  {
    id: 4,
    name: "Tenaga Kesehatan",
    lembaga: "Dinas Kesehatan",
    lokasi: "Jakarta Barat",
    description: "Memberikan pelayanan kesehatan masyarakat dan melaksanakan program promosi kesehatan di tingkat puskesmas.",
    quota: "20 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "Diploma III/Sarjana Muda",
    programStudi: "Keperawatan",
    jenisPengadaan: "PPPK Tenaga Kesehatan"
  },
  {
    id: 5,
    name: "Pranata Komputer",
    lembaga: "Kementerian Komunikasi dan Informatika",
    lokasi: "Jakarta Pusat",
    description: "Mengembangkan dan memelihara sistem informasi serta infrastruktur teknologi untuk mendukung transformasi digital pemerintahan.",
    quota: "12 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Ilmu Komputer",
    jenisPengadaan: "CPNS"
  },
  {
    id: 6,
    name: "Analis Sumber Daya Manusia",
    lembaga: "Badan Kepegawaian Negara",
    lokasi: "Jakarta Selatan",
    description: "Melakukan analisis kebutuhan, perencanaan, dan pengembangan kompetensi aparatur sipil negara untuk meningkatkan kinerja organisasi.",
    quota: "6 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Manajemen",
    jenisPengadaan: "CPNS"
  },
  {
    id: 7,
    name: "Guru Matematika",
    lembaga: "Dinas Pendidikan",
    lokasi: "Jakarta Utara",
    description: "Mengajar mata pelajaran Matematika di sekolah menengah atas dan membimbing siswa dalam kompetisi akademik.",
    quota: "25 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Pendidikan Matematika",
    jenisPengadaan: "PPPK Guru"
  },
  {
    id: 8,
    name: "Dokter Umum",
    lembaga: "Rumah Sakit Umum Daerah",
    lokasi: "Bandung",
    description: "Memberikan pelayanan kesehatan dasar dan rujukan medis di fasilitas kesehatan tingkat pertama.",
    quota: "18 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Kedokteran",
    jenisPengadaan: "PPPK Tenaga Kesehatan"
  },
  {
    id: 9,
    name: "Analis Data",
    lembaga: "Badan Pusat Statistik",
    lokasi: "Jakarta Pusat",
    description: "Melakukan pengolahan dan analisis data statistik untuk mendukung perumusan kebijakan berbasis data.",
    quota: "10 Pendaftar",
    periode: 2024,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Statistika",
    jenisPengadaan: "CPNS"
  },
  {
    id: 10,
    name: "Pengelola Keuangan",
    lembaga: "Kementerian Dalam Negeri",
    lokasi: "Jakarta Selatan",
    description: "Mengelola dan mengawasi pelaksanaan anggaran serta pelaporan keuangan instansi pemerintah.",
    quota: "14 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "Diploma IV",
    programStudi: "Akuntansi",
    jenisPengadaan: "CPNS"
  },
  {
    id: 11,
    name: "Teknisi Laboratorium",
    lembaga: "Kementerian Kesehatan",
    lokasi: "Surabaya",
    description: "Melakukan pemeriksaan laboratorium dan pemeliharaan peralatan medis untuk mendukung diagnosis penyakit.",
    quota: "22 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "Diploma III/Sarjana Muda",
    programStudi: "Analis Kesehatan",
    jenisPengadaan: "PPPK Teknis"
  },
  {
    id: 12,
    name: "Guru Bahasa Inggris",
    lembaga: "Dinas Pendidikan",
    lokasi: "Semarang",
    description: "Mengajar Bahasa Inggris di sekolah menengah pertama dan mengembangkan kurikulum pembelajaran bahasa.",
    quota: "30 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Pendidikan Bahasa Inggris",
    jenisPengadaan: "PPPK Guru"
  },
  {
    id: 13,
    name: "Penyuluh Pertanian",
    lembaga: "Dinas Pertanian",
    lokasi: "Yogyakarta",
    description: "Memberikan penyuluhan dan pendampingan kepada petani untuk meningkatkan produktivitas pertanian.",
    quota: "16 Pendaftar",
    periode: 2024,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Agronomi",
    jenisPengadaan: "PPPK Teknis"
  },
  {
    id: 14,
    name: "Arsiparis",
    lembaga: "Arsip Nasional Republik Indonesia",
    lokasi: "Jakarta Timur",
    description: "Mengelola, melestarikan, dan menyediakan akses terhadap arsip dan dokumen penting negara.",
    quota: "7 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "Diploma IV",
    programStudi: "Kearsipan",
    jenisPengadaan: "CPNS"
  },
  {
    id: 15,
    name: "Apoteker",
    lembaga: "Dinas Kesehatan",
    lokasi: "Medan",
    description: "Mengelola pelayanan kefarmasian dan memberikan konsultasi penggunaan obat yang rasional.",
    quota: "12 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Farmasi",
    jenisPengadaan: "PPPK Tenaga Kesehatan"
  },
  {
    id: 16,
    name: "Network Administrator",
    lembaga: "Kementerian Komunikasi dan Informatika",
    lokasi: "Jakarta Pusat",
    description: "Mengelola infrastruktur jaringan dan memastikan keamanan sistem informasi pemerintah.",
    quota: "9 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "Diploma III/Sarjana Muda",
    programStudi: "Teknik Informatika",
    jenisPengadaan: "PPPK Teknis"
  },
  {
    id: 17,
    name: "Perancang Peraturan Perundang-undangan",
    lembaga: "Kementerian Hukum dan HAM",
    lokasi: "Jakarta Selatan",
    description: "Menyusun dan mengharmonisasikan rancangan peraturan perundang-undangan sesuai kaidah hukum.",
    quota: "8 Pendaftar",
    periode: 2024,
    jenjangPendidikan: "S-2",
    programStudi: "Ilmu Hukum",
    jenisPengadaan: "CPNS"
  },
  {
    id: 18,
    name: "Guru Pendidikan Jasmani",
    lembaga: "Dinas Pendidikan",
    lokasi: "Malang",
    description: "Mengajar pendidikan jasmani dan olahraga serta melatih siswa dalam cabang olahraga tertentu.",
    quota: "20 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Pendidikan Jasmani",
    jenisPengadaan: "PPPK Guru"
  },
  {
    id: 19,
    name: "Analis Lingkungan",
    lembaga: "Kementerian Lingkungan Hidup dan Kehutanan",
    lokasi: "Bogor",
    description: "Melakukan pemantauan kualitas lingkungan dan evaluasi dampak lingkungan dari berbagai kegiatan.",
    quota: "11 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Teknik Lingkungan",
    jenisPengadaan: "CPNS"
  },
  {
    id: 20,
    name: "Radiografer",
    lembaga: "Rumah Sakit Umum Daerah",
    lokasi: "Denpasar",
    description: "Melakukan pemeriksaan radiologi dan pencitraan medis untuk mendukung diagnosis dokter.",
    quota: "13 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "Diploma III/Sarjana Muda",
    programStudi: "Radiologi",
    jenisPengadaan: "PPPK Tenaga Kesehatan"
  },
  {
    id: 21,
    name: "Perencana",
    lembaga: "Badan Perencanaan Pembangunan Nasional",
    lokasi: "Jakarta Pusat",
    description: "Menyusun rencana pembangunan nasional dan daerah untuk mendukung pencapaian target pembangunan.",
    quota: "10 Pendaftar",
    periode: 2024,
    jenjangPendidikan: "S-2",
    programStudi: "Perencanaan Wilayah dan Kota",
    jenisPengadaan: "CPNS"
  },
  {
    id: 22,
    name: "Widyaiswara",
    lembaga: "Lembaga Administrasi Negara",
    lokasi: "Jakarta Timur",
    description: "Melakukan pendidikan dan pelatihan untuk meningkatkan kompetensi aparatur sipil negara.",
    quota: "6 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-2",
    programStudi: "Administrasi Publik",
    jenisPengadaan: "CPNS"
  },
  {
    id: 23,
    name: "Pranata Humas",
    lembaga: "Kementerian Komunikasi dan Informatika",
    lokasi: "Jakarta Pusat",
    description: "Mengelola komunikasi publik dan membangun citra positif instansi pemerintah.",
    quota: "8 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Ilmu Komunikasi",
    jenisPengadaan: "PPPK Teknis"
  },
  {
    id: 24,
    name: "Bidan",
    lembaga: "Puskesmas",
    lokasi: "Palembang",
    description: "Memberikan pelayanan kesehatan ibu dan anak serta melakukan pertolongan persalinan.",
    quota: "28 Pendaftar",
    periode: 2025,
    jenjangPendidikan: "Diploma III/Sarjana Muda",
    programStudi: "Kebidanan",
    jenisPengadaan: "PPPK Tenaga Kesehatan"
  },
  {
    id: 25,
    name: "Analis Kepegawaian",
    lembaga: "Badan Kepegawaian Negara",
    lokasi: "Jakarta Selatan",
    description: "Melakukan analisis dan pengelolaan data kepegawaian untuk mendukung pengambilan keputusan SDM.",
    quota: "9 Pendaftar",
    periode: 2024,
    jenjangPendidikan: "S-1/Sarjana",
    programStudi: "Psikologi",
    jenisPengadaan: "CPNS"
  },
];

export default function DaftarPendaftar() {
  const [formasiData, setFormasiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    periode: "2025",
    jenjangPendidikan: "",
    programStudi: "",
    instansi: "",
    jenisPengadaan: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });
  const [allFormasiData, setAllFormasiData] = useState([]);

  // Fetch all data for filter dropdowns (without pagination)
  useEffect(() => {
    async function fetchAllFormasi() {
      try {
        const { data, error } = await supabase
          .from('formasi')
          .select('*');

        if (error) throw error;

        // Transform data dari snake_case ke camelCase untuk compatibility
        const transformedData = data.map(item => ({
          id: item.id,
          name: item.name,
          lembaga: item.lembaga,
          lokasi: item.lokasi,
          description: item.description,
          quota: item.quota,
          periode: item.periode,
          jenjangPendidikan: item.jenjang_pendidikan,
          programStudi: item.program_studi,
          jenisPengadaan: item.jenis_pengadaan
        }));

        setAllFormasiData(transformedData);
      } catch (err) {
        console.error('Error fetching all formasi:', err);
        // Fallback ke data hardcoded jika gagal
        setAllFormasiData(formasiDataFallback);
      }
    }

    fetchAllFormasi();
  }, []);

  // Fetch paginated data from API
  useEffect(() => {
    async function fetchFormasi() {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        // Add filters to query params
        if (filters.periode) params.append('periode', filters.periode);
        if (filters.jenjangPendidikan) params.append('jenjangPendidikan', filters.jenjangPendidikan);
        if (filters.programStudi) params.append('programStudi', filters.programStudi);
        if (filters.instansi) params.append('instansi', filters.instansi);
        if (filters.jenisPengadaan) params.append('jenisPengadaan', filters.jenisPengadaan);

        const response = await fetch(`/api/formasi?${params.toString()}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch formasi');
        }

        setFormasiData(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages
        }));
        setError(null);
      } catch (err) {
        console.error('Error fetching formasi:', err);
        setError(err.message);
        // Fallback ke data hardcoded jika gagal
        setFormasiData(formasiDataFallback);
      } finally {
        setLoading(false);
      }
    }

    fetchFormasi();
  }, [pagination.page, filters]);

  // Get unique values for dropdowns from all data
  const uniquePeriode = [...new Set(allFormasiData.map(f => f.periode))].sort((a, b) => b - a);
  const uniqueJenjang = [
    "SD",
    "SLTP",
    "SLTA",
    "SMK/SLTA Kejuruan",
    "SLTA Keguruan",
    "Diploma I",
    "Diploma II",
    "Diploma III/Sarjana Muda",
    "Diploma IV",
    "S-1/Sarjana",
    "S-2",
    "S-3/Doktor"
  ];
  const uniqueProdi = [...new Set(allFormasiData.map(f => f.programStudi))].sort();
  const uniqueInstansi = [...new Set(allFormasiData.map(f => f.lembaga))].sort();
  const uniqueJenisPengadaan = [
    "CPNS",
    "PPPK Guru",
    "PPPK Teknis",
    "PPPK Tenaga Kesehatan"
  ];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset to page 1 when filter changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      periode: "2025",
      jenjangPendidikan: "",
      programStudi: "",
      instansi: "",
      jenisPengadaan: ""
    });
    // Reset to page 1 when filters are reset
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <section id="daftar-formasi" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data formasi...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="daftar-formasi" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Daftar Pendaftar
          </h2>
          <p className="text-lg text-gray-600">
            Pilih formasi yang sesuai dengan kualifikasi Anda
          </p>
          {error && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm">⚠️ Menggunakan data fallback. Koneksi Supabase: {error}</p>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Periode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode
              </label>
              <select
                value={filters.periode}
                onChange={(e) => handleFilterChange("periode", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Semua Periode</option>
                {uniquePeriode.map(periode => (
                  <option key={periode} value={periode}>{periode}</option>
                ))}
              </select>
            </div>

            {/* Jenjang Pendidikan Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenjang Pendidikan
              </label>
              <select
                value={filters.jenjangPendidikan}
                onChange={(e) => handleFilterChange("jenjangPendidikan", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Semua Jenjang</option>
                {uniqueJenjang.map(jenjang => (
                  <option key={jenjang} value={jenjang}>{jenjang}</option>
                ))}
              </select>
            </div>

            {/* Program Studi Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Studi
              </label>
              <select
                value={filters.programStudi}
                onChange={(e) => handleFilterChange("programStudi", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Semua Program Studi</option>
                {uniqueProdi.map(prodi => (
                  <option key={prodi} value={prodi}>{prodi}</option>
                ))}
              </select>
            </div>

            {/* Instansi Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instansi
              </label>
              <select
                value={filters.instansi}
                onChange={(e) => handleFilterChange("instansi", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Semua Instansi</option>
                {uniqueInstansi.map(instansi => (
                  <option key={instansi} value={instansi}>{instansi}</option>
                ))}
              </select>
            </div>

            {/* Jenis Pengadaan Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Pengadaan
              </label>
              <select
                value={filters.jenisPengadaan}
                onChange={(e) => handleFilterChange("jenisPengadaan", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="">Semua Jenis</option>
                {uniqueJenisPengadaan.map(jenis => (
                  <option key={jenis} value={jenis}>{jenis}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-semibold">{pagination.total}</span> formasi
          </div>
        </div>

        {/* Pendaftar Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formasiData.map((formasi) => (
            <div
              key={formasi.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="flex-grow mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {formasi.name}
                </h3>
                <p className="text-gray-500 text-xs mb-3">
                  {formasi.lembaga} • {formasi.lokasi}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                    {formasi.jenisPengadaan}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">
                    {formasi.jenjangPendidikan}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {formasi.description}
                </p>
                <p className="text-brand-blue font-medium text-sm">
                  {formasi.quota}
                </p>
              </div>
              <Link
                href={`/formasi/${formasi.id}`}
                className="block w-full bg-brand-pink hover:bg-opacity-90 text-white text-center px-4 py-2 rounded-lg font-medium transition-all"
              >
                Daftar
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {formasiData.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pagination.page === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-blue text-white hover:bg-opacity-90'
              }`}
            >
              Sebelumnya
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

                // Adjust startPage if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // First page + ellipsis
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis-start" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }

                // Page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        i === pagination.page
                          ? 'bg-brand-blue text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // Ellipsis + last page
                if (endPage < pagination.totalPages) {
                  if (endPage < pagination.totalPages - 1) {
                    pages.push(
                      <span key="ellipsis-end" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={pagination.totalPages}
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {pagination.totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-blue text-white hover:bg-opacity-90'
              }`}
            >
              Selanjutnya
            </button>
          </div>
        )}

        {/* No Results Message */}
        {formasiData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Tidak ada formasi yang sesuai dengan filter yang dipilih.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
