const https = require('https');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlStr, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log("=== VERIFYING LIVE RBAC ===\n");

  // Login as DEVELOPER
  const loginRes = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'fintop.bashare@gmail.com', password: 'FinTop@2026'
  });
  const token = loginRes.data?.data?.accessToken;
  console.log("Login Status:", loginRes.status);

  if (!token) { console.log("No token!"); return; }

  // Get roles
  const rolesRes = await getJson('https://api.fintopdata.vn/admin/roles', token);
  console.log("\nRoles Status:", rolesRes.status);

  if (rolesRes.status === 200) {
    const roles = rolesRes.data?.data || rolesRes.data || [];
    console.log("\n┌──────────────────────────────────────────┬───────────────────┬────────┬────────┐");
    console.log("│ Role Name                                │ Code              │ Perms  │ Users  │");
    console.log("├──────────────────────────────────────────┼───────────────────┼────────┼────────┤");
    for (const r of roles) {
      const name = (r.name || '').padEnd(40);
      const code = (r.code || '').padEnd(17);
      const perms = String(r.permissionCount || 0).padStart(4);
      const users = String(r.userCount || 0).padStart(4);
      console.log(`│ ${name} │ ${code} │ ${perms}   │ ${users}   │`);
    }
    console.log("└──────────────────────────────────────────┴───────────────────┴────────┴────────┘");
  }

  // Test handbooks, market data, overview
  const endpoints = [
    '/admin/overview',
    '/admin/handbooks',
    '/admin/market/stocks?limit=1',
    '/admin/portfolios',
    '/admin/notifications?limit=1'
  ];
  console.log("\n=== ENDPOINT ACCESS TEST ===");
  for (const ep of endpoints) {
    const res = await getJson(`https://api.fintopdata.vn${ep}`, token);
    console.log(`  ${ep} → ${res.status}`);
  }
}

main().catch(err => console.error("ERROR:", err));
