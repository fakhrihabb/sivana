/**
 * Test Google Document AI Configuration
 * Run with: node test-docai-config.js
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('\n' + '='.repeat(80));
console.log('Google Document AI Configuration Test');
console.log('='.repeat(80) + '\n');

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const processorId = process.env.GOOGLE_DOC_AI_PROCESSOR_ID;
const location = process.env.GOOGLE_DOC_AI_LOCATION;
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Check configuration
console.log('📋 Configuration Check:\n');

const checks = [
  { name: 'Project ID', value: projectId, expected: 'sivana-1' },
  { name: 'Processor ID', value: processorId, expected: '6e8077f690e39e2' },
  { name: 'Location', value: location, expected: 'us' },
  { name: 'Credentials JSON', value: credentials ? 'Present' : null, expected: 'Present' },
];

let allGood = true;

checks.forEach(check => {
  const status = check.value ? '✅' : '❌';
  const display = check.value === 'Present' ? 'Present' : check.value || 'Missing';
  console.log(`${status} ${check.name}: ${display}`);

  if (!check.value) {
    allGood = false;
  }
});

console.log('\n' + '='.repeat(80));

if (allGood) {
  console.log('🎉 All configuration is correct!');
  console.log('\n✨ Google Document AI is ready to use!\n');
  console.log('Next steps:');
  console.log('1. Start your Next.js server: npm run dev');
  console.log('2. Upload an ijazah with handwritten nomor');
  console.log('3. Check console logs for extraction results\n');
} else {
  console.log('⚠️  Some configuration is missing');
  console.log('\nPlease check your .env.local file and make sure it contains:');
  console.log('  - GOOGLE_CLOUD_PROJECT_ID');
  console.log('  - GOOGLE_DOC_AI_PROCESSOR_ID');
  console.log('  - GOOGLE_DOC_AI_LOCATION');
  console.log('  - GOOGLE_APPLICATION_CREDENTIALS\n');
}

console.log('='.repeat(80) + '\n');

// Parse and validate credentials JSON if present
if (credentials) {
  try {
    const parsed = JSON.parse(credentials);
    console.log('✅ Credentials JSON is valid');
    console.log('   Service Account:', parsed.client_email);
    console.log('   Project:', parsed.project_id);
  } catch (error) {
    console.log('❌ Credentials JSON is invalid:', error.message);
    allGood = false;
  }
}

process.exit(allGood ? 0 : 1);
