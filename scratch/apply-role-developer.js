const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const localUri = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/fintop";
const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function setupDeveloperRole(dbUri, label) {
  console.log(`\n======================================================`);
  console.log(`=== UPDATING ROLE STRUCTURE IN: ${label} ===`);
  console.log(`======================================================`);
  const client = new Client({ connectionString: dbUri, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();

    // 1. Add DEVELOPER to ROLE_CODE enum if not present
    console.log(`Adding 'DEVELOPER' to ROLE_CODE enum...`);
    await client.query(`ALTER TYPE "ROLE_CODE" ADD VALUE IF NOT EXISTS 'DEVELOPER'`);

    // 2. Insert DEVELOPER role into roles table if not present
    const devRoleCheck = await client.query(`SELECT id FROM roles WHERE code = 'DEVELOPER'`);
    let devRoleId;
    if (devRoleCheck.rows.length === 0) {
      const newRoleRes = await client.query(`
        INSERT INTO roles (code, name, description, "isSystem", status, "createdAt", "updatedAt")
        VALUES ('DEVELOPER', 'Developer / Kỹ sư Phát triển', 'Quyền Quản trị viên Kỹ thuật (Dưới quyền CEO)', true, 'ACTIVE', NOW(), NOW())
        RETURNING id
      `);
      devRoleId = newRoleRes.rows[0].id;
      console.log(`✅ Created DEVELOPER role with ID: ${devRoleId}`);
    } else {
      devRoleId = devRoleCheck.rows[0].id;
      console.log(`ℹ️ DEVELOPER role already exists with ID: ${devRoleId}`);
    }

    // Get CEO role ID
    const ceoRoleRes = await client.query(`SELECT id FROM roles WHERE code = 'CEO'`);
    const ceoRoleId = ceoRoleRes.rows[0].id;

    // Get SUPER_ADMIN role ID
    const saRoleRes = await client.query(`SELECT id FROM roles WHERE code = 'SUPER_ADMIN'`);
    const saRoleId = saRoleRes.rows.length > 0 ? saRoleRes.rows[0].id : null;

    // 3. Configure fintop.ba@gmail.com -> CEO ONLY
    const ceoUserRes = await client.query(`SELECT id, email, "fullName" FROM users WHERE email = 'fintop.ba@gmail.com' AND "deletedAt" IS NULL`);
    if (ceoUserRes.rows.length > 0) {
      const ceoUserId = ceoUserRes.rows[0].id;
      // Remove all roles and assign CEO only
      await client.query(`DELETE FROM user_roles WHERE "userId" = $1`, [ceoUserId]);
      await client.query(`INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, $1)`, [ceoUserId, ceoRoleId]);
      console.log(`👑 Assigned CEO role ONLY to: [ID ${ceoUserId}] ${ceoUserRes.rows[0].fullName} (fintop.ba@gmail.com)`);
    } else {
      console.log(`⚠️ User fintop.ba@gmail.com not found`);
    }

    // 4. Configure fintop.bashare@gmail.com -> DEVELOPER ONLY
    const devUserRes = await client.query(`SELECT id, email, "fullName" FROM users WHERE email = 'fintop.bashare@gmail.com' AND "deletedAt" IS NULL`);
    if (devUserRes.rows.length > 0) {
      const devUserId = devUserRes.rows[0].id;
      // Remove all roles and assign DEVELOPER only
      await client.query(`DELETE FROM user_roles WHERE "userId" = $1`, [devUserId]);
      await client.query(`INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, $1)`, [devUserId, devRoleId]);
      console.log(`🛠️ Assigned DEVELOPER role ONLY to: [ID ${devUserId}] ${devUserRes.rows[0].fullName} (fintop.bashare@gmail.com)`);
    } else {
      console.log(`⚠️ User fintop.bashare@gmail.com not found`);
    }

    // 5. Clean up SUPER_ADMIN assignments for all users: reassign to DEVELOPER or CEO
    if (saRoleId) {
      const saUsers = await client.query(`
        SELECT u.id, u.email, u."fullName" 
        FROM users u 
        JOIN user_roles ur ON u.id = ur."userId" 
        WHERE ur."roleId" = $1 AND u.email NOT IN ('fintop.ba@gmail.com', 'fintop.bashare@gmail.com')
      `, [saRoleId]);

      for (const u of saUsers.rows) {
        // Delete SUPER_ADMIN role assignment
        await client.query(`DELETE FROM user_roles WHERE "userId" = $1 AND "roleId" = $2`, [u.id, saRoleId]);
        // Assign DEVELOPER role as fallback for remaining tech/admin staff
        await client.query(`
          INSERT INTO user_roles ("userId", "roleId", "assignedById") 
          VALUES ($1, $2, $1) 
          ON CONFLICT ("userId", "roleId") DO NOTHING
        `, [u.id, devRoleId]);
        console.log(`🔄 Converted SUPER_ADMIN to DEVELOPER for: [ID ${u.id}] ${u.fullName} (${u.email})`);
      }
    }

    // 6. Copy ALL permissions from CEO role to DEVELOPER role
    console.log(`Copying all permissions from CEO role to DEVELOPER role...`);
    const ceoPerms = await client.query(`SELECT "permissionId" FROM role_permissions WHERE "roleId" = $1`, [ceoRoleId]);
    for (const p of ceoPerms.rows) {
      await client.query(`
        INSERT INTO role_permissions ("roleId", "permissionId")
        VALUES ($1, $2)
        ON CONFLICT ("roleId", "permissionId") DO NOTHING
      `, [devRoleId, p.permissionId]);
    }
    console.log(`✅ Copied ${ceoPerms.rows.length} permissions to DEVELOPER role.`);

  } catch (err) {
    console.error(`Error updating ${label}:`, err);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  await setupDeveloperRole(localUri, "LOCAL POSTGRES");
  await setupDeveloperRole(stagingUri, "REMOTE STAGING (Supabase)");
}

main();
