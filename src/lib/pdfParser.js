import fs from 'fs/promises';
import path from 'path';
import { pdfToPng } from 'pdf-to-png-converter';

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

/**
 * Convert PDF to images (for scanned PDFs that need OCR)
 * Returns array of image paths
 */
export async function convertPDFToImages(pdfPath) {
  try {
    console.log('[PDF Converter] Converting PDF to images:', pdfPath);
    
    const outputDir = path.join(process.cwd(), 'tmp', 'pdf-images');
    
    // Create output directory if not exists
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      console.warn('[PDF Converter] Directory already exists or could not be created');
    }
    
    // Convert PDF to PNG images
    console.log('[PDF Converter] Starting conversion...');
    const pngPages = await pdfToPng(pdfPath, {
      disableFontFace: false,
      useSystemFonts: false,
            viewportScale: 1.5,
            outputFolder: outputDir,
            strictPagesToProcess: false,
            verbosityLevel: 0,
          });
      
          console.log(`[PDF Converter] ✅ Converted ${pngPages.length} pages`);
      
          // The library saves the files automatically when outputFolder is provided.
          // We just need to collect the paths.
          const imagePaths = pngPages.map(page => page.path);
      
          if (imagePaths.length === 0) {
            throw new Error('No pages could be converted to images');
          }
      
          console.log('[PDF Converter] ✅ Successfully found', imagePaths.length, 'images');
      
          return {
            success: true,
            imagePaths,
            pageCount: imagePaths.length,
          };
        } catch (error) {
          console.error('[PDF Converter] ❌ Error:', error);
          return {
            success: false,
            imagePaths: [],
            pageCount: 0,
            error: error.message,
          };
        }
      }
      
      /**
       * Clean up converted PDF images
       */
      export async function cleanupPDFImages(imagePaths) {
        if (!imagePaths || imagePaths.length === 0) return;
      
        console.log('[PDF Converter] Cleaning up', imagePaths.length, 'temporary images');
        const outputDir = path.join(process.cwd(), 'tmp', 'pdf-images');
      
        for (const imagePath of imagePaths) {
          // Resolve the path against the known output directory to be safe
          const fullPath = path.resolve(outputDir, path.basename(imagePath));
          try {
            await fs.unlink(fullPath);
            console.log('[PDF Converter] ✅ Deleted:', fullPath);
          } catch (error) {
            console.warn('[PDF Converter] ⚠️ Could not delete:', fullPath, error.message);
          }
        }
      }
