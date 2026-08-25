const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function check() {
  const perms = await pool.query('SELECT id, code, module, action, description FROM permissions ORDER BY id');
  console.log('All Permissions:', perms.rows);
  const vipPerms = await pool.query(`
    SELECT p.code, p.description 
    FROM role_permissions rp 
    JOIN roles r ON r.id = rp."roleId" 
    JOIN permissions p ON p.id = rp."permissionId" 
    WHERE r.code = 'CLIENT_VIP'
  `);
  console.log('CLIENT_VIP Perms:', vipPerms.rows);
  await pool.end();
}

check().catch(console.error);
