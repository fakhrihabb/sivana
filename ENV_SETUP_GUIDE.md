# 🎯 GEMINI 2.5 FLASH - YOUR .env.local FILE

## Copy & Paste This (Then Add Your API Key)

```bash
# ===================================
# GEMINI 2.5 FLASH API CONFIGURATION
# ===================================
# Get your API key from: https://aistudio.google.com/app/apikeys
# Then paste it below, replacing "your_gemini_api_key_here"

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Step-by-Step Instructions

### 1. Get Your API Key
- Visit: **https://aistudio.google.com/app/apikeys**
- Click: **"Create API Key"** button
- Copy: The generated key (it will look like `AIzaSyDexample...`)

### 2. Open `.env.local`
- Location: Root of your project (same level as `package.json`)
- File name: `.env.local` (exactly this, with the dot)

### 3. Replace the Placeholder

**Before:**
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**After (with YOUR key):**
```bash
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDexample1234567890abcdefghijklmnop
```

Replace `AIzaSyDexample1234567890abcdefghijklmnop` with your ACTUAL key from step 1.

### 4. Save the File
- Press: **Ctrl+S** (Windows) or **Cmd+S** (Mac)
- Make sure it's saved!

### 5. Restart Dev Server
```bash
npm run dev
```

### 6. Test the Chatbot
- Open: http://localhost:3000
- Click chatbot bubble (bottom right)
- Type: "Halo"
- Bot should respond in Indonesian!

---

## What Your API Key Looks Like

### ✅ Correct Format
```
AIzaSyDexample1234567890abcdefghijklmnop
```

### ✅ Signs of Valid Key
- Starts with: `AIza`
- Length: About 40 characters
- Contains: Letters and numbers only
- From: https://aistudio.google.com/app/apikeys

### ❌ Wrong Format
```
your_gemini_api_key_here        ← Placeholder (not real)
sk-1234567890                     ← Wrong prefix
https://...                       ← URL (not key)
my-secret-key                     ← Random text
```

---

## Where to Put It

### In Your Project Structure
```
sivana/
├── .env.local                 ← YOUR FILE (with API key)
├── .env.example               ← Template (reference)
├── package.json
├── src/
│   ├── lib/gemini.js          ← Uses your API key from .env.local
│   └── components/ChatBot.js   ← Calls gemini.js
└── README.md
```

---

## Important Notes

### 🔒 Security
- **Never commit `.env.local`** - It's in `.gitignore`
- **Keep it secret** - Don't share your API key
- **Don't push to GitHub** - Always use `.env.local` locally

### 💾 File Encoding
- Make sure `.env.local` is **UTF-8 encoding**
- No BOM (Byte Order Mark)
- Plain text file

### ✅ Verification
After setting up, verify:
```bash
# This command shows if .env.local is ignored by git
git check-ignore .env.local
# Should output: .env.local (if ignored correctly)
```

---

## Quick Troubleshooting

### API Key Not Working?
1. Check it starts with `AIza`
2. Check it's ~40 characters long
3. Check you didn't miss/add any characters
4. Get a new one: https://aistudio.google.com/app/apikeys

### Still Not Working?
1. Open browser console (F12)
2. Look for error messages
3. Restart dev server: `npm run dev`
4. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### File Can't Be Found?
- Make sure `.env.local` is in **root directory**
- Same level as `package.json`
- Not in any subfolder

---

## Complete Example

Here's what your `.env.local` might look like after setup:

```bash
# ===================================
# GEMINI 2.5 FLASH API CONFIGURATION
# ===================================
# Get your API key from: https://aistudio.google.com/app/apikeys
# Then paste it below, replacing "your_gemini_api_key_here"

NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDexample1234567890abcdefghijklmnop
```

That's it! The chatbot will now work. 🎉

---

## Next Steps

```bash
# 1. Make sure .env.local is set up ✓
# 2. Run dev server
npm run dev

# 3. Visit the app
# http://localhost:3000

# 4. Test the chatbot!
# Click bubble and type a message
```

---

## Support

If something doesn't work:
1. Check that API key is in `.env.local` (not `.env.example`)
2. Check API key format starts with `AIza`
3. Check browser console (F12) for error messages
4. Read: `GEMINI_SETUP.md` for detailed docs
5. Read: `SETUP_CHECKLIST.md` for step-by-step guide

---

**You're all set! 🚀**
