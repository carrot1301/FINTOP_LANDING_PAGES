import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  ROLE_CODE,
  RECORD_STATUS,
  SUBSCRIPTION_TIER,
  PERMISSION_ACTION,
  PERMISSION_MODULE,
  AUDIT_SOURCE
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu chạy Foundation Seeder (Wave 1)...');

  // 1. Seed Departments
  console.log('🏢 Seeding Departments...');
  const execDept = await prisma.department.upsert({
    where: { code: 'EXEC' },
    update: {},
    create: {
      name: 'Ban Điều Hành (Executive)',
      code: 'EXEC',
      description: 'Ban điều hành cấp cao',
      status: RECORD_STATUS.ACTIVE,
    },
  });

  const saleDept = await prisma.department.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      name: 'Khối Kinh doanh & Môi giới',
      code: 'SALES',
      description: 'Khối tư vấn và chăm sóc khách hàng',
      status: RECORD_STATUS.ACTIVE,
    },
  });

  const editDept = await prisma.department.upsert({
    where: { code: 'EDITORIAL' },
    update: {},
    create: {
      name: 'Khối Biên tập & Phân tích',
      code: 'EDITORIAL',
      description: 'Khối sản xuất nội dung và tín hiệu',
      status: RECORD_STATUS.ACTIVE,
    },
  });

  // 2. Seed Teams
  console.log('👥 Seeding Teams...');
  const alphaTeam = await prisma.team.upsert({
    where: { code: 'SALE_ALPHA' },
    update: {},
    create: {
      name: 'Team Kinh doanh Alpha',
      code: 'SALE_ALPHA',
      departmentId: saleDept.id,
      description: 'Team khách hàng VIP',
      status: RECORD_STATUS.ACTIVE,
    },
  });

  const betaTeam = await prisma.team.upsert({
    where: { code: 'SALE_BETA' },
    update: {},
    create: {
      name: 'Team Kinh doanh Beta',
      code: 'SALE_BETA',
      departmentId: saleDept.id,
      description: 'Team khách hàng đại chúng',
      status: RECORD_STATUS.ACTIVE,
    },
  });

  // 3. Seed Roles
  console.log('🔑 Seeding Roles...');
  const rolesData = [
    { code: ROLE_CODE.SUPER_ADMIN, name: 'Quản trị viên Cấp cao (Super Admin)', isSystem: true },
    { code: ROLE_CODE.CEO, name: 'Tổng Giám Đốc (CEO)', isSystem: true },
    { code: ROLE_CODE.ASSISTANT_CEO, name: 'Trợ lý CEO', isSystem: false },
    { code: ROLE_CODE.EDITOR_ADMIN, name: 'Trưởng phòng Biên tập', isSystem: false },
    { code: ROLE_CODE.EDITOR_PRO, name: 'Biên tập viên Chuyên nghiệp', isSystem: false },
    { code: ROLE_CODE.EDITOR, name: 'Biên tập viên', isSystem: false },
    { code: ROLE_CODE.SALE_ADMIN, name: 'Trưởng khối Môi giới', isSystem: false },
    { code: ROLE_CODE.SALE, name: 'Chuyên viên Môi giới', isSystem: false },
    { code: ROLE_CODE.EXPERT, name: 'Chuyên gia Cố vấn', isSystem: false },
    { code: ROLE_CODE.CLIENT_VIP, name: 'Khách hàng VIP', isSystem: false },
    { code: ROLE_CODE.CLIENT, name: 'Khách hàng Tiêu chuẩn', isSystem: false },
  ];

  const roleMap: Record<string, any> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: {
        code: r.code,
        name: r.name,
        isSystem: r.isSystem,
        status: RECORD_STATUS.ACTIVE,
      },
    });
    roleMap[r.code] = role;
  }

  // 4. Seed Permissions
  console.log('🛡️ Seeding Permissions...');
  const permissionsData = [
    { module: PERMISSION_MODULE.AUTH, action: PERMISSION_ACTION.CREATE, code: 'AUTH:CREATE', description: 'Tạo tài khoản' },
    { module: PERMISSION_MODULE.USER, action: PERMISSION_ACTION.READ, code: 'USER:READ', description: 'Xem danh sách người dùng' },
    { module: PERMISSION_MODULE.USER, action: PERMISSION_ACTION.UPDATE, code: 'USER:UPDATE', description: 'Sửa thông tin người dùng' },
    { module: PERMISSION_MODULE.USER, action: PERMISSION_ACTION.DELETE, code: 'USER:DELETE', description: 'Khóa/Xóa người dùng' },
    { module: PERMISSION_MODULE.ROLE, action: PERMISSION_ACTION.READ, code: 'ROLE:READ', description: 'Xem vai trò phân quyền' },
    { module: PERMISSION_MODULE.ROLE, action: PERMISSION_ACTION.UPDATE, code: 'ROLE:UPDATE', description: 'Cấp/Đổi quyền vai trò' },
    { module: PERMISSION_MODULE.SYSTEM, action: PERMISSION_ACTION.READ, code: 'SYSTEM:READ', description: 'Xem nhật ký hệ thống' },
    { module: PERMISSION_MODULE.VIP_SIGNALS, action: PERMISSION_ACTION.CREATE, code: 'VIP_SIGNALS:CREATE', description: 'Tạo tín hiệu VIP' },
    { module: PERMISSION_MODULE.VIP_SIGNALS, action: PERMISSION_ACTION.READ, code: 'VIP_SIGNALS:READ', description: 'Xem tín hiệu VIP' },
    { module: PERMISSION_MODULE.VIP_SIGNALS, action: PERMISSION_ACTION.UPDATE, code: 'VIP_SIGNALS:UPDATE', description: 'Cập nhật tín hiệu VIP' },
    { module: PERMISSION_MODULE.BLOG, action: PERMISSION_ACTION.CREATE, code: 'BLOG:CREATE', description: 'Tạo bài viết CMS' },
    { module: PERMISSION_MODULE.BLOG, action: PERMISSION_ACTION.READ, code: 'BLOG:READ', description: 'Xem bài viết CMS' },
    { module: PERMISSION_MODULE.BLOG, action: PERMISSION_ACTION.UPDATE, code: 'BLOG:UPDATE', description: 'Cập nhật bài viết CMS' },
    { module: PERMISSION_MODULE.REPORT, action: PERMISSION_ACTION.READ, code: 'REPORT:READ', description: 'Xem báo cáo chiến lược' },
  ];

  const permIds: number[] = [];
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: {
        module: p.module,
        action: p.action,
        code: p.code,
        description: p.description,
        status: RECORD_STATUS.ACTIVE,
      },
    });
    permIds.push(perm.id);
  }

  // 5. Assign Permissions to Super Admin Role
  console.log('🔗 Assigning Permissions to Super Admin Role...');
  const superAdminRole = roleMap[ROLE_CODE.SUPER_ADMIN];
  for (const permId of permIds) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permId,
      },
    });
  }

  // 6. Seed Super Admin Account
  console.log('👑 Seeding Super Admin Account...');
  const adminEmail = 'admin@fintop.vn';
  const passwordHash = await bcrypt.hash('FinTop@2026', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
      fullName: 'Hệ thống Quản trị viên (Super Admin)',
      phone: '0999999999',
      departmentId: execDept.id,
      tierLevel: SUBSCRIPTION_TIER.DIAMOND,
      status: RECORD_STATUS.ACTIVE,
    },
  });

  // Assign Super Admin Role to Super Admin User
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
      assignedById: superAdminUser.id,
    },
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      userId: superAdminUser.id,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'SYSTEM_SEED',
      tableName: 'users',
      recordId: superAdminUser.id.toString(),
      newValues: { email: adminEmail, note: 'Foundation seeder executed' },
      ipAddress: '127.0.0.1',
      userAgent: 'CLI Seeder',
    },
  });

  console.log('✅ Chạy Foundation Seeder thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
