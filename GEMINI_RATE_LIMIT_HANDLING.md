# 🚦 Gemini API Rate Limit & Fallback Handling

## Problem: Rate Limit Error

```
Error: [GoogleGenerativeAI Error]: Error fetching...
[429] You exceeded your current quota, please check your plan and billing details.

Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
Limit: 10 requests per minute
```

## Gemini Free Tier Limits

| Metric | Free Tier Limit |
|--------|----------------|
| Requests per minute | **10 RPM** |
| Requests per day | 1,500 RPD |
| Tokens per minute | 32,000 TPM |

**Problem**: Saat upload banyak dokumen atau refresh halaman berkali-kali, quota 10 RPM terpakai!

---

## Solution: Hybrid Approach (Gemini + Fallback)

### Architecture

```
┌─────────────────────────────────────────┐
│   Validate Program Studi                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Try Gemini AI  │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
    ✅ Success        ❌ Error
        │                 │
        │           ┌─────┴──────┐
        │           │ Rate Limit │
        │           │   or       │
        │           │ Parse Error│
        │           └─────┬──────┘
        │                 │
        │                 ▼
        │      ┌──────────────────┐
        │      │ Fallback: Manual │
        │      │    Algorithm     │
        │      └──────────┬───────┘
        │                 │
        └────────┬────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Final Result │
         └──────────────┘
```

### Implementation

```javascript
// HYBRID APPROACH
try {
  console.log("[RequirementValidator] Trying GEMINI AI...");
  const geminiMatch = await matchProgramStudiWithGemini(extractedProdi, requiredProdi);
  
  if (geminiMatch.success) {
    // Use Gemini result
    matchResult = {
      similarity: geminiMatch.similarity,
      source: 'GEMINI_AI',
    };
  } else {
    // Gemini parse error - use fallback
    useGemini = false;
  }
} catch (error) {
  // Rate limit, network error, etc - use fallback
  console.log("[RequirementValidator] ⚠️ Gemini error:", error.message);
  console.log("[RequirementValidator] Using fallback algorithm");
  useGemini = false;
}

// FALLBACK: Manual algorithm
if (!useGemini) {
  const manualMatch = checkProgramStudiMatch(extractedProdi, requiredProdi);
  matchResult = {
    similarity: manualMatch.similarity,
    source: 'MANUAL_ALGORITHM',
  };
}
```

---

## Manual Algorithm (Fallback)

Menggunakan **Program Studi Groups** untuk matching:

```javascript
const PROGRAM_STUDI_GROUPS = {
  ekonomi: [
    "ekonomi", "akuntansi", "manajemen", "keuangan", "perbankan", 
    "bisnis", "administrasi bisnis", "ilmu ekonomi", "ekonomi pembangunan"
  ],
  teknik: [
    "teknik", "engineering", "sipil", "mesin", "elektro", "industri",
    "informatika", "komputer", "sistem informasi", "teknologi informasi"
  ],
  // ... more groups
};

function checkProgramStudiMatch(extracted, required) {
  // 1. Exact match → 100%
  if (norm1 === norm2) return { matched: true, similarity: 100 };
  
  // 2. Contains → 95%
  if (norm1.includes(norm2) || norm2.includes(norm1)) 
    return { matched: true, similarity: 95 };
  
  // 3. Same group → 80%
  for (const [group, keywords] of Object.entries(PROGRAM_STUDI_GROUPS)) {
    const inGroup1 = keywords.some(kw => norm1.includes(kw));
    const inGroup2 = keywords.some(kw => norm2.includes(kw));
    
    if (inGroup1 && inGroup2) {
      return { matched: true, similarity: 80 };
    }
  }
  
  // 4. Keyword match → 70%+
  // 5. No match → 0%
}
```

**Keuntungan Fallback**:
- ✅ No API calls = No rate limit
- ✅ Instant (no network latency)
- ✅ Still accurate for common cases
- ✅ Free!

---

## Console Logs

### Scenario 1: Gemini Success
```
[RequirementValidator] 🎓 Validating Program Studi...
[RequirementValidator] Trying GEMINI AI...
[Gemini Matcher] ✅ Match result: 80% - same_field
[RequirementValidator] ✅ Gemini Success: 80%
[RequirementValidator] Final Result: 80% (GEMINI_AI)
```

### Scenario 2: Rate Limit → Fallback
```
[RequirementValidator] 🎓 Validating Program Studi...
[RequirementValidator] Trying GEMINI AI...
[Gemini Matcher] ❌ Error: [429] Rate limit exceeded
[RequirementValidator] ⚠️ Gemini error: Rate limit exceeded
[RequirementValidator] Using fallback algorithm
[checkProgramStudiMatch] ✓ Both in same group: ekonomi
[RequirementValidator] ✅ Manual Algorithm: 80%
[RequirementValidator] Final Result: 80% (MANUAL_ALGORITHM)
```

### Scenario 3: Parse Error → Fallback
```
[RequirementValidator] Trying GEMINI AI...
[Gemini Matcher] JSON parse error: Unexpected EOF
[RequirementValidator] ⚠️ Gemini failed, using fallback algorithm
[RequirementValidator] ✅ Manual Algorithm: 80%
[RequirementValidator] Final Result: 80% (MANUAL_ALGORITHM)
```

---

## UI Display

Result akan menampilkan `validationSource`:

```javascript
{
  category: "Jurusan",
  status: "passed",
  similarity: 80,
  validationSource: "GEMINI_AI" | "MANUAL_ALGORITHM"
}
```

**User tidak perlu tahu** source mana yang digunakan - yang penting hasilnya akurat!

---

## Benefits of Hybrid Approach

| Aspect | Gemini Only | Hybrid (Gemini + Fallback) |
|--------|-------------|---------------------------|
| Accuracy | ⭐⭐⭐⭐⭐ Very High | ⭐⭐⭐⭐ High |
| Reliability | ❌ Fails on rate limit | ✅ Always works |
| Speed | ⚠️ Network latency | ✅ Instant (fallback) |
| Cost | 💰 API calls | 💚 Free (fallback) |
| Rate Limit Risk | ❌ High | ✅ Mitigated |

---

## Best Practices

### 1. Caching (Future Improvement)
Cache Gemini results untuk kombinasi yang sama:
```javascript
const cache = new Map();
const cacheKey = `${extractedProdi}|${requiredProdi}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey); // Instant!
}
```

### 2. Exponential Backoff (Future)
Jika rate limit, tunggu sebelum retry:
```javascript
const retryAfter = error.retryDelay || 18; // seconds
await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
// Retry...
```

### 3. Batch Processing (Future)
Process multiple comparisons dalam 1 API call:
```javascript
// Instead of 5 separate calls:
// - Akuntansi vs Ekonomi
// - Teknik vs Informatika
// - ...

// Do 1 call:
compareMultiple([
  { extracted: "Akuntansi", required: "Ekonomi" },
  { extracted: "Teknik", required: "Informatika" },
  // ...
])
```

---

## Monitoring Usage

Check your Gemini API usage:
🔗 https://ai.dev/usage?tab=rate-limit

**Free Tier Limits**:
- ✅ Requests/min: **10 RPM**
- ✅ Requests/day: 1,500 RPD
- ✅ Tokens/min: 32,000 TPM

**Tips untuk Avoid Rate Limit**:
1. ✅ Use hybrid approach (already implemented!)
2. ✅ Implement caching (future)
3. ✅ Batch requests (future)
4. ✅ Add delay between requests (future)
5. 💰 Upgrade to paid tier if needed

---

## Paid Tier (If Needed)

Jika aplikasi production perlu lebih banyak requests:

| Plan | RPM | Price |
|------|-----|-------|
| Free | 10 | $0 |
| Pay-as-you-go | 1,000+ | ~$0.0006/request |
| Enterprise | Custom | Contact sales |

**Current status**: Free tier + Fallback = **Good enough!** ✅

---

## Summary

✅ **Hybrid approach implemented**
✅ **Gemini tried first** (best accuracy)
✅ **Manual fallback** if Gemini fails (rate limit, error)
✅ **No user impact** - always get result
✅ **Graceful degradation** - system still works
✅ **Console logs** show which method used

**Result**: System is now **resilient** to Gemini API issues! 🎉

