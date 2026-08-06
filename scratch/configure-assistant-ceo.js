const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(backendDir, '.env') });

const localUri = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/fintop";
const stagingUri = "postgresql://postgres.ifvpnxuurhmqummcrmqq:tuantuan2k5ZXC%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function configureAssistantCeo(dbUri, label) {
  console.log(`\n======================================================`);
  console.log(`=== CONFIGURING ASSISTANT_CEO PERMISSIONS IN: ${label} ===`);
  console.log(`======================================================`);
  const client = new Client({ connectionString: dbUri, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();

    // Find role IDs
    const roleRes = await client.query(`SELECT id, code FROM roles WHERE code IN ('ASSISTANT_CEO', 'EDITOR_ADMIN', 'SALE_ADMIN')`);
    const roleMap = {};
    roleRes.rows.forEach(r => roleMap[r.code] = r.id);

    const assistantId = roleMap['ASSISTANT_CEO'];
    const editorAdminId = roleMap['EDITOR_ADMIN'];
    const saleAdminId = roleMap['SALE_ADMIN'];

    if (!assistantId) {
      console.log(`❌ ASSISTANT_CEO role not found!`);
      return;
    }

    // 1. Get all permission IDs for EDITOR_ADMIN and SALE_ADMIN
    const edPerms = await client.query(`SELECT "permissionId" FROM role_permissions WHERE "roleId" = $1`, [editorAdminId]);
    const salePerms = await client.query(`SELECT "permissionId" FROM role_permissions WHERE "roleId" = $1`, [saleAdminId]);

    const combinedPermIds = new Set([
      ...edPerms.rows.map(r => r.permissionId),
      ...salePerms.rows.map(r => r.permissionId),
    ]);

    // 2. Add extra permissions for billing invoice approval and membership tier management
    const extraPerms = await client.query(`
      SELECT id, code FROM permissions 
      WHERE code IN (
        'INVOICE:READ', 'INVOICE:APPROVE', 'INVOICE:UPDATE', 
        'SUBSCRIPTION:READ', 'SUBSCRIPTION:UPDATE', 
        'USER:READ', 'USER:UPDATE', 
        'VIP_SIGNALS:READ', 'VIP_SIGNALS:CREATE', 'VIP_SIGNALS:UPDATE',
        'BLOG:READ', 'BLOG:CREATE', 'BLOG:UPDATE', 'BLOG:PUBLISH', 'BLOG:DELETE'
      )
    `);

    extraPerms.rows.forEach(p => combinedPermIds.add(p.id));

    // 3. Clear existing role_permissions for ASSISTANT_CEO and insert new combined list
    await client.query(`DELETE FROM role_permissions WHERE "roleId" = $1`, [assistantId]);
    for (const permId of combinedPermIds) {
      await client.query(`
        INSERT INTO role_permissions ("roleId", "permissionId")
        VALUES ($1, $2)
        ON CONFLICT ("roleId", "permissionId") DO NOTHING
      `, [assistantId, permId]);
    }

    console.log(`✅ Configured ASSISTANT_CEO role with ${combinedPermIds.size} permissions (EDITOR_ADMIN + SALE_ADMIN + Billing & Membership Approval) in ${label}`);

  } catch (err) {
    console.error(`Error in ${label}:`, err.message);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  await configureAssistantCeo(localUri, "LOCAL POSTGRES");
  await configureAssistantCeo(stagingUri, "REMOTE STAGING (Supabase)");
}

main();
