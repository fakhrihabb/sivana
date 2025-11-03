'use client';
import Image from "next/image";
import { useState } from "react";

export default function Hero() {
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvFile, setCVFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleScrollToFormasi = () => {
    const formasiSection = document.getElementById('daftar-formasi');
    if (formasiSection) {
      formasiSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setCVFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setCVFile(file);
    }
  };

  const handleAnalyzeCV = () => {
    if (!cvFile) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis with dummy data
    setTimeout(() => {
      setAnalysisResult({
        summary: "Berdasarkan analisis CV Anda, kami menemukan kecocokan dengan beberapa formasi yang tersedia.",
        matchedFormations: [
          {
            id: 5,
            name: "Pranata Komputer",
            lembaga: "Kementerian Komunikasi dan Informatika",
            lokasi: "Jakarta Pusat",
            matchScore: 95,
            reasons: ["Pengalaman di bidang IT", "Pendidikan sesuai", "Keahlian programming"]
          },
          {
            id: 1,
            name: "Analis Kebijakan",
            lembaga: "Kementerian Keuangan",
            lokasi: "Jakarta Pusat",
            matchScore: 78,
            reasons: ["Kemampuan analisis data", "Pengalaman riset"]
          },
          {
            id: 6,
            name: "Analis Sumber Daya Manusia",
            lembaga: "Badan Kepegawaian Negara",
            lokasi: "Jakarta Selatan",
            matchScore: 72,
            reasons: ["Kemampuan komunikasi", "Pengalaman organisasi"]
          }
        ]
      });
      setAnalyzing(false);
    }, 2000);
  };

  const resetModal = () => {
    setShowCVModal(false);
    setCVFile(null);
    setAnalysisResult(null);
    setAnalyzing(false);
    setIsDragging(false);
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
              onClick={() => setShowCVModal(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-blue/80 text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-pink to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analisa CV dengan AI
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

      {/* CV Analysis Modal */}
      {showCVModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform animate-scale-in">
            {/* Modal Header with Gradient */}
            <div className="sticky top-0 bg-gradient-to-r from-brand-blue to-brand-pink px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Analisa CV dengan AI
                  </h2>
                  <p className="text-xs text-white/80">Temukan formasi yang cocok untuk Anda</p>
                </div>
              </div>
              <button
                onClick={resetModal}
                className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {!analysisResult ? (
                <>
                  {/* Upload Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs">1</span>
                      Upload CV Anda (PDF/DOCX)
                    </label>
                    
                    {!cvFile ? (
                      <div 
                        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                          isDragging 
                            ? 'border-brand-blue bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 scale-105' 
                            : 'border-gray-300 hover:border-brand-blue hover:bg-gray-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCVUpload}
                          className="hidden"
                          id="cv-upload"
                        />
                        <label
                          htmlFor="cv-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg
                              className="w-10 h-10 text-brand-blue"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <span className="text-brand-blue font-semibold text-lg mb-1">
                            Klik untuk upload file
                          </span>
                          <span className="text-gray-500 text-sm">
                            atau drag and drop file kesini
                          </span>
                          <span className="text-xs text-gray-400 mt-2">
                            Maksimal 10MB • PDF, DOC, DOCX
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="border-2 border-brand-blue/30 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl"></div>
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
                              <svg
                                className="w-7 h-7 text-brand-blue"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                {cvFile.name}
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Siap</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {(cvFile.size / 1024).toFixed(2)} KB • {cvFile.type.split('/')[1].toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setCVFile(null)}
                            className="ml-4 w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shadow-sm hover:shadow"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analyze Button */}
                  {analyzing ? (
                    <div className="relative bg-gradient-to-br from-brand-blue/5 via-purple-50/50 to-brand-pink/5 rounded-2xl p-10 border-2 border-brand-blue/20 overflow-hidden">
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-brand-pink/5 animate-pulse"></div>
                      
                      <div className="relative flex flex-col items-center space-y-5">
                        {/* AI Brain Icon with Multiple Rings */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-brand-blue/30 rounded-full animate-ping"></div>
                          <div className="absolute inset-0 bg-brand-pink/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                          <div className="relative w-20 h-20 bg-gradient-to-br from-brand-blue via-purple-500 to-brand-pink rounded-full flex items-center justify-center shadow-2xl">
                            <svg
                              className="w-10 h-10 text-white animate-pulse"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Loading Text with Gradient */}
                        <div className="text-center space-y-2">
                          <p className="text-lg font-bold bg-gradient-to-r from-brand-blue to-brand-pink bg-clip-text text-transparent">
                            AI sedang menganalisis CV Anda
                          </p>
                          <p className="text-gray-600 text-sm">Memproses data dan mencocokkan formasi...</p>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="w-full max-w-xs">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-blue via-purple-500 to-brand-pink animate-pulse"></div>
                          </div>
                        </div>
                        
                        {/* Progress Dots */}
                        <div className="flex space-x-2">
                          <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2.5 h-2.5 bg-brand-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAnalyzeCV}
                      disabled={!cvFile}
                      className={`group relative w-full py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                        cvFile
                          ? 'bg-gradient-to-r from-brand-blue to-brand-pink text-white shadow-lg hover:shadow-2xl transform hover:scale-105'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {cvFile && (
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-pink to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                      <span className="relative flex items-center justify-center gap-2 text-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analisa CV Sekarang
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Analysis Results */}
                  <div className="mb-6">
                    {/* Success Banner */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-300/20 rounded-full blur-2xl"></div>
                      <div className="relative flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 mb-1">Analisis Selesai!</p>
                          <p className="text-sm text-green-700">{analysisResult.summary}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-pink text-white rounded-lg flex items-center justify-center text-sm">
                          {analysisResult.matchedFormations.length}
                        </span>
                        Formasi yang Cocok
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Urutan berdasarkan kecocokan
                      </span>
                    </div>

                    <div className="space-y-3">
                      {analysisResult.matchedFormations.map((formasi, index) => (
                        <div
                          key={formasi.id}
                          className="group relative border-2 border-gray-200 rounded-2xl p-5 hover:border-brand-blue hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                          onClick={() => {
                            window.location.href = `/formasi/${formasi.id}`;
                          }}
                        >
                          {/* Gradient Background on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Rank Badge */}
                          <div className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                          
                          <div className="relative pl-10">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-brand-blue transition-colors">
                                  {formasi.name}
                                </h4>
                                <p className="text-sm text-gray-600 font-medium mb-1">
                                  {formasi.lembaga}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {formasi.lokasi}
                                </p>
                              </div>
                              
                              {/* Match Score with Gradient */}
                              <div className={`relative px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                                formasi.matchScore >= 90 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                                  : formasi.matchScore >= 75 
                                  ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {formasi.matchScore}%
                                </div>
                              </div>
                            </div>
                            
                            {/* Reasons Tags */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Alasan kecocokan:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {formasi.reasons.map((reason, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gradient-to-r from-brand-blue/10 to-brand-pink/10 text-brand-blue font-medium px-3 py-1.5 rounded-lg border border-brand-blue/20"
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {/* Click Indicator */}
                            <div className="mt-3 flex items-center text-brand-blue text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Klik untuk lihat detail</span>
                              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons with Better Design */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={resetModal}
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Analisa Ulang
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        resetModal();
                        handleScrollToFormasi();
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-brand-blue to-brand-pink text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Lihat Semua Formasi
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
