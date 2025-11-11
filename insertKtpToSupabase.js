/**
 * QUICK INSERT KTP DATA TO SUPABASE
 * Run this script to insert the KTP data into Supabase database
 * Usage: node insertKtpToSupabase.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertKtpData() {
  console.log('='.repeat(80));
  console.log('📝 INSERTING KTP DATA TO SUPABASE');
  console.log('='.repeat(80));

  const ktpData = {
    nik: '1371042501710001',
    nama: 'Sudi Prayitno',
    tempat_lahir: 'Selat Panjang',
    tanggal_lahir: '1995-01-25',
    jenis_kelamin: 'Laki-laki',
    alamat: 'Jl. Belanti Barat No. 19',
    rt: '003',
    rw: '004',
    kelurahan: 'Lolong Belanti',
    kecamatan: 'Padang Utara',
    kabupaten_kota: 'Padang',
    provinsi: 'Sumatera Barat',
    agama: 'Islam',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Pengacara',
  };

  console.log('Data to insert:');
  console.log('  NIK:', ktpData.nik);
  console.log('  Nama:', ktpData.nama);
  console.log('  Tanggal Lahir:', ktpData.tanggal_lahir);
  console.log('  Umur:', new Date().getFullYear() - new Date(ktpData.tanggal_lahir).getFullYear(), 'tahun');
  console.log('');

  try {
    // First, try to check if table exists and has data
    const { count, error: countError } = await supabase
      .from('dukcapil_dummy')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error checking table:', countError.message);
      console.log('');
      console.log('🔧 SOLUTION: Please create the table first using SQL Editor:');
      console.log('   1. Go to: https://app.supabase.com/project/wlpyeldyezghjwjkcoxq/sql/new');
      console.log('   2. Copy paste the content from QUICK_INSERT_KTP.sql');
      console.log('   3. Click RUN');
      process.exit(1);
    }

    console.log(`ℹ️  Table dukcapil_dummy exists with ${count} rows`);
    console.log('');

    // Check if NIK already exists
    const { data: existing, error: checkError } = await supabase
      .from('dukcapil_dummy')
      .select('*')
      .eq('nik', ktpData.nik)
      .single();

    if (existing) {
      console.log('⚠️  NIK already exists in database. Updating...');
      const { data, error } = await supabase
        .from('dukcapil_dummy')
        .update(ktpData)
        .eq('nik', ktpData.nik)
        .select();

      if (error) {
        console.error('❌ Error updating:', error.message);
        process.exit(1);
      }

      console.log('✅ Successfully updated KTP data!');
    } else {
      console.log('➕ Inserting new KTP data...');
      const { data, error } = await supabase
        .from('dukcapil_dummy')
        .insert([ktpData])
        .select();

      if (error) {
        console.error('❌ Error inserting:', error.message);
        process.exit(1);
      }

      console.log('✅ Successfully inserted KTP data!');
    }

    console.log('');
    console.log('🔍 Verifying data...');
    const { data: verified, error: verifyError } = await supabase
      .from('dukcapil_dummy')
      .select('*')
      .eq('nik', ktpData.nik)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      process.exit(1);
    }

    console.log('✅ Data verified successfully:');
    console.log('   NIK:', verified.nik);
    console.log('   Nama:', verified.nama);
    console.log('   Tanggal Lahir:', verified.tanggal_lahir);
    console.log('');
    console.log('='.repeat(80));
    console.log('🎉 ALL DONE! Now reload your browser and test the KTP upload again.');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
insertKtpData();
