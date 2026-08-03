const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const connectionString = "postgresql://postgres:123@localhost:5432/fintop";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('🧹 Starting subscription plan cleanup...\n');

  // Step 1: Migrate subscriptions from old plans to new plans
  // ID 102 (old Silver 1.5M) → ID 16 (PRO1)
  // ID 103 (old Gold 3.5M) → ID 3 (GOLD)
  // ID 104 (old Diamond 9.5M) → ID 4 (DIAMOND)
  // ID 15 (Gold Monthly) → ID 3 (GOLD)

  const migrations = [
    { from: 102, to: 16, label: 'Gói Hội viên Bạc → PRO1' },
    { from: 103, to: 3, label: 'Gói Hội viên Vàng → GOLD' },
    { from: 104, to: 4, label: 'Gói Hội viên Kim Cương → DIAMOND' },
    { from: 15, to: 3, label: 'Gold Monthly → GOLD' },
  ];

  for (const m of migrations) {
    const count = await prisma.userSubscription.updateMany({
      where: { planId: m.from },
      data: { planId: m.to },
    });
    console.log(`  ✅ Migrated ${count.count} subscriptions: ${m.label} (${m.from} → ${m.to})`);
  }

  // Step 2: Delete old/unused plans
  const deleteIds = [2, 8, 15, 102, 103, 104];
  for (const id of deleteIds) {
    try {
      await prisma.subscriptionPlan.delete({ where: { id } });
      console.log(`  🗑️ Deleted plan ID ${id}`);
    } catch (e) {
      console.log(`  ⚠️ Could not delete plan ID ${id}: ${e.message}`);
    }
  }

  // Step 3: Update remaining plans with correct names/descriptions matching the UI
  // STANDARD (ID 1)
  await prisma.subscriptionPlan.update({
    where: { id: 1 },
    data: {
      name: 'Standard',
      description: 'Gói Standard - Truy cập tra cứu cổ phiếu và dữ liệu nền',
      features: 'Tra cứu cổ phiếu;Phân tích cơ bản;Tool & dữ liệu cơ bản',
    },
  });
  console.log('  ✏️ Updated ID 1: Standard (STANDARD)');

  // PRO1 (ID 16)
  await prisma.subscriptionPlan.update({
    where: { id: 16 },
    data: {
      name: 'PRO1',
      description: 'Gói PRO 3 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research',
      features: 'Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data',
      price: 2500000,
      durationDays: 90,
    },
  });
  console.log('  ✏️ Updated ID 16: PRO1 (3 tháng, 2.500.000đ)');

  // PRO2 (ID 17)
  await prisma.subscriptionPlan.update({
    where: { id: 17 },
    data: {
      name: 'PRO2',
      description: 'Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research',
      features: 'Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data',
      price: 4500000,
      durationDays: 180,
    },
  });
  console.log('  ✏️ Updated ID 17: PRO2 (6 tháng, 4.500.000đ)');

  // PRO3 (ID 18)
  await prisma.subscriptionPlan.update({
    where: { id: 18 },
    data: {
      name: 'PRO3',
      description: 'Gói PRO 12 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research',
      features: 'Bộ lọc cổ phiếu chuyên nghiệp;Pro Research;Pro Data',
      price: 6800000,
      durationDays: 365,
    },
  });
  console.log('  ✏️ Updated ID 18: PRO3 (12 tháng, 6.800.000đ)');

  // GOLD / V.I.P (ID 3)
  await prisma.subscriptionPlan.update({
    where: { id: 3 },
    data: {
      name: 'V.I.P',
      description: 'Gói V.I.P - Full PRO + Copy Trade + Kết nối Chuyên gia',
      features: 'Đặc quyền PRO;Kết nối Chuyên gia;Phân tích Chuyên gia',
      price: 5000000,
      durationDays: 180,
    },
  });
  console.log('  ✏️ Updated ID 3: V.I.P (GOLD)');

  // DIAMOND (ID 4)
  await prisma.subscriptionPlan.update({
    where: { id: 4 },
    data: {
      name: 'Diamond',
      description: 'Gói Diamond - Full V.I.P + Cố vấn 1-1 Chuyên gia',
      features: 'Đặc quyền V.I.P;Đặc quyền PRO;Cố vấn 1-1 Chuyên gia',
      price: 15000000,
      durationDays: 365,
    },
  });
  console.log('  ✏️ Updated ID 4: Diamond (DIAMOND)');

  // Step 4: Verify final result
  console.log('\n=== FINAL SUBSCRIPTION PLANS ===');
  const finalPlans = await prisma.subscriptionPlan.findMany({ orderBy: { id: 'asc' } });
  finalPlans.forEach(p => {
    console.log(`  ID: ${p.id} | ${p.name} | ${p.tierLevel} | ${p.price.toString()}đ | ${p.durationDays} ngày | ${p.status}`);
  });

  console.log(`\n🎉 Cleanup complete! ${finalPlans.length} plans remaining.`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
