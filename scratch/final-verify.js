/**
 * final-verify.js — Test đăng nhập sau khi deploy fix
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
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  FINAL VERIFICATION — POST-DEPLOY LOGIN TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const testAccounts = [
    { email: 'khanhlinhtran10150@gmail.com', desc: '(was EMAIL_NOT_VERIFIED)' },
    { email: 'withna0610@gmail.com', desc: '(was EMAIL_NOT_VERIFIED)' },
    { email: 'user_silver@fintop.vn', desc: '(seed account)' },
    { email: 'doantri12343@gmail.com', desc: '(was EMAIL_NOT_VERIFIED)' },
    { email: 'admin@fintop.vn', desc: '(admin - should always work)' },
    { email: 'fintop.bashare@gmail.com', desc: '(should always work)' },
  ];

  for (const { email, desc } of testAccounts) {
    try {
      const res = await postJson('https://api.fintopdata.vn/auth/login', {
        email, password: 'FinTop@2026',
      });

      if (res.status === 200) {
        const data = res.body.data || res.body;
        if (data.accessToken) {
          const requirePwChange = data.requirePasswordChange ? '🔑 FIRST LOGIN (requirePasswordChange=true)' : '';
          console.log(`  ✅ ${email.padEnd(42)} → LOGIN OK  userId=${data.user?.id}  ${requirePwChange}`);
        } else {
          console.log(`  ⚠️ ${email.padEnd(42)} → HTTP 200 no token`);
        }
      } else if (res.status === 403) {
        const msg = res.body?.message || res.body?.data?.message || JSON.stringify(res.body).slice(0, 80);
        console.log(`  ❌ ${email.padEnd(42)} → HTTP 403: ${msg} ${desc}`);
      } else if (res.status === 401) {
        console.log(`  🔑 ${email.padEnd(42)} → Wrong password ${desc}`);
      } else if (res.status === 429) {
        console.log(`  ⚠️ ${email.padEnd(42)} → Rate limited`);
      } else {
        console.log(`  ⚠️ ${email.padEnd(42)} → HTTP ${res.status}`);
      }
    } catch (err) {
      console.log(`  💥 ${email.padEnd(42)} → ${err.message}`);
    }
    await sleep(2000);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  DONE');
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);
