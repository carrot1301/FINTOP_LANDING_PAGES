require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== User #6 (Nguyễn Văn Tuấn) full details ===');
    const u6 = await client.query(`SELECT id, email, "fullName", "staffCode", "departmentId", "teamId", "referralId", "referralName" FROM users WHERE id = 6`);
    console.table(u6.rows);

    if (u6.rows[0].departmentId) {
      const dept = await client.query(`SELECT * FROM departments WHERE id = ${u6.rows[0].departmentId}`);
      console.log('Department:', dept.rows);
    }
    if (u6.rows[0].teamId) {
      const team = await client.query(`SELECT * FROM teams WHERE id = ${u6.rows[0].teamId}`);
      console.log('Team:', team.rows);
    }

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
