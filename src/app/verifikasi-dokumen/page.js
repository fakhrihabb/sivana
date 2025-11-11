'use client';

import { useState } from 'react';
import DocumentVerification from '@/components/DocumentVerification';
import DocumentStatus from '@/components/documents/DocumentStatus';

export default function DocumentVerificationPage() {
  const [verificationResults, setVerificationResults] = useState([]);
  const [activeTab, setActiveTab] = useState('verify');

  const handleVerificationComplete = (result) => {
    setVerificationResults(prev => [result, ...prev]);
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 py-20 px-6 overflow-hidden">
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
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="space-y-6 max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:bg-white transition-all duration-500 cursor-default border border-[#239DD7]/20">
              <div className="w-2 h-2 bg-[#DE1B5D] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-[#239DD7]">Document Verification</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-right">
              <span className="bg-gradient-to-r from-[#239DD7] via-cyan-500 to-[#DE1B5D] bg-clip-text text-transparent">
                Verifikasi Dokumen Cerdas
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
              Sistem verifikasi dokumen otomatis dengan OCR, analisis kualitas, dan deteksi fraud untuk memastikan kelengkapan dan autentisitas berkas pendaftar.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('verify')}
                className={`pb-4 px-2 font-bold text-lg transition-all duration-300 border-b-2 relative group ${
                  activeTab === 'verify'
                    ? 'border-[#239DD7] text-[#239DD7]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Verifikasi Dokumen
                </span>
                {activeTab === 'verify' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-4 px-2 font-bold text-lg transition-all duration-300 border-b-2 relative group ${
                  activeTab === 'history'
                    ? 'border-[#239DD7] text-[#239DD7]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Riwayat ({verificationResults.length})
                </span>
                {activeTab === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          {/* Verify Tab */}
          {activeTab === 'verify' && (
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#239DD7]/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="relative bg-white rounded-2xl shadow-xl border border-[#239DD7]/20 p-8 group-hover:border-[#239DD7]/50 transition-all duration-500">
                <DocumentVerification onVerificationComplete={handleVerificationComplete} />
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {verificationResults.length === 0 ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/20 to-gray-300/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6H6m0 0H0" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      Belum ada riwayat verifikasi
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Silakan verifikasi dokumen terlebih dahulu untuk melihat riwayat di sini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {verificationResults.map((result, idx) => (
                    <DocumentStatus key={idx} result={result} index={idx} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="relative bg-gradient-to-b from-white via-blue-50 to-white py-16 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#239DD7]/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative bg-white rounded-3xl border border-[#239DD7]/20 p-10 shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-xl blur-md opacity-30"></div>
                  <div className="relative bg-gradient-to-br from-[#239DD7] to-cyan-500 p-3 rounded-xl flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Informasi Verifikasi Dokumen</h3>
                  <p className="text-gray-600 mb-4">
                    Sistem kami melakukan verifikasi menyeluruh untuk memastikan dokumen Anda valid dan autentik. Berikut adalah persyaratan dan informasi penting:
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: "📄", title: "Format File", desc: "JPG, PNG, atau PDF" },
                  { icon: "📏", title: "Ukuran Maksimal", desc: "5 MB per file" },
                  { icon: "✨", title: "Kualitas Dokumen", desc: "Harus jelas dan tidak blur" },
                  { icon: "🔍", title: "Analisis Otomatis", desc: "OCR, kualitas, fraud detection" },
                  { icon: "⚡", title: "Hasil Verifikasi", desc: "APPROVED, NEED_REVIEW, REJECTED" },
                  { icon: "🛡️", title: "Keamanan", desc: "Enkripsi end-to-end untuk semua data" }
                ].map((item, idx) => (
                  <div key={idx} className="group relative">
                    {/* Card Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#239DD7]/20 to-[#DE1B5D]/20 rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                    
                    {/* Card */}
                    <div className="relative bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl border border-[#239DD7]/20 group-hover:border-[#239DD7]/50 transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 bg-gradient-to-r from-[#DE1B5D]/5 to-pink-500/5 border border-[#DE1B5D]/20 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong className="text-[#DE1B5D]">⚠️ Catatan Penting:</strong> Hasil verifikasi otomatis akan divalidasi kembali oleh tim admin untuk memastikan akurasi. Jika ada pertanyaan atau keberatan, Anda dapat mengajukan sanggahan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
