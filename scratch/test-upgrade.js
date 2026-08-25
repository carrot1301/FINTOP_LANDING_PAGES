const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Pool } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testUpgrade() {
  const client = await pool.connect();
  try {
    const userRes = await client.query(`SELECT id FROM users WHERE email = 'linhkhanhtran1111@gmail.com'`);
    if (userRes.rows.length > 0) {
      const uid = userRes.rows[0].id;
      
      // Delete old client roles
      const clientRoleCodes = ['CLIENT', 'CLIENT_PRO', 'CLIENT_VIP', 'CLIENT_DIAMOND'];
      await client.query(`
        DELETE FROM user_roles 
        WHERE "userId" = $1 
          AND "roleId" IN (SELECT id FROM roles WHERE code = ANY($2))
      `, [uid, clientRoleCodes]);

      // Assign CLIENT_DIAMOND role and update tierLevel to DIAMOND
      const diamondRole = await client.query(`SELECT id FROM roles WHERE code = 'CLIENT_DIAMOND'`);
      if (diamondRole.rows.length > 0) {
        await client.query(`INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, 1)`, [uid, diamondRole.rows[0].id]);
      }

      await client.query(`UPDATE users SET "tierLevel" = 'DIAMOND' WHERE id = $1`, [uid]);
      console.log('✅ Updated user 164 to DIAMOND and synced role CLIENT_DIAMOND');

      // Verify result
      const checkRes = await client.query(`
        SELECT u.email, u."tierLevel", r.code as role_code, r.name as role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur."userId"
        LEFT JOIN roles r ON ur."roleId" = r.id
        WHERE u.id = $1
      `, [uid]);
      console.log('VERIFY:', checkRes.rows);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

testUpgrade();
