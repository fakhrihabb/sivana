/**
 * Export Formasi Data for Chatbot Knowledge Base
 *
 * This script fetches all formasi and province data from Supabase
 * and exports it in a format suitable for chatbot knowledge base.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exportFormasiData() {
  console.log('📊 Fetching formasi data...');

  try {
    // Fetch all formasi with related provinces
    const { data: formasiData, error: formasiError } = await supabase
      .from('formasi')
      .select(`
        id,
        name,
        lembaga,
        kantor_pusat,
        jenjang_pendidikan,
        program_studi,
        formasi_provinces (
          provinces (
            id,
            name,
            latitude,
            longitude,
            formatted_address
          )
        )
      `)
      .order('id');

    if (formasiError) throw formasiError;

    console.log(`✅ Fetched ${formasiData.length} formasi records`);

    // Transform data into readable format for chatbot
    const knowledgeBase = {
      metadata: {
        exported_at: new Date().toISOString(),
        total_formasi: formasiData.length,
        description: 'Data formasi CASN/PPPK untuk chatbot knowledge base'
      },
      formasi: formasiData.map(f => ({
        id: f.id,
        nama_jabatan: f.name,
        instansi: f.lembaga,
        kantor_pusat: f.kantor_pusat,
        persyaratan_pendidikan: {
          jenjang: f.jenjang_pendidikan,
          program_studi: f.program_studi
        },
        lokasi_penempatan: f.formasi_provinces
          ?.map(fp => fp.provinces?.name)
          .filter(Boolean) || [],
        detail_lokasi: f.formasi_provinces
          ?.map(fp => ({
            provinsi: fp.provinces?.name,
            alamat: fp.provinces?.formatted_address,
            koordinat: fp.provinces?.latitude && fp.provinces?.longitude
              ? `${fp.provinces.latitude}, ${fp.provinces.longitude}`
              : null
          }))
          .filter(loc => loc.provinsi) || []
      }))
    };

    // Export as JSON
    const outputDir = path.join(process.cwd(), 'data', 'knowledge-base');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const jsonPath = path.join(outputDir, 'formasi-knowledge-base.json');
    fs.writeFileSync(jsonPath, JSON.stringify(knowledgeBase, null, 2));
    console.log(`✅ Exported to ${jsonPath}`);

    // Also export as readable text format for easy reading
    const textContent = generateTextFormat(knowledgeBase);
    const textPath = path.join(outputDir, 'formasi-knowledge-base.txt');
    fs.writeFileSync(textPath, textContent);
    console.log(`✅ Exported readable format to ${textPath}`);

    // Generate summary
    console.log('\n📋 Summary:');
    console.log(`   Total Formasi: ${knowledgeBase.formasi.length}`);
    console.log(`   Instansi Unique: ${new Set(formasiData.map(f => f.lembaga)).size}`);
    console.log(`   Program Studi Unique: ${new Set(formasiData.map(f => f.program_studi)).size}`);

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  }
}

function generateTextFormat(knowledgeBase) {
  let text = `FORMASI CASN/PPPK - KNOWLEDGE BASE
Exported: ${knowledgeBase.metadata.exported_at}
Total Formasi: ${knowledgeBase.metadata.total_formasi}

================================================================================

`;

  knowledgeBase.formasi.forEach((f, index) => {
    text += `${index + 1}. ${f.nama_jabatan}
   Instansi: ${f.instansi}
   Kantor Pusat: ${f.kantor_pusat}
   Persyaratan: ${f.persyaratan_pendidikan.jenjang} ${f.persyaratan_pendidikan.program_studi}
   Lokasi Penempatan: ${f.lokasi_penempatan.length > 0 ? f.lokasi_penempatan.join(', ') : 'Tidak ada data'}

`;
  });

  return text;
}

// Run the export
exportFormasiData();
