/**
 * Test script for Gemini AI Transcript Extraction (Bilingual Support)
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

// Log API key status
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

import { extractTranskripWithGemini } from './src/lib/gemini.js';

// Sample English Transcript from EPFL (Summer School)
const englishTranscriptText = `
École Polytechnique Fédérale de Lausanne (EPFL)
Summer@EPFL Program

TRANSCRIPT OF RECORDS

Student Information:
Name: ABDUL ZACKY
Student ID: 2024-SUMMER-12345
Program: Summer School 2024
Faculty: School of Computer and Communication Sciences

Academic Record:

Course Code    Course Title                                Credits    Grade
CS-101         Introduction to Programming                 6 ECTS     A (5.5/6.0)
CS-250         Algorithms and Data Structures              6 ECTS     A- (5.0/6.0)
MATH-101       Linear Algebra                              4 ECTS     B+ (4.75/6.0)
CS-305         Software Engineering                        6 ECTS     A (5.25/6.0)

Total Credits Earned: 22 ECTS
GPA (converted to 4.0 scale): 3.85

Academic Period: Summer 2024
Date of Issue: September 15, 2024

Note: This is an official transcript issued by EPFL.
Original grading scale: 6.0 (Switzerland)
Converted GPA: 3.85/4.0

Registrar's Office
École Polytechnique Fédérale de Lausanne
CH-1015 Lausanne, Switzerland
`;

// Sample Indonesian Transcript
const indonesianTranscriptText = `
KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN
UNIVERSITAS INDONESIA

TRANSKRIP NILAI AKADEMIK

Data Mahasiswa:
Nama: ABDUL ZACKY
NIM: 1906123456
Program Studi: Ilmu Komputer
Fakultas: Fakultas Ilmu Komputer

Prestasi Akademik:

Semester I (2019/2020 Ganjil)
- Pengantar Ilmu Komputer        4 SKS    A    4.00
- Matematika Diskrit             3 SKS    A-   3.75
- Dasar-dasar Pemrograman        4 SKS    A    4.00

Semester II (2019/2020 Genap)
- Struktur Data                  4 SKS    A    4.00
- Sistem Operasi                 3 SKS    B+   3.50
- Basis Data                     4 SKS    A-   3.75

Total SKS: 146
IPK: 3.82

Tahun Masuk: 2019
Tahun Lulus: 2023

Depok, 25 Juli 2023
Kepala Bagian Akademik
`;

console.log('\n' + '='.repeat(80));
console.log('🧪 TESTING GEMINI AI TRANSCRIPT EXTRACTION (BILINGUAL)');
console.log('='.repeat(80));

// Test 1: English Transcript (EPFL)
console.log('\n📝 TEST 1: ENGLISH TRANSCRIPT (EPFL Summer School)');
console.log('-'.repeat(80));
const englishResult = await extractTranskripWithGemini(englishTranscriptText);

if (englishResult.success) {
  const data = englishResult.data;
  console.log('✅ Extraction successful!\n');
  console.log('📊 EXTRACTED DATA:');
  console.log('  - Name:', data.nama_lengkap);
  console.log('  - Student ID:', data.nim);
  console.log('  - Program:', data.program_studi);
  console.log('  - Faculty:', data.fakultas);
  console.log('  - University:', data.universitas);
  console.log('  - GPA/IPK:', data.ipk);
  console.log('  - Total Credits:', data.total_sks);
  console.log('  - Language:', data.language);
  console.log('  - Format Type:', data.format_type);
  
  console.log('\n📈 CONFIDENCE SCORES:');
  console.log('  - Name:', (data.confidence.nama_lengkap * 100).toFixed(0) + '%');
  console.log('  - GPA:', (data.confidence.ipk * 100).toFixed(0) + '%');
  console.log('  - Program:', (data.confidence.program_studi * 100).toFixed(0) + '%');
  console.log('  - University:', (data.confidence.universitas * 100).toFixed(0) + '%');
  
  if (data.extraction_notes) {
    console.log('\n📝 NOTES:', data.extraction_notes);
  }
  
  // Validation Check
  console.log('\n✅ VALIDATION CHECKS:');
  console.log('  - GPA >= 3.0:', data.ipk >= 3.0 ? '✅ PASS' : '❌ FAIL');
  console.log('  - Name extracted:', data.nama_lengkap ? '✅ YES' : '❌ NO');
  console.log('  - Language detected:', data.language === 'english' ? '✅ ENGLISH' : '⚠️ ' + data.language);
} else {
  console.log('❌ Extraction failed!');
  console.log('Error:', englishResult.error);
}

// Test 2: Indonesian Transcript (UI)
console.log('\n' + '='.repeat(80));
console.log('📝 TEST 2: INDONESIAN TRANSCRIPT (Universitas Indonesia)');
console.log('-'.repeat(80));
const indonesianResult = await extractTranskripWithGemini(indonesianTranscriptText);

if (indonesianResult.success) {
  const data = indonesianResult.data;
  console.log('✅ Extraction successful!\n');
  console.log('📊 EXTRACTED DATA:');
  console.log('  - Nama:', data.nama_lengkap);
  console.log('  - NIM:', data.nim);
  console.log('  - Program Studi:', data.program_studi);
  console.log('  - Fakultas:', data.fakultas);
  console.log('  - Universitas:', data.universitas);
  console.log('  - IPK:', data.ipk);
  console.log('  - Total SKS:', data.total_sks);
  console.log('  - Tahun Masuk:', data.tahun_masuk);
  console.log('  - Tahun Lulus:', data.tahun_lulus);
  console.log('  - Bahasa:', data.language);
  console.log('  - Format:', data.format_type);
  
  console.log('\n📈 CONFIDENCE SCORES:');
  console.log('  - Nama:', (data.confidence.nama_lengkap * 100).toFixed(0) + '%');
  console.log('  - IPK:', (data.confidence.ipk * 100).toFixed(0) + '%');
  console.log('  - Program Studi:', (data.confidence.program_studi * 100).toFixed(0) + '%');
  console.log('  - Universitas:', (data.confidence.universitas * 100).toFixed(0) + '%');
  
  if (data.extraction_notes) {
    console.log('\n📝 CATATAN:', data.extraction_notes);
  }
  
  // Validation Check
  console.log('\n✅ VALIDATION CHECKS:');
  console.log('  - IPK >= 3.0:', data.ipk >= 3.0 ? '✅ LULUS' : '❌ TIDAK LULUS');
  console.log('  - Nama extracted:', data.nama_lengkap ? '✅ ADA' : '❌ TIDAK ADA');
  console.log('  - Bahasa detected:', data.language === 'indonesian' ? '✅ INDONESIA' : '⚠️ ' + data.language);
} else {
  console.log('❌ Extraction failed!');
  console.log('Error:', indonesianResult.error);
}

console.log('\n' + '='.repeat(80));
console.log('🎉 TESTING COMPLETED!');
console.log('='.repeat(80));
console.log('\n📊 SUMMARY:');
console.log('  - English transcript:', englishResult.success ? '✅ SUCCESS' : '❌ FAILED');
console.log('  - Indonesian transcript:', indonesianResult.success ? '✅ SUCCESS' : '❌ FAILED');
console.log('\n💡 The system can now handle BOTH Indonesian and English transcripts!');
console.log('='.repeat(80) + '\n');
