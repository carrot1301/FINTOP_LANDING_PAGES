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
      SELECT u.id, u.email, u."fullName", u."staffCode", ARRAY_AGG(r.code) as roles
      FROM users u
      JOIN user_roles ur ON u.id = ur."userId"
      JOIN roles r ON ur."roleId" = r.id
      WHERE u."deletedAt" IS NULL
      GROUP BY u.id
      ORDER BY u.id
    `);
    
    console.log('--- ALL USERS AND THEIR ROLES & STAFF CODES ---');
    for (const row of res.rows) {
      // Check if they have admin/staff roles
      const rolesArr = Array.isArray(row.roles) ? row.roles : (row.roles || '').replace(/[{}]/g, '').split(',');
      const hasAdminRole = rolesArr.some(r => 
        ['SUPER_ADMIN', 'CEO', 'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR', 'SALE_ADMIN', 'SALE', 'EXPERT'].includes(r.trim())
      );
      if (hasAdminRole) {
        console.log(`User ID: ${row.id} | Name: ${row.fullName} | Email: ${row.email} | StaffCode: ${row.staffCode} | Roles: ${rolesArr.map(r=>r.trim()).join(', ')}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
