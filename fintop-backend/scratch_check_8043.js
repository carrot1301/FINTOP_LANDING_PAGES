require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, email, "fullName", "staffCode", "referralId", "referralName"
      FROM users
      WHERE id = 8043 OR "staffCode" = '8043' OR "referralId" = '8043'
    `);
    console.log('QueryResult for 8043:');
    console.table(res.rows);

    const u47 = await client.query(`
      SELECT u.id, u.email, u."fullName", u."brokerId", u."referralId", u."referralName",
             b.id as b_id, b."fullName" as b_name, b."staffCode" as b_staff_code, b.email as b_email
      FROM users u
      LEFT JOIN users b ON u."brokerId" = b.id
      WHERE u.id = 47
    `);
    console.log('User 47 (Đặng Thị Ngọc Hương) details & broker relation:');
    console.table(u47.rows);

    const staff = await client.query(`
      SELECT u.id, u.email, u."fullName", u."staffCode", array_agg(r.code) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur."userId"
      LEFT JOIN roles r ON ur."roleId" = r.id
      WHERE u."deletedAt" IS NULL
      GROUP BY u.id
    `);
    console.log('All users:');
    console.table(staff.rows.slice(0, 30));

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
