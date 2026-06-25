/**
 * FinTop DATA - Data Extractor v2
 * Improved parsing based on actual HTML structure analysis
 * 
 * Fixes from v1:
 * - Login needs acp_checkbox parameter
 * - Library uses TABLE format with <tr> rows, not cards
 * - About uses card-title format with direct href links
 * - Des returns JSON, not HTML
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://fintopdata.vn';
const LOGIN_EMAIL = 'tuannv7105@gmail.com';
const LOGIN_PASSWORD = 'tuantuan2k5ZXC';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'scraped');
const EXTRACTED_DIR = path.join(__dirname, '..', 'data', 'extracted');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function saveJSON(dir, filename, data) {
  ensureDir(dir);
  const fp = path.join(dir, filename);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  💾 ${fp}`);
}

function stripHTML(html) {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, '')
    .replace(/\s+/g, ' ').trim();
}

function extractCSRFToken(html) {
  const m = html.match(/name="_token"[^>]*value="([^"]+)"/);
  if (m) return m[1];
  const m2 = html.match(/id="_token"[^>]*value="([^"]+)"/);
  return m2 ? m2[1] : null;
}

function extractCookiesFromHeaders(headers) {
  const cookies = {};
  const raw = headers.raw?.()?.['set-cookie'] || [];
  for (const c of raw) {
    const [nv] = c.split(';');
    const eq = nv.indexOf('=');
    if (eq > 0) cookies[nv.slice(0, eq).trim()] = nv.slice(eq + 1).trim();
  }
  // Fallback for newer Node fetch
  if (raw.length === 0) {
    const sc = headers.getSetCookie?.() || [];
    for (const c of sc) {
      const [nv] = c.split(';');
      const eq = nv.indexOf('=');
      if (eq > 0) cookies[nv.slice(0, eq).trim()] = nv.slice(eq + 1).trim();
    }
  }
  return cookies;
}

// ===========================================
// HTTP CLIENT
// ===========================================
class Client {
  constructor() { this.cookies = {}; }

  cookieStr() { return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; '); }

  async req(url, opts = {}) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9',
      ...opts.headers,
    };
    if (Object.keys(this.cookies).length) headers['Cookie'] = this.cookieStr();

    let res = await fetch(url, { ...opts, headers, redirect: 'manual' });
    Object.assign(this.cookies, extractCookiesFromHeaders(res.headers));

    let redir = 0;
    while ((res.status === 301 || res.status === 302 || res.status === 303) && redir < 10) {
      const loc = res.headers.get('location');
      if (!loc) break;
      const nextUrl = loc.startsWith('http') ? loc : new URL(loc, url).href;
      res = await fetch(nextUrl, { headers: { ...headers, Cookie: this.cookieStr() }, redirect: 'manual' });
      Object.assign(this.cookies, extractCookiesFromHeaders(res.headers));
      redir++;
    }
    return res;
  }

  async get(url) { return (await this.req(url)).text(); }
  async post(url, body) {
    return this.req(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString()
    });
  }
}

// ===========================================
// PARSERS (based on actual HTML structure)
// ===========================================

/** Parse Library table: <tr> with STT, content, Google Drive link */
function parseLibraryTable(html) {
  const items = [];
  const trPattern = /<tr>([\s\S]*?)<\/tr>/gi;
  let match;
  while ((match = trPattern.exec(html)) !== null) {
    const row = match[1];
    
    // Skip header rows
    if (row.includes('thead') || row.includes('title_table')) continue;
    
    // Extract STT (number)
    const sttMatch = row.match(/<td[^>]*align="center"[^>]*>(\d+)/);
    
    // Extract content/title
    const titleMatch = row.match(/onclick="[^"]*">\s*([\s\S]*?)\s*<\/td>/);
    const title = titleMatch ? stripHTML(titleMatch[1]).trim() : '';
    
    // Extract Google Drive link
    const linkMatch = row.match(/href="([^"]*drive\.google\.com[^"]*)"/);
    
    // Extract ID from checkbox
    const idMatch = row.match(/value="([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/);
    
    if (title || linkMatch) {
      items.push({
        stt: sttMatch ? parseInt(sttMatch[1]) : items.length + 1,
        id: idMatch ? idMatch[1] : null,
        title: title,
        driveLink: linkMatch ? linkMatch[1] : null,
      });
    }
  }
  return items;
}

/** Parse About articles: card format with images, titles, dates, content */
function parseAboutArticles(html) {
  const articles = [];
  
  // Pattern: each article block starts with col-sm-6 col-lg-12
  const blockPattern = /<div class="col-sm-6 col-lg-12 text-decoration-none[^"]*">([\s\S]*?)(?=<div class="col-sm-6 col-lg-12|<\/ul>)/gi;
  let match;
  while ((match = blockPattern.exec(html)) !== null) {
    const block = match[1];
    const article = {};
    
    // ID from href
    const idMatch = block.match(/\/client\/about\/reader\/([0-9a-f-]+)/);
    if (idMatch) article.id = idMatch[1];
    
    // Image
    const imgMatch = block.match(/src="(https:\/\/fintopdata\.vn\/file-image-client[^"]+)"/);
    if (imgMatch) article.image = imgMatch[1];
    
    // Title
    const titleMatch = block.match(/<h5[^>]*class="card-title[^"]*"[^>]*>([\s\S]*?)<\/h5>/i);
    if (titleMatch) article.title = stripHTML(titleMatch[1]);
    
    // Date and views
    const dateMatch = block.match(/(\d+\s+(?:tháng|ngày|giờ|phút|năm)\s+trước)\s*\((\d{2}:\d{2}\s+\d{2}\/\d{2}\/\d{4})\)/);
    if (dateMatch) {
      article.relativeDate = dateMatch[1];
      article.date = dateMatch[2];
    }
    
    const viewMatch = block.match(/fa-eye"><\/i>\s*(\d+)/);
    if (viewMatch) article.views = parseInt(viewMatch[1]);
    
    // Full content from blogReader div
    const contentMatch = block.match(/<div class="blogReader">([\s\S]*?)<\/div>/i);
    if (contentMatch) {
      article.contentHTML = contentMatch[1];
      article.contentText = stripHTML(contentMatch[1]);
    }
    
    if (article.id || article.title) {
      articles.push(article);
    }
  }
  return articles;
}

// ===========================================
// MAIN EXTRACTOR
// ===========================================
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  FinTop DATA Extractor v2 (Improved Parser) ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  ensureDir(EXTRACTED_DIR);
  const client = new Client();
  const allData = { metadata: { scrapedAt: new Date().toISOString(), source: BASE_URL } };

  // ===================================
  // 1. PARSE ALREADY-SCRAPED RAW FILES
  // ===================================
  console.log('━━━ PHASE 1: Parse dữ liệu từ raw HTML đã scrape ━━━\n');

  // 1a. Library (Cẩm nang đầu tư)
  console.log('📚 Parsing Cẩm nang đầu tư...');
  const libraryCategories = {
    'TU_SACH_DAU_TU': 'Tủ sách đầu tư',
    'KT_TA': 'Kiến thức phân tích kỹ thuật (TA)',
    'KT_FA': 'Kiến thức phân tích cơ bản (FA)',
    'KT_TTCK': 'Kiến thức chứng khoán, TTCK'
  };
  
  allData.library = {};
  for (const [cat, name] of Object.entries(libraryCategories)) {
    const rawFile = path.join(OUTPUT_DIR, 'library', `${cat}_raw.html`);
    if (fs.existsSync(rawFile)) {
      const html = fs.readFileSync(rawFile, 'utf-8');
      const items = parseLibraryTable(html);
      allData.library[cat] = { name, category: cat, items, count: items.length };
      console.log(`  ✅ ${name}: ${items.length} items`);
      saveJSON(path.join(EXTRACTED_DIR, 'library'), `${cat}.json`, allData.library[cat]);
    } else {
      console.log(`  ⚠️ Raw file not found for ${cat}`);
    }
  }

  // 1b. About (Báo cáo phân tích)
  console.log('\n📊 Parsing Báo cáo phân tích...');
  const aboutSections = [
    { endpoint: 'loadListTHTT', name: 'Thị trường tổng hợp' },
    { endpoint: 'loadListTKP', name: 'VIP Đầu tư' },
    { endpoint: 'loadListPTN', name: 'BCPT Ngành' },
    { endpoint: 'loadListPTDN', name: 'BCPT Doanh nghiệp' },
  ];
  
  allData.about = {};
  for (const section of aboutSections) {
    const rawFile = path.join(OUTPUT_DIR, 'about', `${section.endpoint}_page1_raw.html`);
    if (fs.existsSync(rawFile)) {
      const html = fs.readFileSync(rawFile, 'utf-8');
      const articles = parseAboutArticles(html);
      
      // Extract total count from pagination
      const totalMatch = html.match(/Có tất cả (\d+)\/(\d+) bài viết/);
      const total = totalMatch ? parseInt(totalMatch[2]) : articles.length;
      
      allData.about[section.endpoint] = {
        name: section.name,
        articles,
        count: articles.length,
        totalOnServer: total
      };
      console.log(`  ✅ ${section.name}: ${articles.length} articles (total on server: ${total})`);
      saveJSON(path.join(EXTRACTED_DIR, 'about'), `${section.endpoint}.json`, allData.about[section.endpoint]);
    } else {
      console.log(`  ⚠️ Raw file not found for ${section.endpoint}`);
    }
  }

  // 1c. Static pages — extract key content
  console.log('\n📄 Parsing trang tĩnh...');
  allData.staticPages = {};
  const staticFiles = ['Trang_chủ', 'Giới_thiệu', 'Đặc_quyền_hội_viên'];
  for (const name of staticFiles) {
    const rawFile = path.join(OUTPUT_DIR, 'static', `${name}.html`);
    if (fs.existsSync(rawFile)) {
      const html = fs.readFileSync(rawFile, 'utf-8');
      allData.staticPages[name] = {
        name,
        sizeBytes: html.length,
        textContent: stripHTML(html).substring(0, 5000) + '...',
      };
      console.log(`  ✅ ${name}: ${html.length} bytes`);
    }
  }

  // ===================================
  // 2. LOGIN & FETCH MORE DATA
  // ===================================
  console.log('\n━━━ PHASE 2: Đăng nhập & Tải thêm dữ liệu ━━━\n');

  // Step 1: Get login page + CSRF token + session cookie
  console.log('🔐 Đăng nhập...');
  const loginPage = await client.get(`${BASE_URL}/login`);
  const token = extractCSRFToken(loginPage);
  console.log(`  🔑 Token: ${token ? token.substring(0, 15) + '...' : 'NOT FOUND'}`);
  console.log(`  🍪 Session cookies: ${Object.keys(client.cookies).join(', ')}`);

  // Step 2: POST login with acp_checkbox (required!)
  const loginResp = await client.post(`${BASE_URL}/system/home`, {
    _token: token,
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
    acp_checkbox: 'on',
  });

  const loginBody = await loginResp.text();
  const isLoggedIn = loginBody.includes('Đăng xuất') || 
                     !loginBody.includes('Đăng nhập</h3>') ||
                     loginBody.includes('Chào mừng');

  console.log(`  📬 Status: ${loginResp.status}`);
  console.log(`  🍪 Cookies: ${Object.keys(client.cookies).join(', ')}`);
  console.log(`  ${isLoggedIn ? '✅ Đăng nhập thành công!' : '⚠️ Đăng nhập có thể thất bại'}`);
  
  ensureDir(path.join(EXTRACTED_DIR, 'admin'));
  fs.writeFileSync(path.join(EXTRACTED_DIR, 'admin', '_login_response.html'), loginBody, 'utf-8');

  // Step 3: Try to navigate admin pages
  if (isLoggedIn || loginResp.status === 200) {
    console.log('\n👑 Kiểm tra Admin Panel...');
    
    // Try main admin routes specific to FinTop Laravel structure
    const adminRoutes = [
      // System routes (main admin area for FinTop)
      '/system/blog/index',
      '/system/about/index',
      '/system/library/index',
      '/system/des/index',
      '/system/member/index',
      '/system/user/index',
      '/system/datafinancial/index',
      '/system/recommendations/index',
      '/system/notification/index',
      '/system/setting/index',
      // Try loadList endpoints (AJAX)
      '/system/blog/loadList',
      '/system/about/loadList',
      '/system/library/loadList',
      '/system/des/loadList',
      '/system/member/loadList',
      '/system/user/loadList',
    ];

    const foundPages = [];
    for (const route of adminRoutes) {
      try {
        await delay(300);
        const html = await client.get(`${BASE_URL}${route}`);
        
        if (html.length > 1000 && !html.includes('Not Found') && !html.includes('404')) {
          console.log(`  ✅ ${route} (${html.length} bytes)`);
          const safeName = route.replace(/\//g, '_').replace(/^_/, '');
          fs.writeFileSync(path.join(EXTRACTED_DIR, 'admin', `${safeName}.html`), html, 'utf-8');
          foundPages.push({ route, size: html.length });
          
          // Extract emails from any page
          const emails = [...new Set(html.match(/[\w.-]+@[\w.-]+\.\w{2,}/g) || [])];
          if (emails.length > 0) {
            console.log(`    📧 Found ${emails.length} emails`);
          }
          
          // If this looks like a user list (table with emails)
          if (route.includes('user') || route.includes('member')) {
            const userRows = parseLibraryTable(html); // Reuse table parser
            if (userRows.length > 0) {
              console.log(`    👥 Found ${userRows.length} user rows`);
              saveJSON(path.join(EXTRACTED_DIR, 'admin'), 'users_list.json', userRows);
            }
          }
        } else {
          console.log(`  ❌ ${route} (${html.length > 100 ? 'Not Found/Redirected' : 'Empty'})`);
        }
      } catch (e) {
        console.log(`  ❌ ${route} (${e.message})`);
      }
    }

    allData.admin = { foundPages };
    saveJSON(path.join(EXTRACTED_DIR, 'admin'), '_found_pages.json', foundPages);

    // Step 4: Fetch VIP content with login session
    console.log('\n💎 Tải nội dung VIP...');
    
    // Re-scrape Báo cáo phân tích sections that returned 0 (VIP/PTN/PTDN might need login)
    const aboutPage = await client.get(`${BASE_URL}/client/about/index`);
    const aboutToken = extractCSRFToken(aboutPage);
    
    const vipSections = [
      { endpoint: 'loadListTKP', category: 'BAO_CAO_PTDTVIP', name: 'VIP Đầu tư' },
      { endpoint: 'loadListPTN', category: 'BAO_CAO_PTN', name: 'BCPT Ngành' },
      { endpoint: 'loadListPTDN', category: 'BAO_CAO_PTDN', name: 'BCPT Doanh nghiệp' },
    ];

    for (const section of vipSections) {
      try {
        await delay(500);
        const url = `${BASE_URL}/client/about/${section.endpoint}?_token=${aboutToken || ''}&offset=1&limit=50&category=${section.category}`;
        const html = await client.get(url);
        
        const articles = parseAboutArticles(html);
        const totalMatch = html.match(/Có tất cả (\d+)\/(\d+) bài viết/);
        const total = totalMatch ? parseInt(totalMatch[2]) : 0;
        
        console.log(`  💎 ${section.name}: ${articles.length} articles (total: ${total})`);
        
        if (articles.length > 0 || html.length > 1000) {
          ensureDir(path.join(EXTRACTED_DIR, 'about_vip'));
          fs.writeFileSync(
            path.join(EXTRACTED_DIR, 'about_vip', `${section.endpoint}_raw.html`), html, 'utf-8'
          );
          saveJSON(path.join(EXTRACTED_DIR, 'about_vip'), `${section.endpoint}.json`, {
            name: section.name,
            articles,
            count: articles.length,
            totalOnServer: total
          });
          
          // Update main data
          allData.about[section.endpoint] = {
            name: section.name,
            articles,
            count: articles.length,
            totalOnServer: total
          };
        }
      } catch (e) {
        console.log(`  ❌ ${section.name}: ${e.message}`);
      }
    }

    // Step 5: Try Des/Hướng dẫn with login session
    console.log('\n📘 Tải Hướng dẫn đầu tư A-Z (with login)...');
    const desCategories = [
      { id: '0afd21fe-3cfd-4a9d-8e20-05306de8f751', name: 'Hướng dẫn giao dịch' },
      { id: '22afb64d-1c8e-44d1-a31d-427b6ca8187d', name: 'Hướng dẫn đầu tư' },
      { id: '2c1d2afb-d4bf-4813-b71b-ddefe4c547a7', name: 'Phân tích giao dịch biểu đồ (TA)' },
      { id: '3cfcbe8a-8fea-4826-9fa6-1571e550c86f', name: 'Phân tích tài chính DN (FA)' },
      { id: 'bff21b1d-dd9e-43d0-8c48-eb05c2d15559', name: 'Bài viết tổng hợp' },
    ];
    
    allData.des = {};
    for (const cat of desCategories) {
      try {
        await delay(500);
        const url = `${BASE_URL}/client/des/list?id=${cat.id}`;
        const response = await client.get(url);
        
        // Des returns JSON
        let parsed;
        try {
          parsed = JSON.parse(response);
        } catch {
          parsed = { raw: response };
        }
        
        console.log(`  📘 ${cat.name}: ${parsed.content ? 'Has content' : 'Empty'} (${response.length} bytes)`);
        
        if (parsed.content && parsed.content.length > 0) {
          // Parse submenu content if it's HTML
          const items = [];
          if (typeof parsed.content === 'string') {
            // Extract items from submenu HTML
            const itemPattern = /onclick="reader\('([^']+)'\)"[^>]*>([\s\S]*?)<\/(?:span|a|div|li|h5)/gi;
            let m;
            while ((m = itemPattern.exec(parsed.content)) !== null) {
              items.push({ id: m[1], title: stripHTML(m[2]) });
            }
          }
          
          allData.des[cat.id] = {
            name: cat.name,
            categoryId: cat.id,
            items,
            rawContent: parsed.content,
            count: items.length
          };
        } else {
          allData.des[cat.id] = { name: cat.name, categoryId: cat.id, items: [], count: 0, empty: true };
        }

        ensureDir(path.join(EXTRACTED_DIR, 'des'));
        saveJSON(path.join(EXTRACTED_DIR, 'des'), `${cat.id}.json`, allData.des[cat.id]);
        
      } catch (e) {
        console.log(`  ❌ ${cat.name}: ${e.message}`);
      }
    }
    
    // Also try fetching the main des page which loads content differently
    try {
      const desPage = await client.get(`${BASE_URL}/client/des/index`);
      fs.writeFileSync(path.join(EXTRACTED_DIR, 'des', '_des_index.html'), desPage, 'utf-8');
      console.log(`  📄 Des index page: ${desPage.length} bytes`);
    } catch (e) { /* ignore */ }
  }

  // ===================================
  // 3. SAVE COMPLETE DATA
  // ===================================
  console.log('\n━━━ PHASE 3: Lưu dữ liệu tổng hợp ━━━\n');
  
  // Remove large HTML blobs from the complete data to keep it manageable
  const summary = JSON.parse(JSON.stringify(allData));
  if (summary.staticPages) {
    for (const key of Object.keys(summary.staticPages)) {
      delete summary.staticPages[key].textContent;
    }
  }
  
  saveJSON(EXTRACTED_DIR, '_complete_extracted_data.json', allData);
  
  // ===================================
  // SUMMARY
  // ===================================
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║           📊 EXTRACTION SUMMARY             ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('📚 CẨM NANG ĐẦU TƯ (Library):');
  let totalLibrary = 0;
  for (const [cat, data] of Object.entries(allData.library || {})) {
    console.log(`   ${data.name}: ${data.count} sách/tài liệu`);
    totalLibrary += data.count;
  }
  console.log(`   → Tổng: ${totalLibrary} items`);

  console.log('\n📊 BÁO CÁO PHÂN TÍCH (About):');
  let totalAbout = 0;
  for (const [ep, data] of Object.entries(allData.about || {})) {
    console.log(`   ${data.name}: ${data.count} articles (server total: ${data.totalOnServer})`);
    totalAbout += data.count;
  }
  console.log(`   → Tổng: ${totalAbout} articles`);

  console.log('\n📘 HƯỚNG DẪN ĐẦU TƯ A-Z (Des):');
  let totalDes = 0;
  for (const [id, data] of Object.entries(allData.des || {})) {
    console.log(`   ${data.name}: ${data.count} items${data.empty ? ' (empty/requires access)' : ''}`);
    totalDes += data.count;
  }
  console.log(`   → Tổng: ${totalDes} items`);

  console.log('\n📄 TRANG TĨNH:');
  for (const [name, data] of Object.entries(allData.staticPages || {})) {
    console.log(`   ${name}: ${data.sizeBytes} bytes`);
  }

  if (allData.admin?.foundPages) {
    console.log(`\n👑 ADMIN PAGES: ${allData.admin.foundPages.length} accessible`);
    for (const p of allData.admin.foundPages) {
      console.log(`   ${p.route}: ${p.size} bytes`);
    }
  }

  console.log(`\n💾 Extracted data saved to: ${EXTRACTED_DIR}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
