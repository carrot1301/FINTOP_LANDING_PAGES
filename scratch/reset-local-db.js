/**
 * reset-local-db.js
 * Reset emailVerifiedAt = null for accounts on LOCAL backend (http://127.0.0.1:3000)
 */
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers,
      timeout: 5000,
    };
    const req = http.request(options, (res) => {
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
  console.log('🔑 Đăng nhập admin trên LOCAL (http://127.0.0.1:3000)...');
  const login = await request('POST', '/auth/login', { email: 'admin@fintop.vn', password: 'FinTop@2026' });
  if (login.status !== 200) {
    console.log('❌ Local Admin login failed:', login.body);
    return;
  }
  const token = (login.body.data || login.body).accessToken;
  console.log('✅ Local Admin login OK\n');

  // Fetch all users
  let allUsers = [];
  let page = 1;
  while (true) {
    const res = await request('GET', `/admin/users?page=${page}&limit=100`, null, token);
    if (res.status !== 200) break;
    const data = res.body.data || res.body;
    const users = data.data || data;
    if (!Array.isArray(users) || users.length === 0) break;
    allUsers = allUsers.concat(users);
    if (!data.meta || page >= data.meta.totalPages) break;
    page++;
  }

  console.log(`📊 Tổng số tài khoản trên LOCAL DB: ${allUsers.length}`);

  let ok = 0;
  for (const u of allUsers) {
    if (u.email === 'admin@fintop.vn') continue;
    const res = await request('PATCH', `/admin/users/${u.id}`, { emailVerifiedAt: null }, token);
    if (res.status === 200) ok++;
  }

  console.log(`✅ Đã reset emailVerifiedAt = null cho ${ok} tài khoản trên LOCAL DB thành công!`);
}

main().catch(console.error);
