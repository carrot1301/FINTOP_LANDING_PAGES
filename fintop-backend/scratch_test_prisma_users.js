require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'huongdn2008@gmail.com',
          'phuonganh2559@gmail.com',
          'ptu186204@gmail.com',
          'xolano8558@gmail.com',
          'thanhcaht38@gmail.com',
          'maitiendung210899@gmail.com'
        ]
      }
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      brokerId: true,
      broker: {
        select: {
          id: true,
          fullName: true,
          staffCode: true,
          department: { select: { code: true } },
          team: { select: { code: true } },
        }
      }
    }
  });

  console.log('Prisma output for these 6 users:');
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
