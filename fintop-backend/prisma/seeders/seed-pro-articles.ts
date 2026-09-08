import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  BLOG_STATUS,
  CONTENT_VISIBILITY,
  SUBSCRIPTION_TIER,
} from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/fintop' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting PRO Articles Seeder for Local DB testing...');

  // 1. Ensure admin user exists
  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@fintop.vn' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.findFirst({
      where: { deletedAt: null },
    });
  }

  if (!adminUser) {
    console.error('❌ No user found in local DB to assign as author. Run base seeders first.');
    process.exit(1);
  }

  console.log(`✅ Using author ID: ${adminUser.id} (${adminUser.email})`);

  // 2. Ensure categories exist
  const categories = [
    { slug: 'thi-truong', name: 'Thị trường' },
    { slug: 'pro-research', name: 'PRO Research' },
    { slug: 'doanh-nghiep', name: 'Doanh nghiệp' },
    { slug: 'ncpt-nganh', name: 'NCPT Ngành' },
    { slug: 'pro-data', name: 'PRO Data' },
    { slug: 'dinh-luong', name: 'Định lượng' },
  ];

  const catMap: Record<string, number> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
    catMap[c.slug] = cat.id;
  }

  // 3. Articles definition — a mix of PRO and Standard articles to verify PRO badges
  const proArticles = [
    // --- THỊ TRƯỜNG PRO ARTICLES ---
    {
      slug: 'pro-vnindex-khang-cu-1800',
      title: '[DỮ LIỆU THỊ TRƯỜNG 25/8] - VNIndex chững tại kháng cự 1800, xu hướng đi ngang co hẹp biên độ',
      excerpt: 'VNIndex chững lại tại kháng cự 1800, xu hướng đi ngang co hẹp biên độ Phiên giao dịch thứ Ba 25/8 chứng kiến một phiên giằng co mạnh mẽ...',
      content: '<p>VN-Index ghi nhận áp lực chốt lời gia tăng khi tiệm cận ngưỡng kháng cự tâm lý 1800 điểm. Dòng tiền phân hóa mạnh mẽ giữa các nhóm ngành...</p>',
      categorySlug: 'thi-truong',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      views: 142,
    },
    {
      slug: 'pro-thi-truong-toan-canh-238',
      title: '[THỊ TRƯỜNG TOÀN CẢNH 23/8] - VNIndex tiếp diễn sóng tăng tiệm cận vùng 1800',
      excerpt: 'Xác nhận hỗ trợ thành công tại 1720, VNIndex đảo chiều sóng tăng +33.88 điểm (+1.95%) tiệm cận mốc 1800...',
      content: '<p>Nhịp phục hồi ấn tượng từ vùng 1720 đã đưa chỉ số VN-Index vượt qua các đường MA quan trọng. Nhóm Ngân hàng và Bất động sản đóng vai trò là động lực chính...</p>',
      categorySlug: 'thi-truong',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      views: 204,
    },
    {
      slug: 'pro-dong-tien-tu-do-q3-2026',
      title: '[ĐẶC QUYỀN PRO] Phân tích dòng tiền cá mập & Khối ngoại tuần cuối tháng 8/2026',
      excerpt: 'Báo cáo độc quyền PRO: Khối ngoại quay lại mua ròng 1.500 tỷ đồng, tập trung gom mạnh FPT, VCB, HPG.',
      content: '<p>Dữ liệu giao dịch độc quyền FinTop PRO chỉ ra lực mua chủ động của các quỹ ETF ngoại đang nhắm tới nhóm cổ phiếu đáp ứng tiêu chuẩn FTSE...</p>',
      categorySlug: 'thi-truong',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      views: 385,
    },
    {
      slug: 'std-thi-truong-tong-quan-hang-ngay',
      title: 'Điểm tin thị trường hàng ngày: Thanh khoản duy trì mức trung bình 20 phiên',
      excerpt: 'Tổng hợp diễn biến phiên giao dịch hôm nay: Chỉ số biến động trong biên độ hẹp, nhà đầu tư chờ đợi tín hiệu từ báo cáo vĩ mô.',
      content: '<p>Thị trường chứng khoán hôm nay diễn biến giằng co đi ngang. Khối lượng giao dịch đạt 15.200 tỷ đồng trên sàn HOSE...</p>',
      categorySlug: 'thi-truong',
      visibility: CONTENT_VISIBILITY.PUBLIC,
      minTierAccess: SUBSCRIPTION_TIER.STANDARD,
      views: 89,
    },

    // --- PRO RESEARCH ARTICLES ---
    {
      slug: 'pro-fpt-dinh-gia-chuyen-sau-160k',
      title: 'PRO Analysis | FPT — Bệ phóng AI & Cloud Computing, Mục tiêu 160.000đ',
      excerpt: 'Định giá chuyên sâu dành cho hội viên PRO: EPS 2026 dự phóng đạt 7.800đ (+28% YoY). Khuyến nghị MUA mạnh.',
      content: '<p>FPT tiếp tục khẳng định vị thế dẫn đầu trong đợt sóng chuyển đổi số và AI tại Đông Nam Á...</p>',
      categorySlug: 'pro-research',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      views: 512,
    },
    {
      slug: 'pro-vcb-dinh-gia-ngan-hang-105k',
      title: 'PRO Analysis | VCB — Chất lượng tài sản số 1 hệ thống, Mục tiêu 105.000đ',
      excerpt: 'Mô hình định giá PRO: ROE 24%, CASA 38%, chất lượng nợ vay vượt trội giúp VCB duy trì mức định giá cao.',
      content: '<p>Vietcombank duy trì sức mạnh nội tại vượt trội và biên an toàn cao cho các nhà đầu tư dài hạn...</p>',
      categorySlug: 'pro-research',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      views: 430,
    },

    // --- DOANH NGHIỆP PRO ARTICLES ---
    {
      slug: 'pro-msn-phan-tich-chuyen-sau-2026',
      title: 'PRO Enterprise | MSN — Masan Group: WinCommerce chính thức hòa vốn & mở rộng',
      excerpt: 'Phân tích độc quyền PRO: Chuỗi Bách Hóa / WinMart ghi nhận EBITDA dương toàn hệ thống, mảng tiêu dùng bứt phá.',
      content: '<p>Masan Group đang bước vào giai đoạn gặt hái thành quả sau chuỗi năm tái cơ cấu mạnh mẽ...</p>',
      categorySlug: 'doanh-nghiep',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      views: 310,
    },
    {
      slug: 'std-mwg-phan-tich-co-ban',
      title: 'MWG | Thế Giới Di Động — Cập nhật kết quả kinh doanh quý 2',
      excerpt: 'Doanh thu thuần đạt tăng trưởng 15% YoY nhờ phục hồi sức mua tiêu dùng nội địa.',
      content: '<p>MWG ghi nhận sự hồi phục tích cực ở cả 2 mảng bán lẻ điện thoại - điện máy và chuỗi bách hóa...</p>',
      categorySlug: 'doanh-nghiep',
      visibility: CONTENT_VISIBILITY.PUBLIC,
      minTierAccess: SUBSCRIPTION_TIER.STANDARD,
      views: 175,
    },

    // --- NCPT NGÀNH PRO ARTICLES ---
    {
      slug: 'pro-nganh-ngan-hang-nim-phuc-hoi',
      title: 'PRO Industry | Ngành Ngân Hàng: Chu kỳ nới lỏng tiền tệ & NIM phục hồi mạnh Q3/2026',
      excerpt: 'Báo cáo ngành PRO: Dự báo lợi nhuận toàn ngành ngân hàng tăng trưởng 22% trong nửa cuối 2026.',
      content: '<p>Biên lãi ròng (NIM) toàn ngành ngân hàng có dấu hiệu chạm đáy và phục hồi từ Q2/2026...</p>',
      categorySlug: 'ncpt-nganh',
      visibility: CONTENT_VISIBILITY.PREMIUM,
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
      views: 298,
    },
  ];

  let insertedCount = 0;
  for (const art of proArticles) {
    const catId = catMap[art.categorySlug];
    if (!catId) continue;

    await prisma.blog.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        excerpt: art.excerpt,
        content: art.content,
        visibility: art.visibility,
        minTierAccess: art.minTierAccess,
        status: BLOG_STATUS.PUBLISHED,
        publishedAt: new Date(),
        views: art.views,
      },
      create: {
        slug: art.slug,
        title: art.title,
        excerpt: art.excerpt,
        content: art.content,
        authorId: adminUser.id,
        categoryId: catId,
        visibility: art.visibility,
        minTierAccess: art.minTierAccess,
        status: BLOG_STATUS.PUBLISHED,
        publishedAt: new Date(),
        views: art.views,
      },
    });

    insertedCount++;
    console.log(`   ✅ Seeded/Updated article: [${art.visibility}] ${art.title.substring(0, 50)}...`);
  }

  // Also update existing articles if any to have minTierAccess: GOLD if their slug contains 'pro'
  const existingProBlogs = await prisma.blog.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'pro-' } },
        { title: { contains: 'PRO' } },
        { title: { contains: 'ĐẶC QUYỀN' } },
      ],
    },
  });

  for (const blog of existingProBlogs) {
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        visibility: CONTENT_VISIBILITY.PREMIUM,
        minTierAccess: SUBSCRIPTION_TIER.GOLD,
      },
    });
    console.log(`   👑 Updated existing article ID ${blog.id} to PREMIUM / GOLD tier access.`);
  }

  console.log(`\n🎉 Seeded ${insertedCount} PRO articles successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding PRO articles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
