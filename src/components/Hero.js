'use client';
import Image from "next/image";
import { useState } from "react";
import QuestionnaireModal from "./QuestionnaireModal";

export default function Hero() {
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);

  const handleScrollToFormasi = () => {
    const formasiSection = document.getElementById('daftar-formasi');
    if (formasiSection) {
      formasiSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 py-20 md:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
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

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          {/* Logo with enhanced animation */}
          <div className="flex justify-center mb-10 animate-fade-in">
            <div className="group/logo relative w-32 h-32 md:w-44 md:h-44">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#239DD7] via-cyan-400 to-[#239DD7] rounded-full blur-2xl opacity-30 group-hover/logo:opacity-60 animate-pulse transition-opacity duration-500"></div>
              <div className="relative w-full h-full transform group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500">
                <Image
                  src="/images/hero-image.png"
                  alt="SIVANA x SSCASN"
                  fill
                  className="object-contain relative z-10 drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Text content with enhanced gradients */}
          <div className="text-center mb-12 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-slide-right">
              <span className="bg-gradient-to-r from-[#239DD7] via-cyan-500 to-[#DE1B5D] bg-clip-text text-transparent">
                SIVANA x SSCASN
              </span>
            </h1>

            <div className="group/badge inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:bg-white transition-all duration-500 cursor-default border border-[#239DD7]/20">
              <div className="w-2 h-2 bg-[#DE1B5D] rounded-full animate-pulse group-hover/badge:scale-150 transition-transform duration-300"></div>
              <p className="text-sm font-semibold text-[#239DD7] group-hover/badge:text-[#DE1B5D] transition-colors duration-300">
                Powered by AI Technology
              </p>
            </div>

            <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
              Sistem Informasi Verifikasi Administrasi Nasional untuk seleksi
              Aparatur Sipil Negara. Daftar sekarang dan raih kesempatan untuk
              mengabdi kepada negara.
            </p>
          </div>

          {/* Enhanced Action buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button
              onClick={() => setShowQuestionnaireModal(true)}
              className="group relative px-10 py-4 bg-gradient-to-r from-[#DE1B5D] to-pink-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.15] hover:shadow-[0_0_50px_rgba(222,27,93,0.8)] hover:-translate-y-2 hover:rotate-2 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-[#DE1B5D] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Temukan Formasi Ideal
              </span>
            </button>

            <button
              onClick={handleScrollToFormasi}
              className="group px-10 py-4 bg-white/50 backdrop-blur-xl text-[#239DD7] font-semibold rounded-xl border-2 border-[#239DD7]/30 hover:border-[#239DD7] hover:bg-white hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:rotate-1 shadow-lg"
            >
              <span className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Eksplor Formasi
              </span>
            </button>
          </div>

        </div>
      </section>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={showQuestionnaireModal}
        onClose={() => setShowQuestionnaireModal(false)}
      />
    </>
  );
}
