const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function fixIsSystem() {
  const staffRoles = ['SUPER_ADMIN', 'CEO', 'DEVELOPER', 'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR', 'SALE_ADMIN', 'SALE', 'EXPERT'];
  const clientRoles = ['CLIENT', 'CLIENT_PRO', 'CLIENT_VIP', 'CLIENT_DIAMOND'];

  // Set isSystem = true for all staff roles
  await pool.query('UPDATE roles SET "isSystem" = true WHERE code = ANY($1)', [staffRoles]);
  // Set isSystem = false for all customer roles
  await pool.query('UPDATE roles SET "isSystem" = false WHERE code = ANY($1)', [clientRoles]);

  const res = await pool.query('SELECT id, code, name, "isSystem" FROM roles ORDER BY id');
  console.log('✅ Updated DB Roles isSystem status:');
  console.table(res.rows);
  await pool.end();
}

fixIsSystem().catch(console.error);
