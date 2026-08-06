const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

const LOCAL_URI = "postgresql://postgres:123@localhost:5432/fintop";

async function main() {
  const client = new Client({ connectionString: LOCAL_URI });
  await client.connect();

  console.log("1. Checking users with SUPER_ADMIN role...");
  const superAdminUsers = await client.query(`
    SELECT u.id, u.email, u."fullName"
    FROM users u
    JOIN user_roles ur ON u.id = ur."userId"
    JOIN roles r ON ur."roleId" = r.id
    WHERE r.code = 'SUPER_ADMIN' AND u."deletedAt" IS NULL
  `);
  console.log("SUPER_ADMIN users found:", superAdminUsers.rows);

  console.log("2. Re-assigning SUPER_ADMIN users to DEVELOPER or CEO...");
  for (const u of superAdminUsers.rows) {
    if (u.email === 'fintop.ba@gmail.com') {
      // Set CEO
      await client.query(`
        DELETE FROM user_roles WHERE "userId" = $1 AND "roleId" = (SELECT id FROM roles WHERE code = 'SUPER_ADMIN');
        INSERT INTO user_roles ("userId", "roleId", "assignedAt")
        SELECT $1, id, NOW() FROM roles WHERE code = 'CEO'
        ON CONFLICT DO NOTHING;
      `, [u.id]);
      console.log(`  -> Migrated ${u.email} to CEO`);
    } else {
      // Set DEVELOPER
      await client.query(`
        DELETE FROM user_roles WHERE "userId" = $1 AND "roleId" = (SELECT id FROM roles WHERE code = 'SUPER_ADMIN');
        INSERT INTO user_roles ("userId", "roleId", "assignedAt")
        SELECT $1, id, NOW() FROM roles WHERE code = 'DEVELOPER'
        ON CONFLICT DO NOTHING;
      `, [u.id]);
      console.log(`  -> Migrated ${u.email} to DEVELOPER`);
    }
  }

  console.log("3. Soft-deleting SUPER_ADMIN role in database...");
  await client.query(`UPDATE roles SET "deletedAt" = NOW() WHERE code = 'SUPER_ADMIN'`);
  console.log("✅ SUPER_ADMIN role soft deleted!");

  await client.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
