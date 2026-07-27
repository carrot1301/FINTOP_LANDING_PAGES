const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  console.log('All notifications for user:', JSON.stringify(notifications, null, 2));

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, status: 'UNREAD' }
  });
  console.log('Unread count:', unreadCount);
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
