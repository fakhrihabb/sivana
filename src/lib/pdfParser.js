import fs from 'fs/promises';

/**
 * Extract text from PDF using pdf-parse
 * This is much more reliable than OCR for text-based PDFs
 */
export async function extractTextFromPDF(filepath) {
  try {
    console.log('[PDF Parser] Reading PDF file:', filepath);
    
    // Dynamically import pdf-parse (CommonJS module)
    const pdfParse = (await import('pdf-parse')).default;
    
    // Read PDF file
    const dataBuffer = await fs.readFile(filepath);
    
    console.log('[PDF Parser] Parsing PDF...');
    const data = await pdfParse(dataBuffer);
    
    console.log('[PDF Parser] ✅ PDF parsed successfully');
    console.log('[PDF Parser] Pages:', data.numpages);
    console.log('[PDF Parser] Text length:', data.text.length);
    console.log('[PDF Parser] Text preview:', data.text.substring(0, 300));
    
    return {
      success: true,
      text: data.text,
      confidence: 1.0, // PDF text extraction is 100% accurate
      pages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error('[PDF Parser] ❌ Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message,
    };
  }
}
