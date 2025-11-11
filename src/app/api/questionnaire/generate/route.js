import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { getProgramsByEducation } from '@/lib/educationMapping';

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

    // Question 1: ALWAYS education level (static, predefined)
    if (questionNumber === 1) {
      return NextResponse.json({
        success: true,
        data: {
          id: 1,
          question: 'Apa jenjang pendidikan tertinggi Anda?',
          options: [
            { id: "a", text: "SD (Sekolah Dasar)", value: "SD" },
            { id: "b", text: "SMP (Sekolah Menengah Pertama)", value: "SMP" },
            { id: "c", text: "SMA/SMK (Sekolah Menengah Atas/Kejuruan)", value: "SMA/SMK" },
            { id: "d", text: "D3 (Diploma III/Sarjana Muda)", value: "Diploma III/Sarjana Muda" },
            { id: "e", text: "D4 (Diploma IV)", value: "D-4" },
            { id: "f", text: "S1 (Sarjana)", value: "S-1/Sarjana" },
            { id: "g", text: "S2 (Magister)", value: "S-2" },
            { id: "h", text: "S3 (Doktor)", value: "S-3" }
          ]
        }
      });
    }

    // Question 2: Program Studi - Based on education level from Q1
    if (questionNumber === 2) {
      const educationLevel = previousAnswers?.[0]?.value;
      
      if (!educationLevel) {
        return NextResponse.json({
          success: false,
          error: "Education level not found in previous answers"
        }, { status: 400 });
      }

      const programs = getProgramsByEducation(educationLevel);
      
      if (!programs || programs.length === 0) {
        return NextResponse.json({
          success: false,
          error: "No programs found for this education level"
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: 2,
          question: 'Apa bidang studi/jurusan Anda?',
          options: programs
        }
      });
    }

    // Question 3: Institution Type
    if (questionNumber === 3) {
      return NextResponse.json({
        success: true,
        data: {
          id: 3,
          question: 'Jenis instansi apa yang Anda minati?',
          options: [
            { id: "a", text: "Kementerian/Lembaga Pemerintah Pusat", value: "kementerian" },
            { id: "b", text: "Pemerintah Daerah (Provinsi/Kabupaten/Kota)", value: "pemda" },
            { id: "c", text: "Lembaga Pendidikan (Sekolah/Universitas)", value: "pendidikan" },
            { id: "d", text: "Fasilitas Kesehatan (Rumah Sakit/Puskesmas)", value: "kesehatan" },
            { id: "e", text: "Tidak ada preferensi khusus", value: "any" }
          ]
        }
      });
    }

    // Question 4: Location Preference (with personalization)
    if (questionNumber === 4) {
      const baseOptions = [
        { id: "a", text: "Jakarta dan sekitarnya", value: "Jakarta" },
        { id: "b", text: "Jawa Barat (Bandung, Bogor, dll)", value: "Jawa Barat" },
        { id: "c", text: "Jawa Tengah (Semarang, Solo, dll)", value: "Jawa Tengah" },
        { id: "d", text: "Jawa Timur (Surabaya, Malang, dll)", value: "Jawa Timur" },
        { id: "e", text: "Bali", value: "Bali" },
        { id: "f", text: "Sumatera", value: "Sumatera" },
        { id: "g", text: "Kalimantan", value: "Kalimantan" },
        { id: "h", text: "Sulawesi", value: "Sulawesi" },
        { id: "i", text: "Maluku dan Papua", value: "Maluku dan Papua" },
        { id: "j", text: "Dimana saja (fleksibel)", value: "any" }
      ];

      // Personalize based on user location if available
      if (userLocation && userLocation.province) {
        const province = userLocation.province;
        
        // Check if user's province is already in the options
        const hasProvince = baseOptions.some(opt =>
          opt.text.toLowerCase().includes(province.toLowerCase()) ||
          opt.value.toLowerCase().includes(province.toLowerCase())
        );

        if (!hasProvince && province !== 'Jakarta') {
          // Add personalized option at the top
          const personalizedOptions = [
            { id: "a", text: `${province} (dekat lokasi Anda saat ini)`, value: province },
            ...baseOptions.map((opt, idx) => ({
              ...opt,
              id: String.fromCharCode(98 + idx) // shift IDs: b, c, d, ...
            }))
          ];
          
          return NextResponse.json({
            success: true,
            data: {
              id: 4,
              question: 'Di mana Anda ingin bekerja?',
              options: personalizedOptions
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          id: 4,
          question: 'Di mana Anda ingin bekerja?',
          options: baseOptions
        }
      });
    }

    // Question 5: Work Motivation/Preference
    if (questionNumber === 5) {
      return NextResponse.json({
        success: true,
        data: {
          id: 5,
          question: 'Apa yang paling penting bagi Anda dalam bekerja sebagai ASN?',
          options: [
            { id: "a", text: "Mengabdi kepada masyarakat dan negara", value: "service" },
            { id: "b", text: "Mengembangkan karir dan kompetensi profesional", value: "career" },
            { id: "c", text: "Stabilitas pekerjaan dan jaminan masa depan", value: "stability" },
            { id: "d", text: "Berkontribusi pada bidang keahlian saya", value: "expertise" },
            { id: "e", text: "Bekerja di lingkunan yang dinamis dan inovatif", value: "innovation" },
            { id: "f", text: "Work-life balance yang baik", value: "balance" }
          ]
        }
      });
    }

    // Invalid question number
    return NextResponse.json({
      success: false,
      error: "Invalid question number"
    }, { status: 400 });

  } catch (error) {
    console.error('Error generating question:', error);
    
    return NextResponse.json({
      success: false,
      error: "Could not load question: " + error.message
    }, { status: 500 });
  }
}
