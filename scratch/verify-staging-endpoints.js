const API_BASE = "https://fintop-backend-staging.onrender.com";
const DEFAULT_PASSWORD = "FinTop@2026";

const usersToTest = [
  { email: 'admin@fintop.vn', role: 'SUPER_ADMIN (Default)', expectedAdminAccess: true },
  { email: 'tuannv7105@gmail.com', role: 'SUPER_ADMIN (Promoted)', expectedAdminAccess: true },
  { email: 'fintop.ba@gmail.com', role: 'SUPER_ADMIN & CEO', expectedAdminAccess: true },
  { email: 'khanhlinh.8043@fintop.vn', role: 'SALE_ADMIN', expectedAdminAccess: true },
  { email: 'luongtuyen.271298@gmail.com', role: 'CLIENT', expectedAdminAccess: false }
];

async function testUserAccess(user) {
  console.log(`\n--------------------------------------------`);
  console.log(`👤 Testing User: ${user.email} (Role: ${user.role})`);
  
  try {
    // 1. Authenticate (Login)
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: DEFAULT_PASSWORD
      })
    });
    
    if (!loginRes.ok) {
      const errData = await loginRes.json().catch(() => ({}));
      throw new Error(`Login failed with status ${loginRes.status}: ${errData.message || 'Unknown error'}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    console.log(`  🔑 Login: SUCCESS (Token acquired)`);
    
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };
    
    // 2. Fetch Profile via /auth/me
    const profileRes = await fetch(`${API_BASE}/auth/me`, { headers });
    if (!profileRes.ok) {
      throw new Error(`Fetch profile (/auth/me) failed with status ${profileRes.status}`);
    }
    const profileData = await profileRes.json();
    console.log(`  👤 Fetch Profile: SUCCESS (FullName: ${profileData.data.fullName})`);
    
    // 3. Fetch Plans (Public/Client endpoint)
    const plansRes = await fetch(`${API_BASE}/users/subscription/plans`, { headers });
    if (!plansRes.ok) {
      throw new Error(`Fetch plans failed with status ${plansRes.status}`);
    }
    const plansData = await plansRes.json();
    console.log(`  💳 Fetch Plans: SUCCESS (Loaded ${plansData.data.length} plans)`);
    
    // 4. Test RBAC: Admin Users Endpoint
    const adminUsersRes = await fetch(`${API_BASE}/admin/users?page=1&limit=10`, { headers });
    const canAccess = adminUsersRes.ok;
    
    if (canAccess) {
      if (user.expectedAdminAccess) {
        console.log(`  🛡️ RBAC Admin Access: PASSED (Allowed as expected)`);
      } else {
        console.log(`  ❌ RBAC Admin Access: FAILED (Allowed client, expected deny)`);
      }
    } else {
      const isForbidden = adminUsersRes.status === 403 || adminUsersRes.status === 401;
      if (isForbidden && !user.expectedAdminAccess) {
        console.log(`  🛡️ RBAC Admin Access: PASSED (Denied as expected: ${adminUsersRes.status} Forbidden)`);
      } else {
        console.log(`  ❌ RBAC Admin Access: FAILED (Expected allowed=${user.expectedAdminAccess}, got status ${adminUsersRes.status})`);
      }
    }
    
  } catch (err) {
    console.log(`  ❌ Test Failed: ${err.message}`);
  }
}

async function runAllTests() {
  console.log(`🚀 STARTING END-TO-END STAGING API & RBAC ROLE VALIDATION`);
  console.log(`📍 Target Staging Backend: ${API_BASE}`);
  
  for (const user of usersToTest) {
    await testUserAccess(user);
  }
  
  console.log(`\n============================================`);
  console.log(`🎉 END-TO-END STAGING VALIDATION COMPLETED`);
}

runAllTests();
