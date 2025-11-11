/**
 * Google Document AI Integration
 * For handwriting recognition and structured document extraction
 *
 * Use Case: Extract handwritten "Nomor Ijazah" from Indonesian diplomas
 *
 * Setup: See GOOGLE_DOCUMENT_AI_SETUP.md for configuration
 */

import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

// Initialize client
let documentAIClient = null;

function getDocumentAIClient() {
  if (documentAIClient) {
    return documentAIClient;
  }

  console.log('[Document AI Client] Initializing Google Document AI client...');
  console.log('[Document AI Client] Environment check:');
  console.log('[Document AI Client] - Has GOOGLE_APPLICATION_CREDENTIALS:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('[Document AI Client] - Has GOOGLE_CLOUD_PROJECT_ID:', !!process.env.GOOGLE_CLOUD_PROJECT_ID);
  console.log('[Document AI Client] - Has GOOGLE_DOC_AI_PROCESSOR_ID:', !!process.env.GOOGLE_DOC_AI_PROCESSOR_ID);
  console.log('[Document AI Client] - GOOGLE_DOC_AI_LOCATION:', process.env.GOOGLE_DOC_AI_LOCATION || 'us');

  // Get credentials from environment
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentials) {
    console.error('[Document AI Client] ❌ GOOGLE_APPLICATION_CREDENTIALS not found in environment');
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS not found in environment variables');
  }

  console.log('[Document AI Client] Credentials type:', typeof credentials);
  console.log('[Document AI Client] Credentials length:', credentials.length);
  console.log('[Document AI Client] Credentials preview:', credentials.substring(0, 100) + '...');

  // Parse JSON credentials
  let parsedCredentials;
  try {
    parsedCredentials = typeof credentials === 'string'
      ? JSON.parse(credentials)
      : credentials;

    console.log('[Document AI Client] ✅ Credentials parsed successfully');
    console.log('[Document AI Client] - Project ID from credentials:', parsedCredentials.project_id);
    console.log('[Document AI Client] - Client email:', parsedCredentials.client_email);
    console.log('[Document AI Client] - Has private key:', !!parsedCredentials.private_key);
  } catch (error) {
    console.error('[Document AI Client] ❌ Failed to parse credentials:', error.message);
    console.error('[Document AI Client] Credentials string:', credentials.substring(0, 200));
    throw new Error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS: ' + error.message);
  }

  // Initialize client with credentials
  try {
    documentAIClient = new DocumentProcessorServiceClient({
      credentials: parsedCredentials,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    console.log('[Document AI Client] ✅ Client initialized successfully');
  } catch (error) {
    console.error('[Document AI Client] ❌ Failed to initialize client:', error.message);
    throw new Error('Failed to initialize DocumentProcessorServiceClient: ' + error.message);
  }

  return documentAIClient;
}

/**
 * Process document with Google Document AI OCR
 * Optimized for handwriting recognition
 *
 * @param {Buffer} imageBuffer - Image buffer (JPEG, PNG, PDF)
 * @param {string} mimeType - MIME type of image (e.g., 'image/jpeg')
 * @returns {Promise<Object>} - Extracted text and confidence scores
 */
export async function processDocumentWithOCR(imageBuffer, mimeType = 'image/jpeg') {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('[Google Document AI] STARTING OCR PROCESSING');
    console.log('='.repeat(80));
    console.log('[Document AI] Image size:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    console.log('[Document AI] MIME type:', mimeType);

    const client = getDocumentAIClient();

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_DOC_AI_LOCATION || 'us';
    const processorId = process.env.GOOGLE_DOC_AI_PROCESSOR_ID;

    if (!projectId || !processorId) {
      throw new Error('Missing required environment variables: GOOGLE_CLOUD_PROJECT_ID or GOOGLE_DOC_AI_PROCESSOR_ID');
    }

    // Build processor name
    const processorName = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    console.log('[Document AI] Processor:', processorName);

    // Prepare request
    const request = {
      name: processorName,
      rawDocument: {
        content: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    console.log('[Document AI] Sending request to Google Document AI...');
    const startTime = Date.now();

    // Process document
    const [result] = await client.processDocument(request);
    const endTime = Date.now();

    console.log('[Document AI] ✅ Processing completed in', (endTime - startTime), 'ms');
    console.log('[Document AI] Text length:', result.document.text?.length || 0);

    // Extract text and confidence
    const extractedText = result.document.text || '';

    // Calculate average confidence from all text segments
    let totalConfidence = 0;
    let confidenceCount = 0;

    if (result.document.pages) {
      result.document.pages.forEach(page => {
        if (page.tokens) {
          page.tokens.forEach(token => {
            if (token.layout?.confidence) {
              totalConfidence += token.layout.confidence;
              confidenceCount++;
            }
          });
        }
      });
    }

    const averageConfidence = confidenceCount > 0
      ? totalConfidence / confidenceCount
      : 0.9; // Default confidence if not available

    console.log('[Document AI] Average confidence:', (averageConfidence * 100).toFixed(1) + '%');
    console.log('[Document AI] Extracted text preview (first 300 chars):');
    console.log(extractedText.substring(0, 300));
    console.log('='.repeat(80) + '\n');

    return {
      success: true,
      text: extractedText,
      confidence: averageConfidence,
      pages: result.document.pages?.length || 1,
      processingTime: endTime - startTime,
      source: 'google-document-ai',
    };

  } catch (error) {
    console.error('[Document AI] ❌ Error processing document:', error.message);
    console.error('[Document AI] Error details:', error);

    return {
      success: false,
      error: error.message,
      text: '',
      confidence: 0,
      source: 'google-document-ai',
    };
  }
}

/**
 * Extract Nomor Ijazah from OCR text
 * Supports various formats common in Indonesian diplomas
 *
 * @param {string} ocrText - Raw OCR text from document
 * @returns {string|null} - Extracted nomor ijazah or null
 */
export function extractNomorIjazahFromOCR(ocrText) {
  if (!ocrText || typeof ocrText !== 'string') {
    return null;
  }

  console.log('\n[Extract Nomor Ijazah] Analyzing OCR text...');
  console.log('[Extract Nomor Ijazah] Text length:', ocrText.length);

  // Common patterns for Nomor Ijazah in Indonesia
  const patterns = [
    // Generic pattern: Complex format with multiple slashes (e.g., "182016/K01/PP/VII/IJZ/1/2008")
    // MUST be first to catch long formats before generic patterns
    /\b([0-9]{4,6}\/[A-Z0-9]{2,6}\/[A-Z0-9]{2,6}\/[A-Z0-9\/\-]{3,30})\b/i,

    // Format: "Nomor Ijazah: 12345/UN/2020" or "No. Ijazah: ..."
    // Use non-greedy and stop at space/newline
    /(?:nomor\s+ijazah|no\.?\s*ijazah|ijazah\s+no\.?)\s*:?\s*([A-Z0-9\/\-\.]+)/i,

    // Format: "Nomor: 12345/UN/2020" (standalone, biasanya di header/pojok)
    /\bnomor\s*:?\s*([A-Z0-9\/\-\.]+)/i,

    // Format: Registration number patterns
    /(?:reg\.?\s*no\.?|registration\s+number)\s*:?\s*([A-Z0-9\/\-\.]+)/i,

    // Format: Serial number patterns (common in older diplomas)
    /(?:serial|seri)\s*:?\s*([A-Z0-9\/\-\.]+)/i,

    // Generic pattern: Numbers with slashes (e.g., "12345/UN/2020")
    /\b([0-9]{3,6}\/[A-Z]{2,6}\/[0-9]{4})\b/,

    // Pattern: Year-based format (e.g., "2020.05.12345")
    /\b([0-9]{4}\.[0-9]{2}\.[0-9]{4,6})\b/,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = ocrText.match(pattern);

    if (match && match[1]) {
      let nomorIjazah = match[1].trim();

      // Clean up: remove trailing text that's not part of nomor
      // Stop at newline or lowercase words (indicates start of sentence)
      nomorIjazah = nomorIjazah.split(/\n/)[0].trim();
      nomorIjazah = nomorIjazah.replace(/\s+[a-z]{3,}.*$/i, '').trim();

      console.log(`[Extract Nomor Ijazah] ✅ Found with pattern ${i + 1}:`, nomorIjazah);
      return nomorIjazah;
    }
  }

  console.log('[Extract Nomor Ijazah] ❌ No nomor ijazah found');
  return null;
}

/**
 * Process Ijazah document and extract nomor ijazah
 * Complete workflow: OCR → Extract → Validate
 *
 * @param {Buffer} imageBuffer - Ijazah image buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} - Extraction result with nomor ijazah
 */
export async function extractIjazahWithDocumentAI(imageBuffer, mimeType = 'image/jpeg') {
  console.log('\n' + '='.repeat(80));
  console.log('[Ijazah Extraction] STARTING GOOGLE DOCUMENT AI EXTRACTION');
  console.log('='.repeat(80));

  try {
    // Step 1: OCR Processing
    const ocrResult = await processDocumentWithOCR(imageBuffer, mimeType);

    if (!ocrResult.success) {
      console.log('[Ijazah Extraction] ❌ OCR failed');
      return {
        success: false,
        error: 'OCR processing failed: ' + ocrResult.error,
        nomorIjazah: null,
        confidence: 0,
      };
    }

    console.log('[Ijazah Extraction] ✅ OCR successful');
    console.log('[Ijazah Extraction] Confidence:', (ocrResult.confidence * 100).toFixed(1) + '%');

    // Step 2: Extract Nomor Ijazah
    const nomorIjazah = extractNomorIjazahFromOCR(ocrResult.text);

    if (!nomorIjazah) {
      console.log('[Ijazah Extraction] ⚠️ Nomor Ijazah not found in OCR text');
      return {
        success: true, // OCR succeeded, but extraction failed
        nomorIjazah: null,
        confidence: ocrResult.confidence,
        ocrText: ocrResult.text,
        warning: 'Nomor Ijazah tidak dapat diekstrak dari dokumen',
      };
    }

    console.log('[Ijazah Extraction] ✅ Nomor Ijazah extracted:', nomorIjazah);
    console.log('='.repeat(80) + '\n');

    return {
      success: true,
      nomorIjazah: nomorIjazah,
      confidence: ocrResult.confidence,
      ocrText: ocrResult.text,
      processingTime: ocrResult.processingTime,
    };

  } catch (error) {
    console.error('[Ijazah Extraction] ❌ Error:', error.message);
    console.error('[Ijazah Extraction] Stack:', error.stack);

    return {
      success: false,
      error: error.message,
      nomorIjazah: null,
      confidence: 0,
    };
  }
}

/**
 * Check if Document AI is configured and available
 * @returns {boolean}
 */
export function isDocumentAIAvailable() {
  const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasProjectId = !!process.env.GOOGLE_CLOUD_PROJECT_ID;
  const hasProcessorId = !!process.env.GOOGLE_DOC_AI_PROCESSOR_ID;

  const isAvailable = hasCredentials && hasProjectId && hasProcessorId;

  if (!isAvailable) {
    console.log('[Document AI] Configuration check:');
    console.log('  - Has credentials:', hasCredentials);
    console.log('  - Has project ID:', hasProjectId);
    console.log('  - Has processor ID:', hasProcessorId);
  }

  return isAvailable;
}

export default {
  processDocumentWithOCR,
  extractNomorIjazahFromOCR,
  extractIjazahWithDocumentAI,
  isDocumentAIAvailable,
};
