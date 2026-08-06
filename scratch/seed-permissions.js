const path = require('path');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

const LOCAL_URI = "postgresql://postgres:123@localhost:5432/fintop";

// ════════════════════════════════════════════════════════
// NEW PERMISSIONS TO CREATE
// ════════════════════════════════════════════════════════
const NEW_PERMISSIONS = [
  // INVOICE
  { module: 'INVOICE', action: 'READ',    code: 'INVOICE:READ',    description: 'Xem hóa đơn' },
  { module: 'INVOICE', action: 'APPROVE', code: 'INVOICE:APPROVE', description: 'Phê duyệt hóa đơn' },
  { module: 'INVOICE', action: 'UPDATE',  code: 'INVOICE:UPDATE',  description: 'Cập nhật hóa đơn' },
  // PLAN
  { module: 'PLAN', action: 'READ',   code: 'PLAN:READ',   description: 'Xem gói cước' },
  { module: 'PLAN', action: 'CREATE', code: 'PLAN:CREATE', description: 'Tạo gói cước' },
  { module: 'PLAN', action: 'UPDATE', code: 'PLAN:UPDATE', description: 'Sửa gói cước' },
  { module: 'PLAN', action: 'DELETE', code: 'PLAN:DELETE', description: 'Xóa gói cước' },
  // SUBSCRIPTION
  { module: 'SUBSCRIPTION', action: 'READ',   code: 'SUBSCRIPTION:READ',   description: 'Xem hội viên' },
  { module: 'SUBSCRIPTION', action: 'UPDATE', code: 'SUBSCRIPTION:UPDATE', description: 'Nâng cấp hội viên' },
  // BLOG extended
  { module: 'BLOG', action: 'DELETE',    code: 'BLOG:DELETE',    description: 'Xóa/ẩn bài viết' },
  { module: 'BLOG', action: 'MANAGE',    code: 'BLOG:MANAGE',    description: 'Quản lý bài viết cấp dưới (ẩn/hiện/xóa)' },
  { module: 'BLOG', action: 'LABEL_PRO', code: 'BLOG:LABEL_PRO', description: 'Gắn/bỏ nhãn Pro bài viết' },
  // STOCK_DATA
  { module: 'STOCK_DATA', action: 'READ',   code: 'STOCK_DATA:READ',   description: 'Xem dữ liệu chứng khoán' },
  { module: 'STOCK_DATA', action: 'UPDATE', code: 'STOCK_DATA:UPDATE', description: 'Chỉnh sửa dữ liệu CK' },
  // HANDBOOK
  { module: 'HANDBOOK', action: 'READ',   code: 'HANDBOOK:READ',   description: 'Xem hướng dẫn/tủ sách' },
  { module: 'HANDBOOK', action: 'CREATE', code: 'HANDBOOK:CREATE', description: 'Tạo hướng dẫn' },
  { module: 'HANDBOOK', action: 'UPDATE', code: 'HANDBOOK:UPDATE', description: 'Sửa hướng dẫn' },
  { module: 'HANDBOOK', action: 'DELETE', code: 'HANDBOOK:DELETE', description: 'Xóa hướng dẫn' },
  // REPORT extended
  { module: 'REPORT', action: 'CREATE', code: 'REPORT:CREATE', description: 'Tạo báo cáo' },
  { module: 'REPORT', action: 'UPDATE', code: 'REPORT:UPDATE', description: 'Sửa báo cáo' },
  { module: 'REPORT', action: 'DELETE', code: 'REPORT:DELETE', description: 'Xóa báo cáo' },
  // SALES (business)
  { module: 'SALES', action: 'READ',   code: 'SALES:READ',   description: 'Xem doanh số/KH kinh doanh' },
  { module: 'SALES', action: 'MANAGE', code: 'SALES:MANAGE', description: 'Quản lý đội ngũ kinh doanh' },
];

// ════════════════════════════════════════════════════════
// ROLE → PERMISSIONS MAPPING (complete matrix)
// ════════════════════════════════════════════════════════
const ROLE_PERMISSIONS = {
  // CEO: ALL permissions
  CEO: 'ALL',
  // DEVELOPER: ALL permissions (same as CEO)
  DEVELOPER: 'ALL',
  // SUPER_ADMIN: ALL permissions (legacy)
  SUPER_ADMIN: 'ALL',

  // EDITOR_ADMIN: Full editing + quản lý nhân sự editing + hướng dẫn/báo cáo/tủ sách + gắn nhãn Pro
  EDITOR_ADMIN: [
    'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE', 'BLOG:DELETE', 'BLOG:MANAGE', 'BLOG:LABEL_PRO',
    'REPORT:READ', 'REPORT:CREATE', 'REPORT:UPDATE', 'REPORT:DELETE',
    'HANDBOOK:READ', 'HANDBOOK:CREATE', 'HANDBOOK:UPDATE', 'HANDBOOK:DELETE',
    'STOCK_DATA:READ', 'STOCK_DATA:UPDATE',
    'VIP_SIGNALS:READ',
    'USER:READ', 'USER:UPDATE',
    'ROLE:READ', 'ROLE:UPDATE',
  ],

  // EDITOR_PRO: Viết bài + edit bài mình + truy cập dữ liệu CK
  EDITOR_PRO: [
    'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE',
    'STOCK_DATA:READ', 'STOCK_DATA:UPDATE',
    'VIP_SIGNALS:READ',
    'REPORT:READ',
  ],

  // EDITOR: Viết bài + edit bài chính mình only
  EDITOR: [
    'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE',
  ],

  // ASSISTANT_CEO (Trợ lý CEO): Full kinh doanh, phê duyệt thanh toán, nâng cấp hội viên
  ASSISTANT_CEO: [
    'INVOICE:READ', 'INVOICE:APPROVE', 'INVOICE:UPDATE',
    'PLAN:READ', 'PLAN:CREATE', 'PLAN:UPDATE', 'PLAN:DELETE',
    'SUBSCRIPTION:READ', 'SUBSCRIPTION:UPDATE',
    'SALES:READ', 'SALES:MANAGE',
    'USER:READ', 'USER:UPDATE',
    'ROLE:READ', 'ROLE:UPDATE',
    'VIP_SIGNALS:READ',
    'REPORT:READ',
  ],

  // SALE_ADMIN: Xem KH+doanh số team mình, cấp quyền user→Sales
  SALE_ADMIN: [
    'SALES:READ',
    'USER:READ', 'USER:UPDATE',
    'VIP_SIGNALS:READ',
    'REPORT:READ',
  ],

  // SALE: Xem KH mình quản lý + doanh số
  SALE: [
    'SALES:READ',
    'USER:READ',
    'VIP_SIGNALS:READ',
  ],

  // EXPERT: Tín hiệu VIP + báo cáo
  EXPERT: [
    'VIP_SIGNALS:CREATE', 'VIP_SIGNALS:READ', 'VIP_SIGNALS:UPDATE',
    'REPORT:READ',
  ],

  // CLIENT_VIP: Xem bài + báo cáo + tín hiệu VIP
  CLIENT_VIP: [
    'BLOG:READ',
    'REPORT:READ',
    'VIP_SIGNALS:READ',
  ],

  // CLIENT: Xem bài
  CLIENT: [
    'BLOG:READ',
  ],
};

async function main() {
  const client = new Client({ connectionString: LOCAL_URI });
  await client.connect();

  console.log("═══════════════════════════════════════════════");
  console.log("STEP 1: Creating new permissions...");
  console.log("═══════════════════════════════════════════════");

  let created = 0;
  let skipped = 0;
  for (const perm of NEW_PERMISSIONS) {
    const exists = await client.query('SELECT id FROM permissions WHERE code = $1', [perm.code]);
    if (exists.rows.length > 0) {
      skipped++;
      continue;
    }
    await client.query(
      `INSERT INTO permissions (module, action, code, description, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'ACTIVE', NOW(), NOW())`,
      [perm.module, perm.action, perm.code, perm.description]
    );
    console.log(`  ✅ Created: ${perm.code}`);
    created++;
  }
  console.log(`  → Created: ${created}, Skipped (already exists): ${skipped}`);

  console.log("\n═══════════════════════════════════════════════");
  console.log("STEP 2: Reassigning role_permissions...");
  console.log("═══════════════════════════════════════════════");

  // Get all permission IDs
  const allPerms = await client.query('SELECT id, code FROM permissions ORDER BY code');
  const permMap = {};
  for (const p of allPerms.rows) {
    permMap[p.code] = p.id;
  }
  console.log(`  Total permissions in DB: ${allPerms.rows.length}`);

  // Get all role IDs
  const allRoles = await client.query('SELECT id, code FROM roles WHERE "deletedAt" IS NULL ORDER BY id');
  const roleMap = {};
  for (const r of allRoles.rows) {
    roleMap[r.code] = r.id;
  }

  const allPermIds = allPerms.rows.map(p => p.id);

  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleCode];
    if (!roleId) {
      console.log(`  ⚠️ Role ${roleCode} not found in DB, skipping`);
      continue;
    }

    // Delete all existing role_permissions for this role
    await client.query('DELETE FROM role_permissions WHERE "roleId" = $1', [roleId]);

    // Determine which permission IDs to assign
    let targetPermIds;
    if (permCodes === 'ALL') {
      targetPermIds = allPermIds;
    } else {
      targetPermIds = permCodes
        .map(code => permMap[code])
        .filter(id => id !== undefined);
    }

    // Insert new role_permissions
    if (targetPermIds.length > 0) {
      const values = targetPermIds.map(pid => `(${roleId}, ${pid})`).join(',');
      await client.query(`INSERT INTO role_permissions ("roleId", "permissionId") VALUES ${values} ON CONFLICT ("roleId", "permissionId") DO NOTHING`);
    }

    console.log(`  ✅ ${roleCode} (id=${roleId}): assigned ${targetPermIds.length} permissions`);
  }

  console.log("\n═══════════════════════════════════════════════");
  console.log("STEP 3: Verification...");
  console.log("═══════════════════════════════════════════════");

  for (const [roleCode, _] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleCode];
    if (!roleId) continue;
    const count = await client.query('SELECT COUNT(*) as cnt FROM role_permissions WHERE "roleId" = $1', [roleId]);
    console.log(`  ${roleCode}: ${count.rows[0].cnt} permissions`);
  }

  await client.end();
  console.log("\n✅ DONE — All permissions seeded and role_permissions reassigned.");
}

main().catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
