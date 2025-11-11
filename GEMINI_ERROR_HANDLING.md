# Gemini API Error Handling

## Overview

Sistem SIVANA menggunakan **Hybrid Approach** untuk validasi dokumen, dengan Gemini AI sebagai primary engine dan fallback algorithm untuk reliability.

## Error Types Handled

### 1. **Rate Limit Error (429)**
**Error Message:**
```
[429] You exceeded your current quota
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
```

**Cause:**
- Gemini API free tier limit: **10 requests/minute**
- Multiple users/refreshes quickly exceed quota

**Handling Strategy:**
1. **Suppress detailed error logging** (tidak menakut-nakuti user)
2. **Automatic fallback** ke manual algorithm
3. Log hanya: `⚠️ API rate limit - using fallback algorithm`

**Implementation:**
```javascript
// In src/lib/gemini.js
catch (error) {
  if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
    console.log('[Gemini Matcher] ⚠️ API rate limit - using fallback algorithm');
    return {
      success: false,
      category: 'rate_limit',
      error: 'rate_limit',
    };
  }
}
```

### 2. **JSON Parse Error**
**Error Message:**
```
JSON Parse error: Unexpected EOF
```

**Cause:**
- Gemini response incomplete or malformed
- Response surrounded by non-JSON text

**Handling Strategy:**
1. Remove markdown code blocks (`\`\`\`json`)
2. Check if response is too short (< 20 chars)
3. Extract JSON using regex: `/\{[\s\S]*\}/`
4. Validate required fields exist
5. Return safe fallback if parsing fails

**Implementation:**
```javascript
try {
  let cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  if (!cleanJson || cleanJson.length < 20) {
    throw new Error('Gemini response is empty or incomplete');
  }
  
  const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanJson = jsonMatch[0];
  }
  
  matchResult = JSON.parse(cleanJson);
  
  // Validate required fields
  if (!matchResult.hasOwnProperty('matched')) {
    throw new Error('Missing required fields');
  }
} catch (parseError) {
  return {
    success: false,
    recommendation: 'review',
  };
}
```

### 3. **Network Errors**
**Cause:**
- Internet connection issues
- Gemini API down/maintenance

**Handling Strategy:**
- Catch all errors, log message
- Fallback to manual algorithm
- User experience tidak terpengaruh

## Fallback Flow

### Program Studi Matching

```
1. Try Gemini AI
   ├── Success → Use Gemini result (similarity, reasoning)
   └── Fail (429/error) → Fallback to manual algorithm
       
2. Manual Algorithm (checkProgramStudiMatch)
   ├── Exact match: 100%
   ├── Contains match: 95%
   ├── Same group (ekonomi, teknik, etc): 80%
   └── Keyword similarity: calculated %
```

**Code Flow:**
```javascript
// In RequirementValidator.js
try {
  const geminiMatch = await matchProgramStudiWithGemini(extractedProdi, requiredProdi);
  if (geminiMatch.success) {
    matchResult = { ...geminiMatch, source: 'GEMINI_AI' };
  } else {
    useGemini = false;
  }
} catch (error) {
  console.log("⚠️ Gemini error, using fallback");
  useGemini = false;
}

if (!useGemini) {
  const manualMatch = checkProgramStudiMatch(extractedProdi, requiredProdi);
  matchResult = { ...manualMatch, source: 'MANUAL_ALGORITHM' };
}
```

### Ijazah Extraction

```
1. Try Gemini AI
   ├── Success → Use Gemini extracted data (nama, prodi, dll)
   └── Fail → Fallback to OCR pattern matching
       
2. OCR Pattern Matching
   ├── Nama: Regex patterns for common formats
   ├── Program Studi: Search for "Program Studi:", "Jurusan:", etc
   └── Other fields: Best-effort extraction
```

### Transkrip (IPK) Extraction

**NO GEMINI** - Manual pattern matching only (per user request)

```
1. extractIPK() - Regex patterns
   ├── IPK: 3.50
   ├── GPA: 3.50
   ├── 3.50/4.0
   └── Alternative patterns
   
2. Validate IPK range (0.0 - 4.0)
```

## User Experience

### With Rate Limit (Before Fix)
❌ Browser console shows scary red error:
```
[Error] [GoogleGenerativeAI Error]: Error fetching from ...
[429] You exceeded your current quota...
```

### With Rate Limit (After Fix)
✅ Browser console shows friendly message:
```
[Gemini Matcher] ⚠️ API rate limit - using fallback algorithm
[RequirementValidator] ✅ Manual Algorithm: 80%
```

## Benefits

1. **Reliability**: System never crashes, always produces result
2. **User-Friendly**: No scary error messages in console
3. **Seamless**: User doesn't know if Gemini or manual was used
4. **Cost-Effective**: Reduces Gemini API calls while maintaining quality
5. **Performance**: Manual algorithm is faster than API calls

## Monitoring

### Console Logs to Watch
- `[Gemini Matcher] ✅ Match result:` - Gemini success
- `[RequirementValidator] ✅ Manual Algorithm:` - Fallback used
- `⚠️ API rate limit` - Rate limit hit
- `❌ Error:` - Other errors

### Source Tracking
Every validation result includes `source` field:
- `GEMINI_AI` - Gemini AI was used
- `MANUAL_ALGORITHM` - Manual fallback was used
- `RATE_LIMIT` - Rate limit triggered fallback
- `ERROR` - Other error triggered fallback

## Future Improvements

1. **Rate Limit Handling**: Implement exponential backoff/retry
2. **Cache Results**: Cache Gemini responses for common prodi combinations
3. **Queue System**: Queue requests to avoid hitting rate limits
4. **Upgrade Plan**: Consider upgrading to paid Gemini API for higher limits
5. **Analytics**: Track Gemini vs Manual usage ratio

## Testing

To test error handling:
1. **Force Rate Limit**: Upload multiple documents rapidly
2. **Check Console**: Should see fallback messages, not scary errors
3. **Verify Results**: System should still produce validation results
4. **Check Source**: `validationSource` should show which method was used

## Summary

**Hybrid Approach = Best of Both Worlds**
- Gemini AI for intelligent, context-aware validation
- Manual algorithm for reliability and speed
- Seamless fallback for continuous service
- User never sees technical errors

