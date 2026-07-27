const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.id, u.email, u."fullName", u."staffCode", u."teamId", t.code as team_code, u."departmentId", d.code as dept_code
      FROM users u
      LEFT JOIN teams t ON u."teamId" = t.id
      LEFT JOIN departments d ON u."departmentId" = d.id
      WHERE u.id IN (1, 140)
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
