const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

async function main() {
  const client = new Client({ connectionString: "postgresql://postgres:123@localhost:5432/fintop" });
  await client.connect();

  // 1. List all permissions
  const perms = await client.query('SELECT id, module, action, code, description FROM permissions ORDER BY code');
  console.log("=== ALL PERMISSIONS ===");
  console.table(perms.rows);

  // 2. List all roles
  const roles = await client.query('SELECT id, name, code, status FROM roles WHERE "deletedAt" IS NULL ORDER BY id');
  console.log("\n=== ALL ROLES ===");
  console.table(roles.rows);

  // 3. For each role, list assigned permissions
  for (const role of roles.rows) {
    const rp = await client.query(`
      SELECT p.code, p.description
      FROM role_permissions rp
      JOIN permissions p ON rp."permissionId" = p.id
      WHERE rp."roleId" = $1
      ORDER BY p.code
    `, [role.id]);
    console.log(`\n=== ROLE: ${role.name} (${role.code}) — ${rp.rows.length} permissions ===`);
    if (rp.rows.length > 0) {
      console.table(rp.rows);
    }
  }

  await client.end();
}
main();
