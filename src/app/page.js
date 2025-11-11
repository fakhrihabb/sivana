'use client';

import React, { useState } from 'react';
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
    <div className="min-h-screen pt-16 bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Hero Section - Light Blue Gradient */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(rgba(35, 157, 215, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(35, 157, 215, 0.15) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center bottom'
          }}></div>

          {/* Glowing Orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#239DD7] rounded-full blur-[120px] opacity-20 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-[120px] opacity-15 animate-float" style={{animationDelay: '2s'}}></div>

          {/* Scan Lines */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#239DD7] to-transparent h-32 animate-[scan-line_4s_ease-in-out_infinite]"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8 animate-slide-right">
              {/* Tech Badge */}
              <div className="group/badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-[#239DD7]/20 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-110 hover:border-[#DE1B5D]/70 hover:bg-white transition-all duration-500 cursor-default hover:rotate-2">
                <div className="w-2 h-2 bg-[#DE1B5D] rounded-full animate-pulse group-hover/badge:scale-150 transition-transform duration-300"></div>
                <span className="text-sm font-medium text-[#239DD7] group-hover/badge:text-[#DE1B5D] group-hover/badge:scale-105 transition-all duration-300">AI-POWERED VERIFICATION SYSTEM</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900">
                Seleksi ASN yang Lebih{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#239DD7] to-cyan-500 bg-clip-text text-transparent">
                    Jujur
                  </span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-[#239DD7] to-cyan-500 blur-xl opacity-30"></span>
                </span>
                {' '}dan{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#DE1B5D] to-pink-500 bg-clip-text text-transparent">
                    Transparan
                  </span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-[#DE1B5D] to-pink-500 blur-xl opacity-30"></span>
                </span>
              </h1>

              <p className="text-xl text-gray-700 leading-relaxed">
                SIVANA menghadirkan verifikasi identitas berbasis AI, otomasi administrasi pintar, dan layanan informasi terintegrasi untuk proses seleksi Aparatur Sipil Negara yang objektif dan terpercaya.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-[1.15] hover:shadow-[0_0_50px_rgba(222,27,93,0.8)] hover:-translate-y-2 hover:rotate-2 text-white duration-500"
                >
                  <span className="relative z-10 group-hover:scale-110 inline-block transition-transform duration-300">Coba Sekarang</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-[#DE1B5D] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
                <button className="group px-8 py-4 rounded-xl font-semibold text-lg border-2 border-[#239DD7]/30 backdrop-blur-xl bg-white/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:border-[#239DD7] hover:scale-110 hover:-translate-y-2 text-gray-900 duration-500 hover:rotate-1">
                  <span className="group-hover:scale-105 inline-block transition-transform">Pelajari Lebih Lanjut</span>
                </button>
              </div>
            </div>

            {/* Right Side - Futuristic Image Card */}
            <div className="relative h-[500px] md:h-[600px] animate-fade-in group/card">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#239DD7] via-cyan-400 to-[#239DD7] rounded-3xl blur-2xl opacity-30 group-hover/card:opacity-80 transition-opacity duration-500"></div>

              {/* Main Card */}
              <div className="relative h-full bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl border border-[#239DD7]/20 shadow-2xl overflow-hidden group-hover/card:border-[#239DD7] transition-all group-hover/card:shadow-[0_0_50px_rgba(35,157,215,0.5)] group-hover/card:scale-[1.03] group-hover/card:rotate-1 duration-500">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#239DD7] rounded-tl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#DE1B5D] rounded-br-2xl"></div>

                {/* Image Container with Overlay */}
                <div className="relative h-full w-full p-4">
                  <div className="relative h-full w-full rounded-xl overflow-hidden">
                    <Image
                      src="/images/cat-photo.jpeg"
                      alt="SIVANA System"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent"></div>
                  </div>
                </div>

                {/* Tech Overlay Elements */}
                <div className="absolute top-6 right-6 px-3 py-2 bg-white/80 backdrop-blur-xl rounded-lg border border-[#239DD7]/30 text-xs font-mono shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#DE1B5D] rounded-full animate-pulse"></div>
                    <span className="text-[#239DD7] font-semibold">SYSTEM ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa SIVANA Section - Light Blue Gradient */}
      <section className="relative bg-gradient-to-b from-white via-blue-50 to-white py-32 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(35, 157, 215, 0.2) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full border border-[#239DD7]/20 text-sm font-mono text-[#239DD7] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-110 hover:border-[#DE1B5D]/70 hover:bg-white hover:text-[#DE1B5D] transition-all duration-500 cursor-default hover:rotate-2">
                CORE FEATURES
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent">
                Kenapa SIVANA?
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Solusi komprehensif untuk meningkatkan integritas dan efisiensi seleksi ASN
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow Effect on Hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>

                {/* Card Content */}
                <div className="relative h-full bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl border border-[#239DD7]/20 hover:border-[#DE1B5D]/70 transition-all duration-500 hover:-translate-y-4 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20">
                  {/* Icon Container */}
                  <div className="relative mb-6 flex justify-center">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur-md opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-gradient-to-br from-[#DE1B5D] to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      <benefit.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#DE1B5D] group-hover:scale-105 transition-all duration-300">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {benefit.description}
                  </p>

                  {/* Decorative Corner */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#239DD7]/40 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#DE1B5D]/40 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bagaimana Cara Kerjanya Section - Blue Gradient */}
      <section className="relative bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100 py-32 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#239DD7] rounded-full blur-[150px] opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#DE1B5D] rounded-full blur-[150px] opacity-20 animate-float" style={{animationDelay: '3s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full border border-[#239DD7]/20 text-sm font-mono text-[#239DD7] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-110 hover:border-[#DE1B5D]/70 hover:bg-white hover:text-[#DE1B5D] transition-all duration-500 cursor-default hover:rotate-2">
                WORKFLOW
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent">
                Bagaimana Cara Kerjanya?
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Proses sederhana dalam 3 langkah untuk seleksi ASN yang lebih baik
            </p>
          </div>

          {/* Carousel */}
          <div className="relative max-w-5xl mx-auto">
            {/* Main Card */}
            <div className="relative group">
              {/* Animated Border Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#DE1B5D] via-pink-500 to-[#DE1B5D] rounded-3xl blur-xl opacity-30 group-hover:opacity-80 transition-all duration-500"></div>

              <div className="relative bg-white rounded-3xl border border-[#239DD7]/20 overflow-hidden shadow-2xl group-hover:shadow-pink-500/30 group-hover:scale-[1.02] transition-all duration-500">
                <div className="p-12 md:p-16">
                  {/* Icon */}
                  <div className="flex justify-center mb-10">
                    <div className="relative group/icon">
                      <div className="absolute -inset-2 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-2xl blur-lg opacity-30 group-hover/icon:opacity-70 transition-opacity duration-500"></div>
                      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-[#239DD7]/20 shadow-lg group-hover/icon:scale-110 group-hover/icon:rotate-6 transition-all duration-500">
                        {React.createElement(steps[currentStep].icon, { className: "w-12 h-12 text-[#239DD7] group-hover/icon:scale-110 transition-transform duration-500" })}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {steps[currentStep].description}
                    </p>
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex justify-center gap-3 mt-12">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`group/dot relative transition-all ${
                          index === currentStep ? 'w-12' : 'w-3'
                        }`}
                      >
                        {index === currentStep && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-full blur-md"></div>
                        )}
                        <div className={`relative h-3 rounded-full transition-all duration-300 ${
                          index === currentStep
                            ? 'bg-gradient-to-r from-[#DE1B5D] to-pink-500'
                            : 'bg-gray-300 group-hover/dot:bg-gray-400 group-hover/dot:scale-125'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevStep}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-16 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-full blur-lg opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative bg-white hover:bg-gray-50 p-4 rounded-full border border-[#239DD7]/20 shadow-2xl transition-all hover:scale-125 hover:rotate-12 hover:shadow-pink-500/30 duration-500">
                <ChevronLeft className="w-6 h-6 text-[#239DD7] group-hover:text-[#DE1B5D] group-hover:scale-110 transition-all duration-300" />
              </div>
            </button>
            <button
              onClick={nextStep}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-16 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-full blur-lg opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative bg-white hover:bg-gray-50 p-4 rounded-full border border-[#239DD7]/20 shadow-2xl transition-all hover:scale-125 hover:-rotate-12 hover:shadow-pink-500/30 duration-500">
                <ChevronRight className="w-6 h-6 text-[#239DD7] group-hover:text-[#DE1B5D] group-hover:scale-110 transition-all duration-300" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Hasil SIVANA Section - Light Mode */}
      <section className="relative bg-gradient-to-b from-white via-blue-50 to-white py-32 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(35, 157, 215, 0.1) 0px, transparent 2px, transparent 40px), repeating-linear-gradient(90deg, rgba(222, 27, 93, 0.1) 0px, transparent 2px, transparent 40px)',
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full border border-[#239DD7]/20 text-sm font-mono text-[#239DD7] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-110 hover:border-[#DE1B5D]/70 hover:bg-white hover:text-[#DE1B5D] transition-all duration-500 cursor-default hover:rotate-2">
                IMPACT ANALYSIS
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent">
                Hasil SIVANA
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Perbedaan signifikan dalam proses seleksi ASN
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Tanpa SIVANA */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-700 rounded-2xl blur opacity-20 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-red-500/30 hover:border-red-500/80 transition-all shadow-lg hover:shadow-2xl hover:shadow-red-500/20 transform hover:-translate-y-3 hover:scale-[1.02] duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative group/icon-tanpa">
                    <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-30 group-hover/icon-tanpa:opacity-70 transition-opacity duration-500"></div>
                    <div className="relative bg-red-500 p-3 rounded-xl shadow-lg group-hover/icon-tanpa:scale-110 group-hover/icon-tanpa:rotate-12 transition-all duration-500">
                      <X className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 group-hover:scale-105 transition-all duration-300">
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
                    <li key={index} className="flex items-start gap-3 group/item">
                      <div className="relative mt-1">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-30"></div>
                        <X className="relative w-5 h-5 text-red-500 flex-shrink-0" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dengan SIVANA */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-90 transition-opacity duration-500"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-[#239DD7]/30 hover:border-[#239DD7] transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transform hover:-translate-y-3 hover:scale-[1.02] duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative group/icon-dengan">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-xl blur-md opacity-50 group-hover/icon-dengan:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-gradient-to-r from-[#239DD7] to-cyan-500 p-3 rounded-xl shadow-lg group-hover/icon-dengan:scale-110 group-hover/icon-dengan:rotate-12 transition-all duration-500">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#239DD7] group-hover:scale-105 transition-all duration-300">
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
                      <div className="relative mt-1">
                        <div className="absolute inset-0 bg-[#239DD7] rounded-full blur-sm opacity-50"></div>
                        <Check className="relative w-5 h-5 text-[#239DD7] flex-shrink-0" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stats - Pink Gradient Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { value: "70%", label: "Penghematan Waktu" },
              { value: "60%", label: "Penurunan Biaya Operasional" },
              { value: "99%", label: "Akurasi Verifikasi" }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#DE1B5D] to-pink-500 p-8 rounded-2xl border border-white shadow-xl text-center transform group-hover:scale-[1.15] group-hover:-translate-y-4 group-hover:rotate-3 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/50">
                  <div className="text-5xl md:text-6xl font-bold mb-3 text-white group-hover:scale-125 transition-transform duration-500">
                    {stat.value}
                  </div>
                  <div className="text-white/90 font-medium group-hover:scale-110 transition-transform duration-300">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Light Blue */}
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 py-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#239DD7]/10 via-transparent to-cyan-400/10"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full border border-[#239DD7]/20 text-sm font-mono text-[#239DD7] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-110 hover:border-[#DE1B5D]/70 hover:bg-white hover:text-[#DE1B5D] transition-all duration-500 cursor-default hover:rotate-2">
                FAQ
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-xl text-gray-700">
              Pertanyaan yang sering diajukan tentang SIVANA
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl border border-[#239DD7]/20 overflow-hidden hover:border-[#DE1B5D] transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 transform hover:-translate-y-3 hover:scale-[1.02]">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center transition-colors"
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4 group-hover:text-[#DE1B5D] group-hover:scale-105 transition-all duration-300">
                      {faq.question}
                    </span>
                    <div className="relative">
                      <div className={`absolute inset-0 bg-[#DE1B5D] rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${openFaq === index ? 'opacity-60' : ''}`}></div>
                      <ChevronRight
                        className={`relative w-6 h-6 text-gray-600 group-hover:text-[#DE1B5D] group-hover:scale-125 flex-shrink-0 transition-all duration-300 ${
                          openFaq === index ? 'rotate-90 text-[#DE1B5D]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {openFaq === index && (
                    <div className="px-8 pb-6 text-gray-700 leading-relaxed animate-slide-up border-t border-gray-100 pt-6">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Section - Light Blue CTA */}
      <section className="relative bg-gradient-to-b from-white via-blue-50 to-white py-32 px-6 overflow-hidden">
        {/* Radial Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-[#239DD7]/10 via-transparent to-transparent"></div>
        </div>

        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#239DD7] rounded-full animate-float opacity-40"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-[#DE1B5D] rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#239DD7] rounded-full animate-float opacity-40" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Main CTA Box */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#DE1B5D] via-pink-500 to-[#DE1B5D] rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition"></div>

            <div className="relative bg-white p-12 md:p-16 rounded-3xl border border-[#239DD7]/20 shadow-2xl">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent">
                  Siap Mencoba SIVANA?
                </span>
              </h2>
              <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                Bergabunglah dengan sistem seleksi ASN yang lebih objektif, efisien, dan terpercaya. Mulai pengalaman Anda dengan SIVANA hari ini.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group/btn relative w-full sm:w-auto"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur opacity-50 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-r from-[#DE1B5D] to-pink-500 px-10 py-4 rounded-xl font-semibold text-lg text-white transition-all group-hover/btn:scale-[1.15] group-hover/btn:-translate-y-2 group-hover/btn:rotate-2 shadow-lg hover:shadow-2xl hover:shadow-pink-500/50 duration-500">
                    <span className="group-hover/btn:scale-110 inline-block transition-transform duration-300">Coba Sebagai Pendaftar</span>
                  </div>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group/btn relative w-full sm:w-auto"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur opacity-0 group-hover/btn:opacity-80 transition-opacity duration-500"></div>
                  <div className="relative bg-transparent border-2 border-[#DE1B5D] px-10 py-4 rounded-xl font-semibold text-lg text-[#DE1B5D] hover:text-white hover:bg-[#DE1B5D]/20 backdrop-blur-xl transition-all group-hover/btn:scale-[1.15] group-hover/btn:-translate-y-2 group-hover/btn:rotate-2 hover:shadow-2xl hover:shadow-pink-500/30 duration-500">
                    <span className="group-hover/btn:scale-110 inline-block transition-transform duration-300">Coba Sebagai Admin</span>
                  </div>
                </button>
              </div>

              {/* Feature Pills */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Shield, title: "Aman & Terpercaya", desc: "Enkripsi end-to-end untuk semua data" },
                  { icon: Clock, title: "Cepat & Efisien", desc: "Hemat waktu hingga 70%" },
                  { icon: Users, title: "Dukungan 24/7", desc: "TanyaBKN siap membantu Anda" }
                ].map((feature, index) => (
                  <div key={index} className="group/feature relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur opacity-0 group-hover/feature:opacity-70 transition-opacity duration-500"></div>
                    <div className="relative bg-white backdrop-blur-xl p-6 rounded-xl border border-[#239DD7]/20 hover:border-[#DE1B5D] transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 transform hover:-translate-y-3 hover:scale-[1.05]">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-lg blur-md opacity-30 group-hover/feature:opacity-80 transition-opacity duration-500"></div>
                          <div className="relative bg-gradient-to-br from-[#DE1B5D] to-pink-500 p-3 rounded-lg flex-shrink-0 shadow-lg transform group-hover/feature:scale-125 group-hover/feature:rotate-12 transition-all duration-500">
                            <feature.icon className="w-6 h-6 text-white group-hover/feature:scale-110 transition-transform duration-300" />
                          </div>
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900 mb-1 group-hover/feature:text-[#DE1B5D] group-hover/feature:scale-105 transition-all duration-300">{feature.title}</h4>
                          <p className="text-gray-600 text-sm">{feature.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <CobaSivanaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
