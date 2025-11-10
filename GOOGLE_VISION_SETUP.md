# Google Vision API Setup Guide

## Step-by-Step Setup

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Select a Project" → "New Project"
3. Enter project name: `SIVANA-Vision`
4. Click "Create"

### Step 2: Enable Vision API
1. In GCP Console, go to "APIs & Services" → "Library"
2. Search for "Cloud Vision API"
3. Click on it and press "ENABLE"
4. Wait for enablement to complete (~1-2 min)

### Step 3: Create Service Account
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in service account details:
   - Service account name: `sivana-vision-service`
   - Service account ID: (auto-filled)
   - Description: `SIVANA document verification service`
4. Click "Create and Continue"
5. Grant permissions:
   - Select role: **"Basic" → "Editor"** (for testing)
   - Click "Continue"
6. Click "Create Key"
7. Select **"JSON"** format
8. Click "Create"
9. **Download JSON file** (save it safely!)

### Step 4: Convert JSON to Base64 (Optional but Recommended)
Jika ingin store di `.env.local` sebagai variable:

```bash
# Mac/Linux
base64 < /path/to/service-account-key.json | tr -d '\n' > vision-api-key.txt

# Windows
certutil -encode /path/to/service-account-key.json vision-api-key-b64.txt
```

Salin isi dari file output dan paste ke `.env.local`:
```
GOOGLE_VISION_API_KEY=<paste base64 here>
```

### Step 5: Update .env.local
Pilih salah satu:

**Option A (Recommended for Development):**
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Option B (For Production/Environment Variable):**
```env
GOOGLE_VISION_API_KEY=base64_encoded_json_here
```

---

## Verify Setup

Jalankan test script:

```bash
npm run test:vision
```

Script akan test apakah API key valid dan Vision API bisa diakses.

---

## Cost Estimate

**Free Tier:**
- 1,000 requests/month gratis (unlimited)
- $300 credit untuk 90 hari pertama
- ~46,000 extra requests = ~$300

**Production:**
- Harga: $6.50 per 1,000 requests
- 100K users × 1 request/user/bulan = ~$650/bulan

---

## Troubleshooting

### Error: "Authentication failed"
- ✅ Pastikan service account JSON di-download
- ✅ Pastikan Vision API sudah di-enable
- ✅ Check PATH ke file sudah benar

### Error: "Permission denied"
- ✅ Service account perlu role "Editor" atau minimal "Viewer"
- ✅ Re-create service account dengan role yang tepat

### Error: "Quota exceeded"
- ✅ Sudah melebihi 1000 gratis/bulan
- ✅ Need to add payment method untuk production

---

## Next: Integration Code

Setelah setup selesai, saya akan create:
- `/src/lib/visionApi.js` - Wrapper untuk Google Vision
- `/src/components/DocumentUpload.js` - UI untuk upload dokumen
- `/src/api/documents/verify.js` - API endpoint untuk verifikasi

Siap? Kasih tahu setelah step 4 selesai! 🚀
