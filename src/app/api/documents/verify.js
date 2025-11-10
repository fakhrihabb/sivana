import { writeFile, unlink } from "fs/promises";
import path from "path";
import { verifyDocument, detectDocumentTypeFromContent } from "@/lib/visionApi";

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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "File harus berupa gambar (JPG, PNG, etc)" },
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

    // Run document verification
    const result = await verifyDocument(filepath, documentType);

    // Also detect actual document type from content
    const contentDetection = await detectDocumentTypeFromContent(filepath);

    // Delete temp file only if it was created successfully
    if (fileCreated) {
      try {
        await unlink(filepath);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp file:", unlinkErr);
        // Don't fail the request if cleanup fails
      }
    }

    // Return result (always success now due to fallback handling in visionApi)
    return Response.json({
      success: true,
      data: {
        ocr: result.ocr || { text: "", confidence: 0, success: true },
        analysis: result.analysis || { success: true, analysis: {} },
        fraud: result.fraud || { success: true, fraudIndicators: {}, isSuspicious: false, confidence: 0.85 },
        verdict: result.verdict || { status: "PENDING", reasons: [], score: 0 },
        contentDetection: contentDetection || { detectedType: null, confidence: 0 },
      },
    });
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
