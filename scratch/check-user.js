const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@fintop.vn' }
  });
  console.log('User admin@fintop.vn info:', {
    id: user.id,
    email: user.email,
    paymentProofUrl: user.paymentProofUrl,
    tierLevel: user.tierLevel
  });
  
  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('User invoices:', invoices.map(i => ({
    id: i.id.toString(),
    status: i.status,
    amount: i.amount.toString(),
    createdAt: i.createdAt
  })));
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
