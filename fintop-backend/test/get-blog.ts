process.env.DATABASE_URL = "postgresql://postgres:123@localhost:5432/fintop";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const blog = await prisma.blog.findFirst({
    where: {
      title: {
        contains: 'NGÂN HÀNG'
      }
    },
    include: {
      category: true
    }
  });

  if (!blog) {
    console.log('No blog found with title containing "NGÂN HÀNG"');
    const blogs = await prisma.blog.findMany({ take: 5 });
    console.log('Available blogs:', blogs.map(b => b.title));
    return;
  }

  console.log('Title:', blog.title);
  console.log('Slug:', blog.slug);
  console.log('Category:', blog.category.name);
  console.log('--- Content (first 2500 chars) ---');
  console.log(blog.content.substring(0, 2500));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
