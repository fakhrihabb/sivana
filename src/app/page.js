'use client';

import { useState } from 'react';
import {
  Shield,
  Clock,
  CheckCircle,
  Users,
  Camera,
  FileCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Check
} from 'lucide-react';
import Image from 'next/image';
import CobaSivanaModal from '@/components/CobaSivanaModal';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const benefits = [
    {
      icon: Shield,
      title: "Anti Joki Detection",
      description: "Verifikasi wajah berbasis AI untuk mencegah praktik kecurangan dan penggantian identitas peserta ujian."
    },
    {
      icon: Clock,
      title: "Efisiensi Administrasi",
      description: "Otomasi pemeriksaan dokumen dengan OCR dan NLP menghemat waktu hingga 70% dalam verifikasi berkas."
    },
    {
      icon: MessageSquare,
      title: "Layanan 24/7",
      description: "Chatbot TanyaBKN siap menjawab pertanyaan peserta kapan saja dengan informasi yang konsisten dan akurat."
    },
    {
      icon: CheckCircle,
      title: "Transparansi & Audit",
      description: "Setiap proses tercatat digital dengan timestamp dan dapat diaudit untuk memastikan objektivitas seleksi."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Pendaftaran & Upload Dokumen",
      description: "Peserta mendaftar melalui SSCASN dan mengunggah dokumen persyaratan. SIVANA secara otomatis mengekstrak dan memvalidasi informasi dari ijazah, transkrip, dan KTP menggunakan teknologi OCR.",
      icon: FileCheck
    },
    {
      number: 2,
      title: "Verifikasi Identitas di Lokasi Ujian",
      description: "Saat masuk ruang ujian, pengawas menggunakan aplikasi mobile SIVANA untuk memverifikasi wajah peserta. Sistem mencocokkan dengan foto pendaftaran dan mencatat setiap verifikasi dengan cap waktu.",
      icon: Camera
    },
    {
      number: 3,
      title: "Monitoring & Layanan Informasi",
      description: "BKN memantau seluruh proses melalui dashboard terpusat. Peserta dapat bertanya melalui TanyaBKN Chatbot yang terintegrasi dengan SSCASN untuk mendapat informasi status secara real-time.",
      icon: Users
    }
  ];

  const faqs = [
    {
      question: "Apa itu SIVANA?",
      answer: "SIVANA (Sistem Integritas dan Verifikasi ASN Nasional) adalah platform berbasis AI dan Computer Vision yang dirancang untuk meningkatkan integritas, efisiensi, dan transparansi dalam proses seleksi Aparatur Sipil Negara di Indonesia."
    },
    {
      question: "Bagaimana SIVANA mencegah praktik joki?",
      answer: "SIVANA menggunakan teknologi Computer Vision untuk verifikasi wajah real-time di lokasi ujian. Sistem mencocokkan wajah peserta dengan foto pendaftaran dan data KTP, mencatat setiap verifikasi dengan timestamp dan identitas petugas untuk audit."
    },
    {
      question: "Apakah data peserta aman?",
      answer: "Ya, sangat aman. SIVANA menerapkan enkripsi end-to-end, kontrol akses berbasis peran (IAM), penyimpanan terenkripsi di Google Cloud, dan kepatuhan penuh terhadap regulasi perlindungan data pemerintah."
    },
    {
      question: "Bagaimana cara kerja otomasi administrasi?",
      answer: "SIVANA menggunakan Google Document AI untuk OCR dan NLP guna mengekstrak informasi dari ijazah, transkrip, dan dokumen lainnya. Sistem memeriksa kelengkapan, kesesuaian dengan syarat formasi, dan mendeteksi anomali dokumen secara otomatis."
    },
    {
      question: "Apakah SIVANA menggantikan peran verifikator manusia?",
      answer: "Tidak. SIVANA membantu verifikator dengan menyediakan rekomendasi dan analisis otomatis, namun keputusan akhir tetap berada di tangan verifikator dan pengawas manusia."
    },
    {
      question: "Berapa lama waktu implementasi SIVANA?",
      answer: "Implementasi SIVANA dirancang bertahap dalam 3 tahun: Tahun 1 untuk pilot project, Tahun 2 untuk perluasan ke lebih banyak lokasi, dan Tahun 3 untuk implementasi nasional penuh."
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Gradient Background */}
      <section className="relative bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Seleksi ASN yang Lebih <span className="text-white underline decoration-white/50">Jujur</span> dan <span className="text-white underline decoration-white/50">Transparan</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                SIVANA menghadirkan verifikasi identitas berbasis AI, otomasi administrasi pintar, dan layanan informasi terintegrasi untuk proses seleksi Aparatur Sipil Negara yang objektif dan terpercaya.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-[#239DD7] hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105 shadow-xl"
              >
                Coba Sekarang
              </button>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative h-[400px] md:h-[500px] animate-fade-in">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <Image
                  src="/images/cat-photo.jpeg"
                  alt="SIVANA System"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa SIVANA Section - White Background */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kenapa SIVANA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solusi komprehensif untuk meningkatkan integritas dan efisiensi seleksi ASN
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200 text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bagaimana Cara Kerjanya Section - Gradient Background */}
      <section className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Bagaimana Cara Kerjanya?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Proses sederhana dalam 3 langkah untuk seleksi ASN yang lebih baik
            </p>
          </div>

          {/* Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-12">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                    {steps[currentStep].number}
                  </div>
                </div>

                <div className="text-center space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    {steps[currentStep].description}
                  </p>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center gap-3 mt-8">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-[#239DD7] w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevStep}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white hover:bg-gray-100 p-3 rounded-full shadow-xl transition-all hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextStep}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white hover:bg-gray-100 p-3 rounded-full shadow-xl transition-all hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Hasil SIVANA Section - White Background */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Hasil SIVANA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Perbedaan signifikan dalam proses seleksi ASN
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tanpa SIVANA */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-xl border-2 border-red-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-500 p-3 rounded-xl">
                  <X className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Tanpa SIVANA
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Verifikasi identitas manual rentan terhadap praktik joki",
                  "Pemeriksaan administrasi memakan waktu berhari-hari",
                  "Inkonsistensi keputusan antar instansi",
                  "Layanan informasi lambat saat puncak pendaftaran",
                  "Sulitnya pelacakan dan audit proses seleksi",
                  "Beban kerja verifikator sangat tinggi"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dengan SIVANA */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-500 p-3 rounded-xl">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Dengan SIVANA
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Verifikasi wajah otomatis dengan AI mencegah kecurangan",
                  "Pemeriksaan administrasi selesai dalam hitungan menit",
                  "Standardisasi keputusan di seluruh instansi",
                  "Respons informasi instan 24/7 melalui chatbot",
                  "Audit trail lengkap untuk setiap proses",
                  "Efisiensi waktu kerja meningkat hingga 70%"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] p-6 rounded-xl text-white text-center shadow-lg">
              <div className="text-4xl font-bold mb-2">70%</div>
              <div className="text-white/90">Penghematan Waktu</div>
            </div>
            <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] p-6 rounded-xl text-white text-center shadow-lg">
              <div className="text-4xl font-bold mb-2">60%</div>
              <div className="text-white/90">Penurunan Biaya Operasional</div>
            </div>
            <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] p-6 rounded-xl text-white text-center shadow-lg">
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-white/90">Akurasi Verifikasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Gradient Background */}
      <section className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-white/90">
              Pertanyaan yang sering diajukan tentang SIVANA
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronRight
                    className={`w-6 h-6 text-gray-600 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {openFaq === index && (
                  <div className="px-8 pb-6 text-gray-700 leading-relaxed animate-slide-up">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Section - White Background */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Siap Mencoba SIVANA?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan sistem seleksi ASN yang lebih objektif, efisien, dan terpercaya. Mulai pengalaman Anda dengan SIVANA hari ini.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#239DD7] to-[#DE1B5D] hover:from-[#1e8ac4] hover:to-[#c91e52] text-white font-semibold px-10 py-4 rounded-lg text-lg transition-all hover:scale-105 shadow-xl w-full sm:w-auto"
            >
              Coba Sebagai Pendaftar
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white border-2 border-[#239DD7] text-[#239DD7] hover:bg-[#239DD7] hover:text-white font-semibold px-10 py-4 rounded-lg text-lg transition-all hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              Coba Sebagai Admin
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] p-3 rounded-lg flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Aman & Terpercaya</h4>
                <p className="text-gray-600 text-sm">Enkripsi end-to-end untuk semua data</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] p-3 rounded-lg flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Cepat & Efisien</h4>
                <p className="text-gray-600 text-sm">Hemat waktu hingga 70%</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] p-3 rounded-lg flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Dukungan 24/7</h4>
                <p className="text-gray-600 text-sm">TanyaBKN siap membantu Anda</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">SIVANA</h3>
          <p className="text-white/80 mb-6">
            Sistem Integritas dan Verifikasi ASN Nasional
          </p>
          <p className="text-white/60 text-sm">
            © 2025 Tim Makara - ASN Digital AI Hackathon
          </p>
        </div>
      </footer>

      {/* Modal */}
      <CobaSivanaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
