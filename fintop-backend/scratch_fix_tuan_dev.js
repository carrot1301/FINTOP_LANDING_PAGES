require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔧 Setting up Developer role for tuannv7105@gmail.com (BW9B)...');

  const devRole = await prisma.role.findFirst({ where: { code: 'DEVELOPER' } });
  if (!devRole) {
    console.error('❌ Role DEVELOPER not found in database!');
    process.exit(1);
  }

  // Find all accounts associated with tuannv7105@gmail.com
  const users = await prisma.user.findMany({
    where: { email: 'tuannv7105@gmail.com' },
  });

  console.log(`Found ${users.length} accounts for tuannv7105@gmail.com`);

  for (const user of users) {
    // 1. Remove all existing roles
    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    // 2. Assign DEVELOPER role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: devRole.id,
        assignedById: user.id,
      },
    });

    // 3. Update position and staffCode
    await prisma.user.update({
      where: { id: user.id },
      data: {
        staffCode: 'BW9B',
        position: 'Developer / Kỹ sư Phát triển',
        tierLevel: 'DIAMOND',
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Configured Account #${user.id} (${user.email}) as DEVELOPER (BW9B)`);
  }

  console.log('🎉 Done configuring Developer account!');
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
