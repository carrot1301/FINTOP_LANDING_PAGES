import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ROLE_CODE, RECORD_STATUS, SUBSCRIPTION_TIER } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:123@127.0.0.1:5432/fintop" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Role Permissions Seeder...');

  // 1. Get all roles
  const dbRoles = await prisma.role.findMany();
  const roleMap = new Map(dbRoles.map(r => [r.code, r.id]));

  // 2. Get all permissions
  const dbPerms = await prisma.permission.findMany();
  const permMap = new Map(dbPerms.map(p => [p.code, p.id]));

  // 3. Define permission codes mapped to role codes
  const rolePermissionsMap: Record<ROLE_CODE, string[]> = {
    SUPER_ADMIN: Array.from(permMap.keys()), // All permissions
    CEO: Array.from(permMap.keys()), // All permissions
    ASSISTANT_CEO: [
      'USER:READ', 'USER:UPDATE', 'ROLE:READ', 'VIP_SIGNALS:READ', 'BLOG:READ', 'REPORT:READ', 'SYSTEM:READ'
    ],
    EDITOR_ADMIN: [
      'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE', 'BLOG:DELETE', 'REPORT:READ', 'VIP_SIGNALS:READ'
    ],
    EDITOR_PRO: [
      'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE', 'BLOG:DELETE'
    ],
    EDITOR: [
      'BLOG:CREATE', 'BLOG:READ', 'BLOG:UPDATE', 'BLOG:DELETE'
    ],
    SALE_ADMIN: [
      'USER:READ', 'VIP_SIGNALS:READ', 'REPORT:READ'
    ],
    SALE: [
      'USER:READ', 'VIP_SIGNALS:READ'
    ],
    EXPERT: [
      'VIP_SIGNALS:CREATE', 'VIP_SIGNALS:READ', 'VIP_SIGNALS:UPDATE', 'REPORT:READ'
    ],
    CLIENT_VIP: [
      'VIP_SIGNALS:READ', 'REPORT:READ', 'BLOG:READ'
    ],
    CLIENT: [
      'BLOG:READ'
    ]
  };

  // 4. Assign permissions to roles in transaction
  await prisma.$transaction(async (tx) => {
    // Clean up existing role permissions
    await tx.rolePermission.deleteMany({});

    for (const [roleCode, permCodes] of Object.entries(rolePermissionsMap)) {
      const roleId = roleMap.get(roleCode as ROLE_CODE);
      if (!roleId) {
        console.warn(`Role ${roleCode} not found in database.`);
        continue;
      }

      for (const permCode of permCodes) {
        const permId = permMap.get(permCode);
        if (!permId) {
          console.warn(`Permission ${permCode} not found in database.`);
          continue;
        }

        await tx.rolePermission.create({
          data: {
            roleId,
            permissionId: permId
          }
        });
      }
    }
  });
  console.log('✅ Role permissions mapped successfully.');

  // 5. Seed Mock Staff Users
  const passwordHash = await bcrypt.hash('FinTop@2026', 10);

  // Departments
  const execDept = await prisma.department.findUnique({ where: { code: 'EXEC' } });
  const editorialDept = await prisma.department.findUnique({ where: { code: 'EDITORIAL' } });
  const salesDept = await prisma.department.findUnique({ where: { code: 'SALES' } });

  const staffData = [
    { email: 'ceo@fintop.vn', fullName: 'Nguyễn Thế Anh', role: ROLE_CODE.CEO, deptId: execDept?.id },
    { email: 'assistant@fintop.vn', fullName: 'Trần Minh Hằng', role: ROLE_CODE.ASSISTANT_CEO, deptId: execDept?.id },
    { email: 'editor.admin@fintop.vn', fullName: 'Phạm Thanh Sơn', role: ROLE_CODE.EDITOR_ADMIN, deptId: editorialDept?.id },
    { email: 'editor.pro@fintop.vn', fullName: 'Lê Thu Trang', role: ROLE_CODE.EDITOR_PRO, deptId: editorialDept?.id },
    { email: 'editor@fintop.vn', fullName: 'Vũ Quốc Việt', role: ROLE_CODE.EDITOR, deptId: editorialDept?.id },
    { email: 'sale.admin@fintop.vn', fullName: 'Đỗ Gia Bảo', role: ROLE_CODE.SALE_ADMIN, deptId: salesDept?.id },
    { email: 'sale@fintop.vn', fullName: 'Hoàng Lan Anh', role: ROLE_CODE.SALE, deptId: salesDept?.id },
    { email: 'expert@fintop.vn', fullName: 'Vũ Việt Đức', role: ROLE_CODE.EXPERT, deptId: editorialDept?.id },
  ];

  console.log('👤 Seeding mock staff users...');
  for (const sd of staffData) {
    const user = await prisma.user.upsert({
      where: { email: sd.email },
      update: {
        fullName: sd.fullName,
        departmentId: sd.deptId,
        emailVerifiedAt: new Date()
      },
      create: {
        email: sd.email,
        passwordHash,
        fullName: sd.fullName,
        departmentId: sd.deptId,
        tierLevel: SUBSCRIPTION_TIER.STANDARD,
        status: RECORD_STATUS.ACTIVE,
        emailVerifiedAt: new Date()
      }
    });

    const roleId = roleMap.get(sd.role);
    if (roleId) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId
          }
        },
        update: {},
        create: {
          userId: user.id,
          roleId
        }
      });
    }
  }

  console.log('✅ Seeding role permissions and staff users complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeder Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
