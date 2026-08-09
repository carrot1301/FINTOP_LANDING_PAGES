/**
 * verify-login-fix.js — Xác nhận fix đã hoạt động
 */
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const testAccounts = [
    'khanhlinhtran10150@gmail.com',
    'withna0610@gmail.com',
    'doantri12343@gmail.com',
    'user_silver@fintop.vn',
    'user_gold@fintop.vn',
    'user_diamond@fintop.vn',
    'hailedylan889@gmail.com',
    'hanhnm91@gmail.com',
    'admin@fintop.vn',
    'fintop.bashare@gmail.com',
  ];

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  XÁC NHẬN FIX EMAIL_NOT_VERIFIED — TEST ĐĂNG NHẬP LẠI');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const email of testAccounts) {
    try {
      const res = await postJson('https://api.fintopdata.vn/auth/login', {
        email, password: 'FinTop@2026',
      });

      if (res.status === 200) {
        // Check if response has accessToken (could be wrapped in data)
        const data = res.body.data || res.body;
        if (data.accessToken) {
          console.log(`  ✅ ${email.padEnd(45)} → ĐĂNG NHẬP THÀNH CÔNG (userId=${data.user?.id}, tier=${data.user?.tierLevel})`);
        } else {
          console.log(`  ⚠️  ${email.padEnd(45)} → HTTP 200 nhưng không có token: ${JSON.stringify(res.body).slice(0, 80)}`);
        }
      } else if (res.status === 401) {
        console.log(`  🔑 ${email.padEnd(45)} → Sai mật khẩu (bình thường nếu đã đổi pass)`);
      } else if (res.status === 403 && (res.body.message || '').includes('EMAIL_NOT_VERIFIED')) {
        console.log(`  ❌ ${email.padEnd(45)} → VẪN BỊ EMAIL_NOT_VERIFIED! Fix chưa hiệu lực.`);
      } else {
        console.log(`  ⚠️  ${email.padEnd(45)} → HTTP ${res.status}: ${JSON.stringify(res.body).slice(0, 80)}`);
      }
    } catch (err) {
      console.log(`  💥 ${email.padEnd(45)} → ERROR: ${err.message}`);
    }
    await sleep(2000); // 2 giây delay để tránh rate limit
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  DONE!');
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);
