require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.id, u.email, u."fullName", u."brokerId", u."referralId", u."referralName",
             b.id as broker_id, b.email as broker_email, b."fullName" as broker_name, b."staffCode" as broker_staffCode
      FROM users u
      LEFT JOIN users b ON u."brokerId" = b.id
      WHERE u.id = 47 OR u.email = 'huongdn2008@gmail.com'
    `);
    console.log('User 47 in DB:');
    console.table(res.rows);

    // Check all users who have brokerId pointing to user 6 or user 122
    const clients = await client.query(`
      SELECT u.id, u.email, u."fullName", u."brokerId", b."fullName" as broker_name, b."staffCode" as broker_code
      FROM users u
      LEFT JOIN users b ON u."brokerId" = b.id
      WHERE u."brokerId" IS NOT NULL
      LIMIT 10
    `);
    console.log('\nSample clients with brokerId:');
    console.table(clients.rows);
  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
