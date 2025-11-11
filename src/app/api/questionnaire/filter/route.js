import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { questionNumber, answer, previousFilters } = await request.json();

    // Fetch all formasi (or use cached version from previous filter)
    let formasi;
    if (previousFilters && previousFilters.length > 0) {
      // Use already filtered formasi from previous step
      formasi = previousFilters;
    } else {
      // Initial fetch - get all formasi
      const { data: formasiData } = await supabase
        .from('formasi')
        .select('*')
        .order('id', { ascending: true });
      formasi = formasiData;
    }

    // Progressive filtering based on question number
    let filteredFormasi = formasi;

    switch (questionNumber) {
      case 1: // Education level
        filteredFormasi = formasi.filter(f => {
          if (!f.jenjang_pendidikan || !answer.value) return false;
          return f.jenjang_pendidikan.includes(answer.value) ||
                 answer.value.includes(f.jenjang_pendidikan);
        });
        break;

      case 2: // Program studi
        filteredFormasi = formasi.filter(f => {
          if (!f.program_studi || !answer.value) return true; // Keep if no program_studi
          const programLower = answer.value.toLowerCase();
          const formasiProgramLower = f.program_studi.toLowerCase();

          // Direct match
          if (formasiProgramLower.includes(programLower) ||
              programLower.includes(formasiProgramLower)) {
            return true;
          }

          // Partial keyword match for broad categories
          if (programLower.includes('informatika') && formasiProgramLower.includes('komputer')) return true;
          if (programLower.includes('komputer') && formasiProgramLower.includes('informatika')) return true;
          if (programLower.includes('teknik') && formasiProgramLower.includes('teknik')) return true;
          if (programLower.includes('ekonomi') && formasiProgramLower.includes('ekonomi')) return true;
          if (programLower.includes('kesehatan') && formasiProgramLower.includes('kesehatan')) return true;

          return false;
        });
        break;

      case 3: // Instansi preference
        // Soft filter - don't eliminate too aggressively on instansi
        filteredFormasi = formasi.filter(f => {
          if (!answer.value || answer.value.includes('Lainnya') || answer.value.includes('Fleksibel')) {
            return true; // Keep all if flexible
          }

          if (!f.lembaga) return true;

          const lembagaLower = f.lembaga.toLowerCase();
          const prefLower = answer.value.toLowerCase();

          // Check if lembaga contains preference keyword
          return lembagaLower.includes(prefLower) || prefLower.includes(lembagaLower);
        });
        break;

      case 4: // Location preference
        // Soft filter - boost location matches but don't eliminate
        filteredFormasi = formasi.map(f => {
          let score = 0;

          if (answer.value === 'Semua' || !answer.value) {
            score = 1; // Neutral
          } else if (f.lokasi) {
            const lokasiLower = f.lokasi.toLowerCase();
            const prefLower = answer.value.toLowerCase();

            if (lokasiLower.includes(prefLower) || prefLower.includes(lokasiLower)) {
              score = 10; // High match
            } else {
              score = 1; // Keep but deprioritize
            }
          }

          return { ...f, _tempScore: score };
        }).sort((a, b) => b._tempScore - a._tempScore);
        break;

      case 5: // Motivation/preferences
        // Don't filter on motivation - just pass through
        filteredFormasi = formasi;
        break;

      default:
        filteredFormasi = formasi;
    }

    console.log(`Q${questionNumber} filter: ${formasi.length} -> ${filteredFormasi.length} formasi`);

    return NextResponse.json({
      success: true,
      data: {
        remainingCount: filteredFormasi.length,
        filteredFormasi: filteredFormasi.slice(0, 100) // Limit to 100 for performance
      }
    });

  } catch (error) {
    console.error('Error filtering formasi:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
