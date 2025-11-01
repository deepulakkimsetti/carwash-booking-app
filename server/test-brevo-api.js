// Test script to verify Brevo API key
const brevo = require('@getbrevo/brevo');

// Your current API key
const API_KEY = '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';

async function testBrevoAPI() {
  console.log('🔍 Testing Brevo API Key...\n');
  
  try {
    // Initialize API client
    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = API_KEY;
    
    console.log('✅ API client initialized');
    console.log('📧 API Key (first 20 chars):', API_KEY.substring(0, 20) + '...');
    
    // Try to send a test email
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
      name: 'CarWash Booking App',
      email: 'deepulakkimsetti@gmail.com'
    };
    
    sendSmtpEmail.to = [{
      email: 'deepulakkimsetti@gmail.com', // Send test to yourself
      name: 'Test Recipient'
    }];
    
    sendSmtpEmail.subject = 'Brevo API Test - CarWash Booking App';
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>✅ Brevo API Test Successful!</h1>
          <p>Your Brevo API key is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </body>
      </html>
    `;
    
    console.log('📤 Attempting to send test email...\n');
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ SUCCESS! Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('\n✅ Your Brevo API key is VALID and working correctly!');
    
  } catch (error) {
    console.error('\n❌ FAILED! Error testing Brevo API:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n📋 Troubleshooting Steps:');
    console.log('1. Check if your Brevo account is fully verified');
    console.log('2. Verify sender email (deepulakkimsetti@gmail.com) is verified in Brevo');
    console.log('3. Generate a new API key from: https://app.brevo.com/settings/keys/api');
    console.log('4. Ensure you copied the FULL API key (starts with "xkeysib-")');
    console.log('5. Check if you have reached your daily email limit (300 emails/day on free tier)');
  }
}

testBrevoAPI();
