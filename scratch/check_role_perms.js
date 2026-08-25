const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function check() {
  const roles = await pool.query('SELECT id, code, name FROM roles ORDER BY id');
  console.log('Roles:', roles.rows);
  const perms = await pool.query(`
    SELECT r.code as role_code, r.name, COUNT(rp."permissionId") as perm_count 
    FROM roles r 
    LEFT JOIN role_permissions rp ON r.id = rp."roleId" 
    GROUP BY r.id, r.code, r.name 
    ORDER BY r.id
  `);
  console.log('Role Perm Counts:', perms.rows);
  await pool.end();
}

check().catch(console.error);
