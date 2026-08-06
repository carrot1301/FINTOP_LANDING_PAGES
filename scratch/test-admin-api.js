const https = require('https');
const http = require('http');

function postJson(urlStr, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };
    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function patchJson(urlStr, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };
    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function fixLiveRolesViaApi() {
  console.log("=== STEP 1: LOGIN AS admin@fintop.vn ON LIVE API (https://api.fintopdata.vn) ===");
  const loginRes = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'admin@fintop.vn',
    password: 'FinTop@2026'
  });
  console.log("Admin Login Status:", loginRes.status);
  
  const adminToken = loginRes.data?.data?.accessToken;
  if (!adminToken) {
    console.error("Failed to login as admin@fintop.vn:", loginRes.data);
    return;
  }
  console.log("✅ Admin login successful!");

  const targetUsers = [
    { id: 105, email: 'fintop.bashare@gmail.com', name: 'Nguyễn Công Luật' },
    { id: 110, email: 'fintop.ba@gmail.com', name: 'FinTop Admin' },
    { id: 121, email: 'withna0610@gmail.com', name: 'Đào Thị Ngọc Anh' },
    { id: 122, email: 'khanhlinhtran10150@gmail.com', name: 'Trần Khánh Linh' },
    { id: 156, email: 'doantri12343@gmail.com', name: 'Đoàn Nguyên Trí' },
    { id: 6,   email: 'tuannv7105@gmail.com', name: 'Nguyễn Văn Tuấn' },
    { id: 155, email: 'tuanmv7105@gmail.com', name: 'Nguyễn Văn Tuấn' },
  ];

  console.log("\n=== STEP 2: ASSIGN SUPER_ADMIN ROLE TO ALL EXEC USERS VIA API ===");
  for (const u of targetUsers) {
    const res = await patchJson(
      `https://api.fintopdata.vn/admin/users/${u.id}/role`,
      { roleCode: 'SUPER_ADMIN' },
      { 'Authorization': `Bearer ${adminToken}` }
    );
    console.log(`Assigning SUPER_ADMIN to [ID ${u.id}] ${u.name} (${u.email}) -> Status: ${res.status}`, res.data?.message || res.data?.success || '');
  }

  console.log("\n=== STEP 3: VERIFY LOGIN AND /admin/billing/invoices FOR fintop.bashare@gmail.com ===");
  const userLogin = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'fintop.bashare@gmail.com',
    password: 'FinTop@2026'
  });
  const userToken = userLogin.data?.data?.accessToken;
  
  const getJson = (urlStr, token) => new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });

  const testBilling = await getJson('https://api.fintopdata.vn/admin/billing/invoices?limit=1000', userToken);
  console.log("GET /admin/billing/invoices Status for fintop.bashare@gmail.com:", testBilling.status);
  if (testBilling.status === 200) {
    console.log("🎉 SUCCESS! fintop.bashare@gmail.com NOW HAS FULL SUPER_ADMIN PRIVILEGES ON LIVE WEBSITE!");
  } else {
    console.log("Response:", testBilling.data);
  }
}

fixLiveRolesViaApi();
