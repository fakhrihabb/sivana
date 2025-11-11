import { writeFile, unlink } from "fs/promises";
import path from "path";
import { verifyDocument, detectDocumentTypeFromContent, performOCR } from "@/lib/visionApi";
import { performTesseractOCR } from "@/lib/tesseractOcr";
import { extractTextFromPDF } from "@/lib/pdfParser";
import { 
  validateKTP, 
  validateIjazah, 
  validateTranskrip,
  validateSuratLamaran,
  validateSuratPernyataan 
} from "@/lib/documentValidator";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType") || "ktp";

    if (!file) {
      return Response.json(
        { error: "Tidak ada file yang di-upload" },
        { status: 400 }
      );
    }

    // Validate file type (support both images and PDF)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith("image/")) {
      return Response.json(
        { error: "File harus berupa gambar (JPG, PNG, etc) atau PDF" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "Ukuran file terlalu besar (max 5MB)" },
        { status: 400 }
      );
    }

    // Save file temporarily
    const tempDir = path.join(process.cwd(), "tmp");
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(tempDir, filename);
    let fileCreated = false;

    // Create tmp directory if not exists
    try {
      await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
      fileCreated = true;
    } catch (err) {
      if (err.code === "ENOENT") {
        try {
          const fs = await import("fs");
          fs.mkdirSync(tempDir, { recursive: true });
          await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
          fileCreated = true;
        } catch (mkdirErr) {
          console.error("Failed to create temp directory:", mkdirErr);
          return Response.json(
            {
              error: "Tidak dapat menyimpan file sementara: " + mkdirErr.message,
              success: false,
            },
            { status: 500 }
          );
        }
      } else {
        console.error("Failed to write file:", err);
        return Response.json(
          {
            error: "Tidak dapat menyimpan file: " + err.message,
            success: false,
          },
          { status: 500 }
        );
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("[API] 🔍 DOCUMENT UPLOAD START");
    console.log("=".repeat(80));
    console.log("[API] Document Type:", documentType);
    console.log("[API] File Name:", file.name);
    console.log("[API] File Type:", file.type);
    console.log("[API] File Size:", file.size, "bytes");

    // Determine OCR method based on file type and document type
    let ocrResult;
    let visionAnalysis = null;
    let handwritingData = null;

    // Check if file is PDF
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    
    if (isPDF) {
      // Use PDF parser for PDF files (much more accurate than OCR)
      console.log("[API] 📄 PDF detected, using PDF parser");
      ocrResult = await extractTextFromPDF(filepath);
      
      if (!ocrResult.success || !ocrResult.text || ocrResult.text.length < 10) {
        console.log("[API] ⚠️ PDF parsing failed or insufficient text, trying OCR fallback");
        // Fallback to Vision API if PDF parsing fails
        const visionResult = await verifyDocument(filepath, documentType);
        ocrResult = visionResult.ocr;
        visionAnalysis = visionResult.analysis;
      }
    } else if (documentType === 'ijazah' || documentType === 'sttb') {
      // Use Vision API for ijazah (can detect handwriting)
      console.log("[API] Using Vision API OCR for ijazah/sttb");
      const visionResult = await verifyDocument(filepath, documentType);
      ocrResult = visionResult.ocr;
      visionAnalysis = visionResult.analysis;
      
      // Check for handwriting in ijazah
      if (visionResult.ocr?.confidence < 0.7) {
        handwritingData = {
          detected: true,
          confidence: (1 - visionResult.ocr.confidence) * 100
        };
      }
    } else {
      // Try Tesseract first, fallback to Vision API if fails
      console.log("[API] Attempting Tesseract OCR for", documentType);
      try {
        ocrResult = await Promise.race([
          performTesseractOCR(filepath),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Tesseract timeout')), 10000)
          )
        ]);
        
        // Check if Tesseract failed
        if (!ocrResult.success || !ocrResult.text || ocrResult.text.length < 10) {
          throw new Error('Tesseract returned insufficient data');
        }
        
        console.log("[API] ✅ Tesseract OCR succeeded");
      } catch (tesseractError) {
        console.warn("[API] ⚠️ Tesseract failed, falling back to Vision API:", tesseractError.message);
        const visionResult = await verifyDocument(filepath, documentType);
        ocrResult = visionResult.ocr;
        visionAnalysis = visionResult.analysis;
      }
    }

    console.log("\n[API] 📄 OCR EXTRACTION RESULT:");
    console.log("[API] OCR Success:", ocrResult?.success);
    console.log("[API] OCR Text Length:", ocrResult?.text?.length);
    console.log("[API] OCR Confidence:", ocrResult?.confidence);
    console.log("[API] OCR Text (first 500 chars):");
    console.log(ocrResult?.text?.substring(0, 500));

    // Content-based document type detection
    const contentDetection = await detectDocumentTypeFromContent(filepath);
    console.log("\n[API] 🎯 CONTENT-BASED DETECTION:");
    console.log("[API] Detected Type:", contentDetection.detectedType);
    console.log("[API] Confidence:", contentDetection.confidence);

    // VALIDATION based on document type
    let validation = null;
    const ocrText = ocrResult?.text || '';

    // Get session data from request (for cross-document validation)
    const sessionData = formData.get("sessionData");
    let ktpData = null;
    let ijazahData = null;
    let formasiData = null;

    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        ktpData = parsed.ktpData;
        ijazahData = parsed.ijazahData;
        formasiData = parsed.formasiData;
      } catch (e) {
        console.warn("[API] Failed to parse session data:", e);
      }
    }

    console.log("\n[API] 🔐 STARTING VALIDATION:");
    console.log("[API] Document Type:", documentType);

    switch (documentType) {
      case 'ktp':
        validation = await validateKTP(ocrText, formasiData);
        console.log("[API] KTP Validation Result:", validation);
        break;
      
      case 'ijazah':
      case 'sttb':
        validation = await validateIjazah(ocrText, ktpData, formasiData, handwritingData);
        console.log("[API] Ijazah Validation Result:", validation);
        break;
      
      case 'transkrip':
        validation = await validateTranskrip(ocrText, ktpData, ijazahData);
        console.log("[API] Transkrip Validation Result:", validation);
        break;
      
      case 'surat_lamaran':
        validation = await validateSuratLamaran(ocrText, ktpData, ijazahData);
        console.log("[API] Surat Lamaran Validation Result:", validation);
        break;
      
      case 'surat_pernyataan':
        validation = await validateSuratPernyataan(ocrText, ktpData, ijazahData);
        console.log("[API] Surat Pernyataan Validation Result:", validation);
        break;
      
      default:
        console.log("[API] No specific validation for document type:", documentType);
        validation = { success: true, warnings: [], errors: [] };
    }

    console.log("=".repeat(80) + "\n");

    // Delete temp file only if it was created successfully
    if (fileCreated) {
      try {
        await unlink(filepath);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp file:", unlinkErr);
      }
    }

    // Create verdict object from validation
    const verdict = {
      status: "APPROVED",
      reasons: [],
      score: 1.0
    };

    // Check validation errors and warnings
    if (validation && validation.errors && validation.errors.length > 0) {
      verdict.status = "REJECTED";
      verdict.reasons = validation.errors;
      verdict.score = 0;
    } else if (validation && validation.warnings && validation.warnings.length > 0) {
      verdict.status = "NEED_REVIEW";
      verdict.reasons = validation.warnings;
      verdict.score = 0.7;
    } else if (validation && validation.success) {
      verdict.status = "APPROVED";
      verdict.reasons = ["Dokumen lolos semua pemeriksaan"];
      verdict.score = 1.0;
    }

    // Return comprehensive response
    const responseData = {
      success: true,
      data: {
        ocr: ocrResult || { text: "", confidence: 0, success: true },
        contentDetection: contentDetection || { detectedType: null, confidence: 0 },
        validation: validation || { success: true, warnings: [], errors: [] },
        verdict: verdict, // Add verdict for frontend compatibility
        visionAnalysis: visionAnalysis, // Only for ijazah
      },
    };

    console.log("[API] Response Summary:");
    console.log("  - OCR Success:", responseData.data.ocr.success);
    console.log("  - Validation Success:", responseData.data.validation.success);
    console.log("  - Validation Errors:", responseData.data.validation.errors?.length || 0);
    console.log("  - Validation Warnings:", responseData.data.validation.warnings?.length || 0);
    console.log("  - Verdict Status:", responseData.data.verdict.status);
    
    return Response.json(responseData);
  } catch (error) {
    console.error("Document verification error:", error);
    return Response.json(
      {
        error: "Gagal memverifikasi dokumen: " + error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
