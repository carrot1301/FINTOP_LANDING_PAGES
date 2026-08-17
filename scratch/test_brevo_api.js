const dotenv = require('dotenv');
dotenv.config({ path: './fintop-backend/.env' });

async function testBrevo() {
  const apiKey = (process.env.BREVO_API_KEY || '').replace(/['"\r\n\s]/g, '').trim();
  console.log('Testing Brevo API key:', apiKey.slice(0, 15) + '...');

  const bodyPayload = {
    sender: {
      name: 'FinTop DATA',
      email: 'fintopdata.info@gmail.com',
    },
    to: [
      {
        email: 'fintopdata.info@gmail.com',
      },
    ],
    replyTo: {
      email: 'fintopdata.info@gmail.com',
    },
    subject: 'Test Brevo Sender fintopdata.info@gmail.com',
    htmlContent: '<h1>Test Email</h1>',
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();
    console.log('HTTP Status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testBrevo();
