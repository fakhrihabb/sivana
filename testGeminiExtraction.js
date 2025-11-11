/**
 * Test script for Gemini AI Ijazah Extraction
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

// Log API key status (first 10 chars only for security)
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

import { extractIjazahWithGemini } from './src/lib/gemini.js';

// Sample OCR text from Universitas Brawijaya ijazah
const ubIjazahText = `
KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN
UNIVERSITAS BRAWIJAYA
FAKULTAS PERIKANAN DAN ILMU KELAUTAN

IJAZAH
STRATA SATU

Nomor: 542452022000179

Rektor Universitas Brawijaya menerangkan bahwa:

Nama: BUDI SANTOSO
NIK: 3573012345678901
Tempat, Tanggal Lahir: Malang, 15 Agustus 1999

Telah menyelesaikan studinya pada:
Program Studi: Agrobisnis Perikanan
Fakultas: Perikanan dan Ilmu Kelautan
Jenjang: Sarjana (S1)

Dan berhak menyandang gelar:
SARJANA PERIKANAN (S.Pi)

Diberikan di: Malang
Tanggal: 25 Juli 2022

Rektor,
Prof. Dr. Ir. Nuhfil Hanani, MS
`;

console.log('🧪 Testing Gemini AI Ijazah Extraction...\n');
console.log('OCR Text length:', ubIjazahText.length);
console.log('='.repeat(80));

const result = await extractIjazahWithGemini(ubIjazahText);

console.log('\n' + '='.repeat(80));
console.log('📊 EXTRACTION RESULTS:\n');

if (result.success) {
  const data = result.data;
  console.log('✅ Extraction successful!\n');
  console.log('Nomor Ijazah:', data.nomor_ijazah);
  console.log('Nama Lengkap:', data.nama_lengkap);
  console.log('NIK:', data.nik);
  console.log('Tempat Lahir:', data.tempat_lahir);
  console.log('Tanggal Lahir:', data.tanggal_lahir);
  console.log('Program Studi:', data.program_studi);
  console.log('Fakultas:', data.fakultas);
  console.log('Universitas:', data.universitas);
  console.log('Jenjang:', data.jenjang);
  console.log('Gelar:', data.gelar);
  console.log('Tahun Lulus:', data.tahun_lulus);
  console.log('Tanggal Lulus:', data.tanggal_lulus);
  console.log('Kota Ijazah:', data.kota_ijazah);
  
  console.log('\n📈 CONFIDENCE SCORES:');
  console.log('  - Nomor Ijazah:', (data.confidence.nomor_ijazah * 100).toFixed(0) + '%');
  console.log('  - Nama Lengkap:', (data.confidence.nama_lengkap * 100).toFixed(0) + '%');
  console.log('  - Program Studi:', (data.confidence.program_studi * 100).toFixed(0) + '%');
  console.log('  - Universitas:', (data.confidence.universitas * 100).toFixed(0) + '%');
  console.log('  - Tahun Lulus:', (data.confidence.tahun_lulus * 100).toFixed(0) + '%');
  
  if (data.extraction_notes) {
    console.log('\n📝 NOTES:', data.extraction_notes);
  }
} else {
  console.log('❌ Extraction failed!');
  console.log('Error:', result.error);
}

console.log('\n' + '='.repeat(80));
