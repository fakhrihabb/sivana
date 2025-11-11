# Fix: Cross-Document Name Validation

## Problem
Validasi nama antar dokumen (terutama KTP vs Ijazah) tidak berfungsi karena frontend tidak mengirim session data yang berisi informasi dokumen yang sudah di-upload sebelumnya.

## Root Cause
1. **Backend sudah siap**: API route di `/src/app/api/documents/route.js` sudah mengekspektasi `sessionData` dari FormData
2. **Validator sudah siap**: Semua validator di `/src/lib/documentValidator.js` sudah menerima parameter `ktpData`, `ijazahData`, dll
3. **Frontend tidak mengirim**: Component `DocumentUpload.js` tidak mengirim `sessionData` ke API

## Solution Implemented

### 1. Update DocumentUpload Component (`/src/components/documents/DocumentUpload.js`)

**Added new props `uploadedDocs` and `formasiData`:**
```javascript
export default function DocumentUpload({
  documentId,
  documentName,
  required,
  onUpload,
  uploaded,
  requirementValidation,
  sessionData, // OLD: Not used anymore
  uploadedDocs, // NEW: All uploaded documents for extracting latest data
  formasiData, // NEW: Formasi data for validation
}) {
```

**Prepare FRESH sessionData from uploadedDocs at upload time:**
```javascript
// Create FormData
const formData = new FormData();
formData.append("file", file);
formData.append("documentType", documentId);

// Prepare fresh session data from latest uploadedDocs state
const freshSessionData = {
  ktpData: uploadedDocs?.ktp?.result?.extractedData || null,
  ijazahData: uploadedDocs?.ijazah?.result?.extractedData || null,
  formasiData: formasiData || null,
};

console.log("[DocumentUpload] Preparing fresh session data for", documentId);
console.log("[DocumentUpload] - Has KTP data:", !!freshSessionData.ktpData);
console.log("[DocumentUpload] - KTP nama:", freshSessionData.ktpData?.nama);

// Add session data for cross-document validation
formData.append("sessionData", JSON.stringify(freshSessionData));
```

**⚠️ CRITICAL FIX:** SessionData is now prepared **at upload time** (inside handleSubmit), not at render time. This ensures we get the **latest uploaded documents** data, avoiding React state update timing issues.

### 2. Update Formasi Page (`/src/app/formasi/[id]/page.js`)

**Pass uploadedDocs and formasiData to each DocumentUpload:**
```javascript
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
```

**Why this approach?** By passing the entire `uploadedDocs` state object, DocumentUpload can extract fresh data at the exact moment of upload, avoiding React state update timing issues.

## How It Works

### Data Flow:
1. **User uploads KTP** → Extracted data stored in `uploadedDocs.ktp.result.extractedData`
2. **User uploads Ijazah** → sessionData is created containing:
   - `ktpData`: Data from previously uploaded KTP (nama, nik, etc.)
   - `ijazahData`: null (belum ada)
   - `formasiData`: Current formasi requirements
3. **SessionData sent to API** → Backend receives ktpData
4. **Validator compares names:**
   ```javascript
   if (ktpData && ktpData.nama && namaIjazah) {
     const namaKTP = ktpData.nama;
     const similarity = nameSimilarity(namaKTP, namaIjazah);
     
     if (similarity < 0.7) {
       validation.errors.push(
         `❌ Nama tidak cocok: Ijazah tercatat atas nama "${namaIjazah}" ` +
         `tetapi KTP menunjukkan "${namaKTP}". ` +
         `Tingkat kesesuaian: ${(similarity * 100).toFixed(1)}% (minimum 70%).`
       );
     }
   }
   ```

### Validation Checks:
- **KTP vs Ijazah**: Nama harus memiliki similarity ≥ 70%
- **KTP vs Transkrip**: Nama harus match
- **KTP vs Surat Lamaran**: Nama harus match
- **Ijazah vs Transkrip**: Nama dan program studi harus consistent

## Testing

### Manual Test:
1. Go to http://localhost:3000
2. Select a formasi position
3. Upload KTP with name "John Doe"
4. Upload Ijazah with different name "Jane Smith"
5. **Expected Result**: Error message appears:
   ```
   ❌ Nama tidak cocok: Ijazah tercatat atas nama "Jane Smith" 
   tetapi KTP menunjukkan "John Doe". 
   Tingkat kesesuaian: 45.5% (minimum 70%).
   ```

### Check Console Logs:
```
[DocumentUpload] Sending session data: { ktpData: {...}, ijazahData: null, formasiData: {...} }
[API] Session data received: { ktpData: {...}, ijazahData: null, formasiData: {...} }
[IJAZAH Validation] Comparing names (AI extracted):
  - KTP: John Doe
  - Ijazah (AI): Jane Smith
  - Similarity: 45.5%
[IJAZAH Validation] ❌ Name mismatch (AI extracted)
```

## Benefits
✅ **Cross-document validation now works**
✅ **Detects name inconsistencies between documents**
✅ **Prevents fraudulent document submissions**
✅ **Similarity threshold (70%) allows for minor variations (e.g., with/without middle name)**
✅ **User gets immediate feedback with clear error messages**

## Future Enhancements
- [ ] Add persistent session storage (localStorage/sessionStorage) for page refresh
- [ ] Add database storage for submitted applications
- [ ] Add document-to-document consistency report (all documents cross-checked)
- [ ] Add audit trail logging for security
- [ ] Allow manual override with justification for legitimate name changes

## Related Files
- `/src/components/documents/DocumentUpload.js` - Frontend upload component
- `/src/app/formasi/[id]/page.js` - Formasi detail page with state management
- `/src/app/api/documents/route.js` - API route handler
- `/src/lib/documentValidator.js` - All validation logic
- `/src/lib/tesseractOcr.js` - Name similarity calculation

## Status
✅ **IMPLEMENTED** - Cross-document name validation is now functional
