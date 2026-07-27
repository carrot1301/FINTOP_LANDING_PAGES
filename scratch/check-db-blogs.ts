import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Querying all blogs from database directly...');
  const blogs = await prisma.blog.findMany({
    include: { category: true }
  });
  console.log(`📊 Total blogs in database: ${blogs.length}`);
  blogs.forEach((b, i) => {
    console.log(`${i+1}. ID: ${b.id} | Slug: ${b.slug} | Status: ${b.status} | DeletedAt: ${b.deletedAt} | Category: ${b.category?.slug}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
