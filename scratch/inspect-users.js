const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== Users Count ===');
    const cnt = await client.query('SELECT COUNT(*) FROM users');
    console.log('Total users:', cnt.rows[0].count);

    console.log('\n=== Staff Users in DB ===');
    // Staff are users that have a role other than CLIENT / CLIENT_VIP, or belong to a team/department
    const staff = await client.query(`
      SELECT u.id, u.email, u."fullName", u."teamId", t.name as team_name, t.code as team_code
      FROM users u
      LEFT JOIN teams t ON u."teamId" = t.id
      WHERE u."deletedAt" IS NULL
      AND (u."teamId" IS NOT NULL OR u."departmentId" IS NOT NULL OR u.email LIKE '%@fintop%')
    `);
    console.log(staff.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
