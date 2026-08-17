require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.id, u.email, u."fullName", u."tierLevel", u."legacyTier", u."deletedAt",
             array_agg(r.code) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur."userId"
      LEFT JOIN roles r ON ur."roleId" = r.id
      WHERE u."deletedAt" IS NULL
        AND (u."tierLevel" = 'DIAMOND' OR u."legacyTier" = 'KIM_CUONG' OR r.code = 'CLIENT_DIAMOND' OR u.email LIKE '%diamond%')
      GROUP BY u.id
    `);
    console.log('All Diamond related users:');
    console.table(res.rows);
  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
