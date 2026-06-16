import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, INVOICE_STATUS } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting pending invoices seeder...');

  // 1. Get or create some mock users to assign invoices to
  const mockUsers = [
    { email: 'user_silver@fintop.vn', fullName: 'Nguyễn Văn Bạc', tierLevel: 'STANDARD' as const },
    { email: 'user_gold@fintop.vn', fullName: 'Trần Thị Vàng', tierLevel: 'STANDARD' as const },
    { email: 'user_diamond@fintop.vn', fullName: 'Phạm Minh Kim Cương', tierLevel: 'STANDARD' as const },
  ];

  const dbUsers: any[] = [];
  for (const mu of mockUsers) {
    const user = await prisma.user.upsert({
      where: { email: mu.email },
      update: {},
      create: {
        email: mu.email,
        fullName: mu.fullName,
        passwordHash: '$2b$10$xyz', // Dummy
        tierLevel: mu.tierLevel,
        status: 'ACTIVE',
      },
    });
    dbUsers.push(user);
    console.log(`👤 User processed: ${user.fullName} (${user.email})`);
  }

  // 2. Clear old pending test invoices to avoid duplication
  await prisma.invoice.deleteMany({
    where: {
      userId: { in: dbUsers.map(u => u.id) },
    },
  });
  console.log('🗑️ Cleared previous pending test invoices.');

  // 3. Create active subscription plans if they don't exist
  const silverPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 102 }, // arbitrary id
    update: { status: 'ACTIVE' },
    create: {
      id: 102,
      name: 'Gói Hội viên Bạc (Silver)',
      tierLevel: 'SILVER',
      price: 1500000,
      currency: 'VND',
      durationDays: 30,
      status: 'ACTIVE',
    },
  });

  const goldPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 103 },
    update: { status: 'ACTIVE' },
    create: {
      id: 103,
      name: 'Gói Hội viên Vàng (Gold)',
      tierLevel: 'GOLD',
      price: 3500000,
      currency: 'VND',
      durationDays: 90,
      status: 'ACTIVE',
    },
  });

  const diamondPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 104 },
    update: { status: 'ACTIVE' },
    create: {
      id: 104,
      name: 'Gói Hội viên Kim Cương (Diamond)',
      tierLevel: 'DIAMOND',
      price: 9500000,
      currency: 'VND',
      durationDays: 365,
      status: 'ACTIVE',
    },
  });

  console.log('📋 Mapped subscription plans (Silver, Gold, Diamond).');

  // 4. Create pending (OPEN) invoices
  const invoicesData = [
    {
      userId: dbUsers[0].id,
      amount: 1500000,
      status: INVOICE_STATUS.OPEN,
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 days from now
    },
    {
      userId: dbUsers[1].id,
      amount: 3500000,
      status: INVOICE_STATUS.OPEN,
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
    },
    {
      userId: dbUsers[2].id,
      amount: 9500000,
      status: INVOICE_STATUS.OPEN,
      dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
    },
  ];

  for (const inv of invoicesData) {
    const created = await prisma.invoice.create({
      data: {
        userId: inv.userId,
        amount: inv.amount,
        status: inv.status,
        dueDate: inv.dueDate,
      },
    });
    console.log(`📄 Created pending invoice #${created.id} - Amount: ${created.amount}đ`);
  }

  console.log('🎉 Pending invoices seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
