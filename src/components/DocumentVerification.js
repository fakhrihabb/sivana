"use client";

import { useState, useEffect } from "react";

// Document validation keywords for each document type
const DOCUMENT_KEYWORDS = {
  ktp: {
    name: "Kartu Tanda Penduduk",
    keywords: [
      "ktp",
      "tanda penduduk",
      "nomer identitas",
      "nik",
      "kartu tanda",
      "republic indonesia",
      "nomor identitas",
    ],
  },
  ijazah: {
    name: "Ijazah",
    keywords: [
      "ijazah",
      "diploma",
      "sarjana",
      "s1",
      "s2",
      "s3",
      "universitas",
      "akademi",
      "sekolah tinggi",
      "no ijazah",
    ],
  },
  transkrip: {
    name: "Transkrip Nilai",
    keywords: [
      "transkrip",
      "transcript",
      "nilai",
      "grade",
      "semester",
      "gpa",
      "cumulative",
      "hasil studi",
    ],
  },
  surat_lamaran: {
    name: "Surat Lamaran",
    keywords: [
      "surat lamaran",
      "lamaran",
      "permohonan",
      "application",
      "melamar",
      "kepada yth",
    ],
  },
};

export default function DocumentVerification({ onVerificationComplete }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("ktp");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documentWarning, setDocumentWarning] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Function to detect document type from filename
  const detectDocumentType = (filename) => {
    const lowerFilename = filename.toLowerCase();
    let detected = null;
    let confidence = 0;

    for (const [type, data] of Object.entries(DOCUMENT_KEYWORDS)) {
      const matchCount = data.keywords.filter((keyword) =>
        lowerFilename.includes(keyword)
      ).length;
      if (matchCount > confidence) {
        confidence = matchCount;
        detected = type;
      }
    }

    return { detected, confidence };
  };

  // Function to validate if document matches selected type
  const validateDocumentType = (filename, selectedType) => {
    const { detected, confidence } = detectDocumentType(filename);

    // Create warning based on detection
    let warning = null;

    if (detected && detected !== selectedType) {
      warning = {
        level: "warning",
        title: `⚠️ Dokumen Tidak Cocok`,
        message: `Nama file menunjukkan dokumen ${DOCUMENT_KEYWORDS[detected]?.name || "tidak dikenal"}, tetapi Anda memilih ${DOCUMENT_KEYWORDS[selectedType].name}. Pastikan dokumen sudah benar sebelum melanjutkan.`,
      };
    } else if (!detected) {
      warning = {
        level: "info",
        title: "ℹ️ Tidak Bisa Deteksi Tipe Dokumen",
        message: `Sistem tidak bisa mendeteksi tipe dokumen dari nama file. Pastikan Anda memilih tipe dokumen yang tepat: ${DOCUMENT_KEYWORDS[selectedType].name}`,
      };
    }

    return warning;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);

      // Validate document type
      const warning = validateDocumentType(selectedFile.name, documentType);
      setDocumentWarning(warning);

      // Create file preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Re-validate when document type changes
  useEffect(() => {
    if (file) {
      const warning = validateDocumentType(file.name, documentType);
      setDocumentWarning(warning);
    }
  }, [documentType, file]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Pilih file dokumen terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memverifikasi dokumen");
      }

      setResult(data.data);

      // Call callback if provided
      if (onVerificationComplete) {
        onVerificationComplete({
          fileName: file.name,
          documentType,
          timestamp: new Date(),
          ...data.data,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipe Dokumen
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ktp">KTP</option>
            <option value="ijazah">Ijazah</option>
            <option value="transkrip">Transkrip Nilai</option>
            <option value="surat_lamaran">Surat Lamaran</option>
            <option value="surat_pernyataan">Surat Pernyataan</option>
            <option value="other">Dokumen Lainnya</option>
          </select>
        </div>

      {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* File Status */}
          {file && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-green-600">
                ✓ File terpilih: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>

              {/* File Preview Thumbnail */}
              {filePreview && (
                <div className="mt-2 relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Document Type Warning/Info */}
          {documentWarning && (
            <div
              className={`mt-3 p-3 rounded-lg border-l-4 ${
                documentWarning.level === "warning"
                  ? "bg-yellow-50 border-yellow-400"
                  : "bg-blue-50 border-blue-400"
              }`}
            >
              <p
                className={`font-medium text-sm ${
                  documentWarning.level === "warning"
                    ? "text-yellow-800"
                    : "text-blue-800"
                }`}
              >
                {documentWarning.title}
              </p>
              <p
                className={`text-xs mt-1 ${
                  documentWarning.level === "warning"
                    ? "text-yellow-700"
                    : "text-blue-700"
                }`}
              >
                {documentWarning.message}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
        >
          {loading ? "⏳ Memverifikasi..." : "✓ Verifikasi Dokumen"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Verdict - Main Result */}
          <div
            className={`p-4 rounded-lg border-l-4 ${
              result.verdict.status === "APPROVED"
                ? "bg-green-50 border-green-500"
                : result.verdict.status === "REJECTED"
                  ? "bg-red-50 border-red-500"
                  : "bg-yellow-50 border-yellow-500"
            }`}
          >
            <h3 className="font-bold text-lg mb-2">Hasil Verifikasi</h3>
            <div
              className={`text-2xl font-bold mb-3 ${
                result.verdict.status === "APPROVED"
                  ? "text-green-600"
                  : result.verdict.status === "REJECTED"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {result.verdict.status === "APPROVED" && "✅ DISETUJUI"}
              {result.verdict.status === "REJECTED" && "❌ DITOLAK"}
              {result.verdict.status === "NEED_REVIEW" && "⚠️ PERLU REVIEW"}
            </div>

            {result.verdict.reasons.length > 0 && (
              <div>
                <p className="font-medium text-gray-700 mb-2">Catatan:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {result.verdict.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.verdict.reasons.length === 0 && (
              <p className="text-gray-700">Dokumen lolos semua pemeriksaan ✓</p>
            )}
          </div>

          {/* Quality Analysis */}
          {result.analysis?.success && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold mb-3 text-gray-900">📋 Analisis Kualitas</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Status Blur:</p>
                  <p className="font-medium text-gray-900">
                    {result.analysis.analysis?.quality?.isBlurry ? "❌ Blur" : "✅ Jelas"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Kelengkapan:</p>
                  <p className="font-medium text-gray-900">
                    {result.analysis.analysis?.quality?.isComplete ? "✅ Lengkap" : "❌ Terpotong"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Field Terdeteksi:</p>
                  <p className="font-medium text-gray-900">
                    {Math.round(result.analysis.analysis?.completeness * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Confidence:</p>
                  <p className="font-medium text-gray-900">
                    {Math.round(result.analysis.analysis?.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OCR Result */}
          {result.ocr?.success && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold mb-2 text-gray-900">📄 Hasil OCR</h3>
              <div className="bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {result.ocr.text?.substring(0, 500)}
                  {result.ocr.text?.length > 500 && "..."}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Confidence: {Math.round(result.ocr.confidence * 100)}%
              </p>
            </div>
          )}

          {/* Fraud Detection */}
          {result.fraud?.success && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold mb-3 text-gray-900">🔍 Deteksi Fraud</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Indikasi Dokumen Palsu:</span>
                  <span
                    className={`font-bold ${
                      result.fraud.isSuspicious ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {result.fraud.isSuspicious ? "⚠️ TERDETEKSI" : "✅ TIDAK ADA"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Score Authenticity:</span>
                  <span className="font-bold text-gray-900">
                    {Math.round(result.fraud.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

