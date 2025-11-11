/**
 * Quick test for IPK extraction patterns
 */
import { extractIPK } from './src/lib/tesseractOcr.js';

console.log('🧪 Testing IPK Extraction Patterns\n');
console.log('='.repeat(80));

// Test cases
const testCases = [
  {
    name: 'Indonesian Standard',
    text: 'TRANSKRIP NILAI\nNama: John Doe\nIPK: 3.75\nTotal SKS: 144'
  },
  {
    name: 'Indonesian with comma',
    text: 'Indeks Prestasi Kumulatif: 3,82'
  },
  {
    name: 'English GPA format',
    text: 'Academic Record\nStudent: John Doe\nGPA: 3.85\nCredits: 120'
  },
  {
    name: 'English with scale',
    text: 'Cumulative GPA: 3.67 / 4.0'
  },
  {
    name: 'Converted GPA',
    text: 'GPA (converted to 4.0 scale): 3.85'
  },
  {
    name: 'Swiss format converted',
    text: 'Original: 5.5/6.0\nGPA converted to 4.0 scale: 3.85'
  },
  {
    name: 'In parentheses',
    text: 'Final Grade (GPA: 3.92)'
  },
  {
    name: 'EPFL style (from your PDF)',
    text: `École Polytechnique Fédérale de Lausanne
Summer@EPFL Program
TRANSCRIPT OF RECORDS
Student: Abdul Zacky
GPA (converted to 4.0 scale): 3.85
Total Credits: 22 ECTS`
  }
];

console.log('\n📊 Running Test Cases:\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(60));
  console.log('Input text:', testCase.text.substring(0, 100));
  
  const ipk = extractIPK(testCase.text);
  
  if (ipk !== null) {
    console.log(`✅ PASS - Extracted IPK: ${ipk}`);
    passedTests++;
  } else {
    console.log('❌ FAIL - No IPK extracted');
    failedTests++;
  }
});

console.log('\n' + '='.repeat(80));
console.log('📈 RESULTS:');
console.log(`  ✅ Passed: ${passedTests}/${testCases.length}`);
console.log(`  ❌ Failed: ${failedTests}/${testCases.length}`);
console.log('='.repeat(80) + '\n');

if (failedTests === 0) {
  console.log('🎉 All tests passed! IPK extraction is working correctly.');
} else {
  console.log('⚠️ Some tests failed. Check the patterns above.');
}
