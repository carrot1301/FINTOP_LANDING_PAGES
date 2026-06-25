import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  ROLE_CODE,
  RECORD_STATUS,
  SUBSCRIPTION_TIER,
  BLOG_STATUS,
  CONTENT_VISIBILITY,
  RISK_TASTE,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // separate accent marks
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
}

async function main() {
  console.log('🌱 Bắt đầu import dữ liệu từ Web cũ (Blogs & Clients)...');

  // Paths to scraped data files
  const dataDir = path.join(__dirname, '..', '..', '..', 'data', 'extracted');
  const blogsPath = path.join(dataDir, 'parsed_blogs.json');
  const clientsPath = path.join(dataDir, 'parsed_clients.json');

  // Find default Super Admin user to assign as author of blogs
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'admin@fintop.vn' },
  });
  if (!superAdmin) {
    console.error('  ❌ Không tìm thấy tài khoản admin@fintop.vn. Hãy chạy wave1.seeder.ts trước!');
    process.exit(1);
  }
  const authorId = superAdmin.id;

  // Retrieve client role
  const clientRole = await prisma.role.findUnique({
    where: { code: ROLE_CODE.CLIENT },
  });
  const clientVipRole = await prisma.role.findUnique({
    where: { code: ROLE_CODE.CLIENT_VIP },
  });

  if (!clientRole || !clientVipRole) {
    console.error('  ❌ Không tìm thấy role CLIENT hoặc CLIENT_VIP!');
    process.exit(1);
  }

  // ==========================================
  // 1. IMPORT CLIENTS (USERS)
  // ==========================================
  if (fs.existsSync(clientsPath)) {
    console.log('\n👥 Importing Clients...');
    const clients = JSON.parse(fs.readFileSync(clientsPath, 'utf-8'));
    console.log(`  Parsed ${clients.length} clients from parsed_clients.json`);

    const defaultPasswordHash = await bcrypt.hash('FinTop@2026', 10);
    const processedEmails = new Set<string>();
    const processedPhones = new Set<string>();

    let importCount = 0;
    for (const client of clients) {
      let email = client.email ? client.email.trim().toLowerCase() : '';
      if (!email || !email.includes('@')) {
        // Generate pseudo email if missing to satisfy unique constraint
        const cleanName = slugify(client.name || 'khachhang');
        email = `${cleanName || 'client'}_${Date.now()}_${Math.floor(Math.random() * 1000)}@fintopdata.old`;
      }

      if (processedEmails.has(email)) {
        console.log(`    ⚠️ Trùng email, bỏ qua: ${email}`);
        continue;
      }
      processedEmails.add(email);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        console.log(`    ℹ️ Email đã tồn tại, bỏ qua: ${email}`);
        continue;
      }

      // Sanitize phone
      let phone = client.phone ? client.phone.trim().replace(/\s+/g, '') : null;
      if (phone) {
        // Remove spaces, dashes, parentheses
        phone = phone.replace(/[^0-9+]/g, '');
        if (processedPhones.has(phone)) {
          // If phone duplicate, set to null to avoid constraint violation
          phone = null;
        } else {
          processedPhones.add(phone);
        }
      }

      // Map tierLevel
      let tierLevel: SUBSCRIPTION_TIER = SUBSCRIPTION_TIER.STANDARD;
      const accType = client.accountType || '';
      if (accType.includes('VIP2') || accType.includes('GOLD')) {
        tierLevel = SUBSCRIPTION_TIER.GOLD;
      } else if (accType.includes('KIM_CUONG') || accType.includes('DIAMOND')) {
        tierLevel = SUBSCRIPTION_TIER.DIAMOND;
      } else if (accType.includes('SILVER')) {
        tierLevel = SUBSCRIPTION_TIER.SILVER;
      }

      // Map riskTaste
      let riskTaste: RISK_TASTE | null = null;
      const risk = client.riskTaste || '';
      if (risk.includes('Linh hoạt')) {
        riskTaste = RISK_TASTE.MODERATE;
      } else if (risk.includes('Lướt sóng')) {
        riskTaste = RISK_TASTE.AGGRESSIVE;
      } else if (risk.includes('Trung và dài hạn')) {
        riskTaste = RISK_TASTE.CONSERVATIVE;
      }

      // Parse DOB
      let dob: Date | null = null;
      if (client.dob && client.dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dob = new Date(client.dob);
      }

      // Parse joinDate
      let createdAt = new Date();
      if (client.joinDate) {
        const d = new Date(client.joinDate);
        if (!isNaN(d.getTime())) createdAt = d;
      }

      try {
        const newUser = await prisma.user.create({
          data: {
            email,
            fullName: client.name || 'Khách hàng cũ',
            passwordHash: defaultPasswordHash,
            phone,
            dob,
            address: client.address || null,
            avatarUrl: client.avatar || null,
            riskTaste,
            tierLevel,
            status: RECORD_STATUS.ACTIVE,
            createdAt,
            emailVerifiedAt: createdAt,
          },
        });

        // Assign Role
        const isVip = tierLevel !== SUBSCRIPTION_TIER.STANDARD;
        const roleToAssign = isVip ? clientVipRole : clientRole;
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: roleToAssign.id,
            assignedById: authorId,
          },
        });

        importCount++;
      } catch (err: any) {
        console.error(`    ❌ Lỗi import user ${email}: ${err.message}`);
      }
    }
    console.log(`  ✅ Đã import thành công ${importCount}/${clients.length} clients.`);
  } else {
    console.log('  ⚠️ Không thấy file parsed_clients.json, bỏ qua import clients.');
  }

  // ==========================================
  // 2. IMPORT BLOG ARTICLES
  // ==========================================
  if (fs.existsSync(blogsPath)) {
    console.log('\n📝 Importing Blog Articles...');
    const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf-8'));
    console.log(`  Parsed ${blogs.length} articles from parsed_blogs.json`);

    let importCount = 0;
    const processedSlugs = new Set<string>();

    for (const blog of blogs) {
      // 2a. Find or create Category
      const catName = blog.category || 'Chung';
      const catSlug = slugify(catName);
      
      const category = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          slug: catSlug,
          name: catName,
          description: `Danh mục ${catName} được import từ web cũ`,
        },
      });

      // 2b. Generate unique slug for blog
      let blogSlug = slugify(blog.title || 'bai-viet');
      if (!blogSlug) blogSlug = `blog-${Date.now()}`;
      
      let counter = 1;
      let uniqueSlug = blogSlug;
      while (processedSlugs.has(uniqueSlug)) {
        uniqueSlug = `${blogSlug}-${counter}`;
        counter++;
      }
      processedSlugs.add(uniqueSlug);

      // Check if already in DB
      const existingBlog = await prisma.blog.findUnique({
        where: { slug: uniqueSlug },
      });
      if (existingBlog) {
        console.log(`    ℹ️ Blog đã tồn tại, bỏ qua: ${uniqueSlug}`);
        continue;
      }

      // Map status
      let status: BLOG_STATUS = BLOG_STATUS.PUBLISHED;
      if (blog.status && blog.status.toLowerCase().includes('không')) {
        status = BLOG_STATUS.UNPUBLISHED;
      } else if (blog.status && blog.status.toLowerCase().includes('nháp')) {
        status = BLOG_STATUS.DRAFT;
      }

      // Map visibility & tier access
      let visibility: CONTENT_VISIBILITY = CONTENT_VISIBILITY.PUBLIC;
      let minTierAccess: SUBSCRIPTION_TIER = SUBSCRIPTION_TIER.STANDARD;
      const metaType = blog.metaType || '';
      const cat = blog.category || '';
      
      if (metaType.includes('VIP') || cat.includes('VIP') || cat.includes('V.I.P')) {
        visibility = CONTENT_VISIBILITY.PREMIUM;
        minTierAccess = SUBSCRIPTION_TIER.GOLD;
      }

      // Parse dates
      let createdAt = new Date();
      if (blog.createdDate) {
        const d = new Date(blog.createdDate);
        if (!isNaN(d.getTime())) createdAt = d;
      }

      // Extract a short excerpt (first 180 characters of clean text)
      const cleanExcerpt = blog.contentHTML
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 180) + '...';

      try {
        await prisma.blog.create({
          data: {
            authorId,
            categoryId: category.id,
            slug: uniqueSlug,
            title: blog.title || 'Bài viết cũ',
            excerpt: cleanExcerpt,
            content: blog.contentHTML,
            status,
            visibility,
            minTierAccess,
            publishedAt: status === BLOG_STATUS.PUBLISHED ? createdAt : null,
            createdAt,
            updatedAt: createdAt,
          },
        });
        importCount++;
      } catch (err: any) {
        console.error(`    ❌ Lỗi import blog "${blog.title}": ${err.message}`);
      }
    }
    console.log(`  ✅ Đã import thành công ${importCount}/${blogs.length} articles.`);
  } else {
    console.log('  ⚠️ Không thấy file parsed_blogs.json, bỏ qua import blogs.');
  }

  console.log('\n╔═════════════════════════════════════════════════╗');
  console.log('║               🎉 IMPORT COMPLETED               ║');
  console.log('╚═════════════════════════════════════════════════╝');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
