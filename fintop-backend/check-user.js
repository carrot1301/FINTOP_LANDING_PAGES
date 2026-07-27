const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const connectionString = "postgresql://postgres:123@localhost:5432/fintop";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const plans = await prisma.subscriptionPlan.findMany();
  console.log('Subscription plans in DB:');
  plans.forEach(p => {
    console.log(`- ID: ${p.id}, Name: ${p.name}, Tier: ${p.tierLevel}, Price: ${p.price.toString()} VND, Duration: ${p.durationDays} days`);
  });
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
