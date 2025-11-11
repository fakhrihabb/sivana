import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { questionNumber, previousAnswers, userLocation } = await request.json();

    // Validate question number (1-5)
    if (!questionNumber || questionNumber < 1 || questionNumber > 5) {
      return NextResponse.json({
        success: false,
        error: "Invalid question number"
      }, { status: 400 });
    }

    // Question 1: ALWAYS education level (static, from database)
    if (questionNumber === 1) {
      // Get education question from question_bank
      const { data: educationQuestion } = await supabase
        .from('question_bank')
        .select('*')
        .eq('id', 'education')
        .single();

      // Get unique education levels from formasi
      const { data: formasiData } = await supabase
        .from('formasi')
        .select('jenjang_pendidikan')
        .order('id');

      const uniqueEducationLevels = [...new Set(formasiData.map(f => f.jenjang_pendidikan).filter(Boolean))];
      const options = uniqueEducationLevels.map((level, idx) => ({
        id: String.fromCharCode(97 + idx),
        text: level,
        value: level
      }));

      return NextResponse.json({
        success: true,
        data: {
          id: 1,
          question: educationQuestion.question,
          options: options
        }
      });
    }

    // Questions 2-5: Let Gemini pick the best question from the database
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
      }
    });

    // Build context from previous answers
    const answerContext = previousAnswers.map((ans, idx) =>
      `Q${idx + 1}: ${ans.text} (value: ${ans.value})`
    ).join('\n');

    // Get all available questions from database (exclude 'education')
    const { data: availableQuestions } = await supabase
      .from('question_bank')
      .select('id, question, tags')
      .neq('id', 'education')
      .order('id');

    const questionsForPrompt = availableQuestions.map(q => ({
      id: q.id,
      question: q.question,
      tags: q.tags.join(', ')
    }));

    const prompt = `Pilih 1 pertanyaan TERBAIK untuk Q${questionNumber} dari question bank.

KONTEKS USER (previous answers):
${answerContext}
${userLocation ? `\nLokasi user: ${userLocation.city}, ${userLocation.province}` : ''}

AVAILABLE QUESTIONS:
${JSON.stringify(questionsForPrompt, null, 2)}

RULES:
- Q2 harus tentang program studi (pilih yang paling spesifik/relevan)
- Q3 harus tentang instansi (pilih yang sesuai program studi)
- Q4 harus tentang lokasi
- Q5 harus tentang motivasi/preferensi kerja
- Prioritaskan pertanyaan "specific" yang relevan dengan jawaban sebelumnya
- Jika user jawab "Teknik" di Q2, pilih pertanyaan specific teknik untuk Q3

OUTPUT JSON (no markdown):
{"question_id": "program_general"}

Hanya return question_id, tidak perlu penjelasan.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const { question_id } = JSON.parse(text);

    // Fetch selected question from database
    const { data: selectedQuestion, error: questionError } = await supabase
      .from('question_bank')
      .select('*')
      .eq('id', question_id)
      .single();

    if (questionError || !selectedQuestion) {
      throw new Error('Invalid question_id from AI');
    }

    // Handle location personalization for Q4
    if (selectedQuestion.id === 'location_preference' && userLocation) {
      const province = userLocation.province;

      // Check if province is already in options to avoid duplicates
      const existingOptions = selectedQuestion.options || [];
      const hasProvince = existingOptions.some(opt =>
        opt.value.toLowerCase().includes(province.toLowerCase()) ||
        province.toLowerCase().includes(opt.value.toLowerCase())
      );

      let personalizedOptions;
      if (!hasProvince) {
        // Add personalized option at the beginning, shift other option IDs
        personalizedOptions = [
          { id: "a", text: `Di sekitar ${province} (dekat lokasi saya)`, value: province },
          ...existingOptions.map((opt, idx) => ({
            ...opt,
            id: String.fromCharCode(98 + idx) // b, c, d, e...
          }))
        ];
      } else {
        // Province already covered, just use original options
        personalizedOptions = existingOptions;
      }

      return NextResponse.json({
        success: true,
        data: {
          id: questionNumber,
          question: selectedQuestion.question,
          options: personalizedOptions
        }
      });
    }

    // Return selected question
    return NextResponse.json({
      success: true,
      data: {
        id: questionNumber,
        question: selectedQuestion.question,
        options: selectedQuestion.options
      }
    });

  } catch (error) {
    console.error('Error generating question:', error);

    // Fallback: Use simple rule-based selection from database
    const { questionNumber, previousAnswers } = await request.json();

    let fallbackQuestionId = 'program_general';

    if (questionNumber === 2) {
      fallbackQuestionId = 'program_general';
    } else if (questionNumber === 3) {
      const programValue = previousAnswers?.[1]?.value || '';
      if (programValue.includes('Teknik')) fallbackQuestionId = 'instansi_teknik';
      else if (programValue.includes('Ekonomi')) fallbackQuestionId = 'instansi_ekonomi';
      else if (programValue.includes('Kesehatan')) fallbackQuestionId = 'instansi_kesehatan';
      else if (programValue.includes('Pendidikan')) fallbackQuestionId = 'instansi_pendidikan';
      else fallbackQuestionId = 'instansi_type';
    } else if (questionNumber === 4) {
      fallbackQuestionId = 'location_preference';
    } else if (questionNumber === 5) {
      fallbackQuestionId = 'motivation_general';
    }

    // Fetch fallback question from database
    const { data: fallbackQuestion } = await supabase
      .from('question_bank')
      .select('*')
      .eq('id', fallbackQuestionId)
      .single();

    if (fallbackQuestion) {
      return NextResponse.json({
        success: true,
        data: {
          id: questionNumber,
          question: fallbackQuestion.question,
          options: fallbackQuestion.options
        },
        fallback: true
      });
    }

    // Ultimate fallback
    return NextResponse.json({
      success: false,
      error: "Could not load question"
    }, { status: 500 });
  }
}
