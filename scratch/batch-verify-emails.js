/**
 * batch-verify-emails.js
 * ---------------------------------------------------
 * Sử dụng Admin API (PATCH /admin/users/:id) để set emailVerifiedAt
 * cho tất cả tài khoản chưa xác thực email trên production.
 * ---------------------------------------------------
 */
const https = require('https');

const API_BASE = 'https://api.fintopdata.vn';

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

function patchJson(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname, port: 443, path: urlObj.pathname, method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`,
      },
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

function getJson(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname, port: 443, path: urlObj.pathname + urlObj.search, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 15000,
    };
    const req = https.request(options, (res) => {
      let rd = '';
      res.on('data', (c) => { rd += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(rd) }); } catch { resolve({ status: res.statusCode, body: rd }); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BATCH UPDATE emailVerifiedAt CHO TẤT CẢ TÀI KHOẢN');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Login as admin
  console.log('📌 Step 1: Đăng nhập admin...');
  const loginRes = await postJson(`${API_BASE}/auth/login`, {
    email: 'admin@fintop.vn',
    password: 'FinTop@2026',
  });

  if (loginRes.status !== 200) {
    console.log(`❌ Login failed! HTTP ${loginRes.status}`, loginRes.body);
    return;
  }

  const token = (loginRes.body.data || loginRes.body).accessToken;
  console.log('✅ Login thành công.\n');

  // 2. Get all users (paginated)
  console.log('📌 Step 2: Lấy danh sách tài khoản...');
  let allUsers = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await getJson(`${API_BASE}/admin/users?page=${page}&limit=${limit}`, token);
    if (res.status !== 200) {
      console.log(`⚠️ Lỗi lấy users page ${page}: HTTP ${res.status}`);
      break;
    }
    const data = res.body.data || res.body;
    const users = data.data || data;
    if (!Array.isArray(users) || users.length === 0) break;
    allUsers = allUsers.concat(users);
    const meta = data.meta;
    if (meta && page >= meta.totalPages) break;
    page++;
    await sleep(300);
  }

  console.log(`📊 Tổng users: ${allUsers.length}\n`);

  // 3. Filter users without emailVerifiedAt
  //    Note: API list might not return emailVerifiedAt, so we check detail for ones that look suspect
  //    Better approach: just set emailVerifiedAt for ALL users that we know are unverified
  //    We'll use the user detail API

  // For efficiency, check user detail for IDs we know are affected
  const knownUnverifiedIds = [
    2, 3, 4, 5, 9, 12, 13,
    120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135,
    136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150,
    151, 152, 153, 154, 155, 156, 175, 177, 178,
  ];

  console.log('📌 Step 3: Update emailVerifiedAt cho các tài khoản chưa verify...\n');

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const userId of knownUnverifiedIds) {
    try {
      // First check current state
      const detailRes = await getJson(`${API_BASE}/admin/users/${userId}`, token);
      if (detailRes.status !== 200) {
        console.log(`  ⚠️ ID=${userId}: Không tìm thấy user (HTTP ${detailRes.status})`);
        skipCount++;
        await sleep(300);
        continue;
      }

      const userData = detailRes.body.data || detailRes.body;
      if (userData.emailVerifiedAt) {
        console.log(`  ⏭  ID=${String(userId).padStart(3)} ${(userData.email || '').padEnd(42)} → Đã verified, bỏ qua`);
        skipCount++;
        await sleep(200);
        continue;
      }

      // PATCH update
      const patchRes = await patchJson(`${API_BASE}/admin/users/${userId}`, {
        emailVerifiedAt: new Date().toISOString(),
      }, token);

      if (patchRes.status === 200) {
        console.log(`  ✅ ID=${String(userId).padStart(3)} ${(userData.email || '').padEnd(42)} → emailVerifiedAt SET OK`);
        successCount++;
      } else {
        console.log(`  ❌ ID=${String(userId).padStart(3)} ${(userData.email || '').padEnd(42)} → PATCH failed: HTTP ${patchRes.status} ${JSON.stringify(patchRes.body).slice(0, 80)}`);
        failCount++;
      }
    } catch (err) {
      console.log(`  💥 ID=${userId}: ERROR ${err.message}`);
      failCount++;
    }
    await sleep(500);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  📊 TỔNG KẾT:`);
  console.log(`     ✅ Updated thành công: ${successCount}`);
  console.log(`     ⏭  Đã verified/bỏ qua: ${skipCount}`);
  console.log(`     ❌ Thất bại:            ${failCount}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 4. Quick verification test
  console.log('📌 Step 4: Test đăng nhập xác nhận...\n');
  const testEmails = ['khanhlinhtran10150@gmail.com', 'withna0610@gmail.com', 'user_silver@fintop.vn'];
  for (const email of testEmails) {
    try {
      const res = await postJson(`${API_BASE}/auth/login`, { email, password: 'FinTop@2026' });
      if (res.status === 200) {
        console.log(`  ✅ ${email.padEnd(42)} → ĐĂNG NHẬP THÀNH CÔNG!`);
      } else {
        const msg = (res.body.data || res.body).message || res.body.message || '';
        console.log(`  ❌ ${email.padEnd(42)} → HTTP ${res.status}: ${msg}`);
      }
    } catch (err) {
      console.log(`  💥 ${email.padEnd(42)} → ${err.message}`);
    }
    await sleep(2000);
  }
}

main().catch(console.error);
