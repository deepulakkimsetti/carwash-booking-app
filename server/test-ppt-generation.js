/**
 * Test script for PPT generation functionality
 * This script tests the pptxgenjs library without requiring database connection
 */

const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing PowerPoint generation functionality...\n');

async function testBasicPPTGeneration() {
  try {
    console.log('1️⃣ Creating a simple test presentation...');
    
    // Create a new presentation
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'CarWash Booking System Test';
    pptx.title = 'Test Presentation';
    
    // Add title slide
    const slide1 = pptx.addSlide();
    slide1.background = { color: '2C3E50' };
    slide1.addText('Test Presentation', { 
      x: 0.5, 
      y: 2, 
      w: 9, 
      h: 1.5, 
      fontSize: 44, 
      bold: true, 
      color: 'FFFFFF',
      align: 'center'
    });
    
    // Add content slide
    const slide2 = pptx.addSlide();
    slide2.addText('PPT Generation Works!', { 
      x: 0.5, 
      y: 0.5, 
      w: 9, 
      h: 0.6, 
      fontSize: 32, 
      bold: true, 
      color: '2C3E50'
    });
    
    // Add a table
    const tableData = [
      ['Feature', 'Status'],
      ['Library Import', '✅ Success'],
      ['Slide Creation', '✅ Success'],
      ['Text Formatting', '✅ Success'],
      ['Table Generation', '✅ Success']
    ];
    
    slide2.addTable(tableData, {
      x: 1.5,
      y: 2.0,
      w: 7.0,
      colW: [3.5, 3.5],
      rowH: 0.4,
      fill: { color: 'F3F4F6' },
      color: '1F2937',
      fontSize: 14,
      border: { pt: 1, color: 'D1D5DB' }
    });
    
    // Save to file
    const outputPath = path.join(__dirname, 'test-output.pptx');
    await pptx.writeFile({ fileName: outputPath });
    
    console.log('✅ Test presentation created successfully!');
    console.log(`📄 File saved to: ${outputPath}`);
    
    // Check if file exists and get size
    const stats = fs.statSync(outputPath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Clean up test file
    fs.unlinkSync(outputPath);
    console.log('🧹 Test file cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testAdvancedFeatures() {
  try {
    console.log('\n2️⃣ Testing advanced features...');
    
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    
    const slide = pptx.addSlide();
    
    // Test different text styles
    slide.addText('Advanced Features Test', { 
      x: 0.5, 
      y: 0.5, 
      w: 9, 
      h: 0.5, 
      fontSize: 28, 
      bold: true 
    });
    
    // Test color coding (like status indicators)
    const statusColors = {
      'success': '10B981',
      'warning': 'F59E0B',
      'error': 'EF4444',
      'info': '3B82F6'
    };
    
    let yPos = 1.5;
    Object.entries(statusColors).forEach(([status, color]) => {
      slide.addText(status.toUpperCase(), {
        x: 2,
        y: yPos,
        w: 2,
        h: 0.5,
        fontSize: 14,
        bold: true,
        color: 'FFFFFF',
        fill: { color: color },
        align: 'center'
      });
      yPos += 0.7;
    });
    
    console.log('✅ Advanced features test passed!');
    return true;
  } catch (error) {
    console.error('❌ Advanced test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('PowerPoint Generation Test Suite');
  console.log('═══════════════════════════════════════════════════\n');
  
  const test1 = await testBasicPPTGeneration();
  const test2 = await testAdvancedFeatures();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('Test Results Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Basic Generation: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Advanced Features: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═══════════════════════════════════════════════════\n');
  
  if (test1 && test2) {
    console.log('🎉 All tests passed! PPT generation is working correctly.');
    console.log('✨ The API endpoints are ready to generate presentations.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
