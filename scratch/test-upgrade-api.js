const http = require('http');
const https = require('https');

function requestJson(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    const reqHeaders = {
      ...headers,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: reqHeaders,
      timeout: 5000,
    };
    const req = client.request(options, (res) => {
      let rd = '';
      res.on('data', (c) => { rd += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(rd) }); }
        catch { resolve({ status: res.statusCode, body: rd }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  try {
    // 1. Login to local backend
    const loginRes = await requestJson('http://127.0.0.1:3000/auth/login', 'POST', {}, {
      email: 'fintop.bashare@gmail.com',
      password: 'FinTop@2026'
    });
    console.log('Login Status:', loginRes.status);
    const token = loginRes.body?.data?.accessToken || loginRes.body?.accessToken;
    if (!token) {
      console.log('No token returned:', loginRes.body);
      return;
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Patch user 164 to tierLevel: 'diamond'
    console.log('\n--- Patching user 164 to tierLevel: diamond ---');
    const patchRes = await requestJson('http://127.0.0.1:3000/admin/users/164', 'PATCH', authHeaders, {
      tierLevel: 'diamond'
    });
    console.log('Patch Status:', patchRes.status);

    // 3. Get user 164 detail
    console.log('\n--- Getting user 164 detail ---');
    const detailRes = await requestJson('http://127.0.0.1:3000/admin/users/164', 'GET', authHeaders);
    console.log('TierLevel:', detailRes.body?.data?.tierLevel || detailRes.body?.tierLevel);
    console.log('Roles:', detailRes.body?.data?.roles || detailRes.body?.roles);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
