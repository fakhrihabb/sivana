"use client";

import { useState, useEffect } from "react";

export default function DocumentStatus({
  status,
  uploadedDocs,
  formasiName,
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (status?.stage === "completed") {
      setTimeout(() => setShowDetails(true), 500);
    }
  }, [status]);

  const getStageText = (stage) => {
    switch (stage) {
      case "upload":
        return "Mengunggah dokumen ke server...";
      case "ocr":
        return "Membaca teks dari dokumen (OCR)...";
      case "verification":
        return "Memverifikasi kesesuaian dengan persyaratan...";
      case "forensics":
        return "Melakukan analisis forensik dokumen...";
      case "completed":
        return "Verifikasi selesai!";
      default:
        return "Memproses...";
    }
  };

  const getVerificationSummary = () => {
    const docs = Object.values(uploadedDocs);
    const verified = docs.filter((d) => d.result.status === "verified").length;
    const needsReview = docs.filter(
      (d) => d.result.status === "needs_review"
    ).length;
    const rejected = docs.filter((d) => d.result.status === "rejected").length;

    return { verified, needsReview, rejected, total: docs.length };
  };

  const summary = getVerificationSummary();

  if (!status) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      {status.stage !== "completed" ? (
        <div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-blue/10 rounded-full mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Memproses Dokumen Anda
            </h2>
            <p className="text-gray-600">{getStageText(status.stage)}</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-pink transition-all duration-500 ease-out"
                  style={{ width: `${status.progress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {status.progress}%
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {["upload", "ocr", "verification", "forensics"].map(
                (stage, idx) => {
                  const isCompleted =
                    status.progress > idx * 25 || status.stage === "completed";
                  const isCurrent = status.stage === stage;

                  return (
                    <div
                      key={stage}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isCurrent
                          ? "bg-blue-50 border border-blue-200"
                          : isCompleted
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "bg-brand-blue text-white"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent || isCompleted
                              ? "text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {stage === "upload" && "Upload Dokumen"}
                          {stage === "ocr" && "Optical Character Recognition"}
                          {stage === "verification" && "Verifikasi Kesesuaian"}
                          {stage === "forensics" && "Analisis Forensik"}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-gray-600 mt-1">
                            Sedang berjalan...
                          </p>
                        )}
                        {isCompleted && !isCurrent && (
                          <p className="text-xs text-green-600 mt-1">Selesai</p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Selesai!
            </h2>
            <p className="text-gray-600">
              Dokumen Anda telah diverifikasi dan dianalisis oleh sistem SIVANA
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Terverifikasi
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {summary.verified}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {summary.needsReview > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">
                      Perlu Peninjauan
                    </p>
                    <p className="text-3xl font-bold text-yellow-900 mt-1">
                      {summary.needsReview}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {summary.rejected > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-medium">Ditolak</p>
                    <p className="text-3xl font-bold text-red-900 mt-1">
                      {summary.rejected}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Application Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              Ringkasan Pendaftaran
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-800">Formasi:</span>
                <span className="text-blue-900 font-medium">{formasiName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-800">Nomor Pendaftaran:</span>
                <span className="text-blue-900 font-medium">
                  REG-2025-{Math.floor(Math.random() * 1000000)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-800">Tanggal Submit:</span>
                <span className="text-blue-900 font-medium">
                  {new Date().toLocaleString("id-ID", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-800">Status:</span>
                <span className="text-blue-900 font-medium">
                  {summary.rejected > 0
                    ? "Perlu Perbaikan Dokumen"
                    : summary.needsReview > 0
                    ? "Menunggu Verifikasi Manual"
                    : "Lolos Verifikasi Otomatis"}
                </span>
              </div>
            </div>
          </div>

          {/* Document Details */}
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 mb-4"
            >
              <span className="font-semibold text-gray-900">
                Detail Dokumen ({summary.total} file)
              </span>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  showDetails ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDetails && (
              <div className="space-y-4 mb-6">
                {Object.entries(uploadedDocs).map(([docId, doc]) => (
                  <div
                    key={docId}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {doc.result.fileName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.result.fileSize}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doc.result.status === "verified"
                            ? "bg-green-100 text-green-700"
                            : doc.result.status === "needs_review"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {doc.result.status === "verified" && "✓ Terverifikasi"}
                        {doc.result.status === "needs_review" &&
                          "⚠ Perlu Peninjauan"}
                        {doc.result.status === "rejected" && "✗ Ditolak"}
                      </div>
                    </div>

                    {/* Forensic Score */}
                    {doc.result.forensics && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">
                            Skor Autentikasi
                          </span>
                          <span className="text-xs font-medium text-gray-900">
                            {doc.result.forensics.authenticity}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              doc.result.forensics.authenticity >= 95
                                ? "bg-green-500"
                                : doc.result.forensics.authenticity >= 85
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${doc.result.forensics.authenticity}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {doc.result.warnings && doc.result.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                        <p className="text-xs text-yellow-800 font-medium mb-1">
                          Peringatan:
                        </p>
                        {doc.result.warnings.map((warning, idx) => (
                          <p key={idx} className="text-xs text-yellow-700">
                            • {warning}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Key Info */}
                    {Object.keys(doc.result.extractedData).length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(doc.result.extractedData)
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key}>
                              <p className="text-xs text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="text-sm text-gray-900 font-medium truncate">
                                {value}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Langkah Selanjutnya
            </h3>
            <div className="space-y-3">
              {summary.rejected === 0 && summary.needsReview === 0 ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0 text-sm">
                      1
                    </div>
                    <p className="text-sm text-gray-700">
                      Verifikator akan melakukan peninjauan akhir dalam 1-3 hari
                      kerja
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0 text-sm">
                      2
                    </div>
                    <p className="text-sm text-gray-700">
                      Anda akan menerima notifikasi melalui email dan SMS
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0 text-sm">
                      3
                    </div>
                    <p className="text-sm text-gray-700">
                      Pantau terus portal SSCASN untuk informasi jadwal ujian
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                      1
                    </div>
                    <p className="text-sm text-gray-700">
                      Periksa dokumen yang memerlukan perbaikan atau peninjauan
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                      2
                    </div>
                    <p className="text-sm text-gray-700">
                      Siapkan dokumen yang valid dan unggah kembali
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                      3
                    </div>
                    <p className="text-sm text-gray-700">
                      Hubungi bantuan jika memerlukan klarifikasi
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Cetak Bukti
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
