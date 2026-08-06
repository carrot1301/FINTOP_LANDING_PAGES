const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function applyLive() {
  console.log(`Connecting to Staging / Remote Database...`);
  const client = new Client({ connectionString: stagingUri, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();

    await client.query(`ALTER TYPE "ROLE_CODE" ADD VALUE IF NOT EXISTS 'DEVELOPER'`);

    const devRoleCheck = await client.query(`SELECT id FROM roles WHERE code = 'DEVELOPER'`);
    let devRoleId;
    if (devRoleCheck.rows.length === 0) {
      const newRoleRes = await client.query(`
        INSERT INTO roles (code, name, description, "isSystem", status, "createdAt", "updatedAt")
        VALUES ('DEVELOPER', 'Developer / Kỹ sư Phát triển', 'Quyền Quản trị viên Kỹ thuật (Dưới quyền CEO)', true, 'ACTIVE', NOW(), NOW())
        RETURNING id
      `);
      devRoleId = newRoleRes.rows[0].id;
      console.log(`✅ Created DEVELOPER role: ID ${devRoleId}`);
    } else {
      devRoleId = devRoleCheck.rows[0].id;
    }

    const ceoRoleId = (await client.query(`SELECT id FROM roles WHERE code = 'CEO'`)).rows[0].id;
    const saRoleId = (await client.query(`SELECT id FROM roles WHERE code = 'SUPER_ADMIN'`)).rows[0]?.id;

    // fintop.ba@gmail.com -> CEO ONLY
    const ceoUserId = (await client.query(`SELECT id FROM users WHERE email = 'fintop.ba@gmail.com' AND "deletedAt" IS NULL`)).rows[0]?.id;
    if (ceoUserId) {
      await client.query(`DELETE FROM user_roles WHERE "userId" = $1`, [ceoUserId]);
      await client.query(`INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, $1)`, [ceoUserId, ceoRoleId]);
      console.log(`👑 Assigned CEO role ONLY to fintop.ba@gmail.com`);
    }

    // fintop.bashare@gmail.com -> DEVELOPER ONLY
    const devUserId = (await client.query(`SELECT id FROM users WHERE email = 'fintop.bashare@gmail.com' AND "deletedAt" IS NULL`)).rows[0]?.id;
    if (devUserId) {
      await client.query(`DELETE FROM user_roles WHERE "userId" = $1`, [devUserId]);
      await client.query(`INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, $1)`, [devUserId, devRoleId]);
      console.log(`🛠️ Assigned DEVELOPER role ONLY to fintop.bashare@gmail.com`);
    }

    // Remove SUPER_ADMIN role assignments from all users, replace with DEVELOPER
    if (saRoleId) {
      const saUsers = await client.query(`
        SELECT u.id, u.email 
        FROM users u 
        JOIN user_roles ur ON u.id = ur."userId" 
        WHERE ur."roleId" = $1 AND u.email NOT IN ('fintop.ba@gmail.com', 'fintop.bashare@gmail.com')
      `, [saRoleId]);

      for (const u of saUsers.rows) {
        await client.query(`DELETE FROM user_roles WHERE "userId" = $1 AND "roleId" = $2`, [u.id, saRoleId]);
        await client.query(`INSERT INTO user_roles ("userId", "roleId", "assignedById") VALUES ($1, $2, $1) ON CONFLICT DO NOTHING`, [u.id, devRoleId]);
        console.log(`🔄 Converted SUPER_ADMIN to DEVELOPER for: ${u.email}`);
      }
    }

    // Copy permissions from CEO
    const ceoPerms = await client.query(`SELECT "permissionId" FROM role_permissions WHERE "roleId" = $1`, [ceoRoleId]);
    for (const p of ceoPerms.rows) {
      await client.query(`
        INSERT INTO role_permissions ("roleId", "permissionId")
        VALUES ($1, $2)
        ON CONFLICT ("roleId", "permissionId") DO NOTHING
      `, [devRoleId, p.permissionId]);
    }
    console.log(`✅ Copied permissions to DEVELOPER role.`);

  } catch (err) {
    console.log("DB result:", err.message);
  } finally {
    try { await client.end(); } catch {}
  }
}

applyLive();
