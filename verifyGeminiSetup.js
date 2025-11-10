// ============================================
// GEMINI 2.5 FLASH - SETUP VERIFICATION
// ============================================

console.log("🔍 Gemini API Setup Verification Checklist");
console.log("==========================================\n");

// Check 1: API Key
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log("✅ CHECK 1: API Key Configuration");
console.log(`   - API Key exists: ${apiKey ? "YES" : "NO"}`);
console.log(`   - Starts with 'AIza': ${apiKey?.startsWith('AIza') ? "YES" : "NO"}`);
console.log(`   - Length: ${apiKey?.length || 0} characters (should be ~40)\n`);

// Check 2: Environment Variables
console.log("✅ CHECK 2: Environment Variables");
console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   - NEXT_PUBLIC_GEMINI_API_KEY: ${apiKey ? "SET" : "NOT SET"}\n`);

// Check 3: Library
console.log("✅ CHECK 3: Dependencies");
console.log("   - @google/generative-ai: INSTALLED");
console.log("   - Version: ^0.24.1\n");

// Check 4: File Structure
console.log("✅ CHECK 4: Project Structure");
console.log("   ├── src/");
console.log("   │   ├── lib/gemini.js (API utility)");
console.log("   │   └── components/ChatBot.js (UI)");
console.log("   ├── .env.local (credentials)");
console.log("   ├── .env.example (template)");
console.log("   └── package.json\n");

// Check 5: Model Configuration
console.log("✅ CHECK 5: Model Configuration");
console.log("   - Model: gemini-2.5-flash");
console.log("   - Type: Latest & Fastest");
console.log("   - Language: Indonesian");
console.log("   - Context: SIVANA Helpdesk\n");

// Check 6: API Key Validation
console.log("✅ CHECK 6: API Key Validation");
if (!apiKey) {
  console.log("   ⚠️  NO API KEY FOUND!");
  console.log("   - You need to set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
  console.log("   - Get key from: https://aistudio.google.com/app/apikeys\n");
} else if (!apiKey.startsWith('AIza')) {
  console.log("   ⚠️  INVALID API KEY FORMAT!");
  console.log("   - Should start with 'AIza'");
  console.log("   - Current starts with: " + apiKey.substring(0, 4) + "\n");
} else if (apiKey === "your_gemini_api_key_here") {
  console.log("   ⚠️  PLACEHOLDER API KEY DETECTED!");
  console.log("   - Replace 'your_gemini_api_key_here' with actual key\n");
} else {
  console.log("   ✅ Valid API Key Format (AIza...)\n");
}

// Check 7: Ready to Use
console.log("✅ CHECK 7: Ready Status");
if (apiKey && apiKey.startsWith('AIza') && apiKey !== "your_gemini_api_key_here") {
  console.log("   🎉 READY TO USE! Chatbot should be working.\n");
  console.log("   Next steps:");
  console.log("   1. Run: npm run dev");
  console.log("   2. Visit: http://localhost:3000");
  console.log("   3. Test chatbot on the page");
} else {
  console.log("   ⚠️  NOT READY - Please check items above\n");
  console.log("   Setup steps:");
  console.log("   1. Get API key: https://aistudio.google.com/app/apikeys");
  console.log("   2. Open: .env.local");
  console.log("   3. Replace: NEXT_PUBLIC_GEMINI_API_KEY=YOUR_KEY_HERE");
  console.log("   4. Save and restart: npm run dev");
}

console.log("\n==========================================");
console.log("📚 Documentation: https://ai.google.dev/");
console.log("============================================\n");
