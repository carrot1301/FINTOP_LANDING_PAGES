const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123@127.0.0.1:5432/fintop' });

async function seedCustomerRolePerms() {
  const roles = await pool.query("SELECT id, code FROM roles WHERE code IN ('CLIENT_PRO', 'CLIENT_DIAMOND')");
  const roleMap = new Map(roles.rows.map(r => [r.code, r.id]));

  const perms = await pool.query("SELECT id, code FROM permissions WHERE code IN ('BLOG:READ', 'REPORT:READ', 'VIP_SIGNALS:READ', 'STOCK_DATA:READ')");
  const permMap = new Map(perms.rows.map(p => [p.code, p.id]));

  const proRoleId = roleMap.get('CLIENT_PRO');
  const diamondRoleId = roleMap.get('CLIENT_DIAMOND');

  // PRO permissions: BLOG:READ, STOCK_DATA:READ
  const proCodes = ['BLOG:READ', 'STOCK_DATA:READ'];
  for (const code of proCodes) {
    const permId = permMap.get(code);
    if (proRoleId && permId) {
      await pool.query(
        'INSERT INTO role_permissions ("roleId", "permissionId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [proRoleId, permId]
      );
    }
  }

  // DIAMOND permissions: BLOG:READ, REPORT:READ, VIP_SIGNALS:READ, STOCK_DATA:READ
  const diamondCodes = ['BLOG:READ', 'REPORT:READ', 'VIP_SIGNALS:READ', 'STOCK_DATA:READ'];
  for (const code of diamondCodes) {
    const permId = permMap.get(code);
    if (diamondRoleId && permId) {
      await pool.query(
        'INSERT INTO role_permissions ("roleId", "permissionId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [diamondRoleId, permId]
      );
    }
  }

  console.log('✅ Successfully assigned permissions for CLIENT_PRO (2 perms) and CLIENT_DIAMOND (4 perms)!');
  await pool.end();
}

seedCustomerRolePerms().catch(console.error);
