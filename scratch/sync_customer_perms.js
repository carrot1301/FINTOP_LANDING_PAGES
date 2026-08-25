const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function syncAllCustomerPerms() {
  const roles = await pool.query("SELECT id, code FROM roles WHERE code IN ('CLIENT_PRO', 'CLIENT_VIP', 'CLIENT_DIAMOND')");
  const roleMap = new Map(roles.rows.map(r => [r.code, r.id]));

  const perms = await pool.query("SELECT id, code FROM permissions WHERE code IN ('BLOG:READ', 'REPORT:READ', 'VIP_SIGNALS:READ', 'STOCK_DATA:READ')");

  const customerRoleCodes = ['CLIENT_PRO', 'CLIENT_VIP', 'CLIENT_DIAMOND'];

  for (const roleCode of customerRoleCodes) {
    const roleId = roleMap.get(roleCode);
    if (!roleId) continue;
    for (const p of perms.rows) {
      await pool.query(
        'INSERT INTO role_permissions ("roleId", "permissionId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [roleId, p.id]
      );
    }
  }

  console.log('✅ Synchronized all 4 permissions for CLIENT_PRO, CLIENT_VIP, and CLIENT_DIAMOND!');
  await pool.end();
}

syncAllCustomerPerms().catch(console.error);
