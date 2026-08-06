-- ═══════════════════════════════════════════════════════════
-- FINTOP RBAC MIGRATION — Full Permission Matrix v2
-- Run this on Production VPS PostgreSQL
-- ═══════════════════════════════════════════════════════════

-- STEP 1: Add new enum values
ALTER TYPE "ROLE_CODE" ADD VALUE IF NOT EXISTS 'DEVELOPER';
ALTER TYPE "PERMISSION_MODULE" ADD VALUE IF NOT EXISTS 'PLAN';
ALTER TYPE "PERMISSION_MODULE" ADD VALUE IF NOT EXISTS 'STOCK_DATA';
ALTER TYPE "PERMISSION_MODULE" ADD VALUE IF NOT EXISTS 'HANDBOOK';
ALTER TYPE "PERMISSION_MODULE" ADD VALUE IF NOT EXISTS 'SALES';
ALTER TYPE "PERMISSION_ACTION" ADD VALUE IF NOT EXISTS 'MANAGE';
ALTER TYPE "PERMISSION_ACTION" ADD VALUE IF NOT EXISTS 'LABEL_PRO';

-- STEP 2: Ensure all roles exist
INSERT INTO roles (id, name, code, description, "isSystem", status, "createdAt", "updatedAt")
VALUES
  (2, 'Tổng Giám Đốc (CEO)', 'CEO', 'Tổng Giám Đốc (Cấp cao nhất)', true, 'ACTIVE', NOW(), NOW()),
  (3, 'Trợ lý CEO', 'ASSISTANT_CEO', 'Trợ lý Tổng Giám Đốc — Full kinh doanh', true, 'ACTIVE', NOW(), NOW()),
  (4, 'Trưởng phòng Biên tập', 'EDITOR_ADMIN', 'Quản trị Biên tập — Full editing', true, 'ACTIVE', NOW(), NOW()),
  (5, 'Biên tập viên Chuyên nghiệp', 'EDITOR_PRO', 'Biên tập viên Pro + Dữ liệu CK', true, 'ACTIVE', NOW(), NOW()),
  (6, 'Biên tập viên', 'EDITOR', 'Biên tập viên — chỉ viết/sửa bài của mình', true, 'ACTIVE', NOW(), NOW()),
  (7, 'Trưởng khối Môi giới', 'SALE_ADMIN', 'Quản trị Team Sale', true, 'ACTIVE', NOW(), NOW()),
  (8, 'Chuyên viên Môi giới', 'SALE', 'Chuyên viên Sale', true, 'ACTIVE', NOW(), NOW()),
  (9, 'Chuyên gia Cố vấn', 'EXPERT', 'Chuyên gia Phân tích', true, 'ACTIVE', NOW(), NOW()),
  (10, 'Khách hàng VIP', 'CLIENT_VIP', 'Khách hàng VIP', true, 'ACTIVE', NOW(), NOW()),
  (11, 'Khách hàng Tiêu chuẩn', 'CLIENT', 'Khách hàng thường', true, 'ACTIVE', NOW(), NOW()),
  (12, 'Developer / Kỹ sư Phát triển', 'DEVELOPER', 'Quản trị Kỹ thuật — Full quyền dưới CEO', true, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, name = EXCLUDED.name, description = EXCLUDED.description;

-- STEP 3: Ensure user accounts are correct
UPDATE users SET status = 'ACTIVE', "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()) WHERE email = 'fintop.ba@gmail.com';
UPDATE users SET status = 'ACTIVE', "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()) WHERE email = 'fintop.bashare@gmail.com';

-- Set fintop.ba@gmail.com -> CEO
DELETE FROM user_roles WHERE "userId" IN (SELECT id FROM users WHERE email = 'fintop.ba@gmail.com');
INSERT INTO user_roles ("userId", "roleId", "assignedAt")
SELECT id, (SELECT id FROM roles WHERE code = 'CEO'), NOW() FROM users WHERE email = 'fintop.ba@gmail.com';

-- Set fintop.bashare@gmail.com -> DEVELOPER
DELETE FROM user_roles WHERE "userId" IN (SELECT id FROM users WHERE email = 'fintop.bashare@gmail.com');
INSERT INTO user_roles ("userId", "roleId", "assignedAt")
SELECT id, (SELECT id FROM roles WHERE code = 'DEVELOPER'), NOW() FROM users WHERE email = 'fintop.bashare@gmail.com';

-- STEP 3.5: Migrate SUPER_ADMIN users and soft-delete SUPER_ADMIN role
UPDATE user_roles SET "roleId" = (SELECT id FROM roles WHERE code = 'DEVELOPER')
WHERE "roleId" = (SELECT id FROM roles WHERE code = 'SUPER_ADMIN')
  AND "userId" NOT IN (SELECT id FROM users WHERE email = 'fintop.ba@gmail.com');

UPDATE user_roles SET "roleId" = (SELECT id FROM roles WHERE code = 'CEO')
WHERE "roleId" = (SELECT id FROM roles WHERE code = 'SUPER_ADMIN')
  AND "userId" IN (SELECT id FROM users WHERE email = 'fintop.ba@gmail.com');

UPDATE roles SET "deletedAt" = NOW() WHERE code = 'SUPER_ADMIN' OR id = 1;

-- STEP 4: Create ALL new permissions (INSERT IF NOT EXISTS via ON CONFLICT)
INSERT INTO permissions (module, action, code, description, status, "createdAt", "updatedAt") VALUES
  ('INVOICE', 'READ', 'INVOICE:READ', 'Xem hóa đơn', 'ACTIVE', NOW(), NOW()),
  ('INVOICE', 'APPROVE', 'INVOICE:APPROVE', 'Phê duyệt hóa đơn', 'ACTIVE', NOW(), NOW()),
  ('INVOICE', 'UPDATE', 'INVOICE:UPDATE', 'Cập nhật hóa đơn', 'ACTIVE', NOW(), NOW()),
  ('PLAN', 'READ', 'PLAN:READ', 'Xem gói cước', 'ACTIVE', NOW(), NOW()),
  ('PLAN', 'CREATE', 'PLAN:CREATE', 'Tạo gói cước', 'ACTIVE', NOW(), NOW()),
  ('PLAN', 'UPDATE', 'PLAN:UPDATE', 'Sửa gói cước', 'ACTIVE', NOW(), NOW()),
  ('PLAN', 'DELETE', 'PLAN:DELETE', 'Xóa gói cước', 'ACTIVE', NOW(), NOW()),
  ('SUBSCRIPTION', 'READ', 'SUBSCRIPTION:READ', 'Xem hội viên', 'ACTIVE', NOW(), NOW()),
  ('SUBSCRIPTION', 'UPDATE', 'SUBSCRIPTION:UPDATE', 'Nâng cấp hội viên', 'ACTIVE', NOW(), NOW()),
  ('BLOG', 'DELETE', 'BLOG:DELETE', 'Xóa/ẩn bài viết', 'ACTIVE', NOW(), NOW()),
  ('BLOG', 'MANAGE', 'BLOG:MANAGE', 'Quản lý bài viết cấp dưới', 'ACTIVE', NOW(), NOW()),
  ('BLOG', 'LABEL_PRO', 'BLOG:LABEL_PRO', 'Gắn/bỏ nhãn Pro bài viết', 'ACTIVE', NOW(), NOW()),
  ('STOCK_DATA', 'READ', 'STOCK_DATA:READ', 'Xem dữ liệu chứng khoán', 'ACTIVE', NOW(), NOW()),
  ('STOCK_DATA', 'UPDATE', 'STOCK_DATA:UPDATE', 'Chỉnh sửa dữ liệu CK', 'ACTIVE', NOW(), NOW()),
  ('HANDBOOK', 'READ', 'HANDBOOK:READ', 'Xem hướng dẫn/tủ sách', 'ACTIVE', NOW(), NOW()),
  ('HANDBOOK', 'CREATE', 'HANDBOOK:CREATE', 'Tạo hướng dẫn', 'ACTIVE', NOW(), NOW()),
  ('HANDBOOK', 'UPDATE', 'HANDBOOK:UPDATE', 'Sửa hướng dẫn', 'ACTIVE', NOW(), NOW()),
  ('HANDBOOK', 'DELETE', 'HANDBOOK:DELETE', 'Xóa hướng dẫn', 'ACTIVE', NOW(), NOW()),
  ('REPORT', 'CREATE', 'REPORT:CREATE', 'Tạo báo cáo', 'ACTIVE', NOW(), NOW()),
  ('REPORT', 'UPDATE', 'REPORT:UPDATE', 'Sửa báo cáo', 'ACTIVE', NOW(), NOW()),
  ('REPORT', 'DELETE', 'REPORT:DELETE', 'Xóa báo cáo', 'ACTIVE', NOW(), NOW()),
  ('SALES', 'READ', 'SALES:READ', 'Xem doanh số/KH kinh doanh', 'ACTIVE', NOW(), NOW()),
  ('SALES', 'MANAGE', 'SALES:MANAGE', 'Quản lý đội ngũ kinh doanh', 'ACTIVE', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- STEP 5: Reassign ALL role_permissions per CEO matrix

-- CEO = ALL permissions
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'CEO');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'CEO'), id FROM permissions
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- DEVELOPER = ALL permissions
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'DEVELOPER');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'DEVELOPER'), id FROM permissions
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- SUPER_ADMIN = ALL permissions (legacy)
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'SUPER_ADMIN');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'SUPER_ADMIN'), id FROM permissions
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- EDITOR_ADMIN: Full editing + quản lý nhân sự editing + hướng dẫn/báo cáo/tủ sách + gắn nhãn Pro
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'EDITOR_ADMIN');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'EDITOR_ADMIN'), id FROM permissions
WHERE code IN (
  'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE', 'BLOG:DELETE', 'BLOG:MANAGE', 'BLOG:LABEL_PRO',
  'REPORT:READ', 'REPORT:CREATE', 'REPORT:UPDATE', 'REPORT:DELETE',
  'HANDBOOK:READ', 'HANDBOOK:CREATE', 'HANDBOOK:UPDATE', 'HANDBOOK:DELETE',
  'STOCK_DATA:READ', 'STOCK_DATA:UPDATE',
  'VIP_SIGNALS:READ',
  'USER:READ', 'USER:UPDATE',
  'ROLE:READ', 'ROLE:UPDATE'
) ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- EDITOR_PRO: Viết bài + edit bài mình + truy cập dữ liệu CK
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'EDITOR_PRO');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'EDITOR_PRO'), id FROM permissions
WHERE code IN (
  'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE',
  'STOCK_DATA:READ', 'STOCK_DATA:UPDATE',
  'VIP_SIGNALS:READ',
  'REPORT:READ'
) ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- EDITOR: Viết bài + edit bài chính mình
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'EDITOR');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'EDITOR'), id FROM permissions
WHERE code IN ('BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- ASSISTANT_CEO (Trợ lý CEO): Full kinh doanh, phê duyệt thanh toán, nâng cấp hội viên
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'ASSISTANT_CEO');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'ASSISTANT_CEO'), id FROM permissions
WHERE code IN (
  'INVOICE:READ', 'INVOICE:APPROVE', 'INVOICE:UPDATE',
  'PLAN:READ', 'PLAN:CREATE', 'PLAN:UPDATE', 'PLAN:DELETE',
  'SUBSCRIPTION:READ', 'SUBSCRIPTION:UPDATE',
  'SALES:READ', 'SALES:MANAGE',
  'USER:READ', 'USER:UPDATE',
  'ROLE:READ', 'ROLE:UPDATE',
  'VIP_SIGNALS:READ',
  'REPORT:READ'
) ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- SALE_ADMIN: Xem KH+doanh số team mình, cấp quyền user→Sales
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'SALE_ADMIN');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'SALE_ADMIN'), id FROM permissions
WHERE code IN ('SALES:READ', 'USER:READ', 'USER:UPDATE', 'VIP_SIGNALS:READ', 'REPORT:READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- SALE: Xem KH mình quản lý + doanh số
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'SALE');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'SALE'), id FROM permissions
WHERE code IN ('SALES:READ', 'USER:READ', 'VIP_SIGNALS:READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- EXPERT: Tín hiệu VIP + báo cáo
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'EXPERT');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'EXPERT'), id FROM permissions
WHERE code IN ('VIP_SIGNALS:CREATE', 'VIP_SIGNALS:READ', 'VIP_SIGNALS:UPDATE', 'REPORT:READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- CLIENT_VIP: Xem bài + báo cáo + tín hiệu VIP
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'CLIENT_VIP');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'CLIENT_VIP'), id FROM permissions
WHERE code IN ('BLOG:READ', 'REPORT:READ', 'VIP_SIGNALS:READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- CLIENT: Xem bài
DELETE FROM role_permissions WHERE "roleId" = (SELECT id FROM roles WHERE code = 'CLIENT');
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT (SELECT id FROM roles WHERE code = 'CLIENT'), id FROM permissions
WHERE code IN ('BLOG:READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
