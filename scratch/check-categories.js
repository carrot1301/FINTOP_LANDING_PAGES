const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- CATEGORIES ---');
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { blogs: true }
      }
    }
  });
  console.log(JSON.stringify(categories, null, 2));

  console.log('\n--- RECENT BLOGS ---');
  const blogs = await prisma.blog.findMany({
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      category: {
        select: {
          slug: true,
          name: true
        }
      }
    }
  });
  console.log(JSON.stringify(blogs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
