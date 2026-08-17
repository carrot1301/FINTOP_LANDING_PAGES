require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== User with ID 8043 or staffCode 8043 ===');
    const u8043 = await client.query(`SELECT id, email, "fullName", "staffCode" from users WHERE id = 8043 OR "staffCode" = '8043'`);
    console.table(u8043.rows);

    console.log('\n=== Tuan NV user info ===');
    const tuan = await client.query(`SELECT id, email, "fullName", "staffCode" from users WHERE email = 'tuannv7105@gmail.com' OR "staffCode" = 'BW9B'`);
    console.table(tuan.rows);

    console.log('\n=== Check Đặng Thị Ngọc Hương (id 47) broker/manager info ===');
    const huong = await client.query(`SELECT id, email, "fullName", "brokerId", "referralId", "referralName" FROM users WHERE email = 'huongdn2008@gmail.com'`);
    console.table(huong.rows);

    console.log('\n=== Check all users where brokerId or referralId is 8043 or 6 or BW9B ===');
    const refs = await client.query(`SELECT id, email, "fullName", "staffCode" FROM users WHERE "staffCode" ILIKE '%8043%' OR "staffCode" ILIKE '%BW9B%'`);
    console.table(refs.rows);

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
