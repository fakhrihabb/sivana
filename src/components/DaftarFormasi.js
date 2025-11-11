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
    <section id="daftar-formasi" className="py-16 md:py-24 bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(35, 157, 215, 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full border border-[#239DD7]/20 text-sm font-mono text-[#239DD7] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-110 hover:border-[#DE1B5D]/70 hover:bg-white hover:text-[#DE1B5D] transition-all duration-500 cursor-default hover:rotate-2">
              DAFTAR FORMASI
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent">
              Daftar Pendaftar
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Pilih formasi yang sesuai dengan kualifikasi Anda
          </p>
          {error && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg max-w-2xl mx-auto shadow-lg">
              <p className="text-sm">⚠️ Menggunakan data fallback. Koneksi Supabase: {error}</p>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="group relative mb-10">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-[#239DD7]/20 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {/* Periode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode
              </label>
              <select
                value={filters.periode}
                onChange={(e) => handleFilterChange("periode", e.target.value)}
                className="w-full px-4 py-3 border border-[#239DD7]/30 rounded-xl focus:ring-2 focus:ring-[#239DD7] focus:border-[#239DD7] bg-white/70 backdrop-blur-sm hover:border-[#239DD7]/60 transition-all duration-300 shadow-sm hover:shadow-md"
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
                className="w-full px-4 py-3 border border-[#239DD7]/30 rounded-xl focus:ring-2 focus:ring-[#239DD7] focus:border-[#239DD7] bg-white/70 backdrop-blur-sm hover:border-[#239DD7]/60 transition-all duration-300 shadow-sm hover:shadow-md"
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
                className="w-full px-4 py-3 border border-[#239DD7]/30 rounded-xl focus:ring-2 focus:ring-[#239DD7] focus:border-[#239DD7] bg-white/70 backdrop-blur-sm hover:border-[#239DD7]/60 transition-all duration-300 shadow-sm hover:shadow-md"
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
                className="w-full px-4 py-3 border border-[#239DD7]/30 rounded-xl focus:ring-2 focus:ring-[#239DD7] focus:border-[#239DD7] bg-white/70 backdrop-blur-sm hover:border-[#239DD7]/60 transition-all duration-300 shadow-sm hover:shadow-md"
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
                className="w-full px-4 py-3 border border-[#239DD7]/30 rounded-xl focus:ring-2 focus:ring-[#239DD7] focus:border-[#239DD7] bg-white/70 backdrop-blur-sm hover:border-[#239DD7]/60 transition-all duration-300 shadow-sm hover:shadow-md"
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
                className="group/reset relative w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#239DD7] hover:to-cyan-500 text-gray-700 hover:text-white rounded-xl font-semibold transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 overflow-hidden"
              >
                <span className="relative z-10 group-hover/reset:scale-105 inline-block transition-transform">Reset Filter</span>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-700 font-medium bg-blue-50/50 rounded-lg px-4 py-3 border border-[#239DD7]/10">
            Menampilkan <span className="font-bold text-[#239DD7]">{((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-bold text-[#239DD7]">{pagination.total}</span> formasi
          </div>
        </div>
      </div>

        {/* Pendaftar Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {formasiData.map((formasi) => (
            <div
              key={formasi.id}
              className="group relative"
            >
              {/* Glow Effect on Hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>

              <div className="relative bg-white border border-[#239DD7]/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 flex flex-col hover:-translate-y-2 hover:scale-[1.02] hover:border-[#239DD7]/50 shadow-lg">
                <div className="flex-grow mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#239DD7] group-hover:scale-105 transition-all duration-300">
                    {formasi.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#239DD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {formasi.lembaga}
                  </p>
                  
                  {/* Headquarters */}
                  {formasi.kantorPusat && (
                    <p className="text-gray-500 text-xs mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <span>Kantor: {formasi.kantorPusat}</span>
                    </p>
                  )}
                  
                  {/* Display placement locations */}
                  {formasi.locations && formasi.locations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 font-medium mb-1.5">Lokasi Penempatan:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {formasi.locations.slice(0, 3).map((location, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {location}
                          </span>
                        ))}
                        {formasi.locations.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            +{formasi.locations.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-[#239DD7] text-xs font-semibold rounded-lg border border-[#239DD7]/20 group-hover:scale-110 group-hover:border-[#239DD7]/40 transition-all duration-300">
                      {formasi.jenisPengadaan}
                    </span>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 group-hover:scale-110 group-hover:border-green-300 transition-all duration-300">
                      {formasi.jenjangPendidikan}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {formasi.description}
                  </p>
                  <div className="flex items-center gap-2 text-[#239DD7] font-bold text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {formasi.quota}
                  </div>
                </div>
                <Link
                  href={`/formasi/${formasi.id}`}
                  className="group/btn relative block w-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur opacity-30 group-hover/btn:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-r from-[#DE1B5D] to-pink-500 text-white text-center px-4 py-3 rounded-xl font-bold transition-all duration-500 group-hover/btn:scale-105 group-hover/btn:shadow-lg group-hover/btn:shadow-pink-500/30">
                    <span className="group-hover/btn:scale-110 inline-block transition-transform duration-300">Daftar Sekarang</span>
                  </div>
                </Link>
              </div>
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
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                pagination.page === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#239DD7] to-cyan-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30'
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
                      className="px-4 py-2 rounded-lg font-semibold bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#239DD7] hover:to-cyan-500 hover:text-white border border-[#239DD7]/20 hover:border-[#239DD7] transition-all duration-300 hover:scale-105 hover:shadow-md"
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
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        i === pagination.page
                          ? 'bg-gradient-to-r from-[#239DD7] to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                          : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border border-[#239DD7]/20 hover:border-[#239DD7]/40 hover:scale-105 hover:shadow-md'
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
                      className="px-4 py-2 rounded-lg font-semibold bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#239DD7] hover:to-cyan-500 hover:text-white border border-[#239DD7]/20 hover:border-[#239DD7] transition-all duration-300 hover:scale-105 hover:shadow-md"
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
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#239DD7] to-cyan-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30'
              }`}
            >
              Selanjutnya
            </button>
          </div>
        )}

        {/* No Results Message */}
        {formasiData.length === 0 && (
          <div className="text-center py-16 relative">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(35, 157, 215, 0.3) 1px, transparent 0)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            <div className="relative">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-xl mb-6 font-medium">
                Tidak ada formasi yang sesuai dengan filter yang dipilih.
              </p>
              <button
                onClick={resetFilters}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#239DD7] to-cyan-500 text-white rounded-xl font-semibold transition-all duration-500 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="group-hover:scale-105 inline-block transition-transform">Reset Filter</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
