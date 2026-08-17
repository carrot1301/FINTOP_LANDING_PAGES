require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️ [Remove EXPERT Role] Cleaning up EXPERT role from database...');

  const expertRole = await prisma.role.findFirst({ where: { code: 'EXPERT' } });
  if (expertRole) {
    const deletedUserRoles = await prisma.userRole.deleteMany({
      where: { roleId: expertRole.id },
    });
    console.log(`Deleted ${deletedUserRoles.count} userRole assignments for EXPERT.`);

    await prisma.role.update({
      where: { id: expertRole.id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
    console.log(`✅ Marked EXPERT role as deleted and INACTIVE.`);
  } else {
    console.log('ℹ️ No EXPERT role found in database.');
  }
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
