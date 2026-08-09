/**
 * reset-remaining.js — Reset emailVerifiedAt=null cho các tài khoản bị rate-limit lần trước
 */
const https = require('https');
const API_BASE = 'https://api.fintopdata.vn';

function request(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const urlObj = new URL(url);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const options = { hostname: urlObj.hostname, port: 443, path: urlObj.pathname + urlObj.search, method, headers, timeout: 15000 };
    const req = https.request(options, (res) => {
      let rd = '';
      res.on('data', (c) => { rd += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(rd) }); } catch { resolve({ status: res.statusCode, body: rd }); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// IDs that failed with 400 or 429
const failedIds = [121, 110, 6, 37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75];

async function main() {
  console.log('🔑 Đăng nhập admin...');
  const login = await request('POST', `${API_BASE}/auth/login`, { email: 'admin@fintop.vn', password: 'FinTop@2026' });
  if (login.status !== 200) { console.log('❌ Admin login failed:', login.body); return; }
  const token = (login.body.data || login.body).accessToken;
  console.log('✅ Admin login OK\n');

  console.log(`🔄 Reset emailVerifiedAt=null cho ${failedIds.length} tài khoản còn lại (delay 2s)...\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < failedIds.length; i++) {
    const id = failedIds[i];
    try {
      const res = await request('PATCH', `${API_BASE}/admin/users/${id}`, { emailVerifiedAt: null }, token);
      if (res.status === 200) {
        ok++;
        console.log(`  [${i + 1}/${failedIds.length}] ID=${id} → ✅ OK`);
      } else {
        fail++;
        console.log(`  [${i + 1}/${failedIds.length}] ID=${id} → ⚠️ HTTP ${res.status}`);
      }
    } catch (err) {
      fail++;
      console.log(`  [${i + 1}/${failedIds.length}] ID=${id} → 💥 ${err.message}`);
    }
    await sleep(2000); // 2 second delay to avoid rate limiting
  }

  console.log(`\n✅ Hoàn tất: ${ok} thành công, ${fail} thất bại`);
}

main().catch(console.error);
