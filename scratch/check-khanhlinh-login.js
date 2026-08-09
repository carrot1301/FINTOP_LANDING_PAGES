const https = require('https');

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname, port: 443, path: urlObj.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 15000,
    };
    const req = https.request(options, (res) => {
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

async function check() {
  const res = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'khanhlinhtran10150@gmail.com',
    password: 'FinTop@2026'
  });
  console.log('Login Response:', JSON.stringify(res, null, 2));
}

check().catch(console.error);
