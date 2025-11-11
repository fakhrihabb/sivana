/**
 * TEST SUPABASE CONNECTION & DATA
 * Run: node testSupabaseConnection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n' + '='.repeat(80));
console.log('🔍 SUPABASE CONNECTION TEST');
console.log('='.repeat(80));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ (hidden)' : '❌');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('   Supabase URL:', supabaseUrl);
console.log('   Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n' + '-'.repeat(80));
    console.log('1️⃣  Testing basic connection...');
    console.log('-'.repeat(80));
    
    // Test connection by checking table
    const { data: tableData, error: tableError } = await supabase
      .from('dukcapil_dummy')
      .select('*', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Connection error:', tableError.message);
      console.error('   Details:', tableError);
      return;
    }
    
    console.log('✅ Connection successful!');

    console.log('\n' + '-'.repeat(80));
    console.log('2️⃣  Checking table data...');
    console.log('-'.repeat(80));
    
    const { data: allData, error: allError, count } = await supabase
      .from('dukcapil_dummy')
      .select('*', { count: 'exact' });
    
    if (allError) {
      console.error('❌ Query error:', allError.message);
      return;
    }
    
    console.log(`✅ Table 'dukcapil_dummy' has ${count} rows`);
    
    if (allData && allData.length > 0) {
      console.log('\nFirst 3 records:');
      allData.slice(0, 3).forEach((row, idx) => {
        console.log(`\n   Record ${idx + 1}:`);
        console.log(`   - NIK: ${row.nik}`);
        console.log(`   - Nama: ${row.nama}`);
        console.log(`   - Tanggal Lahir: ${row.tanggal_lahir}`);
        console.log(`   - Provinsi: ${row.provinsi}`);
      });
    }

    console.log('\n' + '-'.repeat(80));
    console.log('3️⃣  Testing specific NIK: 1371042904040002 (Abdul Zacky)');
    console.log('-'.repeat(80));
    
    const testNIK = '1371042904040002';
    const { data: nikData, error: nikError } = await supabase
      .from('dukcapil_dummy')
      .select('*')
      .eq('nik', testNIK)
      .single();
    
    if (nikError) {
      console.error(`❌ NIK ${testNIK} NOT FOUND!`);
      console.error('   Error:', nikError.message);
      console.error('   Code:', nikError.code);
      
      // Try fuzzy search
      console.log('\n   Trying fuzzy search for similar NIKs...');
      const { data: similarData } = await supabase
        .from('dukcapil_dummy')
        .select('*')
        .like('nik', '137104290%');
      
      if (similarData && similarData.length > 0) {
        console.log(`   Found ${similarData.length} similar NIK(s):`);
        similarData.forEach(row => {
          console.log(`   - ${row.nik} → ${row.nama}`);
        });
      } else {
        console.log('   No similar NIKs found');
      }
      
      // List all NIKs
      console.log('\n   All NIKs in database:');
      allData.forEach(row => {
        console.log(`   - ${row.nik} → ${row.nama}`);
      });
      
    } else {
      console.log(`✅ NIK ${testNIK} FOUND!`);
      console.log('\n   Full record:');
      console.log('   ' + JSON.stringify(nikData, null, 2).split('\n').join('\n   '));
    }

    console.log('\n' + '-'.repeat(80));
    console.log('4️⃣  Testing RLS policies...');
    console.log('-'.repeat(80));
    
    // Check if we can read with anon key
    const { data: rlsTest, error: rlsError } = await supabase
      .from('dukcapil_dummy')
      .select('nik, nama')
      .limit(1);
    
    if (rlsError) {
      console.error('❌ RLS Policy blocking read access!');
      console.error('   Error:', rlsError.message);
      console.error('\n   💡 Fix: Run this in Supabase SQL Editor:');
      console.error('   ```sql');
      console.error('   DROP POLICY IF EXISTS "Enable read access for all users" ON dukcapil_dummy;');
      console.error('   CREATE POLICY "Enable read access for all users" ON dukcapil_dummy');
      console.error('     FOR SELECT USING (true);');
      console.error('   ```');
    } else {
      console.log('✅ RLS policies configured correctly');
      console.log('   Anonymous users CAN read data');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    console.error('   Stack:', error.stack);
  }
}

testConnection();
