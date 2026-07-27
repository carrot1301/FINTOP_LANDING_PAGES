const API_BASE = "https://fintop-backend-staging.onrender.com";

async function testRegistration() {
  const uniqueEmail = `fintop_test_reg_${Date.now()}@gmail.com`;
  const payload = {
    email: uniqueEmail,
    fullName: "Test Registration User",
    password: "FinTop@2026",
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`, // unique random phone
    investmentDuration: "0_3",
    investmentStyle: "short_term",
    stockCompany: "VPS"
  };
  
  console.log(`\n--------------------------------------------`);
  console.log(`📝 Testing Registration API`);
  console.log(`👉 Sending Payload to /auth/register:`, JSON.stringify(payload, null, 2));
  
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (res.ok) {
      console.log(`✅ Registration API: SUCCESS`);
      console.log(`👉 Response Data:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Registration API: FAILED (Status: ${res.status})`);
      console.log(`👉 Response Error:`, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log(`❌ Registration API Test Error:`, err.message);
  }
}

async function testForgotPassword() {
  const payload = {
    email: "admin@fintop.vn"
  };
  
  console.log(`\n--------------------------------------------`);
  console.log(`🔑 Testing Forgot Password API`);
  console.log(`👉 Sending Payload to /auth/forgot-password:`, JSON.stringify(payload, null, 2));
  
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (res.ok) {
      console.log(`✅ Forgot Password API: SUCCESS`);
      console.log(`👉 Response Data:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Forgot Password API: FAILED (Status: ${res.status})`);
      console.log(`👉 Response Error:`, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log(`❌ Forgot Password API Test Error:`, err.message);
  }
}

async function runTests() {
  console.log(`🚀 RUNNING REGISTRATION & FORGOT PASSWORD API TESTS ON STAGING`);
  await testRegistration();
  await testForgotPassword();
  console.log(`\n============================================`);
  console.log(`🎉 VALIDATION COMPLETED`);
}

runTests();
