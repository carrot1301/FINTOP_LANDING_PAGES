const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function grantUserPermsToStaff() {
  const staffRoleCodes = ['SUPER_ADMIN', 'CEO', 'DEVELOPER', 'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO', 'EDITOR', 'SALE_ADMIN', 'SALE', 'EXPERT'];
  const roles = await pool.query('SELECT id, code FROM roles WHERE code = ANY($1)', [staffRoleCodes]);
  const userPerms = await pool.query("SELECT id, code FROM permissions WHERE code IN ('BLOG:READ', 'REPORT:READ', 'VIP_SIGNALS:READ', 'STOCK_DATA:READ')");

  for (const r of roles.rows) {
    for (const p of userPerms.rows) {
      await pool.query(
        'INSERT INTO role_permissions ("roleId", "permissionId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [r.id, p.id]
      );
    }
  }

  console.log('✅ Granted all 4 user permissions to ALL staff roles (Sale to CEO)!');
  await pool.end();
}

grantUserPermsToStaff().catch(console.error);
