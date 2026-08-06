const path = require('path');
const fs = require('fs');
const backendDir = path.join(__dirname, '../fintop-backend');
const { Client } = require(path.join(backendDir, 'node_modules/pg'));

const localUri = "postgresql://postgres:123@localhost:5432/fintop";

async function exportSql() {
  console.log("Exporting local database roles & permissions & users to fintop_dump.sql...");
  const client = new Client({ connectionString: localUri });
  await client.connect();

  let sql = `
-- Fix ROLE_CODE Enum
ALTER TYPE "ROLE_CODE" ADD VALUE IF NOT EXISTS 'DEVELOPER';

-- Update roles table
INSERT INTO roles (id, name, code, description, "isSystem", status, "createdAt", "updatedAt")
VALUES 
  (1, 'Super Administrator', 'SUPER_ADMIN', 'Legacy System Admin', true, 'ACTIVE', NOW(), NOW()),
  (2, 'CEO', 'CEO', 'Tổng Giám Đốc (Cấp cao nhất)', true, 'ACTIVE', NOW(), NOW()),
  (3, 'Developer', 'DEVELOPER', 'Quản trị Kỹ thuật', true, 'ACTIVE', NOW(), NOW()),
  (4, 'Trợ lý CEO', 'ASSISTANT_CEO', 'Trợ lý Tổng Giám Đốc', true, 'ACTIVE', NOW(), NOW()),
  (5, 'Biên tập Admin', 'EDITOR_ADMIN', 'Quản trị Biên tập', true, 'ACTIVE', NOW(), NOW()),
  (6, 'Biên tập Pro', 'EDITOR_PRO', 'Biên tập viên Pro', true, 'ACTIVE', NOW(), NOW()),
  (7, 'Biên tập viên', 'EDITOR', 'Biên tập viên', true, 'ACTIVE', NOW(), NOW()),
  (8, 'Sale Admin', 'SALE_ADMIN', 'Quản trị Khối Môi giới', true, 'ACTIVE', NOW(), NOW()),
  (9, 'Chuyên viên Sale', 'SALE', 'Chuyên viên Sale', true, 'ACTIVE', NOW(), NOW()),
  (10, 'Chuyên gia', 'EXPERT', 'Chuyên gia Phân tích', true, 'ACTIVE', NOW(), NOW()),
  (11, 'Khách hàng', 'CLIENT', 'Tài khoản Khách hàng', true, 'ACTIVE', NOW(), NOW()),
  (12, 'Khách hàng VIP', 'CLIENT_VIP', 'Tài khoản Khách hàng VIP', true, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, name = EXCLUDED.name;

-- Ensure fintop.ba@gmail.com is ACTIVE and verified
UPDATE users SET status = 'ACTIVE', "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()) WHERE email = 'fintop.ba@gmail.com';
UPDATE users SET status = 'ACTIVE', "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()) WHERE email = 'fintop.bashare@gmail.com';

-- Set fintop.ba@gmail.com -> CEO (roleId = 2)
DELETE FROM user_roles WHERE "userId" IN (SELECT id FROM users WHERE email = 'fintop.ba@gmail.com');
INSERT INTO user_roles ("userId", "roleId", "assignedAt")
SELECT id, (SELECT id FROM roles WHERE code = 'CEO'), NOW() FROM users WHERE email = 'fintop.ba@gmail.com';

-- Set fintop.bashare@gmail.com -> DEVELOPER (roleId = 3)
DELETE FROM user_roles WHERE "userId" IN (SELECT id FROM users WHERE email = 'fintop.bashare@gmail.com');
INSERT INTO user_roles ("userId", "roleId", "assignedAt")
SELECT id, (SELECT id FROM roles WHERE code = 'DEVELOPER'), NOW() FROM users WHERE email = 'fintop.bashare@gmail.com';

-- Copy all permissions from CEO/SUPER_ADMIN to DEVELOPER in role_permissions
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'DEVELOPER'), "permissionId"
FROM role_permissions
WHERE "roleId" IN (SELECT id FROM roles WHERE code IN ('CEO', 'SUPER_ADMIN'))
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Grant INVOICE and PLAN permissions to DEVELOPER, CEO, ASSISTANT_CEO
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code IN ('CEO', 'DEVELOPER', 'ASSISTANT_CEO')
  AND p.code IN ('INVOICE:READ', 'INVOICE:APPROVE', 'INVOICE:UPDATE', 'PLAN:READ', 'PLAN:CREATE', 'PLAN:UPDATE', 'PLAN:DELETE', 'USER:READ', 'USER:UPDATE')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
`;

  const dumpPath = path.join(backendDir, 'fintop_dump.sql');
  fs.writeFileSync(dumpPath, sql, 'utf8');
  console.log(`✅ Successfully wrote updated seed script to ${dumpPath}`);

  await client.end();
}

exportSql();
