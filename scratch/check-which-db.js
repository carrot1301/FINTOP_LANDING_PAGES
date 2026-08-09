/**
 * check-which-db.js — Kiểm tra xem database nào đang được dùng
 * So sánh dữ liệu giữa DB đã update vs API production
 */
const https = require('https');
const { Client } = require('pg');

// DB connection (the one we just updated)
const client = new Client({
  connectionString: "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
});

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
    req.write(data);
    req.end();
  });
}

async function main() {
  await client.connect();
  
  console.log('═══ KIỂM TRA DATABASE ═══\n');

  // 1. Check emailVerifiedAt in the DB we updated
  const res = await client.query(
    `SELECT id, email, "emailVerifiedAt", "createdAt" 
     FROM users 
     WHERE email = 'khanhlinhtran10150@gmail.com'`
  );
  
  if (res.rows.length > 0) {
    const row = res.rows[0];
    console.log(`📌 DB (Supabase pooler): user ID=${row.id}`);
    console.log(`   email: ${row.email}`);
    console.log(`   emailVerifiedAt: ${row.emailVerifiedAt}`);
    console.log(`   createdAt: ${row.createdAt}`);
  } else {
    console.log('❌ User không tồn tại trong DB này!');
  }

  // 2. Check total user count in this DB
  const countRes = await client.query('SELECT COUNT(*) as total FROM users');
  console.log(`\n📊 Tổng users trong DB này: ${countRes.rows[0].total}`);
  
  // 3. Check DB version/name
  const dbRes = await client.query('SELECT current_database(), version()');
  console.log(`   Database name: ${dbRes.rows[0].current_database}`);
  console.log(`   Version: ${dbRes.rows[0].version?.slice(0, 60)}`);

  // 4. Login via API to see if it's really using a different DB
  console.log('\n═══ TEST API PRODUCTION ═══\n');
  
  try {
    // Login as admin (which works) and get profile to see the DB the API uses
    const loginRes = await postJson('https://api.fintopdata.vn/auth/login', {
      email: 'admin@fintop.vn',
      password: 'FinTop@2026'
    });
    
    if (loginRes.status === 200) {
      const data = loginRes.body.data || loginRes.body;
      console.log(`✅ API Login OK: userId=${data.user?.id}`);
      
      // Use the token to check admin endpoint for user 122
      const token = data.accessToken;
      
      const getRes = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.fintopdata.vn', port: 443,
          path: '/admin/users/122',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 15000,
        };
        const req = https.request(options, (res) => {
          let rd = '';
          res.on('data', (c) => { rd += c; });
          res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(rd) }); } catch { resolve({ status: res.statusCode, body: rd }); } });
        });
        req.on('error', reject);
        req.end();
      });
      
      if (getRes.status === 200) {
        const userData = getRes.body.data || getRes.body;
        console.log(`\n📌 API Production user ID=122:`);
        console.log(`   email: ${userData.email}`);
        console.log(`   emailVerifiedAt: ${userData.emailVerifiedAt}`);
        console.log(`   createdAt: ${userData.createdAt}`);
      } else {
        console.log(`\n⚠️ Không thể lấy user 122 qua API: HTTP ${getRes.status}`);
        console.log(JSON.stringify(getRes.body).slice(0, 200));
      }
    }
  } catch (err) {
    console.log(`💥 API Error: ${err.message}`);
  }
}

main()
  .catch(console.error)
  .finally(() => client.end());
