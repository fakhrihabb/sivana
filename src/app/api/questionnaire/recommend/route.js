import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

// Configure maximum execution time (in seconds) for Vercel
export const maxDuration = 60; // 60 seconds for Pro plan, 10 for Hobby
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    console.log('=== RECOMMEND API CALLED ===');

    // Check if API key is configured
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('GEMINI API KEY NOT CONFIGURED');
      return NextResponse.json({
        success: false,
        error: "Konfigurasi API tidak lengkap. Silakan hubungi administrator."
      }, { status: 500 });
    }

    const { questions, answers, sessionId, preFilteredFormasi } = await request.json();

    console.log('Received data:', {
      questionsCount: questions?.length,
      answersCount: answers?.length,
      sessionId,
      preFilteredFormasiCount: preFilteredFormasi?.length
    });

    if (!questions || !answers || answers.length !== 5) {
      console.error('Invalid input - missing questions or answers');
      return NextResponse.json({
        success: false,
        error: "Data pertanyaan atau jawaban tidak lengkap"
      }, { status: 400 });
    }

    // Use pre-filtered formasi from progressive filtering, or fetch if not provided
    let filteredFormasi;

    if (preFilteredFormasi && preFilteredFormasi.length > 0) {
      console.log(`Using pre-filtered formasi: ${preFilteredFormasi.length} items`);
      filteredFormasi = preFilteredFormasi;
    } else {
      console.log('No pre-filtered data, fetching all formasi...');
      // Fallback: Fetch all formasi from database
      const { data: formasiData, error: formasiError } = await supabase
        .from('formasi')
        .select('*')
        .order('id', { ascending: true });

      if (formasiError) {
        throw new Error(`Supabase error: ${formasiError.message}`);
      }

      if (!formasiData || formasiData.length === 0) {
        return NextResponse.json({
          success: false,
          error: "Tidak ada data formasi tersedia"
        }, { status: 404 });
      }

      // Extract user preferences from answers
      const educationLevel = answers[0]?.value || '';
      const programStudi = answers[1]?.value || '';
      const lokasiPref = answers[3]?.value || '';

      // Quick filter if no pre-filtered data
      filteredFormasi = formasiData.filter(f => {
        if (educationLevel && f.jenjang_pendidikan) {
          if (!(f.jenjang_pendidikan.includes(educationLevel) || educationLevel.includes(f.jenjang_pendidikan))) {
            return false;
          }
        }
        return true;
      }).slice(0, 50);
    }

    // Limit to top 15 for AI processing
    filteredFormasi = filteredFormasi.slice(0, 15);

    // Prepare user profile from answers
    const userProfile = questions.map((q, idx) => {
      const answer = answers[idx];
      return `${q.question}\nJawaban: ${answer.text}`;
    }).join('\n\n');

    // Prepare formasi summaries (limit description length to reduce token usage)
    const formasiSummaries = filteredFormasi.map(f => ({
      id: f.id,
      name: f.name,
      lembaga: f.lembaga,
      lokasi: f.lokasi,
      jenjang_pendidikan: f.jenjang_pendidikan,
      program_studi: f.program_studi,
      jenis_pengadaan: f.jenis_pengadaan,
      description: f.description ? f.description.substring(0, 150) : ''
    }));

    // Use Gemini to analyze and recommend
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
      }
    });

    const prompt = `Analisis profil user dan rekomendasikan TOP 10 formasi ASN dari ${formasiSummaries.length} yang tersedia.

PROFIL USER:
${userProfile}

FORMASI (pre-filtered, ${formasiSummaries.length} tersedia):
${JSON.stringify(formasiSummaries)}

OUTPUT JSON (no markdown):
{
  "recommendations": [
    {"formasi_id": 123, "match_score": 92, "reasons": ["...", "..."]},
    // ... total 10
  ],
  "analysis_summary": "2-3 kalimat profil & rekomendasi"
}

RULES:
- Tepat 10 rekomendasi, sorted by score DESC
- Score realistis & bervariasi: Rank 1-2 (85-95%), 3-5 (75-84%), 6-8 (65-74%), 9-10 (55-64%)
- NO score 100%, NO duplicate scores
- 2-3 reasons per formasi (konkret & spesifik)
- Match berdasarkan: pendidikan (35%), program studi (35%), lokasi (20%), instansi (10%)`;

    console.log('Calling Gemini API...');
    console.log('Gemini API Key exists:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    const result = await model.generateContent(prompt);
    console.log('Gemini API response received');

    const response = await result.response;
    let text = response.text();
    console.log('Gemini response text length:', text.length);

    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const aiResponse = JSON.parse(text);

    // Validate we got 10 recommendations
    if (!aiResponse.recommendations || aiResponse.recommendations.length < 10) {
      throw new Error('AI did not return 10 recommendations');
    }

    // Enrich recommendations with full formasi data
    const enrichedRecommendations = aiResponse.recommendations.slice(0, 10).map(rec => {
      const formasi = filteredFormasi.find(f => f.id === rec.formasi_id);
      if (!formasi) {
        return null;
      }
      return {
        ...formasi,
        match_score: rec.match_score,
        reasons: rec.reasons
      };
    }).filter(Boolean);

    // If we don't have at least 5 valid recommendations, throw error
    if (enrichedRecommendations.length < 5) {
      throw new Error('Could not get enough valid recommendations');
    }

    // Pad with random formasi if we don't have 10 (fallback)
    if (enrichedRecommendations.length < 10) {
      const usedIds = new Set(enrichedRecommendations.map(r => r.id));
      const remainingFormasi = filteredFormasi.filter(f => !usedIds.has(f.id));

      while (enrichedRecommendations.length < 10 && remainingFormasi.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingFormasi.length);
        const formasi = remainingFormasi.splice(randomIndex, 1)[0];
        enrichedRecommendations.push({
          ...formasi,
          match_score: Math.floor(Math.random() * 10) + 55, // 55-64%
          reasons: ['Sesuai dengan jenjang pendidikan', 'Layak untuk dipertimbangkan']
        });
      }
    }

    // Store in database (optional, for analytics)
    if (sessionId) {
      await supabase
        .from('questionnaire_responses')
        .insert({
          session_id: sessionId,
          questions: questions,
          answers: answers,
          recommendations: enrichedRecommendations
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations: enrichedRecommendations,
        analysis_summary: aiResponse.analysis_summary
      }
    });

  } catch (error) {
    console.error('=== ERROR generating recommendations ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);

    // Check for specific error types
    let errorMessage = "Terjadi kesalahan saat menganalisis jawaban Anda";
    if (error.message?.includes('API key')) {
      errorMessage = "Konfigurasi API key tidak valid";
    } else if (error.message?.includes('timeout')) {
      errorMessage = "Request timeout - silakan coba lagi";
    } else if (error.message?.includes('JSON')) {
      errorMessage = "Format respons AI tidak valid";
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      debugError: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
