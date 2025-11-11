/**
 * Test PDF to Image Conversion
 * Tests the new PDF conversion functionality
 */

import { convertPDFToImages, cleanupPDFImages } from './src/lib/pdfParser.js';
import { performOCR } from './src/lib/visionApi.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function testPdfToImage() {
  console.log('🧪 Testing PDF to Image Conversion\n');
  console.log('=' .repeat(60));
  
  // You need to specify a test PDF file path
  // Check if file exists in tmp folder
  const testPdfPath = process.argv[2] || './tmp/test.pdf';
  
  console.log('📄 Test PDF:', testPdfPath);
  console.log('=' .repeat(60) + '\n');
  
  try {
    console.log('� Step 1: Converting PDF to images...\n');
    const result = await convertPDFToImages(testPdfPath);
    
    if (result.success) {
      console.log('\n✅ Conversion successful!');
      console.log(`📊 Converted ${result.pageCount} pages`);
      console.log('🖼️  Image paths:');
      result.imagePaths.forEach((p, i) => {
        console.log(`   ${i + 1}. ${path.basename(p)}`);
      });
      
      // Test OCR on first page
      if (result.imagePaths.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('� Step 2: Testing OCR on first page...\n');
        const ocrResult = await performOCR(result.imagePaths[0]);
        
        console.log('\n✅ OCR Result:');
        console.log('  - Success:', ocrResult.success);
        console.log('  - Confidence:', (ocrResult.confidence * 100).toFixed(1) + '%');
        console.log('  - Text length:', ocrResult.text?.length, 'characters');
        console.log('\n📝 Text preview (first 500 chars):');
        console.log('─'.repeat(60));
        console.log(ocrResult.text?.substring(0, 500));
        console.log('─'.repeat(60));
      }
      
      // Cleanup
      console.log('\n' + '='.repeat(60));
      console.log('🔄 Step 3: Cleaning up converted images...\n');
      await cleanupPDFImages(result.imagePaths);
      console.log('✅ Cleanup complete');
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 TEST PASSED - All steps completed successfully!');
      console.log('='.repeat(60) + '\n');
      
    } else {
      console.log('\n❌ Conversion failed:', result.error);
      console.log('\n💡 Tip: Make sure the PDF file exists at:', testPdfPath);
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nStack trace:', error.stack);
    
    console.log('\n💡 Usage: node testPdfToImage.js [path-to-pdf-file]');
    console.log('   Example: node testPdfToImage.js ./tmp/28457-2.pdf');
  }
}

// Run test
console.log('\n');
testPdfToImage().catch(console.error);
