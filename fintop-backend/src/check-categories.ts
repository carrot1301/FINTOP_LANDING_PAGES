import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- USER CHECK: admin@fintop.vn ---');
  const user = await prisma.user.findUnique({
    where: { email: 'admin@fintop.vn' },
    include: {
      userRoles: {
        include: {
          role: true
        }
      },
      subscriptions: {
        include: {
          plan: true
        }
      }
    }
  });
  console.log(JSON.stringify(user, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2
  ));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
