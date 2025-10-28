import Link from "next/link";

// Sample data - in production this would come from an API
const formasiData = [
  {
    id: 1,
    name: "Analis Kebijakan",
    lembaga: "Kementerian Keuangan",
    lokasi: "Jakarta Pusat",
    description: "Melakukan analisis dan evaluasi kebijakan fiskal serta memberikan rekomendasi strategis untuk pembangunan ekonomi nasional.",
    quota: "10 Formasi",
  },
  {
    id: 2,
    name: "Auditor",
    lembaga: "Badan Pemeriksa Keuangan",
    lokasi: "Jakarta Selatan",
    description: "Melaksanakan pemeriksaan pengelolaan dan tanggung jawab keuangan negara untuk memastikan akuntabilitas dan transparansi.",
    quota: "15 Formasi",
  },
  {
    id: 3,
    name: "Pengawas Sekolah",
    lembaga: "Dinas Pendidikan",
    lokasi: "Jakarta Timur",
    description: "Melakukan pengawasan, pembinaan, dan evaluasi terhadap penyelenggaraan pendidikan di sekolah-sekolah negeri.",
    quota: "8 Formasi",
  },
  {
    id: 4,
    name: "Tenaga Kesehatan",
    lembaga: "Dinas Kesehatan",
    lokasi: "Jakarta Barat",
    description: "Memberikan pelayanan kesehatan masyarakat dan melaksanakan program promosi kesehatan di tingkat puskesmas.",
    quota: "20 Formasi",
  },
  {
    id: 5,
    name: "Pranata Komputer",
    lembaga: "Kementerian Komunikasi dan Informatika",
    lokasi: "Jakarta Pusat",
    description: "Mengembangkan dan memelihara sistem informasi serta infrastruktur teknologi untuk mendukung transformasi digital pemerintahan.",
    quota: "12 Formasi",
  },
  {
    id: 6,
    name: "Analis Sumber Daya Manusia",
    lembaga: "Badan Kepegawaian Negara",
    lokasi: "Jakarta Selatan",
    description: "Melakukan analisis kebutuhan, perencanaan, dan pengembangan kompetensi aparatur sipil negara untuk meningkatkan kinerja organisasi.",
    quota: "6 Formasi",
  },
];

export default function DaftarFormasi() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Daftar Formasi
          </h2>
          <p className="text-lg text-gray-600">
            Pilih formasi yang sesuai dengan kualifikasi Anda
          </p>
        </div>

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
      </div>
    </section>
  );
}
