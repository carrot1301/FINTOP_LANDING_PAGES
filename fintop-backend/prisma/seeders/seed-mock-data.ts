/**
 * ============================================================
 * seed-mock-data.ts — Comprehensive Mock Data Seeder
 * ============================================================
 * PURPOSE:
 *   Seeds ALL tables needed for frontend display testing:
 *   - StockExchanges (HOSE, HNX, UPCOM)
 *   - Sectors & Industries
 *   - Stocks (20+ popular VN stocks)
 *   - Categories & Blogs (research articles for 4 sections)
 *   - SubscriptionPlans (Standard, Silver, Gold, Diamond)
 *   - VipSignals (Published signals for Copy Trade)
 *   - RecommendedPortfolios & Holdings
 *
 * SAFETY:
 *   - Hard-blocks if NODE_ENV=production
 *   - Uses upsert where possible for idempotency
 *   - Does NOT delete existing data
 * ============================================================
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  EXCHANGE_CODE,
  RECORD_STATUS,
  STOCK_STATUS,
  SUBSCRIPTION_TIER,
  BLOG_STATUS,
  CONTENT_VISIBILITY,
  SIGNAL_STATUS,
  SIGNAL_DIRECTION,
  SIGNAL_SOURCE,
  PORTFOLIO_STATUS,
  AUDIT_SOURCE,
  Prisma,
} from '@prisma/client';

// ─── PRODUCTION GUARD ────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('❌ BLOCKED: seed-mock-data.ts cannot run in production.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 [Mock Data Seed] Starting comprehensive mock data seeder...');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);

  // ═══════════════════════════════════════════════════════
  // 1. FIND ADMIN USER (prerequisite)
  // ═══════════════════════════════════════════════════════
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@fintop.vn' },
  });
  if (!adminUser) {
    console.error('❌ Admin user admin@fintop.vn not found. Run wave1.seeder.ts first.');
    process.exit(1);
  }
  console.log(`✅ Found admin user: id=${adminUser.id}`);

  // ═══════════════════════════════════════════════════════
  // 2. STOCK EXCHANGES
  // ═══════════════════════════════════════════════════════
  console.log('\n📈 Seeding Stock Exchanges...');
  const exchanges: Record<string, any> = {};

  for (const ex of [
    { code: EXCHANGE_CODE.HOSE, name: 'Sở Giao dịch Chứng khoán TP.HCM' },
    { code: EXCHANGE_CODE.HNX, name: 'Sở Giao dịch Chứng khoán Hà Nội' },
    { code: EXCHANGE_CODE.UPCOM, name: 'Thị trường UPCoM' },
  ]) {
    exchanges[ex.code] = await prisma.stockExchange.upsert({
      where: { code: ex.code },
      update: {},
      create: { code: ex.code, name: ex.name, status: RECORD_STATUS.ACTIVE },
    });
    console.log(`   ✅ Exchange: ${ex.code} (id=${exchanges[ex.code].id})`);
  }

  // ═══════════════════════════════════════════════════════
  // 3. SECTORS & INDUSTRIES
  // ═══════════════════════════════════════════════════════
  console.log('\n🏭 Seeding Sectors & Industries...');

  const sectorDefs = [
    { code: 'FINANCE', name: 'Tài chính', industries: ['Ngân Hàng', 'Chứng khoán', 'Bảo hiểm'] },
    { code: 'TECH', name: 'Công nghệ', industries: ['Công nghệ thông tin', 'Viễn thông'] },
    { code: 'REALESTATE', name: 'Bất động sản', industries: ['Bất động sản', 'BĐS - KCN'] },
    { code: 'INDUSTRIAL', name: 'Công nghiệp', industries: ['Thép - Vật liệu', 'Xây dựng', 'Dầu khí'] },
    { code: 'CONSUMER', name: 'Tiêu dùng', industries: ['Thực phẩm', 'Bán lẻ', 'Dệt may'] },
    { code: 'ENERGY', name: 'Năng lượng', industries: ['Năng lượng/Điện/Nước'] },
    { code: 'TRANSPORT', name: 'Vận tải', industries: ['Hàng không', 'Vận tải biển'] },
    { code: 'HEALTHCARE', name: 'Y tế', industries: ['Dược phẩm - Y tế'] },
  ];

  const industryMap: Record<string, any> = {};

  for (const sd of sectorDefs) {
    const sector = await prisma.sector.upsert({
      where: { code: sd.code },
      update: {},
      create: {
        code: sd.code,
        name: sd.name,
        status: RECORD_STATUS.ACTIVE,
      },
    });

    for (const indName of sd.industries) {
      const indCode = indName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 50);
      const industry = await prisma.industry.upsert({
        where: { code: indCode },
        update: {},
        create: {
          code: indCode,
          name: indName,
          sectorId: sector.id,
          status: RECORD_STATUS.ACTIVE,
        },
      });
      industryMap[indName] = industry;
    }
    console.log(`   ✅ Sector: ${sd.name} (${sd.industries.length} industries)`);
  }

  // ═══════════════════════════════════════════════════════
  // 4. STOCKS (20 popular Vietnamese stocks)
  // ═══════════════════════════════════════════════════════
  console.log('\n📊 Seeding Stocks...');

  const stockDefs = [
    { symbol: 'FPT', company: 'CTCP FPT', exchange: 'HOSE', industry: 'Công nghệ thông tin' },
    { symbol: 'VNM', company: 'CTCP Sữa Việt Nam (Vinamilk)', exchange: 'HOSE', industry: 'Thực phẩm' },
    { symbol: 'HPG', company: 'CTCP Tập đoàn Hòa Phát', exchange: 'HOSE', industry: 'Thép - Vật liệu' },
    { symbol: 'VCB', company: 'NH TMCP Ngoại thương Việt Nam', exchange: 'HOSE', industry: 'Ngân Hàng' },
    { symbol: 'VHM', company: 'CTCP Vinhomes', exchange: 'HOSE', industry: 'Bất động sản' },
    { symbol: 'VIC', company: 'Tập đoàn Vingroup', exchange: 'HOSE', industry: 'Bất động sản' },
    { symbol: 'MSN', company: 'CTCP Tập đoàn Masan', exchange: 'HOSE', industry: 'Thực phẩm' },
    { symbol: 'MWG', company: 'CTCP Đầu tư Thế Giới Di Động', exchange: 'HOSE', industry: 'Bán lẻ' },
    { symbol: 'TCB', company: 'NH TMCP Kỹ Thương Việt Nam', exchange: 'HOSE', industry: 'Ngân Hàng' },
    { symbol: 'MBB', company: 'NH TMCP Quân Đội', exchange: 'HOSE', industry: 'Ngân Hàng' },
    { symbol: 'VPB', company: 'NH TMCP Việt Nam Thịnh Vượng', exchange: 'HOSE', industry: 'Ngân Hàng' },
    { symbol: 'ACB', company: 'NH TMCP Á Châu', exchange: 'HOSE', industry: 'Ngân Hàng' },
    { symbol: 'SSI', company: 'CTCP Chứng khoán SSI', exchange: 'HOSE', industry: 'Chứng khoán' },
    { symbol: 'VND', company: 'CTCP Chứng khoán VNDirect', exchange: 'HOSE', industry: 'Chứng khoán' },
    { symbol: 'GAS', company: 'Tổng CTCP Khí Việt Nam', exchange: 'HOSE', industry: 'Dầu khí' },
    { symbol: 'PLX', company: 'Tập đoàn Xăng Dầu Việt Nam', exchange: 'HOSE', industry: 'Dầu khí' },
    { symbol: 'VJC', company: 'CTCP Hàng không VietJet', exchange: 'HOSE', industry: 'Hàng không' },
    { symbol: 'HVN', company: 'Tổng CTCP Hàng không Việt Nam', exchange: 'HOSE', industry: 'Hàng không' },
    { symbol: 'PNJ', company: 'CTCP Vàng bạc Đá quý Phú Nhuận', exchange: 'HOSE', industry: 'Bán lẻ' },
    { symbol: 'DHG', company: 'CTCP Dược Hậu Giang', exchange: 'HOSE', industry: 'Dược phẩm - Y tế' },
  ];

  const stockMap: Record<string, any> = {};

  for (const sd of stockDefs) {
    const exchangeKey = sd.exchange as keyof typeof EXCHANGE_CODE;
    const exchangeEntity = exchanges[exchangeKey];
    const industryEntity = industryMap[sd.industry];

    const stock = await prisma.stock.upsert({
      where: { symbol: sd.symbol },
      update: {},
      create: {
        symbol: sd.symbol,
        companyName: sd.company,
        exchangeId: exchangeEntity.id,
        industryId: industryEntity?.id || null,
        status: STOCK_STATUS.ACTIVE,
      },
    });
    stockMap[sd.symbol] = stock;
  }
  console.log(`   ✅ Seeded ${Object.keys(stockMap).length} stocks`);

  // ═══════════════════════════════════════════════════════
  // 5. CATEGORIES (for Blog/Research)
  // ═══════════════════════════════════════════════════════
  console.log('\n📂 Seeding Categories...');

  const categoryDefs = [
    { slug: 'thi-truong', name: 'Thị trường' },
    { slug: 'pro-research', name: 'PRO Research' },
    { slug: 'doanh-nghiep', name: 'Doanh nghiệp' },
    { slug: 'ncpt-nganh', name: 'NCPT Ngành' },
    { slug: 'vi-mo', name: 'Vĩ mô & Tiền tệ' },
    { slug: 'kien-thuc', name: 'Kiến thức đầu tư' },
    { slug: 'phan-tich-ky-thuat', name: 'Phân tích kỹ thuật' },
    { slug: 'tin-tuc', name: 'Tin tức & Sự kiện' },
    { slug: 'nhat-ky-giao-dich', name: 'Nhật ký giao dịch' },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cd of categoryDefs) {
    const cat = await prisma.category.upsert({
      where: { slug: cd.slug },
      update: {},
      create: { slug: cd.slug, name: cd.name },
    });
    categoryMap[cd.slug] = cat;
  }
  console.log(`   ✅ Seeded ${Object.keys(categoryMap).length} categories`);

  // ═══════════════════════════════════════════════════════
  // 6. BLOGS (Research articles for 4 panels)
  // ═══════════════════════════════════════════════════════
  console.log('\n📝 Seeding Blog articles...');

  const blogDefs = [
    // === THỊ TRƯỜNG ===
    {
      slug: 'vnindex-phan-tich-q2-2026',
      title: 'VN-Index phân tích xu hướng Q2/2026 — Vùng tích lũy 1.250-1.320',
      excerpt: 'Thị trường đang trong giai đoạn tích lũy sau nhịp hồi phục mạnh từ vùng 1.150. Dòng tiền ngoại quay trở lại, VN30 dẫn dắt nhóm cổ phiếu vốn hóa lớn.',
      content: 'VN-Index đang giao dịch trong biên độ hẹp 1.250-1.320 điểm, phản ánh tâm lý thận trọng của nhà đầu tư trước mùa báo cáo KQKD Q2/2026.\n\nDòng tiền thông minh đang luân chuyển mạnh vào nhóm Ngân hàng (VCB, TCB, MBB) và Công nghệ (FPT). Khối ngoại mua ròng liên tục 5 phiên gần nhất với tổng giá trị hơn 2.100 tỷ đồng.\n\nKịch bản tích cực: VN-Index vượt kháng cự 1.320 sẽ mở đường lên vùng 1.380-1.400.\nKịch bản tiêu cực: Mất hỗ trợ 1.250, rủi ro quay lại test vùng 1.200.',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    {
      slug: 'dong-tien-tuan-2306-2706',
      title: 'Phân tích dòng tiền tuần 23/06 - 27/06: Tập trung vào nhóm Ngân Hàng & Công Nghệ',
      excerpt: 'Dòng tiền thông minh chảy mạnh vào nhóm Blue-chip Ngân hàng. FPT breakout mạnh, SSI và VND hưởng lợi từ thanh khoản tăng đột biến.',
      content: 'Tuần giao dịch 23-27/06/2026, thanh khoản thị trường cải thiện rõ rệt với giá trị khớp lệnh bình quân đạt 18.500 tỷ/phiên trên HOSE.\n\nNhóm Ngân hàng: VCB tăng 3.2%, TCB +2.8%, MBB +4.1%. Dòng tiền lớn đổ vào mạnh, volume tăng gấp 1.5x so với trung bình 20 phiên.\n\nNhóm Công nghệ: FPT breakout khỏi vùng 130.000, xác lập uptrend mới. SSI và VND hưởng lợi khi thanh khoản tăng cao.',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    {
      slug: 'chien-luoc-dau-tu-thang-7-2026',
      title: 'Chiến lược đầu tư tháng 7/2026: Cơ hội phân bổ danh mục cân bằng',
      excerpt: 'Khuyến nghị phân bổ 40% Ngân hàng, 25% Công nghệ, 20% Bất động sản KCN, 15% tiền mặt. Mục tiêu lợi nhuận 8-12% trong quý.',
      content: 'Tổng quan: Thị trường bước vào giai đoạn thuận lợi khi lãi suất tiếp tục giảm, tín dụng tăng trưởng tốt.\n\nPhân bổ khuyến nghị:\n- 40% Ngân hàng (VCB, MBB, TCB): P/B hấp dẫn, NIM cải thiện\n- 25% Công nghệ (FPT): Động lực từ AI và chuyển đổi số\n- 20% BĐS KCN: Hưởng lợi FDI tăng mạnh\n- 15% Tiền mặt: Chờ cơ hội khi thị trường điều chỉnh',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    {
      slug: 'canh-bao-rui-ro-bien-dong-ty-gia',
      title: 'Cảnh báo: Biến động tỷ giá USD/VND và tác động đến nhóm xuất khẩu',
      excerpt: 'Tỷ giá USD/VND tăng 2% trong tháng 6, tạo áp lực lên nhóm nhập khẩu nhưng lại hỗ trợ nhóm xuất khẩu thủy sản, dệt may.',
      content: 'Biến động tỷ giá gần đây tạo phân hóa rõ rệt giữa các nhóm ngành. Phân tích tác động chi tiết cho từng nhóm cổ phiếu.',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    // === PRO RESEARCH ===
    {
      slug: 'pro-fpt-target-160k',
      title: 'PRO Analysis | FPT — Mục tiêu 160.000, Upside 22%',
      excerpt: 'FPT đang ở giai đoạn tăng trưởng mạnh nhất với AI và Cloud. EPS dự phóng 2026 đạt 7.800đ (+28% YoY). Khuyến nghị MUA với mục tiêu 160.000đ.',
      content: 'FPT Corporation (FPT) — Deep Dive Analysis\n\nKết luận: KHUYẾN NGHỊ MUA, Mục tiêu giá 160.000đ (+22% upside)\n\nĐộng lực tăng trưởng:\n1. Mảng AI & Cloud tăng 45% YoY\n2. Ký hợp đồng mới đạt $1.2B trong 5 tháng đầu 2026\n3. P/E forward 18x - thấp hơn trung vị ngành Công nghệ Đông Nam Á\n\nRủi ro: Biên lợi nhuận mảng viễn thông giảm, cạnh tranh từ các công ty Ấn Độ.',
      category: 'pro-research',
      section: 'PRO Research',
    },
    {
      slug: 'pro-vcb-target-105k',
      title: 'PRO Analysis | VCB — Ngôi sao ngân hàng, mục tiêu 105.000',
      excerpt: 'Vietcombank tiếp tục dẫn đầu ngành Ngân hàng với ROE 24%, NIM cải thiện lên 3.8%. P/B 2.5x — cao nhưng xứng đáng với chất lượng tài sản hàng đầu.',
      content: 'Vietcombank (VCB) — Premium Banking Analysis\n\nKhuyến nghị: MUA DÀI HẠN, Mục tiêu giá 105.000đ\n\nĐiểm nhấn:\n- ROE duy trì >24% - cao nhất ngành\n- Tỷ lệ nợ xấu thấp nhất: 0.68%\n- Tín dụng tăng trưởng 15% room được cấp bổ sung\n- CASA ratio 38% - chi phí vốn thấp nhất hệ thống',
      category: 'pro-research',
      section: 'PRO Research',
    },
    {
      slug: 'pro-hpg-steel-cycle',
      title: 'PRO Analysis | HPG — Chu kỳ thép phục hồi, mục tiêu 34.000',
      excerpt: 'Hòa Phát bước vào giai đoạn phục hồi biên lợi nhuận khi giá thép HRC tăng 15% từ đáy. Dự án Dung Quất 2 sẽ bổ sung 20% công suất.',
      content: 'Hòa Phát Group (HPG) — Steel Cycle Analysis\n\nKhuyến nghị: MUA, Mục tiêu giá 34.000đ (+16% upside)\n\nĐộng lực:\n1. Giá thép HRC tăng 15% từ đáy Q1/2026\n2. Dung Quất giai đoạn 2 vận hành Q4/2026\n3. EPS dự phóng 2.800đ/cp (+35% YoY)',
      category: 'pro-research',
      section: 'PRO Research',
    },
    // === DOANH NGHIỆP ===
    {
      slug: 'phan-tich-msn-q2-2026',
      title: 'MSN | Masan Group — Phân tích KQKD Q2/2026 sơ bộ',
      excerpt: 'Masan kỳ vọng doanh thu thuần đạt 22.500 tỷ (+18% YoY) nhờ WinMart tăng trưởng same-store 8% và Masan MEATLife cải thiện biên lợi nhuận.',
      content: 'Masan Group (MSN) — Q2/2026 Preview\n\nDoanh thu thuần ước đạt 22.500 tỷ đồng, tăng 18% YoY\nWinCommerce (WinMart): SSSG +8%, lỗ thu hẹp đáng kể\nMasan Consumer: Biên EBITDA cải thiện lên 26%\nTechcombank: Đóng góp lợi nhuận ổn định',
      category: 'doanh-nghiep',
      section: 'Doanh nghiệp',
    },
    {
      slug: 'phan-tich-mwg-q2-2026',
      title: 'MWG | Thế Giới Di Động — Bật tăng mạnh nhờ chiến lược đa kênh',
      excerpt: 'Thế Giới Di Động ghi nhận doanh thu phục hồi mạnh mẽ. Chuỗi Bách Hóa Xanh lần đầu có lãi trong Q2/2026.',
      content: 'Thế Giới Di Động (MWG) — Recovery Analysis\n\nDoanh thu phục hồi mạnh: +22% YoY\nBách Hóa Xanh: Lần đầu EBITDA dương, 1.800 cửa hàng\nĐiện Máy Xanh + TGDĐ: Biên lợi nhuận gộp 22%\nErablue Indonesia: Mở rộng lên 100 cửa hàng',
      category: 'doanh-nghiep',
      section: 'Doanh nghiệp',
    },
    {
      slug: 'phan-tich-pnj-q2-2026',
      title: 'PNJ | Vàng bạc Đá quý Phú Nhuận — Tăng trưởng vượt kỳ vọng',
      excerpt: 'PNJ ghi nhận lợi nhuận ròng Q2 ước đạt 580 tỷ (+25% YoY). Giá vàng tăng mạnh hỗ trợ biên lợi nhuận.',
      content: 'PNJ Corporation — Q2/2026 Performance\n\nLợi nhuận ròng Q2: 580 tỷ đồng (+25% YoY)\nDoanh thu vàng miếng tăng 40% do giá vàng lập đỉnh\nMảng trang sức: Biên lợi nhuận gộp ổn định 19%\nKế hoạch mở mới 25 cửa hàng trong nửa cuối 2026',
      category: 'doanh-nghiep',
      section: 'Doanh nghiệp',
    },
    // === NCPT NGÀNH ===
    {
      slug: 'nganh-ngan-hang-q2-2026',
      title: 'Ngành Ngân hàng Q2/2026: NIM phục hồi, tín dụng tăng mạnh',
      excerpt: 'Ngành Ngân hàng bước vào giai đoạn thuận lợi nhất kể từ 2023. NIM tăng trung bình 20bps, tín dụng tăng trưởng 8% so với đầu năm.',
      content: 'Banking Sector Overview Q2/2026\n\nNIM trung bình ngành: 3.5% (+20bps QoQ)\nTín dụng tăng trưởng: 8% YTD (mục tiêu cả năm 14-15%)\nTỷ lệ nợ xấu ngành: 1.4% (giảm từ 1.7%)\n\nTop picks: VCB (Premium), MBB (Growth), TCB (Digital leader)',
      category: 'ncpt-nganh',
      section: 'NCPT Ngành',
    },
    {
      slug: 'nganh-cong-nghe-ai-boom',
      title: 'Ngành Công nghệ Việt Nam: Cơ hội lớn từ AI & Cloud Computing',
      excerpt: 'Thị trường AI tại Việt Nam ước đạt $1.5B trong 2026. FPT chiếm 60% thị phần dịch vụ AI enterprise, tiếp theo là CMC và Viettel Solutions.',
      content: 'Vietnam Tech Sector — AI Revolution\n\nQuy mô thị trường AI Việt Nam: $1.5B (2026E)\nFPT: 60% thị phần AI enterprise\nĐầu tư AI/Cloud của DN Việt: Tăng 45% YoY\nViettel, VNPT đẩy mạnh hạ tầng Cloud quốc gia\n\nTop picks: FPT (Leader), CMG (Value)',
      category: 'ncpt-nganh',
      section: 'NCPT Ngành',
    },
    {
      slug: 'nganh-bds-kcn-fdi',
      title: 'Ngành BĐS KCN: Bùng nổ nhờ FDI và chiến lược Trung Quốc+1',
      excerpt: 'Dòng vốn FDI đăng ký 5T/2026 đạt $18.2B (+28% YoY). BĐS KCN hưởng lợi lớn nhất khi tỷ lệ lấp đầy trung bình đạt 85%.',
      content: 'Industrial Real Estate — FDI Boom Analysis\n\nFDI 5 tháng đầu 2026: $18.2B (+28% YoY)\nTỷ lệ lấp đầy KCN: 85% (cao kỷ lục)\nGiá thuê đất KCN: $130/m²/lease (+12% YoY)\n\nTop picks: VHM (KCN mới), NLG, KBC',
      category: 'ncpt-nganh',
      section: 'NCPT Ngành',
    },
    {
      slug: 'vi-mo-toan-cau-va-lai-suat-fed-2026',
      title: 'Phân tích Vĩ mô: Xu hướng lãi suất FED và ảnh hưởng tới tỷ giá USD/VND',
      excerpt: 'FED dự kiến hạ lãi suất thêm 0.25% trong kỳ họp tới. Tỷ giá USD/VND hạ nhiệt dần về quanh mốc 25.100đ, giảm áp lực lên chính sách tiền tệ.',
      content: 'Bối cảnh kinh tế vĩ mô toàn cầu đang ghi nhận những chuyển dịch tích cực. CPI Mỹ hạ nhiệt nhanh hơn dự kiến hỗ trợ FED có thêm dư địa nới lỏng tiền tệ.\n\nTrong nước, Ngân hàng Nhà nước duy trì chính sách linh hoạt. Lãi suất liên ngân hàng hạ nhiệt giúp thanh khoản hệ thống dồi dào. Tỷ giá USD/VND được dự báo sẽ duy trì ổn định trong khoảng 24.800 - 25.200 trong nửa cuối năm 2026.',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    {
      slug: 'chien-luoc-danh-muc-fintop-q2-2026',
      title: 'Chiến lược phân bổ danh mục FinTop Q2/2026: Đón đầu sóng nâng hạng',
      excerpt: 'Khuyến nghị tập trung vào nhóm cổ phiếu đáp ứng tiêu chuẩn FTSE nâng hạng như FPT, HPG, VCB và SSI. Cơ cấu tỷ trọng danh mục tối ưu.',
      content: 'Việc nâng hạng lên thị trường mới nổi sẽ thu hút hàng tỷ USD dòng vốn ngoại từ các quỹ ETF thụ động.\n\nChúng tôi khuyến nghị chiến lược phân bổ danh mục tập trung:\n1. Công nghệ & AI: FPT (tỷ trọng 25%)\n2. Ngân hàng hàng đầu: VCB (tỷ trọng 20%), TCB (tỷ trọng 15%)\n3. Chu kỳ sản xuất: HPG (tỷ trọng 20%)\n4. Dịch vụ tài chính: SSI (tỷ trọng 20%)\n\nMức dừng lỗ kỷ luật ở mức 7-10% cho từng cổ phiếu.',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    // --- BỔ SUNG BÀI VIẾT MẪU MỚI CHO 4 TRANG NGHIÊN CỨU ---
    {
      slug: 'dong-tien-thang-7-2026-nhom-chung-khoan',
      title: 'Phân tích dòng tiền tháng 7/2026: Dòng tiền thông minh luân chuyển vào nhóm Chứng khoán',
      excerpt: 'Dòng tiền thông minh bắt đầu đổ mạnh vào nhóm cổ phiếu chứng khoán nhờ kỳ vọng thanh khoản hồi phục và tiến độ nâng hạng thị trường.',
      content: 'Báo cáo Dòng tiền tháng 7/2026 ghi nhận khối lượng giao dịch đột biến ở nhóm cổ phiếu Dịch vụ tài chính (Chứng khoán). Các cổ phiếu dẫn dắt như SSI, VND, VCI, HCM đều bứt phá mạnh khỏi vùng nền tích lũy dài hạn. Thanh khoản bình quân toàn thị trường tăng 22% so với tháng trước, củng cố xu hướng tăng của nhóm ngành nhạy bén với thị trường này.',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    {
      slug: 'bao-cao-vi-mo-q3-2026-chinh-sach-tien-te',
      title: 'Báo cáo chiến lược vĩ mô Q3/2026: Điều hành tỷ giá và xu hướng lãi suất nội địa',
      excerpt: 'Dự báo về tăng trưởng GDP và các kịch bản chính sách tỷ giá của Ngân hàng Nhà nước trong nửa cuối năm 2026.',
      content: 'Xuuyên suốt Q3/2026, Ngân hàng Nhà nước duy trì chính sách linh hoạt. Lãi suất liên ngân hàng hạ nhiệt giúp thanh khoản hệ thống dồi dào. Tỷ giá USD/VND được dự báo sẽ duy trì ổn định trong khoảng 24.800 - 25.200 trong nửa cuối năm 2026.',
      category: 'thi-truong',
      section: 'Thị trường',
    },
    {
      slug: 'pro-hpg-dung-quat-2-pe-phong',
      title: 'PRO Analysis | HPG — Dung Quất 2 bệ phóng tăng trưởng dài hạn',
      excerpt: 'Dự án đại siêu dự án Dung Quất 2 dự kiến hoàn thành giai đoạn 1 vào cuối năm 2026, nâng công suất HRC của HPG lên 8.6 triệu tấn/năm.',
      content: 'HPG tiếp tục khẳng định vị thế dẫn đầu ngành thép khu vực Đông Nam Á. Đại dự án Dung Quất 2 sẽ giải quyết nút thắt về năng lực sản xuất HRC chất lượng cao, giúp HPG gia tăng biên lợi nhuận gộp đáng kể nhờ tối ưu hóa chi phí sản xuất theo quy mô. Khuyến nghị: MUA DÀI HẠN với giá mục tiêu 36.500đ.',
      category: 'pro-research',
      section: 'PRO Research',
    },
    {
      slug: 'pro-tcb-mo-hinh-so-dan-dau',
      title: 'PRO Analysis | TCB — Mô hình ngân hàng số dẫn đầu hiệu quả, mục tiêu 32.000',
      excerpt: 'Techcombank duy trì tỷ lệ CASA hàng đầu hệ thống và thúc đẩy nguồn thu phi tín dụng từ số hóa toàn diện quy trình.',
      content: 'Techcombank (TCB) tiếp tục đạt hiệu quả hoạt động vượt trội nhờ chi phí vốn thấp và mô hình ngân hàng số tiện ích cao. Chất lượng tài sản vững chắc với tỷ lệ bao phủ nợ xấu cao và trích lập dự phòng đầy đủ giúp TCB giảm thiểu rủi ro tín dụng. Khuyến nghị: MUA, Mục tiêu giá 32.000đ.',
      category: 'pro-research',
      section: 'PRO Research',
    },
    {
      slug: 'vhm-cap-nhat-tien-do-du-an-2026',
      title: 'VHM | Vinhomes — Cập nhật tiến độ dự án và kế hoạch mở bán nửa cuối 2026',
      excerpt: 'Vinhomes chuẩn bị mở bán phân khu mới tại các dự án đại đô thị trọng điểm. Dự báo dòng tiền và lợi nhuận ròng của doanh nghiệp.',
      content: 'Vinhomes (VHM) tiếp tục duy trì quỹ đất sạch lớn nhất Việt Nam cùng năng lực triển khai dự án vượt trội. Kế hoạch mở bán phân khu mới tại Ocean Park và các dự án đại đô thị vùng ven sẽ mang lại dòng tiền dồi dào, hỗ trợ giảm tỷ lệ đòn bẩy tài chính và gia tăng giá trị cho cổ đông trong chu kỳ 2026 - 2028.',
      category: 'doanh-nghiep',
      section: 'Doanh nghiệp',
    },
    {
      slug: 'nlg-nam-long-nha-o-vua-tui-tien',
      title: 'NLG | Nam Long — Điểm sáng từ các phân khúc nhà ở vừa túi tiền (Affordable Housing)',
      excerpt: 'Nam Long ghi nhận tỷ lệ hấp thụ tốt tại các dự án Mizuki Park và Waterpoint nhờ dòng sản phẩm đáp ứng nhu cầu thực của thị trường.',
      content: 'Chiến lược tập trung vào phân khúc nhà ở vừa túi tiền và trung cấp giúp Nam Long (NLG) duy trì doanh số bán hàng ổn định bất chấp biến động thị trường. Hợp tác chiến lược với các đối tác Nhật Bản giúp NLG đảm bảo nguồn vốn rẻ và tiến độ xây dựng chất lượng cao. Khuyến nghị tích lũy vùng giá hấp dẫn.',
      category: 'doanh-nghiep',
      section: 'Doanh nghiệp',
    },
    {
      slug: 'nganh-ban-le-phuc-hoi-suc-mua-noi-dia',
      title: 'Ngành Bán lẻ: Phục hồi mạnh mẽ nhờ sức mua nội địa cải thiện',
      excerpt: 'Ngành bán lẻ hồi phục tích cực nhờ chính sách hỗ trợ kinh tế và các chương trình kích cầu tiêu dùng nội địa trong năm 2026.',
      content: 'Sau giai đoạn tái cơ cấu quyết liệt, các chuỗi bán lẻ lớn tại Việt Nam bắt đầu gặt hái thành quả. Doanh thu toàn ngành dự báo tăng trưởng 12% trong năm 2026. Bách Hóa Xanh (MWG) và Long Châu (FRT) là những điểm sáng lớn nhất nhờ mở rộng quy mô hiệu quả và tối ưu hóa chuỗi cung ứng.',
      category: 'ncpt-nganh',
      section: 'NCPT Ngành',
    },
    {
      slug: 'nganh-nang-luong-tai-tao-dien-viii',
      title: 'Ngành Năng lượng: Quy hoạch điện VIII và xu hướng phát triển nguồn điện sạch',
      excerpt: 'Các chính sách khuyến khích năng lượng xanh mở ra cơ hội tăng trưởng lớn cho các doanh nghiệp xây lắp và vận hành nguồn điện sạch.',
      content: 'Quy hoạch điện VIII tạo hành lang pháp lý vững chắc cho việc chuyển dịch năng lượng tại Việt Nam. Các dự án điện gió ngoài khơi và điện mặt trời mái nhà tự sản tự tiêu được ưu tiên phát triển. Các doanh nghiệp có năng lực quản lý dự án tốt và cấu trúc vốn lành mạnh như GEX, PC1 sẽ đi đầu đón sóng đầu tư hạ tầng điện.',
      category: 'ncpt-nganh',
      section: 'NCPT Ngành',
    },
  ];

  let blogCount = 0;
  for (const bd of blogDefs) {
    const cat = categoryMap[bd.category];
    if (!cat) {
      console.warn(`   ⚠️ Category not found: ${bd.category}, skipping blog: ${bd.slug}`);
      continue;
    }

    const existing = await prisma.blog.findUnique({ where: { slug: bd.slug } });
    if (existing) {
      console.log(`   ⏩ Blog already exists: ${bd.slug}`);
      blogCount++;
      continue;
    }

    await prisma.blog.create({
      data: {
        authorId: adminUser.id,
        categoryId: cat.id,
        slug: bd.slug,
        title: bd.title,
        excerpt: bd.excerpt,
        content: bd.content,
        status: BLOG_STATUS.PUBLISHED,
        visibility: CONTENT_VISIBILITY.PUBLIC,
        minTierAccess: bd.category === 'pro-research' ? SUBSCRIPTION_TIER.GOLD : SUBSCRIPTION_TIER.STANDARD,
        publishedAt: new Date(Date.now() - Math.random() * 14 * 24 * 3600 * 1000),
      },
    });
    blogCount++;
  }
  console.log(`   ✅ Seeded ${blogCount} blog articles`);

  // ═══════════════════════════════════════════════════════
  // 7. SUBSCRIPTION PLANS
  // ═══════════════════════════════════════════════════════
  console.log('\n💳 Seeding Subscription Plans...');

  const planDefs = [
    {
      name: 'STANDARD',
      description: 'Gói cơ bản - Truy cập tra cứu cổ phiếu và dữ liệu nền',
      features: 'Tra cứu cổ phiếu;Phân tích cơ bản;FinTop AI phân tích;Tool & dữ liệu cơ bản',
      tierLevel: SUBSCRIPTION_TIER.STANDARD,
      price: 0,
      durationDays: 365,
    },
    {
      name: 'PRO1',
      description: 'Gói PRO 3 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research',
      features: 'Bộ lọc cổ phiếu chuyên nghiệp;Nghiên cứu & phân tích chuyên sâu;Tool & dữ liệu nâng cao;PRO Data và PRO Analysis',
      tierLevel: SUBSCRIPTION_TIER.SILVER,
      price: 2500000,
      durationDays: 90,
    },
    {
      name: 'PRO2',
      description: 'Gói PRO 6 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research',
      features: 'Bộ lọc cổ phiếu chuyên nghiệp;Nghiên cứu & phân tích chuyên sâu;Tool & dữ liệu nâng cao;PRO Data và PRO Analysis',
      tierLevel: SUBSCRIPTION_TIER.SILVER,
      price: 4500000,
      durationDays: 180,
    },
    {
      name: 'PRO3',
      description: 'Gói PRO 12 tháng - Bộ lọc chuyên nghiệp, PRO Data & Research',
      features: 'Bộ lọc cổ phiếu chuyên nghiệp;Nghiên cứu & phân tích chuyên sâu;Tool & dữ liệu nâng cao;PRO Data và PRO Analysis',
      tierLevel: SUBSCRIPTION_TIER.SILVER,
      price: 6800000,
      durationDays: 365,
    },
    {
      name: 'GOLD',
      description: 'Gói V.I.P - Full PRO + Copy Trade + Kết nối Chuyên gia',
      features: 'Full đặc quyền PRO;Kết nối chuyên gia;Phân tích chuyên gia;Liên kết tài khoản chứng khoán',
      tierLevel: SUBSCRIPTION_TIER.GOLD,
      price: 5000000,
      durationDays: 180,
    },
    {
      name: 'DIAMOND',
      description: 'Gói Kim Cương - Full V.I.P + Cố vấn 1-1 Chuyên gia',
      features: 'Full đặc quyền PRO;Full đặc quyền V.I.P;Cố vấn 1-1 chuyên gia;Hỗ trợ chiến lược danh mục',
      tierLevel: SUBSCRIPTION_TIER.DIAMOND,
      price: 15000000,
      durationDays: 365,
    },
  ];

  for (const pd of planDefs) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: pd.name },
    });
    if (existing) {
      console.log(`   ⏩ Plan already exists: ${pd.name}. Updating features.`);
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: {
          features: pd.features,
          description: pd.description,
        },
      });
      continue;
    }
    await prisma.subscriptionPlan.create({
      data: {
        name: pd.name,
        description: pd.description,
        features: pd.features,
        tierLevel: pd.tierLevel,
        price: new Prisma.Decimal(pd.price),
        currency: 'VND',
        durationDays: pd.durationDays,
        status: RECORD_STATUS.ACTIVE,
      },
    });
    console.log(`   ✅ Plan: ${pd.name} (${pd.tierLevel}, ${pd.price.toLocaleString()} VND)`);
  }

  // ═══════════════════════════════════════════════════════
  // 8. VIP SIGNALS (Published for Copy Trade panel)
  // ═══════════════════════════════════════════════════════
  console.log('\n📡 Seeding VIP Signals...');

  const signalDefs = [
    {
      symbol: 'FPT',
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.PUBLISHED,
      minTier: SUBSCRIPTION_TIER.STANDARD,
      entryPrice: 132400,
      cutLoss: 124000,
      targetPrice: 155000,
      notes: '🔥 FPT breakout khỏi vùng tích lũy 128-132K. Target 1: 145K, Target 2: 155K. AI & Cloud là động lực chính. Volume xác nhận uptrend.',
    },
    {
      symbol: 'VCB',
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.PUBLISHED,
      minTier: SUBSCRIPTION_TIER.GOLD,
      entryPrice: 91200,
      cutLoss: 86000,
      targetPrice: 105000,
      notes: '📈 VCB đang trong uptrend dài hạn. NIM cải thiện, tín dụng tăng mạnh. Mua tích lũy dần tại vùng 89-92K.',
    },
    {
      symbol: 'HPG',
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.PUBLISHED,
      minTier: SUBSCRIPTION_TIER.GOLD,
      entryPrice: 29150,
      cutLoss: 26500,
      targetPrice: 34000,
      notes: '⚡ HPG phục hồi theo chu kỳ thép. Giá HRC tăng 15% từ đáy. Dung Quất 2 sẽ bổ sung công suất 20%. Entry: 28.5-29.5K.',
    },
    {
      symbol: 'MBB',
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.PUBLISHED,
      minTier: SUBSCRIPTION_TIER.GOLD,
      entryPrice: 25800,
      cutLoss: 23500,
      targetPrice: 30000,
      notes: '🏦 MBB banking star — ROE tăng mạnh, CASA cải thiện. P/B chỉ 1.4x — hấp dẫn so với nhóm. Target 30K.',
    },
    {
      symbol: 'SSI',
      direction: SIGNAL_DIRECTION.BUY,
      status: SIGNAL_STATUS.REACHED_TARGET,
      minTier: SUBSCRIPTION_TIER.GOLD,
      entryPrice: 32000,
      cutLoss: 29000,
      targetPrice: 38000,
      notes: '✅ ĐÃ ĐẠT MỤC TIÊU | SSI hưởng lợi khi thanh khoản thị trường tăng mạnh. Entry 32K → Target 38K đạt. Chốt lời +18.75%.',
    },
    {
      symbol: 'VND',
      direction: SIGNAL_DIRECTION.SELL,
      status: SIGNAL_STATUS.CUT_LOSS,
      minTier: SUBSCRIPTION_TIER.GOLD,
      entryPrice: 24000,
      cutLoss: 21500,
      targetPrice: 28000,
      notes: '⚠️ CẮT LỖ | VND giảm mạnh do tin xấu ngành, kích hoạt SL tại 21.5K. Cắt lỗ -10.4%.',
    },
  ];

  let signalCount = 0;
  for (const sd of signalDefs) {
    const stock = stockMap[sd.symbol];
    if (!stock) {
      console.warn(`   ⚠️ Stock not found for signal: ${sd.symbol}`);
      continue;
    }

    // Check for existing QA signal
    const existing = await prisma.vipSignal.findFirst({
      where: {
        stockId: stock.id,
        status: sd.status,
        entryPrice: new Prisma.Decimal(sd.entryPrice),
      },
    });
    if (existing) {
      console.log(`   ⏩ Signal already exists: ${sd.symbol} ${sd.status}`);
      signalCount++;
      continue;
    }

    const signal = await prisma.vipSignal.create({
      data: {
        stockId: stock.id,
        authorId: adminUser.id,
        source: SIGNAL_SOURCE.EXPERT,
        direction: sd.direction,
        status: sd.status,
        minTierAccess: sd.minTier,
        entryPrice: new Prisma.Decimal(sd.entryPrice),
        cutLossPrice: new Prisma.Decimal(sd.cutLoss),
        targetPrice: new Prisma.Decimal(sd.targetPrice),
        notes: sd.notes,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000),
        closedAt: sd.status !== SIGNAL_STATUS.PUBLISHED ? new Date() : null,
      },
    });

    // Create signal targets
    await prisma.signalTarget.create({
      data: {
        signalId: signal.id,
        price: new Prisma.Decimal(sd.targetPrice),
        targetIndex: 1,
        isHit: sd.status === SIGNAL_STATUS.REACHED_TARGET,
        hitAt: sd.status === SIGNAL_STATUS.REACHED_TARGET ? new Date() : null,
      },
    });

    signalCount++;
    console.log(`   ✅ Signal: ${sd.symbol} ${sd.direction} (${sd.status})`);
  }
  console.log(`   Total signals: ${signalCount}`);

  // ═══════════════════════════════════════════════════════
  // 9. RECOMMENDED PORTFOLIO
  // ═══════════════════════════════════════════════════════
  console.log('\n💼 Seeding Recommended Portfolios...');

  let portfolio = await prisma.recommendedPortfolio.findFirst({
    where: { name: 'FinTop Model Portfolio Q2/2026' },
  });

  if (!portfolio) {
    portfolio = await prisma.recommendedPortfolio.create({
      data: {
        name: 'FinTop Model Portfolio Q2/2026',
        description: 'Danh mục mẫu FinTop — Chiến lược cân bằng tăng trưởng Q2/2026. Tập trung Ngân hàng, Công nghệ, BĐS KCN.',
        managerId: adminUser.id,
        status: PORTFOLIO_STATUS.ACTIVE,
        minTierAccess: SUBSCRIPTION_TIER.GOLD,
        initialCapital: new Prisma.Decimal(1000000000), // 1 tỷ VND
        currentNav: new Prisma.Decimal(1085000000),     // 1.085 tỷ (NAV hiện tại)
        cashBalance: new Prisma.Decimal(150000000),      // 150 triệu tiền mặt
      },
    });

    // Add holdings
    const holdings = [
      { symbol: 'VCB', qty: 3000, avgPrice: 89500, currentPrice: 91200 },
      { symbol: 'FPT', qty: 2000, avgPrice: 126000, currentPrice: 132400 },
      { symbol: 'MBB', qty: 5000, avgPrice: 24200, currentPrice: 25800 },
      { symbol: 'HPG', qty: 4000, avgPrice: 27800, currentPrice: 29150 },
      { symbol: 'SSI', qty: 3000, avgPrice: 32000, currentPrice: 36500 },
    ];

    for (const h of holdings) {
      const stock = stockMap[h.symbol];
      if (!stock) continue;
      await prisma.portfolioHolding.upsert({
        where: {
          portfolioId_stockId: {
            portfolioId: portfolio.id,
            stockId: stock.id,
          },
        },
        update: {
          currentPrice: new Prisma.Decimal(h.currentPrice),
        },
        create: {
          portfolioId: portfolio.id,
          stockId: stock.id,
          quantity: BigInt(h.qty),
          avgEntryPrice: new Prisma.Decimal(h.avgPrice),
          currentPrice: new Prisma.Decimal(h.currentPrice),
        },
      });
    }
    console.log(`   ✅ Portfolio: ${portfolio.name} (${holdings.length} holdings)`);
  } else {
    console.log(`   ⏩ Portfolio already exists: ${portfolio.name}`);
  }

  // ═══════════════════════════════════════════════════════
  // 10. AUDIT LOG
  // ═══════════════════════════════════════════════════════
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'MOCK_DATA_SEED',
      tableName: 'system',
      recordId: '0',
      newValues: {
        note: 'Comprehensive mock data seed executed',
        stocks: Object.keys(stockMap).length,
        blogs: blogCount,
        signals: signalCount,
      },
      ipAddress: '127.0.0.1',
      userAgent: 'CLI Mock Data Seeder',
    },
  });

  // ═══════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Mock Data Seed Complete!');
  console.log('═'.repeat(60));
  console.log(`  Exchanges:     ${Object.keys(exchanges).length}`);
  console.log(`  Sectors:       ${sectorDefs.length}`);
  console.log(`  Industries:    ${Object.keys(industryMap).length}`);
  console.log(`  Stocks:        ${Object.keys(stockMap).length}`);
  console.log(`  Categories:    ${Object.keys(categoryMap).length}`);
  console.log(`  Blogs:         ${blogCount}`);
  console.log(`  Plans:         ${planDefs.length}`);
  console.log(`  Signals:       ${signalCount}`);
  console.log(`  Portfolios:    1`);
  console.log('═'.repeat(60));
  console.log('\n🎉 Frontend should now display data from backend!');
  console.log('   → Tra cứu cổ phiếu: GET /market/stocks');
  console.log('   → Bộ lọc cổ phiếu: GET /market/stocks');
  console.log('   → Nghiên cứu: GET /blogs');
  console.log('   → Copy Trade: GET /signals (requires auth)');
  console.log('   → Hội viên: GET /users/subscription/plans');
}

main()
  .catch((e) => {
    console.error('❌ Mock Data Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
