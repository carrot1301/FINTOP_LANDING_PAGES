const http = require('http');
const https = require('https');

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 5000,
    };
    const req = client.request(options, (res) => {
      let rd = '';
      res.on('data', (c) => { rd += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(rd) }); } catch { resolve({ status: res.statusCode, body: rd }); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

async function debug() {
  console.log('--- 1. Testing Production (https://api.fintopdata.vn/auth/login) ---');
  try {
    const prodRes = await postJson('https://api.fintopdata.vn/auth/login', {
      email: 'khanhlinhtran10150@gmail.com',
      password: 'FinTop@2026'
    });
    console.log('Prod Status:', prodRes.status);
    console.log('Prod Data:', JSON.stringify(prodRes.body?.data || prodRes.body, null, 2));
  } catch (err) {
    console.log('Prod error:', err.message);
  }

  console.log('\n--- 2. Testing Local (http://127.0.0.1:3000/auth/login) ---');
  try {
    const localRes = await postJson('http://127.0.0.1:3000/auth/login', {
      email: 'khanhlinhtran10150@gmail.com',
      password: 'FinTop@2026'
    });
    console.log('Local Status:', localRes.status);
    console.log('Local Data:', JSON.stringify(localRes.body?.data || localRes.body, null, 2));
  } catch (err) {
    console.log('Local error:', err.message);
  }
}

debug();
