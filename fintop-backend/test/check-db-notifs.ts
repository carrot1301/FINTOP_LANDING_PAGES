import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@fintop.vn' }
  });
  if (!user) {
    console.log('User admin@fintop.vn not found!');
    return;
  }
  console.log('User ID:', user.id);
  
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id }
  });
  const mapped = notifications.map(n => ({
    ...n,
    id: n.id.toString()
  }));
  console.log('All notifications for user:', JSON.stringify(mapped, null, 2));

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, status: 'UNREAD' }
  });
  console.log('Unread count:', unreadCount);
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
