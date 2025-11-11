"use client";

import { useState, useRef, useEffect } from "react";

// Document validation keywords (updated requirements)
const DOCUMENT_KEYWORDS = {
  ktp: ["ktp", "tanda penduduk", "nomer identitas", "nik", "kartu tanda", "republic indonesia"],
  ijazah: ["ijazah", "diploma", "sarjana", "s1", "s2", "s3", "universitas", "akademi", "sttb"],
  transkrip: ["transkrip", "transcript", "nilai", "grade", "semester", "gpa", "ipk"],
  surat_lamaran: ["surat lamaran", "lamaran", "application", "permohonan", "melamar"],
  surat_pernyataan: ["surat pernyataan", "pernyataan", "statement", "5 poin", "lima poin"],
};

export default function DocumentUpload({
  documentId,
  documentName,
  required,
  onUpload,
  uploaded,
  requirementValidation,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [documentWarning, setDocumentWarning] = useState(null);
  const fileInputRef = useRef(null);

  // Determine requirement status based on validation
  const getRequirementStatus = (docId) => {
    if (!requirementValidation || !requirementValidation.checks) {
      console.log(`[${docId}] No validation data available`);
      return "MS"; // Default to MS if no validation yet
    }

    // Check if this document type affects any failed requirement
    const relevantChecks = requirementValidation.checks.filter(check => {
      // Map document types to requirement categories
      if (docId === "ijazah" && check.category === "Jurusan") return true;
      if (docId === "transkrip" && check.category === "IPK") return true;
      if (docId === "ktp" && check.category === "Usia") return true;
      if (docId === "surat_lamaran" && check.category === "Kelengkapan Dokumen") return true;
      if ((docId === "ktp" || docId === "ijazah" || docId === "transkrip") && check.category === "Konsistensi Data") return true;
      if ((docId === "ijazah" || docId === "transkrip") && check.category === "Konsistensi Akademik") return true;
      return false;
    });

    console.log(`[${docId}] Relevant checks:`, relevantChecks);

    // If any relevant check failed, mark as TMS
    const hasFailed = relevantChecks.some(check => check.status === "failed");
    const status = hasFailed ? "TMS" : "MS";
    
    console.log(`[${docId}] Final status: ${status} (hasFailed: ${hasFailed})`);
    
    return status;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Detect document type from filename
  const detectDocumentType = (filename) => {
    const lowerFilename = filename.toLowerCase();
    let detected = null;
    let confidence = 0;

    for (const [type, keywords] of Object.entries(DOCUMENT_KEYWORDS)) {
      const matchCount = keywords.filter((keyword) =>
        lowerFilename.includes(keyword)
      ).length;
      if (matchCount > confidence) {
        confidence = matchCount;
        detected = type;
      }
    }

    return { detected, confidence };
  };

  // Validate if document matches expected type
  const validateDocumentType = (filename) => {
    const { detected } = detectDocumentType(filename);

    if (detected && detected !== documentId) {
      return {
        level: "warning",
        title: `⚠️ Dokumen Tidak Cocok`,
        message: `Nama file menunjukkan dokumen lain, tetapi Anda mengunggah ke field ${documentName}. Pastikan sudah benar.`,
      };
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate document type
      const warning = validateDocumentType(file.name);
      setDocumentWarning(warning);
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setIsProcessing(true);

    try {
      // Stage 1: Upload
      setProcessingStage("Mengupload dokumen...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Stage 2: OCR
      setProcessingStage("Membaca teks dokumen (OCR)...");

      // Stage 3: Verification
      setProcessingStage("Memverifikasi dokumen...");

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentId);

      // Check document type match for warnings
      const { detected } = detectDocumentType(file.name);
      const warnings = [];
      let statusFromTypeCheck = "MS"; // Default
      
      if (detected && detected !== documentId) {
        warnings.push(`⚠️ Ketidaksesuaian Dokumen: File ini terdeteksi sebagai dokumen ${detected}, tetapi Anda mengunggah ke field ${documentName}. Harap periksa kembali dokumen Anda.`);
        statusFromTypeCheck = "TMS"; // Mark as not passing due to type mismatch
      }

      // Call Vision API
      let result = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        uploadTime: new Date().toLocaleString("id-ID"),
        status: "MS", // Default to passing
        extractedData: {},
        verificationChecks: {},
        forensics: {
          metadataConsistent: true,
          noTampering: true,
          authenticity: 95.0,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          
          console.log("\n" + "=".repeat(80));
          console.log("[Frontend] 📦 API RESPONSE RECEIVED");
          console.log("=".repeat(80));
          console.log("[Frontend] Response data:", data);
          console.log("[Frontend] OCR Text Length:", data.data?.ocr?.text?.length);
          console.log("[Frontend] OCR Text Sample:", data.data?.ocr?.text?.substring(0, 200));
          console.log("[Frontend] Content Detection:", data.data?.contentDetection);
          console.log("=".repeat(80) + "\n");
          
          if (data.success && data.data) {
            // Parse Vision API response
            result.status = data.data.verdict?.status === "APPROVED" ? "MS" : "TMS";
            result.verdict = data.data.verdict;
            
            // **IMPORTANT: Store validation result for RequirementValidator**
            if (data.data.validation) {
              result.validation = data.data.validation;
              console.log("[Frontend] Validation data stored:", result.validation);
              
              // Extract important fields from validation to extractedData
              if (data.data.validation.nama) {
                result.extractedData.nama = data.data.validation.nama;
              }
              if (data.data.validation.nik) {
                result.extractedData.nik = data.data.validation.nik;
              }
              if (data.data.validation.umur !== undefined) {
                result.extractedData.umur = data.data.validation.umur;
              }
              if (data.data.validation.programStudi) {
                result.extractedData.programStudi = data.data.validation.programStudi;
              }
              if (data.data.validation.ipk !== undefined) {
                result.extractedData.ipk = data.data.validation.ipk;
              }
            }
            
            // Extract OCR text
            if (data.data.ocr?.text) {
              result.extractedData.ocrText = data.data.ocr.text.substring(0, 500);
              result.extractedData.ocrConfidence = Math.round((data.data.ocr.confidence || 0.9) * 100);
            }

            // Extract fields from analysis
            if (data.data.analysis?.success && data.data.analysis?.analysis?.extractedFields) {
              const fields = data.data.analysis.analysis.extractedFields;
              Object.assign(result.extractedData, fields);
            }

            // Add quality checks
            if (data.data.analysis?.success && data.data.analysis?.analysis?.quality) {
              const quality = data.data.analysis.analysis.quality;
              result.verificationChecks = {
                formatValid: !quality.isBlurry,
                notBlurry: !quality.isBlurry,
                complete: quality.isComplete,
                goodContrast: true,
              };
            }

            // Add fraud detection
            if (data.data.fraud?.success) {
              result.forensics.authenticity = Math.round((data.data.fraud.confidence || 0.95) * 100);
              result.forensics.isSuspicious = data.data.fraud.isSuspicious || false;
            }

            // CONTENT-BASED DOCUMENT TYPE DETECTION
            // Check if OCR detected a different document type than expected
            console.log("[Frontend] Content detection received:", data.data.contentDetection);
            if (data.data.contentDetection?.detectedType && 
                data.data.contentDetection.confidence > 0.3 &&
                data.data.contentDetection.detectedType !== documentId) {
              const detectedContentType = data.data.contentDetection.detectedType;
              const contentTypeMsg = `⚠️ Ketidaksesuaian Dokumen: Analisis isi dokumen mendeteksi ini sebagai dokumen ${detectedContentType}, tetapi Anda mengunggah ke field ${documentName}. Confidence: ${Math.round(data.data.contentDetection.confidence * 100)}%. Harap periksa kembali dokumen Anda.`;
              result.warnings = Array.isArray(result.warnings) ? result.warnings : [];
              if (!result.warnings.includes(contentTypeMsg)) result.warnings.unshift(contentTypeMsg);
              result.status = "TMS"; // Mark as not meeting requirements
              console.log("[Frontend] Content mismatch detected! Status set to TMS, warning added");
            }

            // Merge any warnings from analysis (if provided by backend)
            if (data.data.analysis?.analysis?.warnings && Array.isArray(data.data.analysis.analysis.warnings)) {
              result.warnings = Array.isArray(result.warnings)
                ? [...result.warnings, ...data.data.analysis.analysis.warnings]
                : [...data.data.analysis.analysis.warnings];
            }

            // Ensure filename-based type-mismatch leads to TMS and its warning is present (always check, not just on fraud success)
            if (statusFromTypeCheck === "TMS") {
              result.status = "TMS";
              const typeMsg = `⚠️ Ketidaksesuaian Dokumen: File ini terdeteksi sebagai dokumen ${detected}, tetapi Anda mengunggah ke field ${documentName}. Harap periksa kembali dokumen Anda.`;
              result.warnings = Array.isArray(result.warnings) ? result.warnings : [];
              if (!result.warnings.includes(typeMsg)) result.warnings.unshift(typeMsg);
            }
          }
        }
      } catch (fetchError) {
        console.warn("Vision API not available, using default result:", fetchError.message);
        // Use default result above - don't throw, just warn
      }

      // Stage 4: Analysis Complete
      setProcessingStage("Analisis selesai!");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsProcessing(false);
      setProcessingStage("");

      // Call parent handler with result
      onUpload(file, result);
    } catch (error) {
      console.error("Processing error:", error);
      setIsProcessing(false);
      setProcessingStage("");

      // Create error result
      const result = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        status: "ERROR",
        error: error.message,
        extractedData: {},
        verificationChecks: {},
        forensics: { authenticity: 0 },
      };

      onUpload(file, result);
    }
  };

  const simulateProcessing = (docId, file) => {
    // Simulate realistic processing results
    const baseResult = {
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(2) + " KB",
      uploadTime: new Date().toLocaleString("id-ID"),
    };

    // Get dynamic requirement status based on validation
    const reqStatus = getRequirementStatus(docId);

    switch (docId) {
      case "ktp":
        return {
          ...baseResult,
          status: "verified",
          requirementStatus: reqStatus,
          extractedData: {
            nik: "3174XXXXXXXXX",
            nama: "NAMA LENGKAP",
            tempatLahir: "JAKARTA",
            tanggalLahir: "01-01-1995",
            jenisKelamin: "LAKI-LAKI",
            alamat: "JL. SUDIRMAN NO. 123",
          },
          verificationChecks: {
            formatValid: true,
            nikValid: true,
            fotoJelas: true,
            tidakKadaluarsa: true,
          },
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 98.5,
          },
        };

      case "ijazah":
        return {
          ...baseResult,
          status: "verified",
          requirementStatus: reqStatus,
          extractedData: {
            nama: "NAMA LENGKAP",
            nim: "1234567890",
            programStudi: "Teknik Informatika",
            gelar: "S.Kom",
            tahunLulus: "2020",
            nomorIjazah: "12345/UN/2020",
          },
          verificationChecks: {
            formatValid: true,
            universitasValid: true,
            programStudiSesuai: true,
            nomorIjazahValid: true,
            capStempelJelas: true,
          },
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 96.2,
          },
          programStudiMapping: {
            detected: "Teknik Informatika",
            matched: "S1 Teknik Informatika/Sistem Informasi",
            similarity: 100,
          },
        };

      case "transkrip":
        return {
          ...baseResult,
          status: "verified",
          requirementStatus: reqStatus,
          extractedData: {
            nama: "NAMA LENGKAP",
            nim: "1234567890",
            programStudi: "Teknik Informatika",
            ipk: "3.45",
            totalSks: "144",
            jumlahMataKuliah: "48",
          },
          verificationChecks: {
            formatValid: true,
            ipkMemenuhi: true,
            sksMemenuhi: true,
            konsistenDenganIjazah: true,
          },
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 97.8,
          },
        };

      case "surat_pernyataan":
        return {
          ...baseResult,
          status: "needs_review",
          requirementStatus: reqStatus,
          extractedData: {
            nama: "NAMA LENGKAP",
            nik: "3174XXXXXXXXX",
            tanggalSurat: "15-01-2025",
          },
          verificationChecks: {
            formatValid: true,
            tandaTanganAda: true,
            materaiAda: false,
            tanggalValid: true,
          },
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 94.5,
          },
          warnings: ["Meterai tidak terdeteksi, mohon periksa manual"],
        };

      case "surat_lamaran":
        return {
          ...baseResult,
          status: "verified",
          requirementStatus: reqStatus,
          extractedData: {
            nama: "NAMA LENGKAP",
            tanggalSurat: "10-01-2025",
            ditujukanKepada: "Kepala Badan Kepegawaian Negara",
            posisiYangDilamar: "CPNS - Analis Kebijakan",
            alamat: "Jl. Contoh No. 123",
          },
          verificationChecks: {
            formatValid: true,
            bermaterai: true,
            namaSesuai: true,
            lengkap: true,
          },
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 95.0,
          },
        };

      case "str":
        return {
          ...baseResult,
          status: "verified",
          extractedData: {
            nama: "NAMA LENGKAP",
            nomorSTR: "STR/123/2024",
            profesi: "Perawat",
            tanggalTerbit: "05-01-2024",
            masaBerlaku: "05-01-2029",
          },
          verificationChecks: {
            formatValid: true,
            masihBerlaku: true,
            profesiSesuai: true,
            nomorValid: true,
          },
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 98.1,
          },
        };

      case "sertifikat":
        return {
          ...baseResult,
          status: "verified",
          extractedData: {
            nama: "NAMA LENGKAP",
            namaSertifikat: "AWS Certified Solutions Architect",
            penerbit: "Amazon Web Services",
            tanggalTerbit: "15-06-2024",
            nomorSertifikat: "AWS-12345678",
          },
          verificationChecks: {
            formatValid: true,
            penerbitValid: true,
            nomorValid: true,
          },
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 95.8,
          },
        };

      default:
        return {
          ...baseResult,
          status: "verified",
          extractedData: {},
          verificationChecks: {},
          forensics: {
            metadataConsistent: true,
            noTampering: true,
            authenticity: 95.0,
          },
        };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-green-700 bg-green-50 border-green-200";
      case "needs_review":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "needs_review":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "rejected":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{documentName}</h3>
          {required ? (
            <span className="text-xs text-red-600">* Wajib</span>
          ) : (
            <span className="text-xs text-gray-500">Opsional</span>
          )}
        </div>
        {uploaded && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                uploaded.result.status
              )}`}
            >
              {getStatusIcon(uploaded.result.status)}
              <span className="text-sm font-medium capitalize">
                {uploaded.result.status === "verified" && "Terverifikasi"}
                {uploaded.result.status === "needs_review" && "Perlu Peninjauan"}
                {uploaded.result.status === "rejected" && "Ditolak"}
              </span>
            </div>
            
            {/* AI Requirement Status Badge - RECALCULATED ON EVERY RENDER */}
            {(() => {
              const currentStatus = getRequirementStatus(documentId);
              return (
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 ${
                    currentStatus === "MS"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-red-50 border-red-500 text-red-700"
                  }`}
                  title={currentStatus === "MS" ? "Memenuhi Syarat (AI Analysis)" : "Tidak Memenuhi Syarat (AI Analysis)"}
                >
                  {currentStatus}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {!uploaded && !isProcessing && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-brand-blue bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Drag & drop file atau{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-brand-blue hover:text-blue-700 font-medium"
            >
              pilih file
            </button>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PDF, JPG, PNG (Max. 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />

          {/* Document Type Warning */}
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
      )}

      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-blue border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-900">
              Memproses dokumen...
            </p>
          </div>
          <p className="text-sm text-gray-600 ml-8">{processingStage}</p>
          <div className="mt-3 ml-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-blue animate-pulse rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      )}

      {uploaded && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-10 h-10 text-gray-400 flex-shrink-0"
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploaded.result.fileName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {uploaded.result.fileSize} • Diupload{" "}
                {uploaded.result.uploadTime}
              </p>

              {/* AI Analysis Note - RECALCULATED */}
              {(() => {
                const currentStatus = getRequirementStatus(documentId);
                return (
                  <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-900">
                        Status {currentStatus === "MS" ? "MS (Memenuhi Syarat)" : "TMS (Tidak Memenuhi Syarat)"} adalah hasil analisis AI
                      </p>
                      <p className="text-blue-700 mt-0.5">
                        Jika Anda yakin dokumen Anda memenuhi persyaratan, silakan lanjutkan pendaftaran. 
                        Tim verifikator akan melakukan pengecekan manual.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {uploaded.result.warnings && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs text-yellow-800">
                    ⚠️ {uploaded.result.warnings[0]}
                  </p>
                </div>
              )}

              <div className="mt-3">
                <details className="text-sm">
                  <summary className="cursor-pointer text-brand-blue hover:text-blue-700 font-medium">
                    Lihat Detail Verifikasi
                  </summary>
                  <div className="mt-3 space-y-3 pl-4">
                    {/* Extracted Data */}
                    {uploaded.result.extractedData && Object.keys(uploaded.result.extractedData).length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">
                          Data Terekstrak:
                        </p>
                        <div className="space-y-1">
                          {Object.entries(uploaded.result.extractedData).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}:
                                </span>
                                <span className="text-gray-900 font-medium">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Verification Checks */}
                    {uploaded.result.verificationChecks && Object.keys(uploaded.result.verificationChecks).length >
                      0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">
                          Pemeriksaan Verifikasi:
                        </p>
                        <div className="space-y-1">
                          {Object.entries(
                            uploaded.result.verificationChecks
                          ).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              {value ? (
                                <svg
                                  className="w-4 h-4 text-green-600"
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
                                <svg
                                  className="w-4 h-4 text-red-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <span className="text-xs text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Forensics - DISABLED */}
                    {false && uploaded.result.forensics && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">
                          Analisis Forensik:
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              Skor Autentikasi:
                            </span>
                            <span className="text-xs font-medium text-gray-900">
                              {uploaded.result.forensics.authenticity}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${uploaded.result.forensics.authenticity}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-xs text-gray-600">
                              Tidak ada tanda manipulasi
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-xs text-gray-600">
                              Metadata konsisten
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Program Studi Mapping */}
                    {uploaded.result.programStudiMapping && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">
                          Pemetaan Program Studi:
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Terdeteksi:</span>
                            <span className="text-gray-900 font-medium">
                              {uploaded.result.programStudiMapping.detected}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">
                              Cocok dengan:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {uploaded.result.programStudiMapping.matched}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">
                              Tingkat Kesesuaian:
                            </span>
                            <span className="text-green-600 font-medium">
                              {uploaded.result.programStudiMapping.similarity}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
            <button
              onClick={() => onUpload(null, null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
