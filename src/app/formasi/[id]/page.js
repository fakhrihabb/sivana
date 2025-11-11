"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DocumentUpload from "@/components/documents/DocumentUpload";
import RequirementChecklist from "@/components/documents/RequirementChecklist";
import { validateRequirements } from "@/components/documents/RequirementValidator";

const formasiDataFallback = {
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
      { id: "surat_lamaran", name: "Surat Lamaran", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
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
      { id: "surat_lamaran", name: "Surat Lamaran", required: true },
      { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
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
      { id: "surat_lamaran", name: "Surat Lamaran", required: true },
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
      { id: "surat_lamaran", name: "Surat Lamaran", required: true },
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
      { id: "surat_lamaran", name: "Surat Lamaran", required: true },
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
      { id: "surat_lamaran", name: "Surat Lamaran", required: true },
    ],
  },
};

export default function FormasiDetail() {
  const params = useParams();
  const router = useRouter();
  const [formasi, setFormasi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [processingStatus, setProcessingStatus] = useState(null);
  const [requirementValidation, setRequirementValidation] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSanggahModal, setShowSanggahModal] = useState(false);
  const [sanggahReason, setSanggahReason] = useState("");
  const [sanggahSubmitted, setSanggahSubmitted] = useState(false);
  const [recommendedFormasi, setRecommendedFormasi] = useState([]);

  // Fetch formasi detail from Supabase
  useEffect(() => {
    async function fetchFormasi() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('formasi')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (data) {
          // Transform dan set default documents & requirements
          setFormasi({
            name: data.name,
            lembaga: data.lembaga,
            lokasi: data.lokasi,
            requirements: {
              pendidikan: data.jenjang_pendidikan + ' ' + data.program_studi,
              ipk: "3.0",
              usia: "Maksimal 35 tahun",
            },
            documents: [
              { id: "ktp", name: "KTP", required: true },
              { id: "ijazah", name: "Ijazah", required: true },
              { id: "transkrip", name: "Transkrip Nilai", required: true },
              { id: "surat_pernyataan", name: "Surat Pernyataan", required: true },
              { id: "surat_lamaran", name: "Surat Lamaran", required: true },
            ],
          });
        }
      } catch (err) {
        console.error('Error fetching formasi:', err);
        // Fallback ke data hardcoded
        setFormasi(formasiDataFallback[params.id]);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchFormasi();
    }
  }, [params.id]);

  // Function to get user's data from uploaded documents
  const getUserData = () => {
    const userData = {
      programStudi: uploadedDocs.ijazah?.result?.extractedData?.programStudi || "",
      ipk: uploadedDocs.transkrip?.result?.extractedData?.ipk || "",
      age: 0,
    };

    // Get age from KTP VALIDATION (from database, NOT from OCR)
    if (uploadedDocs.ktp?.result?.validation?.umur) {
      userData.age = uploadedDocs.ktp.result.validation.umur;
    }

    return userData;
  };

  // Function to find recommended formasi
  const findRecommendedFormasi = async () => {
    const userData = getUserData();
    const recommendations = [];

    console.log("User Data:", userData);

    // Check all formasi except current one
    for (const [id, formasiItem] of Object.entries(formasiDataFallback)) {
      if (id === params.id) continue; // Skip current formasi

      const validation = await validateRequirements(uploadedDocs, formasiItem.requirements);
      const matchScore = {
        total: 0,
        details: {
          jurusan: false,
          ipk: false,
          usia: false,
        }
      };

      // Check each requirement
      validation.checks.forEach(check => {
        if (check.status === "passed") {
          matchScore.total += 1;
          if (check.category === "Jurusan") matchScore.details.jurusan = true;
          if (check.category === "IPK") matchScore.details.ipk = true;
          if (check.category === "Usia") matchScore.details.usia = true;
        }
      });

      // Calculate percentage
      const percentage = (matchScore.total / validation.totalChecks) * 100;

      // Only recommend if at least 60% match
      if (percentage >= 60) {
        recommendations.push({
          id,
          ...formasiItem,
          matchScore: matchScore.total,
          matchPercentage: Math.round(percentage),
          validation,
          matchDetails: matchScore.details,
        });
      }
    }

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    console.log("Recommendations:", recommendations);

    return recommendations.slice(0, 3); // Return top 3
  };

  // Validate requirements whenever documents change
  useEffect(() => {
    async function runValidation() {
      if (Object.keys(uploadedDocs).length > 0 && formasi) {
        console.log("\n" + "=".repeat(80));
        console.log("[PAGE] VALIDATING REQUIREMENTS WITH GEMINI AI");
        console.log("=".repeat(80));
        console.log("[PAGE] Uploaded Docs:", Object.keys(uploadedDocs));
        console.log("[PAGE] Formasi Requirements:", formasi.requirements);
        
        const validation = await validateRequirements(uploadedDocs, formasi.requirements);
        
        console.log("[PAGE] Validation Result:", validation);
        console.log("[PAGE] Name Inconsistencies:", validation.nameInconsistencies);
        console.log("=".repeat(80) + "\n");
        
        setRequirementValidation(validation);
        
        // If validation failed, find recommendations
        if (validation.overall === "failed") {
          const recommendations = await findRecommendedFormasi();
          setRecommendedFormasi(recommendations);
        } else {
          setRecommendedFormasi([]);
        }
      }
    }
    
    runValidation();
  }, [uploadedDocs, formasi]);

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

  // DEMO: Auto-fix documents to meet requirements
  const handleAutoFixDocuments = () => {
    const fixedDocs = { ...uploadedDocs };

    // Fix IPK if transkrip exists
    if (fixedDocs.transkrip && formasi.requirements.ipk) {
      const requiredIPK = parseFloat(formasi.requirements.ipk);
      fixedDocs.transkrip = {
        ...fixedDocs.transkrip,
        result: {
          ...fixedDocs.transkrip.result,
          extractedData: {
            ...fixedDocs.transkrip.result.extractedData,
            ipk: (requiredIPK + 0.25).toFixed(2), // Set IPK slightly above requirement
          },
        },
      };
    }

    // Fix Jurusan/Program Studi if ijazah exists
    if (fixedDocs.ijazah && formasi.requirements.pendidikan) {
      const requiredProdi = formasi.requirements.pendidikan.split('/')[0]; // Take first option
      fixedDocs.ijazah = {
        ...fixedDocs.ijazah,
        result: {
          ...fixedDocs.ijazah.result,
          extractedData: {
            ...fixedDocs.ijazah.result.extractedData,
            programStudi: requiredProdi,
          },
        },
      };
    }

    // Fix Usia if KTP exists
    if (fixedDocs.ktp && formasi.requirements.usia) {
      const maxAge = parseInt(formasi.requirements.usia.match(/\d+/)[0]);
      const validAge = maxAge - 5; // Set age 5 years below max
      const birthYear = new Date().getFullYear() - validAge;
      fixedDocs.ktp = {
        ...fixedDocs.ktp,
        result: {
          ...fixedDocs.ktp.result,
          extractedData: {
            ...fixedDocs.ktp.result.extractedData,
            tanggalLahir: `01-01-${birthYear}`,
          },
        },
      };
    }

    // Fix Surat Lamaran - ensure name consistency
    if (fixedDocs.surat_lamaran) {
      fixedDocs.surat_lamaran = {
        ...fixedDocs.surat_lamaran,
        result: {
          ...fixedDocs.surat_lamaran.result,
          extractedData: {
            ...fixedDocs.surat_lamaran.result.extractedData,
            nama: consistentName,
          },
        },
      };
    }

    // Fix name consistency
    const consistentName = "NAMA LENGKAP KONSISTEN";
    if (fixedDocs.ktp) {
      fixedDocs.ktp.result.extractedData.nama = consistentName;
    }
    if (fixedDocs.ijazah) {
      fixedDocs.ijazah.result.extractedData.nama = consistentName;
    }
    if (fixedDocs.transkrip) {
      fixedDocs.transkrip.result.extractedData.nama = consistentName;
    }

    setUploadedDocs(fixedDocs);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setCurrentStep(3);
  };

  const handleSanggah = () => {
    setShowSanggahModal(true);
  };

  const handleSubmitSanggah = () => {
    if (sanggahReason.trim()) {
      setSanggahSubmitted(true);
      setShowSanggahModal(false);
    }
  };

  const allRequiredDocsUploaded = () => {
    const requiredDocs = formasi.documents.filter((doc) => doc.required);
    return requiredDocs.every((doc) => uploadedDocs[doc.id]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail formasi...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!formasi) {
    return (
      <div className="min-h-screen gradient-bg pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Formasi Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Formasi yang Anda cari tidak tersedia.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-16">
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

      {/* Progress Steps - 2 Steps Only */}
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
              Hasil Verifikasi
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
          <div>
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Dokumen Persyaratan
              </h2>
              <p className="text-gray-600 mb-8">
                Sistem akan melakukan verifikasi otomatis menggunakan AI untuk
                memastikan dokumen Anda valid dan sesuai persyaratan.
              </p>

              <div className="space-y-6">
                {formasi.documents.map((doc) => {
                  return (
                    <DocumentUpload
                      key={doc.id}
                      documentId={doc.id}
                      documentName={doc.name}
                      required={doc.required}
                      onUpload={(file, result) =>
                        handleDocumentUpload(doc.id, file, result)
                      }
                      uploaded={uploadedDocs[doc.id]}
                      requirementValidation={requirementValidation}
                      uploadedDocs={uploadedDocs}
                      formasiData={formasi}
                    />
                  );
                })}
              </div>
            </div>

            {/* Requirement Validation Results */}
            {requirementValidation && (
              <RequirementChecklist validationResults={requirementValidation} />
            )}

            {/* Warning Box for Failed Requirements */}
            {requirementValidation?.overall === "failed" && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <div className="flex gap-3 mb-4">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 mb-2">
                      ⚠️ Kemungkinan Besar Submisi Anda Tidak Akan Diterima
                    </h3>
                    <p className="text-sm text-red-800 mb-3">
                      Berdasarkan analisis AI, dokumen Anda tidak memenuhi beberapa persyaratan formasi:
                    </p>
                    <ul className="text-sm text-red-800 space-y-1 mb-3">
                      {requirementValidation.checks
                        .filter(check => check.status === "failed")
                        .map((check, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span>•</span>
                            <span><strong>{check.category}:</strong> {check.detail}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">Catatan Penting:</p>
                      <p className="mb-2">
                        Hasil analisis ini dilakukan secara otomatis menggunakan AI dan OCR. 
                        Jika Anda <strong>yakin bahwa Anda memenuhi semua persyaratan</strong> dan dokumen Anda valid, 
                        Anda tetap dapat melanjutkan pendaftaran.
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Tim verifikator akan melakukan pengecekan manual terhadap semua dokumen yang disubmit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rekomendasi Formasi di Step 2 */}
            {requirementValidation?.overall === "failed" && recommendedFormasi.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-900 text-lg mb-2">
                      💡 Formasi Alternatif yang Mungkin Cocok untuk Anda
                    </h3>
                    <p className="text-sm text-purple-700">
                      Berdasarkan dokumen Anda, berikut formasi lain yang kemungkinan besar Anda memenuhi syarat:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {recommendedFormasi.slice(0, 2).map((rec) => (
                    <div 
                      key={rec.id}
                      className="bg-white rounded-lg border-2 border-purple-200 p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => window.open(`/formasi/${rec.id}`, '_blank')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{rec.name}</h4>
                          <p className="text-xs text-gray-600">{rec.lembaga} • {rec.lokasi}</p>
                        </div>
                        <div className="bg-green-100 border-2 border-green-500 px-2 py-1 rounded-full">
                          <span className="text-green-700 font-bold text-xs">
                            {rec.matchPercentage}% Cocok
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.matchDetails.jurusan && (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs">
                            ✓ Jurusan
                          </span>
                        )}
                        {rec.matchDetails.ipk && (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs">
                            ✓ IPK
                          </span>
                        )}
                        {rec.matchDetails.usia && (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs">
                            ✓ Usia
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-white rounded border border-purple-200">
                  <p className="text-xs text-gray-600">
                    💡 <strong>Klik</strong> pada formasi untuk melihat detail di tab baru.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex gap-4">
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
                  {requirementValidation?.overall === "failed" 
                    ? "Lanjutkan Pendaftaran" 
                    : "Submit Berkas"}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            {!sanggahSubmitted ? (
              <>
                {/* Status Menunggu */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Dokumen Sedang Diverifikasi
                  </h2>
                  <p className="text-gray-600">
                    Mohon menunggu, dokumen Anda sedang diverifikasi oleh admin
                  </p>
                </div>

                {/* Hasil Verifikasi AI (Sementara) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Hasil Analisis AI (Sementara)
                  </h3>
                  
                  {requirementValidation && (
                    <RequirementChecklist validationResults={requirementValidation} />
                  )}

                  <div className="mt-4 p-4 bg-white rounded border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <strong>Status Keseluruhan:</strong>{" "}
                      <span className={`font-bold ${
                        requirementValidation?.overall === "passed" 
                          ? "text-green-600"
                          : requirementValidation?.overall === "warning"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                        {requirementValidation?.overall === "passed" && "✓ Memenuhi Syarat"}
                        {requirementValidation?.overall === "warning" && "⚠ Peringatan"}
                        {requirementValidation?.overall === "failed" && "✗ Tidak Memenuhi Syarat"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Ini adalah hasil analisis AI. Hasil final akan ditentukan oleh admin setelah verifikasi manual.
                    </p>
                  </div>
                </div>

                {/* Dokumen yang Diupload */}
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Dokumen yang Diupload:</h3>
                  <div className="space-y-2">
                    {Object.entries(uploadedDocs).map(([docId, doc]) => {
                      const docName = formasi.documents.find(d => d.id === docId)?.name;
                      return (
                        <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-gray-900">{docName}</span>
                          </div>
                          <span className="text-sm text-gray-500">{doc.result.fileName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rekomendasi Formasi (jika tidak memenuhi syarat) */}
                {requirementValidation?.overall === "failed" && recommendedFormasi.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-900 text-lg mb-2">
                          Rekomendasi Formasi untuk Tahun Depan
                        </h3>
                        <p className="text-sm text-purple-700">
                          Berdasarkan dokumen Anda, berikut formasi yang kemungkinan besar Anda memenuhi syarat:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {recommendedFormasi.map((rec) => (
                        <div 
                          key={rec.id}
                          className="bg-white rounded-lg border-2 border-purple-200 p-4 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => router.push(`/formasi/${rec.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-lg mb-1">{rec.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                </svg>
                                {rec.lembaga}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {rec.lokasi}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <div className="bg-green-100 border-2 border-green-500 px-3 py-1 rounded-full">
                                <span className="text-green-700 font-bold text-sm">
                                  {rec.matchPercentage}% Cocok
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Persyaratan yang Cocok:</p>
                            <div className="flex flex-wrap gap-2">
                              {rec.matchDetails.jurusan && (
                                <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Jurusan
                                </span>
                              )}
                              {rec.matchDetails.ipk && (
                                <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  IPK
                                </span>
                              )}
                              {rec.matchDetails.usia && (
                                <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Usia
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-3 flex items-center gap-2 text-purple-600 text-sm font-medium">
                              <span>Lihat Detail</span>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-white rounded border border-purple-200">
                      <p className="text-xs text-gray-600">
                        <strong>💡 Tips:</strong> Simpan rekomendasi ini dan persiapkan diri Anda untuk tahun depan. 
                        Pastikan dokumen Anda sudah memenuhi persyaratan formasi yang direkomendasikan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSanggah}
                    className="flex-1 bg-brand-pink text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Ajukan Sanggahan
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </>
            ) : (
              /* After Sanggah Submitted */
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sanggahan Berhasil Diajukan
                </h2>
                <p className="text-gray-600 mb-2">
                  Sanggahan Anda sedang direview oleh petugas
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Kami akan menghubungi Anda setelah proses review selesai
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-left max-w-2xl mx-auto">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Alasan Sanggahan:</p>
                  <p className="text-sm text-gray-600">{sanggahReason}</p>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="bg-brand-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Sanggah */}
      {showSanggahModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Ajukan Sanggahan</h3>
                <button
                  onClick={() => setShowSanggahModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Catatan:</strong> Sanggahan akan direview oleh petugas. Pastikan Anda memberikan alasan yang jelas dan dokumen pendukung yang valid.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alasan Sanggahan <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={sanggahReason}
                  onChange={(e) => setSanggahReason(e.target.value)}
                  placeholder="Jelaskan alasan sanggahan Anda secara detail..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Minimal 50 karakter
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSanggahModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitSanggah}
                  disabled={sanggahReason.trim().length < 50}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    sanggahReason.trim().length >= 50
                      ? "bg-brand-blue text-white hover:bg-opacity-90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Submit Sanggahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
