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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Verifikasi Dokumen AI
          </h1>
          <p className="text-gray-600">
            Sistem verifikasi dokumen otomatis dengan OCR, analisis kualitas, dan deteksi fraud
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'verify'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Verifikasi Dokumen
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Riwayat Verifikasi ({verificationResults.length})
          </button>
        </div>

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <DocumentVerification onVerificationComplete={handleVerificationComplete} />
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {verificationResults.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                Belum ada riwayat verifikasi. Silakan verifikasi dokumen terlebih dahulu.
              </p>
            ) : (
              <div className="space-y-4">
                {verificationResults.map((result, idx) => (
                  <DocumentStatus key={idx} result={result} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">ℹ️ Informasi Verifikasi</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Dokumen harus berupa gambar (JPG, PNG, PDF)</li>
            <li>Ukuran file maksimal 5MB</li>
            <li>Dokumen harus jelas dan tidak blur</li>
            <li>Hasil verifikasi: APPROVED, NEED_REVIEW, atau REJECTED</li>
            <li>Sistem melakukan OCR, analisis kualitas, dan deteksi fraud secara otomatis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
