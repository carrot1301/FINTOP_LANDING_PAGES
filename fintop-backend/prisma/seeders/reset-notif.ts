import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, NOTIFICATION_STATUS } from '@prisma/client';

if (process.env.NODE_ENV === 'production') {
  console.error('BLOCKED: Cannot run in production');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.notification.updateMany({
    where: {
      title: { startsWith: '[QA]' }
    },
    data: { status: NOTIFICATION_STATUS.UNREAD },
  });
  console.log(`Reset ${result.count} [QA] notifications to UNREAD`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
