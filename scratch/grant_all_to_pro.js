const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function grantAllToPro() {
  const roles = await pool.query("SELECT id, code FROM roles WHERE code = 'CLIENT_PRO'");
  const proRoleId = roles.rows[0]?.id;
  if (!proRoleId) {
    console.error('CLIENT_PRO role not found!');
    await pool.end();
    return;
  }

  const perms = await pool.query("SELECT id, code FROM permissions WHERE code IN ('BLOG:READ', 'REPORT:READ', 'VIP_SIGNALS:READ', 'STOCK_DATA:READ')");
  for (const p of perms.rows) {
    await pool.query(
      'INSERT INTO role_permissions ("roleId", "permissionId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [proRoleId, p.id]
    );
  }

  console.log(`✅ Granted all 4 user permissions to CLIENT_PRO (Role ID ${proRoleId})!`);
  await pool.end();
}

grantAllToPro().catch(console.error);
