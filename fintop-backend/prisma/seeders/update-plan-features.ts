import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = "postgresql://postgres:123@127.0.0.1:5432/fintop";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const planDefs = [
    {
      name: 'STANDARD',
      description: 'Gói cơ bản - Truy cập tra cứu cổ phiếu và dữ liệu nền',
      features: 'Tra cứu cổ phiếu;Phân tích cơ bản;FinTop AI phân tích;Tool & dữ liệu cơ bản',
    },
    {
      name: 'SILVER',
      description: 'Gói PRO - Bộ lọc chuyên nghiệp, PRO Data & Research',
      features: 'Bộ lọc cổ phiếu chuyên nghiệp;Nghiên cứu & phân tích chuyên sâu;Tool & dữ liệu nâng cao;PRO Data và PRO Analysis',
    },
    {
      name: 'GOLD',
      description: 'Gói V.I.P - Full PRO + Copy Trade + Kết nối Chuyên gia',
      features: 'Full đặc quyền PRO;Kết nối chuyên gia;Phân tích chuyên gia;Liên kết tài khoản chứng khoán',
    },
    {
      name: 'DIAMOND',
      description: 'Gói Kim Cương - Full V.I.P + Cố vấn 1-1 Chuyên gia',
      features: 'Full đặc quyền PRO;Full đặc quyền V.I.P;Cố vấn 1-1 chuyên gia;Hỗ trợ chiến lược danh mục',
    },
  ];

  console.log('Updating plan features in database using 127.0.0.1...');
  for (const pd of planDefs) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: pd.name },
    });
    if (existing) {
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: {
          features: pd.features,
          description: pd.description,
        },
      });
      console.log(`✅ Updated features for ${pd.name}`);
    } else {
      console.log(`❌ Plan ${pd.name} not found`);
    }
  }
  console.log('Update finished successfully.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
