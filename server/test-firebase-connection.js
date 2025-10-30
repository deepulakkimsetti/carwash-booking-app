/**
 * Test Firebase Connection
 * Run this script to verify your Firebase Realtime Database connection
 * 
 * Usage: node test-firebase-connection.js
 */

const admin = require('firebase-admin');

console.log('🔧 Testing Firebase Realtime Database Connection...\n');

// Initialize Firebase
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://carwashbookingapp-2020wa15536-default-rtdb.firebaseio.com"
  });
  console.log('✅ Firebase Admin SDK initialized\n');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('\n💡 Tip: Run "gcloud auth application-default login" first\n');
  process.exit(1);
}

const db = admin.database();

// Test 1: Check if professionals node exists
console.log('📋 Test 1: Checking professionals node...');
const professionalsRef = db.ref('professionals');

professionalsRef.once('value', (snapshot) => {
  const data = snapshot.val();
  
  if (!data) {
    console.log('⚠️  No professionals found in database');
    console.log('💡 Expected structure:');
    console.log(`{
  "professionals": {
    "prof_1": {
      "name": "John Doe",
      "nearestLocations": [1, 2, 3],
      "phone": "+91-9876543210",
      "email": "john@example.com"
    }
  }
}\n`);
    process.exit(0);
  }
  
  const professionalCount = Object.keys(data).length;
  console.log(`✅ Found ${professionalCount} professionals\n`);
  
  // Test 2: Show professional details
  console.log('📋 Test 2: Professional Details:\n');
  Object.entries(data).forEach(([id, prof]) => {
    console.log(`Professional ID: ${id}`);
    console.log(`  Name: ${prof.name || 'N/A'}`);
    console.log(`  Phone: ${prof.phone || 'N/A'}`);
    console.log(`  Email: ${prof.email || 'N/A'}`);
    console.log(`  Nearest Locations: ${prof.nearestLocations ? `[${prof.nearestLocations.join(', ')}]` : 'N/A'}`);
    console.log('');
  });
  
  // Test 3: Test location matching
  console.log('📋 Test 3: Testing Location Matching...');
  const testLocationId = 1;
  let foundForLocation = [];
  
  Object.entries(data).forEach(([id, prof]) => {
    if (prof.nearestLocations && Array.isArray(prof.nearestLocations)) {
      if (prof.nearestLocations.includes(testLocationId)) {
        foundForLocation.push({id, name: prof.name});
      }
    }
  });
  
  console.log(`\n🔍 Professionals available for LocationID ${testLocationId}:`);
  if (foundForLocation.length > 0) {
    foundForLocation.forEach(p => {
      console.log(`  ✅ ${p.name} (ID: ${p.id})`);
    });
  } else {
    console.log(`  ⚠️  No professionals found for LocationID ${testLocationId}`);
  }
  
  console.log('\n✅ All tests completed successfully!');
  console.log('🚀 Your Firebase connection is working correctly.\n');
  
  process.exit(0);
  
}, (error) => {
  console.error('❌ Error reading from Firebase:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Check if database URL is correct');
  console.log('2. Verify Firebase Realtime Database is enabled');
  console.log('3. Check Firebase Database Rules allow read access');
  console.log('4. Ensure authentication is set up correctly\n');
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 10 seconds');
  console.log('💡 Check your internet connection and Firebase project settings\n');
  process.exit(1);
}, 10000);
