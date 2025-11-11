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
      <section className="relative bg-gradient-to-br from-brand-blue/10 via-white to-brand-pink/10 py-16 md:py-24 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-brand-blue/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo with animation */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative w-32 h-32 md:w-40 md:h-40 transform hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-brand-pink/20 rounded-full blur-xl animate-pulse"></div>
              <Image
                src="/images/hero-image.png"
                alt="SIVANA x SSCASN"
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Text content with gradient */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-brand-blue via-purple-600 to-brand-pink bg-clip-text text-transparent mb-4 animate-fade-in">
              SIVANA x SSCASN
            </h1>
            <div className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-4">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowQuestionnaireModal(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-blue/80 text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-pink to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Temukan Formasi Ideal
              </span>
            </button>
            <button
              onClick={handleScrollToFormasi}
              className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-brand-blue font-semibold rounded-xl border-2 border-brand-blue/30 hover:border-brand-blue hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
