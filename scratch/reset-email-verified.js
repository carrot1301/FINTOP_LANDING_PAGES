/**
 * reset-email-verified.js
 * Reset emailVerifiedAt = null cho tất cả tài khoản (trừ admin@fintop.vn)
 * để thông báo đổi mật khẩu hiện lại đúng logic mới.
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

async function main() {
  console.log('🔑 Đăng nhập admin...');
  const login = await request('POST', `${API_BASE}/auth/login`, { email: 'admin@fintop.vn', password: 'FinTop@2026' });
  if (login.status !== 200) { console.log('❌ Admin login failed:', login.body); return; }
  const token = (login.body.data || login.body).accessToken;
  console.log('✅ Admin login OK\n');

  // Fetch all users
  let allUsers = [];
  let page = 1;
  while (true) {
    const res = await request('GET', `${API_BASE}/admin/users?page=${page}&limit=100`, null, token);
    if (res.status !== 200) break;
    const data = res.body.data || res.body;
    const users = data.data || data;
    if (!Array.isArray(users) || users.length === 0) break;
    allUsers = allUsers.concat(users);
    if (!data.meta || page >= data.meta.totalPages) break;
    page++;
    await sleep(200);
  }

  console.log(`📊 Tổng tài khoản: ${allUsers.length}\n`);

  // Skip admin@fintop.vn (ID=1)
  const toReset = allUsers.filter(u => u.email !== 'admin@fintop.vn');
  console.log(`🔄 Reset emailVerifiedAt=null cho ${toReset.length} tài khoản (trừ admin)...\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < toReset.length; i++) {
    const u = toReset[i];
    try {
      const res = await request('PATCH', `${API_BASE}/admin/users/${u.id}`, { emailVerifiedAt: null }, token);
      if (res.status === 200) {
        ok++;
        process.stdout.write(`\r  [${i + 1}/${toReset.length}] ID=${u.id} ${u.email} → OK`);
      } else {
        fail++;
        console.log(`\n  ⚠️ ID=${u.id} ${u.email} → HTTP ${res.status}`);
      }
    } catch (err) {
      fail++;
      console.log(`\n  💥 ID=${u.id} → ${err.message}`);
    }
    await sleep(300);
  }

  console.log(`\n\n✅ Hoàn tất: ${ok} thành công, ${fail} thất bại`);
  console.log('\n📌 Bây giờ tất cả tài khoản sẽ hiện thông báo đổi mật khẩu khi đăng nhập.');
  console.log('   Thông báo CHỈ MẤT ĐI khi user thực sự đổi mật khẩu.');
}

main().catch(console.error);
