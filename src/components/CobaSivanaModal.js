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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Anda ingin mencoba SIVANA sebagai siapa?
          </h2>

          <div className="space-y-4 pt-4">
            {/* Pendaftar Button - Gradient */}
            <button
              onClick={handlePendaftar}
              className="w-full bg-gradient-to-r from-[#239DD7] to-[#DE1B5D] hover:from-[#1e8ac4] hover:to-[#c91e52] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105 shadow-lg"
            >
              Pendaftar
            </button>

            {/* Admin Button - Outlined */}
            <button
              onClick={handleAdmin}
              className="w-full bg-white border-2 border-[#239DD7] text-[#239DD7] hover:bg-[#239DD7] hover:text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105 shadow-md"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
