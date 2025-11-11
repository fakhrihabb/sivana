# Testing Google Document AI Integration

## 🧪 How to Test

### 1. Setup Environment Variables

Make sure you have added to `.env`:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_DOC_AI_PROCESSOR_ID=your-processor-id
GOOGLE_DOC_AI_LOCATION=us
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account",...}'
```

### 2. Test with Sample Ijazah

Upload an ijazah image through the web interface:
1. Go to `/formasi/1`
2. Upload KTP first
3. Upload Ijazah with **handwritten nomor ijazah**
4. Check console logs for extraction results

---

## 📊 Expected Behavior

### Extraction Flow (3-Tier Approach):

```
1. Tesseract OCR (Fast, good for printed text)
   ↓ (if fails)
2. Google Document AI (Best for handwriting)
   ↓ (if fails)
3. Gemini AI (Intelligent fallback)
```

### Console Logs to Look For:

#### Success with Tesseract:
```
[IJAZAH Validation] ✅ Nomor ijazah extracted by OCR: 12345/UN/2020
[IJAZAH Validation] extractionSource: tesseract-ocr
```

#### Success with Document AI:
```
[IJAZAH Validation] ⚠️ Nomor ijazah tidak ter-extract dari Tesseract OCR
[IJAZAH Validation] 📄 Trying Google Document AI for handwriting...
[IJAZAH Validation] ✅ Nomor ijazah extracted by Document AI: 12345/UN/2020
[IJAZAH Validation] extractionSource: google-document-ai
```

#### Success with Gemini (final fallback):
```
[IJAZAH Validation] ⚠️ Nomor ijazah tidak ter-extract dari Tesseract OCR
[IJAZAH Validation] 📄 Trying Google Document AI for handwriting...
[IJAZAH Validation] ⚠️ Document AI pattern matching failed
[IJAZAH Validation] 🤖 Trying Gemini AI extraction as final fallback...
[IJAZAH Validation] ✅ Nomor ijazah extracted by Gemini AI: 12345/UN/2020
[IJAZAH Validation] extractionSource: gemini-ai
```

#### All methods failed:
```
[IJAZAH Validation] ❌ All extraction methods failed (Tesseract, Document AI, Gemini)
⚠️ Nomor ijazah tidak dapat diekstrak dari dokumen (semua metode gagal)
```

---

## 🔍 Manual Testing Script

Create a test file `test-document-ai.js`:

```javascript
import fs from 'fs';
import { extractIjazahWithDocumentAI } from './src/lib/googleDocumentAI.js';

async function testDocumentAI() {
  // Read sample ijazah image
  const imageBuffer = fs.readFileSync('./test-samples/ijazah-sample.jpg');

  console.log('Testing Google Document AI...');
  console.log('Image size:', (imageBuffer.length / 1024).toFixed(2), 'KB');

  // Test extraction
  const result = await extractIjazahWithDocumentAI(imageBuffer, 'image/jpeg');

  console.log('\n=== RESULT ===');
  console.log('Success:', result.success);
  console.log('Nomor Ijazah:', result.nomorIjazah);
  console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%');
  console.log('Processing Time:', result.processingTime, 'ms');

  if (result.ocrText) {
    console.log('\nOCR Text Preview (first 300 chars):');
    console.log(result.ocrText.substring(0, 300));
  }
}

testDocumentAI().catch(console.error);
```

Run:
```bash
node test-document-ai.js
```

---

## 📈 Performance Metrics

### Expected Processing Times:

| Method | Average Time | Accuracy (Printed) | Accuracy (Handwritten) |
|--------|--------------|-------------------|----------------------|
| Tesseract | 1-2s | 85-95% | 40-60% |
| Document AI | 2-4s | 90-95% | 85-95% |
| Gemini AI | 3-5s | 80-90% | 75-85% |

### Cost per 1,000 Ijazah:

| Scenario | Tesseract | Document AI | Gemini | Total Cost |
|----------|-----------|-------------|--------|------------|
| All printed (easy) | 1000 | 0 | 0 | **$0** |
| 50% handwritten | 500 | 450 | 50 | **~$0.75** |
| 80% handwritten | 200 | 750 | 50 | **~$1.20** |
| All handwritten | 0 | 900 | 100 | **~$1.50** |

---

## 🐛 Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS not found"
**Solution**: Check `.env` file, make sure credentials are in correct JSON format

### Error: "Processor not found"
**Solution**: Verify `GOOGLE_DOC_AI_PROCESSOR_ID` is correct
- Go to: https://console.cloud.google.com/ai/document-ai/processors
- Copy processor ID from URL or details page

### Error: "Permission denied"
**Solution**: Make sure service account has "Document AI API User" role
- Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
- Check roles for your service account

### Document AI not being used (falls back to Gemini immediately)
**Solution**: Check if `isDocumentAIAvailable()` returns true
```javascript
import { isDocumentAIAvailable } from './src/lib/googleDocumentAI.js';
console.log('Document AI available:', isDocumentAIAvailable());
```

### Low confidence scores
**Possible causes**:
- Image quality too low (< 150 DPI)
- Heavy compression artifacts
- Skewed/rotated image
- Poor lighting/contrast

**Solutions**:
- Pre-process image (deskew, denoise, contrast enhancement)
- Request higher quality scans from users
- Add image quality validation before OCR

---

## 📊 Monitoring & Analytics

### Key Metrics to Track:

1. **Extraction Success Rate**
   - Track which tier successfully extracted (Tesseract, Document AI, Gemini)
   - Log to database or analytics service

2. **Processing Time**
   - Monitor average processing time per tier
   - Optimize if Document AI takes too long

3. **Cost Tracking**
   - Count Document AI usage per month
   - Alert when approaching free tier limit (1,000 pages)

4. **Manual Verification Rate**
   - Track how many ijazah need manual verification
   - Goal: < 5% manual verification

### Example Logging:

```javascript
// In your API route
const extractionLog = {
  documentType: 'ijazah',
  extractionSource: validation.extractionSource, // tesseract-ocr, google-document-ai, gemini-ai
  success: !!validation.nomorIjazah,
  confidence: validation.confidence,
  processingTime: validation.processingTime,
  timestamp: new Date(),
};

// Log to database or analytics
await logExtraction(extractionLog);
```

---

## 🎯 Best Practices

1. **Always try Tesseract first** (free, fast)
2. **Use Document AI for handwriting** (cost-effective at $1.50/1K)
3. **Use Gemini as last resort** (slower, less specialized for OCR)
4. **Cache results** to avoid re-processing same document
5. **Pre-validate image quality** before OCR
6. **Monitor usage** to stay within free tier

---

## 📚 Additional Resources

- [Document AI OCR Guide](https://cloud.google.com/document-ai/docs/ocr)
- [Handwriting Recognition](https://cloud.google.com/document-ai/docs/handwriting-recognition)
- [Best Practices for OCR](https://cloud.google.com/document-ai/docs/ocr-best-practices)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

---

## ✅ Success Criteria

Your Document AI integration is working correctly if:

- [ ] Tesseract extracts printed nomor ijazah (85%+ success rate)
- [ ] Document AI extracts handwritten nomor ijazah (80%+ success rate)
- [ ] Fallback to Gemini works when both fail
- [ ] Console logs show clear extraction source
- [ ] Total cost < $2/1000 ijazah
- [ ] Average processing time < 5 seconds
- [ ] Manual verification needed < 10%

---

**Happy Testing!** 🚀
