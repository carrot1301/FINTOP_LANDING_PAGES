require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // Find all users where staffCode = '8043' or id = 6 or email like '%tuan%' or email like '%linh%'
    const users = await client.query(`
      SELECT id, email, "fullName", "staffCode"
      FROM users
      WHERE "staffCode" = '8043' OR id = 6 OR email LIKE '%tuannv%' OR email LIKE '%khanhlinh%'
    `);
    console.log('Users matching query:');
    console.table(users.rows);
  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
