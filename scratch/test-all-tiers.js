const http = require('http');

function requestJson(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const urlObj = new URL(url);
    const reqHeaders = {
      ...headers,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: method,
      headers: reqHeaders,
    };
    const req = http.request(options, (res) => {
      let rd = '';
      res.on('data', (c) => { rd += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(rd) }); }
        catch { resolve({ status: res.statusCode, body: rd }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testTiers() {
  const loginRes = await requestJson('http://127.0.0.1:3000/auth/login', 'POST', {}, {
    email: 'fintop.bashare@gmail.com',
    password: 'FinTop@2026'
  });
  const token = loginRes.body?.data?.accessToken || loginRes.body?.accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const tiers = ['standard', 'silver', 'gold', 'diamond'];
  for (const t of tiers) {
    await requestJson('http://127.0.0.1:3000/admin/users/164', 'PATCH', headers, { tierLevel: t });
    const detail = await requestJson('http://127.0.0.1:3000/admin/users/164', 'GET', headers);
    const data = detail.body?.data || detail.body;
    console.log(`Tier Input: "${t}" => tierLevel: "${data.tierLevel}", role: "${data.roles?.[0]?.code}" (${data.roles?.[0]?.name})`);
  }
}

testTiers();
