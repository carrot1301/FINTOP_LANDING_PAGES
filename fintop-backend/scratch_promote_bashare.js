require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('👑 [Promote CEO] Setting fintop.bashare@gmail.com as CEO & SUPER_ADMIN...');

  const user = await prisma.user.findFirst({
    where: { email: 'fintop.bashare@gmail.com' },
  });

  if (!user) {
    console.error('❌ Account fintop.bashare@gmail.com not found!');
    process.exit(1);
  }

  // 1. Get CEO & SUPER_ADMIN roles
  const ceoRole = await prisma.role.findFirst({ where: { code: 'CEO' } });
  const superAdminRole = await prisma.role.findFirst({ where: { code: 'SUPER_ADMIN' } });

  if (!ceoRole || !superAdminRole) {
    console.error('❌ Roles CEO or SUPER_ADMIN not found!');
    process.exit(1);
  }

  // 2. Remove existing roles for this user
  await prisma.userRole.deleteMany({
    where: { userId: user.id },
  });

  // 3. Assign CEO and SUPER_ADMIN roles
  await prisma.userRole.createMany({
    data: [
      { userId: user.id, roleId: ceoRole.id, assignedById: user.id },
      { userId: user.id, roleId: superAdminRole.id, assignedById: user.id },
    ],
  });

  // 4. Update User details: tier DIAMOND, status ACTIVE, position CEO
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      tierLevel: 'DIAMOND',
      status: 'ACTIVE',
      company: 'FinTop DATA',
      position: 'Tổng Giám Đốc (CEO)',
      emailVerifiedAt: user.emailVerifiedAt || new Date(),
    },
  });

  console.log('✅ Successfully promoted account to CEO & SUPER_ADMIN with DIAMOND tier!');
  console.log({
    id: updated.id,
    email: updated.email,
    fullName: updated.fullName,
    position: updated.position,
    tierLevel: updated.tierLevel,
    status: updated.status,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
