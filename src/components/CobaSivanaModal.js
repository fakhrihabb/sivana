'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CobaSivanaModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handlePendaftar = () => {
    router.push('/sscasn');
    onClose();
  };

  const handleAdmin = () => {
    router.push('/admin');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-md w-full">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-3xl blur-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"></div>

        {/* Modal Content */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#239DD7]/20 transform animate-scale-in">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#239DD7] rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#DE1B5D] rounded-br-3xl"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 group p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors group-hover:scale-110 duration-300" />
          </button>

          {/* Modal Content */}
          <div className="text-center space-y-8 relative z-10 pt-4">
            {/* Icon with animated background */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#239DD7] via-cyan-500 to-[#DE1B5D] rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-100 to-cyan-50 p-6 rounded-2xl shadow-xl">
                  <div className="bg-gradient-to-br from-[#239DD7] to-cyan-500 p-4 rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#239DD7] via-gray-900 to-[#DE1B5D] bg-clip-text text-transparent mb-3">
                Anda ingin mencoba SIVANA sebagai siapa?
              </h2>
              <p className="text-gray-600 text-lg">
                Pilih peran Anda untuk memulai pengalaman
              </p>
            </div>

            <div className="space-y-4 pt-6">
              {/* Pendaftar Button */}
              <button
                onClick={handlePendaftar}
                className="group relative w-full overflow-hidden"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-r from-[#DE1B5D] to-pink-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-500 group-hover:scale-[1.08] group-hover:shadow-2xl group-hover:shadow-pink-500/50 group-hover:-translate-y-1">
                  <span className="flex items-center justify-center gap-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    Pendaftar CASN
                  </span>
                </div>
              </button>

              {/* Admin Button */}
              <button
                onClick={handleAdmin}
                className="group relative w-full overflow-hidden"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white border-2 border-[#239DD7] text-[#239DD7] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-500 group-hover:bg-[#239DD7] group-hover:text-white group-hover:scale-[1.08] group-hover:shadow-2xl group-hover:shadow-blue-500/50 group-hover:-translate-y-1 group-hover:border-transparent">
                  <span className="flex items-center justify-center gap-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Admin & Petugas SSCASN
                  </span>
                </div>
              </button>
            </div>

            {/* Feature Pills */}
            {/* Removed feature pills section */}
          </div>
        </div>
      </div>
    </div>
  );
}
