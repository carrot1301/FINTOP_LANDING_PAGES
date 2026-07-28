const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const connectionString = "postgresql://postgres:123@localhost:5432/fintop";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.invoice.update({
    where: { id: 24 },
    data: { planId: 3, amount: 0 }
  });
  await prisma.invoice.update({
    where: { id: 25 },
    data: { planId: 3, amount: 0 }
  });
  await prisma.invoice.update({
    where: { id: 26 },
    data: { planId: 4, amount: 0 }
  });

  const invoices = await prisma.invoice.findMany({
    include: {
      user: true,
      plan: true,
      subscription: { include: { plan: true } }
    }
  });
  console.log('Invoices in DB after updating planId:');
  invoices.forEach(inv => {
    console.log(`- ID: ${inv.id}, User: ${inv.user?.fullName} (${inv.userId}), PlanId: ${inv.planId} (${inv.plan?.name} - ${inv.plan?.tierLevel}), Amount: ${inv.amount}, Status: ${inv.status}, StockAcc: ${inv.user?.stockAccount}`);
  });
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
