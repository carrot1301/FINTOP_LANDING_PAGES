const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const connectionString = "postgresql://postgres:123@localhost:5432/fintop";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Delete all test invoices (0đ DRAFT linking requests) to clean up
  // Keep only real invoices
  const deleted = await prisma.invoice.deleteMany({
    where: {
      amount: 0,
      status: 'DRAFT',
    }
  });
  console.log(`Deleted ${deleted.count} test 0đ DRAFT invoices.`);

  // List remaining invoices
  const invoices = await prisma.invoice.findMany({
    include: {
      user: true,
      plan: true,
    },
    orderBy: { id: 'asc' }
  });
  console.log('\n=== Remaining invoices ===');
  invoices.forEach(inv => {
    console.log(`- ID: ${inv.id}, User: ${inv.user?.fullName} (${inv.userId}), PlanId: ${inv.planId} (${inv.plan?.name} - ${inv.plan?.tierLevel}), Amount: ${inv.amount}, Status: ${inv.status}`);
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
