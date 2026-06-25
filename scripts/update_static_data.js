const fs = require('fs');
const path = require('path');

const EXTRACTED_DIR = path.join(__dirname, '..', 'data', 'extracted');
const DATA_DIR = path.join(__dirname, '..', 'data');

async function main() {
  console.log('🔄 Đang đồng bộ hóa dữ liệu di chuyển sang các tệp tĩnh Frontend...');

  const blogsPath = path.join(EXTRACTED_DIR, 'parsed_blogs.json');
  const clientsPath = path.join(EXTRACTED_DIR, 'parsed_clients.json');

  // 1. Update customers-data.js
  if (fs.existsSync(clientsPath)) {
    const clients = JSON.parse(fs.readFileSync(clientsPath, 'utf-8'));
    console.log(`  Parsed ${clients.length} clients.`);

    const staticCustomers = clients.map(client => {
      // Map tier to Capitalized string
      let tier = 'Standard';
      const accType = client.accountType || '';
      if (accType.includes('VIP2') || accType.includes('GOLD')) {
        tier = 'Gold';
      } else if (accType.includes('KIM_CUONG') || accType.includes('DIAMOND')) {
        tier = 'Diamond';
      } else if (accType.includes('SILVER')) {
        tier = 'Silver';
      }

      return {
        id: client.id,
        fullName: client.name || 'Khách hàng cũ',
        email: client.email || '',
        phone: client.phone || '',
        membership_tier: tier,
        status: 'active',
        brokerageAccount: client.brokerAccount || '',
        notes: `Tài khoản cũ di chuyển từ hệ thống. Quyền: ${client.role || 'Khách hàng'}. CTCK: ${client.brokerCompany || '-'}. Người quản lý: ${client.manager || '-'}`,
        updated_at: new Date().toISOString()
      };
    });

    const fileContent = `window.FINTOP_CUSTOMERS_DATA = ${JSON.stringify(staticCustomers, null, 4)};\n`;
    fs.writeFileSync(path.join(DATA_DIR, 'customers-data.js'), fileContent, 'utf-8');
    console.log('  ✅ Đã cập nhật data/customers-data.js');
  }

  // 2. Update research-data.js
  if (fs.existsSync(blogsPath)) {
    const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf-8'));
    console.log(`  Parsed ${blogs.length} blogs.`);

    const staticResearch = blogs.map(blog => {
      // Map category to Section
      let section = 'Thị trường';
      const cat = blog.category || '';
      if (cat.includes('doanh nghiệp')) {
        section = 'Doanh nghiệp';
      } else if (cat.includes('ngành')) {
        section = 'Ngành';
      } else if (cat.includes('VIP') || cat.includes('V.I.P')) {
        section = 'PRO Research';
      }

      // Map status
      const status = blog.status === 'Không hoạt động' ? 'Nháp' : 'Đã đăng';

      // Clean HTML tags for excerpt
      const cleanExcerpt = blog.contentHTML
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 160) + '...';

      // Parse and format time
      let publishTime = blog.createdDate || '';
      if (publishTime) {
        // e.g. "2026-04-17 23:07:18" -> "23:07 17/04/2026"
        const parts = publishTime.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
        if (parts) {
          publishTime = `${parts[4]}:${parts[5]} ${parts[3]}/${parts[2]}/${parts[1]}`;
        }
      }

      return {
        id: blog.id,
        section,
        category: blog.category || 'Chung',
        title: blog.title || 'Bài viết cũ',
        publishTime,
        status,
        author: blog.creator || 'FinTop Research',
        excerpt: cleanExcerpt,
        link: `chuyen-gia/index.html?id=${blog.id}` // Link pointing to the reader template on frontend
      };
    });

    const fileContent = `window.FINTOP_RESEARCH_DATA = ${JSON.stringify(staticResearch, null, 4)};\n`;
    fs.writeFileSync(path.join(DATA_DIR, 'research-data.js'), fileContent, 'utf-8');
    console.log('  ✅ Đã cập nhật data/research-data.js');
  }

  console.log('\n🎉 Đồng bộ dữ liệu Frontend hoàn tất!');
}

main().catch(console.error);
