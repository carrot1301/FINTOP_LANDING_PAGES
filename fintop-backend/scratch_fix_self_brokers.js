require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // Check self-referrals (brokerId == id)
    const selfBrokers = await client.query(`
      SELECT id, email, "fullName", "brokerId"
      FROM users
      WHERE "brokerId" = id AND "deletedAt" IS NULL
    `);
    console.log('Self-referral brokerId users (brokerId == id):');
    console.table(selfBrokers.rows);

    // Fix self-referral brokerId users to null
    if (selfBrokers.rows.length > 0) {
      await client.query(`UPDATE users SET "brokerId" = NULL WHERE "brokerId" = id`);
      console.log(`✅ Cleared ${selfBrokers.rows.length} invalid self-referral brokerId values.`);
    }

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
