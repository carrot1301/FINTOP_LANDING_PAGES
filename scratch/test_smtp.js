const nodemailer = require('nodemailer');
require('dotenv').config({ path: './fintop-backend/.env' });

async function testEmail() {
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  console.log('BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const verified = await transporter.verify();
    console.log('Transporter connection verified:', verified);
  } catch (err) {
    console.error('Transporter verification error:', err.message);
  }
}

testEmail();
