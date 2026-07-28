const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const connectionString = "postgresql://postgres:123@localhost:5432/fintop";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.subscriptionPlan.updateMany({
    where: { id: { in: [3, 4] } },
    data: { deletedAt: null, status: 'ACTIVE' }
  });
  const plans = await prisma.subscriptionPlan.findMany();
  console.log('Subscription plans in DB after restore:');
  plans.forEach(p => {
    console.log(`- ID: ${p.id}, Name: ${p.name}, Tier: ${p.tierLevel}, Status: ${p.status}, DeletedAt: ${p.deletedAt}`);
  });
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
