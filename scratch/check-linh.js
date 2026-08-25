const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkUser() {
  const client = await pool.connect();
  try {
    const userRes = await client.query(`SELECT id, email, "fullName", "tierLevel", "legacyTier" FROM users WHERE email = 'linhkhanhtran1111@gmail.com'`);
    console.log('USER:', userRes.rows);
    if (userRes.rows.length > 0) {
      const uid = userRes.rows[0].id;
      const rolesRes = await client.query(`
        SELECT r.id, r.code, r.name 
        FROM user_roles ur 
        JOIN roles r ON ur."roleId" = r.id 
        WHERE ur."userId" = $1
      `, [uid]);
      console.log('ROLES:', rolesRes.rows);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

checkUser();
