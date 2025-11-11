# Google Document AI Setup Guide

## 🚀 Step-by-Step Setup

### 1. Create Google Cloud Project

1. **Buka Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Login dengan Google account Anda

2. **Create New Project**
   - Klik dropdown di top bar (next to "Google Cloud")
   - Klik "NEW PROJECT"
   - Project Name: `sivana-document-ai` (atau nama lain)
   - Klik "CREATE"

3. **Enable Billing** (Required, tapi ada FREE tier)
   - Go to: https://console.cloud.google.com/billing
   - Klik "Link a billing account"
   - Tambahkan credit card (tidak akan di-charge jika dalam FREE tier)
   - FREE tier: 1,000 pages per month

---

### 2. Enable Document AI API

1. **Go to Document AI Page**
   - URL: https://console.cloud.google.com/ai/document-ai
   - Atau search "Document AI" di search bar

2. **Enable API**
   - Klik "ENABLE" button
   - Wait 1-2 minutes untuk activation

3. **Create Processor**
   - Klik "CREATE PROCESSOR"
   - Select Region: **us** atau **eu** (pilih yang dekat)
   - Processor Type: **OCR Processor** (for handwriting)
   - Processor Name: `ijazah-ocr-processor`
   - Klik "CREATE"

4. **Get Processor Details**
   - Setelah created, klik processor name
   - Copy informasi berikut:
     - **Processor ID**: `6e8077f690e39e2`
     - **Location**: `us`
     - **Full Processor Name**: `ocr`

---

### 3. Create Service Account & API Key

#### Option A: Service Account Key (Recommended for Production)

1. **Go to Service Accounts**
   - URL: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Select your project

2. **Create Service Account**
   - Klik "CREATE SERVICE ACCOUNT"
   - Service account name: `document-ai-service`
   - Service account ID: `document-ai-service` (auto-filled)
   - Klik "CREATE AND CONTINUE"

3. **Grant Permissions**
   - Role: **Document AI API User**
   - Klik "CONTINUE"
   - Klik "DONE"

4. **Create Key**
   - Klik service account yang baru dibuat
   - Tab "KEYS"
   - Klik "ADD KEY" → "Create new key"
   - Key type: **JSON**
   - Klik "CREATE"
   - File JSON akan ter-download (SIMPAN FILE INI!)

5. **Save JSON Content**
   - Buka file JSON yang ter-download
   - Copy semua content
   - Nanti akan dipaste ke `.env` file

---

#### Option B: API Key (Simpler, untuk Development)

1. **Go to Credentials**
   - URL: https://console.cloud.google.com/apis/credentials
   - Select your project

2. **Create API Key**
   - Klik "CREATE CREDENTIALS"
   - Select "API Key"
   - Copy API Key yang muncul
   - Klik "RESTRICT KEY" (recommended)
   - API restrictions: Select "Document AI API"
   - Klik "SAVE"

---

### 4. Test Processor (Optional)

1. **Go to Document AI Processors**
   - URL: https://console.cloud.google.com/ai/document-ai/processors

2. **Select Your Processor**
   - Klik `ijazah-ocr-processor`

3. **Test Upload**
   - Klik "UPLOAD TEST DOCUMENT"
   - Upload sample ijazah image
   - Lihat hasilnya (OCR text)

---

## 📝 Environment Variables

Add these to your `.env` file:

### If using Service Account JSON (Recommended):

```env
# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Google Document AI Processor ID
GOOGLE_DOC_AI_PROCESSOR_ID=abcdef1234567890

# Google Document AI Location (us, eu, asia-southeast1)
GOOGLE_DOC_AI_LOCATION=us

# Google Service Account Credentials (paste entire JSON content)
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

### If using API Key (Simpler):

```env
# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Google Document AI Processor ID
GOOGLE_DOC_AI_PROCESSOR_ID=abcdef1234567890

# Google Document AI Location
GOOGLE_DOC_AI_LOCATION=us

# Google API Key
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🎯 How to Get Each Value

### GOOGLE_CLOUD_PROJECT_ID
- Go to: https://console.cloud.google.com/
- See project ID in top dropdown
- Example: `sivana-document-ai-12345`

### GOOGLE_DOC_AI_PROCESSOR_ID
- Go to: https://console.cloud.google.com/ai/document-ai/processors
- Click your processor
- Copy ID from URL or details page
- Example: `abcdef1234567890`

### GOOGLE_DOC_AI_LOCATION
- When creating processor, you chose a region
- Common values: `us`, `eu`, `asia-southeast1`
- Default: `us`

### GOOGLE_APPLICATION_CREDENTIALS (Service Account JSON)
- The JSON file downloaded in Step 3
- Open file, copy entire content
- Paste as single-line string (keep quotes and escape characters)

### GOOGLE_API_KEY (Alternative to Service Account)
- From: https://console.cloud.google.com/apis/credentials
- Create Credentials → API Key
- Copy the key

---

## 💰 Pricing Summary

### Free Tier (Every Month)
- ✅ **1,000 pages FREE** per month
- No credit card needed for free tier
- Perfect for testing & small volume

### After Free Tier
- **OCR Processor**: $1.50 per 1,000 pages
- **Handwriting OCR**: $1.50 per 1,000 pages

### Example Costs
- 5,000 ijazah/month: (5,000 - 1,000) / 1,000 × $1.50 = **$6/month**
- 10,000 ijazah/month: (10,000 - 1,000) / 1,000 × $1.50 = **$13.50/month**
- 50,000 ijazah/year: (50,000 - 1,000) / 1,000 × $1.50 = **$73.50/year**

---

## 🔍 Testing Your Setup

After adding env variables, test with:

```bash
# Test API connection
node -e "console.log(process.env.GOOGLE_CLOUD_PROJECT_ID)"

# Should output your project ID
```

---

## 📚 Additional Resources

- **Document AI Documentation**: https://cloud.google.com/document-ai/docs
- **OCR Processor Guide**: https://cloud.google.com/document-ai/docs/processors-list#processor_ocr-processor
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Free Tier Details**: https://cloud.google.com/document-ai/pricing

---

## ⚠️ Security Notes

1. **NEVER commit `.env` file to git**
   - Add `.env` to `.gitignore`

2. **Keep Service Account JSON secure**
   - Don't share publicly
   - Rotate keys regularly

3. **Restrict API Keys**
   - Always add API restrictions
   - Limit to Document AI API only

---

## 🆘 Troubleshooting

### Error: "Permission Denied"
- Solution: Make sure service account has "Document AI API User" role

### Error: "Processor not found"
- Solution: Check GOOGLE_DOC_AI_PROCESSOR_ID is correct
- Verify processor exists in: https://console.cloud.google.com/ai/document-ai/processors

### Error: "Billing not enabled"
- Solution: Enable billing at: https://console.cloud.google.com/billing
- Free tier still requires billing account (won't be charged)

### Error: "API not enabled"
- Solution: Enable Document AI API at: https://console.cloud.google.com/apis/library/documentai.googleapis.com

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Billing enabled (for free tier)
- [ ] Document AI API enabled
- [ ] OCR Processor created
- [ ] Service Account created with permissions
- [ ] JSON key downloaded
- [ ] Environment variables added to `.env`
- [ ] `.env` added to `.gitignore`
- [ ] Test processor with sample ijazah

---

**Ready to implement!** 🚀
