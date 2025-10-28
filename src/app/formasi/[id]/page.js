"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentStatus from "@/components/documents/DocumentStatus";

const formasiData = {
  1: {
    name: "Analis Kebijakan",
    lembaga: "Kementerian Keuangan",
    lokasi: "Jakarta Pusat",
    requirements: {
      pendidikan: "S1 Ekonomi/Akuntansi/Manajemen",
      ipk: "3.0",
      usia: "Maksimal 35 tahun",
    },
    documents: [
      { id: "ktp", name: "KTP", required: true },
      { id: "ijazah", name: "Ijazah", required: true },
      { id: "transkrip", name: "Transkrip Nilai", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
      { id: "skck", name: "SKCK", required: true },
    ],
  },
  2: {
    name: "Auditor",
    lembaga: "Badan Pemeriksa Keuangan",
    lokasi: "Jakarta Selatan",
    requirements: {
      pendidikan: "S1 Akuntansi",
      ipk: "3.25",
      usia: "Maksimal 30 tahun",
    },
    documents: [
      { id: "ktp", name: "KTP", required: true },
      { id: "ijazah", name: "Ijazah", required: true },
      { id: "transkrip", name: "Transkrip Nilai", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
      { id: "skck", name: "SKCK", required: true },
    ],
  },
  3: {
    name: "Pengawas Sekolah",
    lembaga: "Dinas Pendidikan",
    lokasi: "Jakarta Timur",
    requirements: {
      pendidikan: "S1 Pendidikan",
      ipk: "3.0",
      usia: "Maksimal 40 tahun",
    },
    documents: [
      { id: "ktp", name: "KTP", required: true },
      { id: "ijazah", name: "Ijazah", required: true },
      { id: "transkrip", name: "Transkrip Nilai", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
      { id: "skck", name: "SKCK", required: true },
    ],
  },
  4: {
    name: "Tenaga Kesehatan",
    lembaga: "Dinas Kesehatan",
    lokasi: "Jakarta Barat",
    requirements: {
      pendidikan: "S1 Kesehatan Masyarakat",
      ipk: "3.0",
      usia: "Maksimal 35 tahun",
    },
    documents: [
      { id: "ktp", name: "KTP", required: true },
      { id: "ijazah", name: "Ijazah", required: true },
      { id: "transkrip", name: "Transkrip Nilai", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
      { id: "skck", name: "SKCK", required: true },
      { id: "str", name: "STR (Surat Tanda Registrasi)", required: true },
    ],
  },
  5: {
    name: "Pranata Komputer",
    lembaga: "Kementerian Komunikasi dan Informatika",
    lokasi: "Jakarta Pusat",
    requirements: {
      pendidikan: "S1 Teknik Informatika/Sistem Informasi",
      ipk: "3.0",
      usia: "Maksimal 30 tahun",
    },
    documents: [
      { id: "ktp", name: "KTP", required: true },
      { id: "ijazah", name: "Ijazah", required: true },
      { id: "transkrip", name: "Transkrip Nilai", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
      { id: "skck", name: "SKCK", required: true },
      { id: "sertifikat", name: "Sertifikat Kompetensi (opsional)", required: false },
    ],
  },
  6: {
    name: "Analis Sumber Daya Manusia",
    lembaga: "Badan Kepegawaian Negara",
    lokasi: "Jakarta Selatan",
    requirements: {
      pendidikan: "S1 Psikologi/Manajemen SDM",
      ipk: "3.0",
      usia: "Maksimal 35 tahun",
    },
    documents: [
      { id: "ktp", name: "KTP", required: true },
      { id: "ijazah", name: "Ijazah", required: true },
      { id: "transkrip", name: "Transkrip Nilai", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
      { id: "skck", name: "SKCK", required: true },
    ],
  },
};

export default function FormasiDetail() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [processingStatus, setProcessingStatus] = useState(null);

  const formasi = formasiData[params.id];

  if (!formasi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Formasi tidak ditemukan
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const handleDocumentUpload = (docId, file, result) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: { file, result },
    }));
  };

  const handleSubmit = async () => {
    setCurrentStep(3);

    // Simulate processing with realistic timing
    setProcessingStatus({ stage: "upload", progress: 0 });

    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStatus({ stage: "ocr", progress: 25 });

    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessingStatus({ stage: "verification", progress: 50 });

    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessingStatus({ stage: "forensics", progress: 75 });

    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingStatus({ stage: "completed", progress: 100 });
  };

  const allRequiredDocsUploaded = () => {
    const requiredDocs = formasi.documents.filter((doc) => doc.required);
    return requiredDocs.every((doc) => uploadedDocs[doc.id]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="text-brand-blue hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{formasi.name}</h1>
          <p className="text-gray-600 mt-2">
            {formasi.lembaga} • {formasi.lokasi}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 1
                    ? "bg-brand-blue text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentStep >= 2 ? "bg-brand-blue" : "bg-gray-200"
                  }`}
                  style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                />
              </div>
            </div>
            <div className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 2
                    ? "bg-brand-blue text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentStep >= 3 ? "bg-brand-blue" : "bg-gray-200"
                  }`}
                  style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                />
              </div>
            </div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 3
                  ? "bg-brand-blue text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-sm font-medium text-gray-700">
              Info Formasi
            </span>
            <span className="text-sm font-medium text-gray-700">
              Upload Dokumen
            </span>
            <span className="text-sm font-medium text-gray-700">
              Verifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Persyaratan Formasi
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-brand-blue"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pendidikan</p>
                  <p className="text-gray-600">{formasi.requirements.pendidikan}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-brand-blue"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">IPK Minimal</p>
                  <p className="text-gray-600">{formasi.requirements.ipk}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-brand-blue"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Usia</p>
                  <p className="text-gray-600">{formasi.requirements.usia}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Dokumen yang perlu disiapkan:
              </h3>
              <ul className="space-y-1">
                {formasi.documents.map((doc) => (
                  <li key={doc.id} className="text-blue-800 text-sm">
                    • {doc.name} {!doc.required && "(opsional)"}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Lanjut Upload Dokumen
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Dokumen Persyaratan
            </h2>
            <p className="text-gray-600 mb-8">
              Sistem akan melakukan verifikasi otomatis menggunakan AI untuk
              memastikan dokumen Anda valid dan sesuai persyaratan.
            </p>

            <div className="space-y-6">
              {formasi.documents.map((doc) => (
                <DocumentUpload
                  key={doc.id}
                  documentId={doc.id}
                  documentName={doc.name}
                  required={doc.required}
                  onUpload={(file, result) =>
                    handleDocumentUpload(doc.id, file, result)
                  }
                  uploaded={uploadedDocs[doc.id]}
                />
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allRequiredDocsUploaded()}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  allRequiredDocsUploaded()
                    ? "bg-brand-blue text-white hover:bg-opacity-90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Berkas
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <DocumentStatus
            status={processingStatus}
            uploadedDocs={uploadedDocs}
            formasiName={formasi.name}
          />
        )}
      </div>
    </div>
  );
}
