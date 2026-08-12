const path = require('path');
const backendNodeModules = 'c:/Users/Admin/FINTOP_LANDING_PAGES/fintop-backend/node_modules';
require(path.join(backendNodeModules, 'dotenv')).config({ path: 'c:/Users/Admin/FINTOP_LANDING_PAGES/fintop-backend/.env' });
const { Pool } = require(path.join(backendNodeModules, 'pg'));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const all = await pool.query('SELECT id, slug, name FROM "categories" ORDER BY id ASC');
  const catMap = {};
  all.rows.forEach(r => { catMap[r.slug] = r.id; });

  const userRes = await pool.query("SELECT id FROM users WHERE email='admin@fintop.vn' LIMIT 1");
  const adminId = userRes.rows[0]?.id || 1;

  const sampleBlogs = [
    {
      slug: 'pro-data-top-10-co-phieu-dinh-luong-q2-2026',
      title: 'PRO Data | Top 10 cổ phiếu có chỉ số định lượng cao nhất Q2/2026',
      excerpt: 'Báo cáo độc quyền dành cho hội viên PRO: Bảng xếp hạng 10 cổ phiếu dẫn đầu về điểm Quant Score, trạng thái Model và vùng giá quản trị rủi ro.',
      content: '<p>Hệ thống FinTop PRO Data ghi nhận sự bứt phá mạnh mẽ của nhóm cổ phiếu vốn hóa lớn và nhóm ngành công nghệ.</p><p><strong>Top 1: FPT (Quant Score: 86)</strong> — Tín hiệu ENTRY vùng 128 - 132, QTRR: 18.</p><p><strong>Top 2: HPG (Quant Score: 78)</strong> — Tín hiệu SMALL ENTRY vùng 29.5 - 31.0, QTRR: 22.</p><p><strong>Top 3: VCB (Quant Score: 82)</strong> — Tín hiệu HOLD vùng 90 - 93, QTRR: 15.</p>',
      categoryId: catMap['pro-data'],
      minTier: 'SILVER',
    },
    {
      slug: 'dinh-luong-mo-hinh-quant-score-fpt-hpg-vcb',
      title: 'Định lượng | Mô hình Quant Score 2026: Phân tích sức mạnh kỹ thuật VNM, FPT, HPG',
      excerpt: 'Phân tích định lượng chuyên sâu các chỉ báo dòng tiền, động lượng ΔRSI và sức mạnh xu hướng RSI/MFI cho nhóm cổ phiếu trụ.',
      content: '<p>Mô hình định lượng Quant Data sử dụng dữ liệu chuỗi thời gian kết hợp các chỉ báo RSI, MFI và đường MA50/MA200 để xác định điểm đảo chiều dòng tiền.</p><p>Theo số liệu mới nhất, nhóm ngành Công nghệ dẫn đầu với độ rộng 78%, theo sau là Thép 64% và Ngân hàng 72%.</p>',
      categoryId: catMap['dinh-luong'],
      minTier: 'STANDARD',
    }
  ];

  for (const b of sampleBlogs) {
    const checkBlog = await pool.query('SELECT id FROM blogs WHERE slug=$1', [b.slug]);
    if (checkBlog.rows.length === 0) {
      await pool.query(`
        INSERT INTO blogs ("authorId", "categoryId", slug, title, excerpt, content, status, visibility, "minTierAccess", "publishedAt", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, 'PUBLISHED', 'PUBLIC', $7, NOW(), NOW(), NOW())
      `, [adminId, b.categoryId, b.slug, b.title, b.excerpt, b.content, b.minTier]);
      console.log(`✅ Seeded blog: ${b.slug}`);
    } else {
      console.log(`⏩ Blog already exists: ${b.slug}`);
    }
  }

  await pool.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
