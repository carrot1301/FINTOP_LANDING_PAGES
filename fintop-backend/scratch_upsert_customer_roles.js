require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Upserting customer roles in database...');

  const rolesToUpsert = [
    { code: 'CLIENT', name: 'Khách hàng Standard', description: 'Khách hàng đăng ký tài khoản Standard / Tiêu chuẩn' },
    { code: 'CLIENT_PRO', name: 'Khách hàng PRO', description: 'Khách hàng nâng cấp gói hội viên PRO' },
    { code: 'CLIENT_VIP', name: 'Khách hàng VIP', description: 'Khách hàng nâng cấp gói hội viên VIP' },
    { code: 'CLIENT_DIAMOND', name: 'Khách hàng Diamond', description: 'Khách hàng đặc quyền Diamond cao nhất' },
  ];

  for (const r of rolesToUpsert) {
    const existing = await prisma.role.findFirst({ where: { code: r.code } });
    if (existing) {
      await prisma.role.update({
        where: { id: existing.id },
        data: { name: r.name, description: r.description, status: 'ACTIVE' },
      });
      console.log(`Updated role: ${r.code} -> ${r.name}`);
    } else {
      await prisma.role.create({
        data: {
          code: r.code,
          name: r.name,
          description: r.description,
          isSystem: true,
          status: 'ACTIVE',
        },
      });
      console.log(`Created role: ${r.code} -> ${r.name}`);
    }
  }

  console.log('✅ All 4 customer roles upserted successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
