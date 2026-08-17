require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const emails = [
      'huongdn2008@gmail.com',
      'phuonganh2559@gmail.com',
      'ptu186204@gmail.com',
      'xolano8558@gmail.com',
      'thanhcaht38@gmail.com',
      'maitiendung210899@gmail.com'
    ];

    const res = await client.query(`
      SELECT u.id, u.email, u."fullName", u."brokerId",
             b.id as b_id, b.email as b_email, b."fullName" as b_name, b."staffCode" as b_code
      FROM users u
      LEFT JOIN users b ON u."brokerId" = b.id
      WHERE LOWER(u.email) = ANY($1)
    `, [emails]);

    console.log('Current DB state for these 6 users:');
    console.table(res.rows);

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
