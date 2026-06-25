/**
 * FinTop DATA - Website Data Scraper
 * Trích xuất toàn bộ dữ liệu từ website cũ fintopdata.vn
 * 
 * Dữ liệu trích xuất:
 * 1. Cẩm nang đầu tư (Library) - 4 loại
 * 2. Báo cáo phân tích (About) - 4 loại
 * 3. Hướng dẫn đầu tư A-Z (Des) - 5 danh mục
 * 4. Nội dung trang tĩnh
 * 5. Admin data (nếu đăng nhập được)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ============================================
// CONFIG
// ============================================
const BASE_URL = 'https://fintopdata.vn';
const LOGIN_EMAIL = 'tuannv7105@gmail.com';
const LOGIN_PASSWORD = 'tuantuan2k5ZXC';

const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'scraped');

// Categories for each section
const LIBRARY_CATEGORIES = ['TU_SACH_DAU_TU', 'KT_TA', 'KT_FA', 'KT_TTCK'];
const LIBRARY_NAMES = {
  'TU_SACH_DAU_TU': 'Tủ sách đầu tư',
  'KT_TA': 'Kiến thức phân tích kỹ thuật (TA)',
  'KT_FA': 'Kiến thức phân tích cơ bản (FA)',
  'KT_TTCK': 'Kiến thức chứng khoán, TTCK'
};

const ABOUT_ENDPOINTS = [
  { name: 'Thị trường tổng hợp', endpoint: 'loadListTHTT', category: 'BAO_CAO_TTTH' },
  { name: 'VIP Đầu tư', endpoint: 'loadListTKP', category: 'BAO_CAO_PTDTVIP' },
  { name: 'BCPT Ngành', endpoint: 'loadListPTN', category: 'BAO_CAO_PTN' },
  { name: 'BCPT Doanh nghiệp', endpoint: 'loadListPTDN', category: 'BAO_CAO_PTDN' }
];

const DES_CATEGORIES = [
  { id: '0afd21fe-3cfd-4a9d-8e20-05306de8f751', name: 'Hướng dẫn giao dịch' },
  { id: '22afb64d-1c8e-44d1-a31d-427b6ca8187d', name: 'Hướng dẫn đầu tư' },
  { id: '2c1d2afb-d4bf-4813-b71b-ddefe4c547a7', name: 'Phân tích giao dịch biểu đồ (TA)' },
  { id: '3cfcbe8a-8fea-4826-9fa6-1571e550c86f', name: 'Phân tích tài chính DN (FA)' },
  { id: 'bff21b1d-dd9e-43d0-8c48-eb05c2d15559', name: 'Bài viết tổng hợp' }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Simple delay */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Ensure directory exists */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Save JSON data to file */
function saveJSON(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  ensureDir(path.dirname(filepath));
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  💾 Saved: ${filepath}`);
}

/** Save HTML content to file */
function saveHTML(filename, html) {
  const filepath = path.join(OUTPUT_DIR, filename);
  ensureDir(path.dirname(filepath));
  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`  💾 Saved: ${filepath}`);
}

/** Extract CSRF token from HTML */
function extractCSRFToken(html) {
  const match = html.match(/name="_token"\s+(?:id="_token"\s+)?value="([^"]+)"/);
  if (match) return match[1];
  const match2 = html.match(/id="_token"\s+(?:name="_token"\s+)?value="([^"]+)"/);
  if (match2) return match2[1];
  const match3 = html.match(/value="([^"]+)"\s*>/);
  return match3 ? match3[1] : null;
}

/** Extract cookies from response headers */
function extractCookies(headers) {
  const setCookies = headers.getSetCookie ? headers.getSetCookie() : [];
  const cookies = {};
  for (const cookie of setCookies) {
    const [nameVal] = cookie.split(';');
    const [name, val] = nameVal.split('=');
    if (name && val) {
      cookies[name.trim()] = val.trim();
    }
  }
  return cookies;
}

/** Format cookies for request header */
function formatCookies(cookies) {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

/** Basic HTML tag stripping for text extraction */
function stripHTML(html) {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract article links from HTML list */
function extractArticleLinks(html) {
  const articles = [];
  // Look for blog post patterns - various formats the site uses
  const patterns = [
    // Pattern 1: onclick="JS_About.blogReader('id')" or onclick="reader('id')"
    /(?:blogReader|reader)\(['"]([^'"]+)['"]\)/g,
    // Pattern 2: href="/client/about/reader/id"
    /href="[^"]*\/reader\/([^"]+)"/g,
    // Pattern 3: onclick="JS_Library.seeVideo('id')"
    /seeVideo\(['"]([^'"]+)['"]\)/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (!articles.includes(match[1])) {
        articles.push(match[1]);
      }
    }
  }
  return articles;
}

/** Extract article data from HTML table rows */
function extractArticlesFromHTML(html) {
  const articles = [];
  
  // Extract titles
  const titlePattern = /<td[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
  const imgPattern = /<img[^>]*src="([^"]+)"[^>]*>/gi;
  const linkPattern = /(?:blogReader|reader)\(['"]([^'"]+)['"]\)/g;
  const datePattern = /(\d{2}[-\/]\d{2}[-\/]\d{4})/g;
  
  // Try to parse table rows
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const row = rowMatch[1];
    const article = {};
    
    // Extract ID from reader link
    const idMatch = row.match(/(?:blogReader|reader)\(['"]([^'"]+)['"]\)/);
    if (idMatch) article.id = idMatch[1];
    
    // Extract image
    const imgMatch = row.match(/<img[^>]*src="([^"]+)"[^>]*>/);
    if (imgMatch) article.image = imgMatch[1];
    
    // Extract title
    const titleMatch = row.match(/class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/(?:td|div|span|a|p)>/i);
    if (titleMatch) article.title = stripHTML(titleMatch[1]);
    
    // Extract date
    const dateMatch = row.match(/(\d{2}[-\/]\d{2}[-\/]\d{4})/);
    if (dateMatch) article.date = dateMatch[1];
    
    // Extract summary/blogReader content
    const blogReaderMatch = row.match(/class="[^"]*blogReader[^"]*"[^>]*>([\s\S]*?)<\/(?:td|div|span)>/i);
    if (blogReaderMatch) article.summary = stripHTML(blogReaderMatch[1]);
    
    if (article.id || article.title) {
      articles.push(article);
    }
  }
  
  return articles;
}

/** Extract list items from des/list response */
function extractDesItems(html) {
  const items = [];
  
  // Pattern for submenu-child items
  const itemPattern = /reader\(['"]([^'"]+)['"]\)[^>]*>[\s\S]*?<(?:h5|span|p|div)[^>]*>([\s\S]*?)<\/(?:h5|span|p|div)>/gi;
  let match;
  while ((match = itemPattern.exec(html)) !== null) {
    items.push({
      id: match[1],
      title: stripHTML(match[2])
    });
  }
  
  // Also try simple link patterns
  const linkPattern = /reader\(['"]([^'"]+)['"]\)/g;
  while ((match = linkPattern.exec(html)) !== null) {
    if (!items.find(i => i.id === match[1])) {
      items.push({ id: match[1], title: '' });
    }
  }
  
  return items;
}

// ============================================
// HTTP CLIENT with Cookie support
// ============================================
class HttpClient {
  constructor() {
    this.cookies = {};
    this.csrfToken = null;
  }

  async fetch(url, options = {}) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      ...options.headers
    };

    if (Object.keys(this.cookies).length > 0) {
      headers['Cookie'] = formatCookies(this.cookies);
    }

    const fetchOptions = {
      ...options,
      headers,
      redirect: 'manual' // Handle redirects manually to capture cookies
    };

    try {
      let response = await fetch(url, fetchOptions);
      
      // Capture cookies
      const newCookies = extractCookies(response.headers);
      Object.assign(this.cookies, newCookies);
      
      // Follow redirects manually (to capture cookies at each step)
      let redirectCount = 0;
      while ((response.status === 301 || response.status === 302 || response.status === 303) && redirectCount < 10) {
        const location = response.headers.get('location');
        if (!location) break;
        
        const redirectUrl = location.startsWith('http') ? location : new URL(location, url).href;
        console.log(`  ↪ Redirect to: ${redirectUrl}`);
        
        response = await fetch(redirectUrl, {
          headers: {
            ...headers,
            'Cookie': formatCookies(this.cookies)
          },
          redirect: 'manual'
        });
        
        const redirectCookies = extractCookies(response.headers);
        Object.assign(this.cookies, redirectCookies);
        redirectCount++;
      }
      
      return response;
    } catch (error) {
      console.error(`  ❌ Fetch error for ${url}: ${error.message}`);
      throw error;
    }
  }

  async getText(url) {
    const response = await this.fetch(url);
    return await response.text();
  }

  async postForm(url, formData) {
    const body = new URLSearchParams(formData).toString();
    const response = await this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body
    });
    return response;
  }
}

// ============================================
// MAIN SCRAPER
// ============================================
class FinTopScraper {
  constructor() {
    this.client = new HttpClient();
    this.results = {
      library: {},
      about: {},
      des: {},
      staticPages: {},
      admin: {},
      users: [],
      metadata: {
        scrapedAt: new Date().toISOString(),
        source: BASE_URL
      }
    };
  }

  async run() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  FinTop DATA - Website Data Scraper      ║');
    console.log('║  Trích xuất dữ liệu từ fintopdata.vn    ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    ensureDir(OUTPUT_DIR);

    // Phase 1: Public content
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 PHASE 1: Scrape nội dung công khai');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await this.scrapeLibrary();
    await delay(1000);
    
    await this.scrapeAbout();
    await delay(1000);
    
    await this.scrapeDes();
    await delay(1000);
    
    await this.scrapeStaticPages();
    await delay(1000);

    // Phase 2: Login & Admin content
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 PHASE 2: Đăng nhập & Scrape Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const loggedIn = await this.login();
    if (loggedIn) {
      await this.scrapeAdmin();
      await delay(1000);
      await this.scrapeVIPContent();
    }

    // Save complete results
    saveJSON('_complete_data.json', this.results);

    // Print summary
    this.printSummary();
  }

  // ========================================
  // LIBRARY (Cẩm nang đầu tư)
  // ========================================
  async scrapeLibrary() {
    console.log('\n📚 Scraping Cẩm nang đầu tư...');
    
    // First, get the library page to obtain CSRF token
    const libraryPage = await this.client.getText(`${BASE_URL}/client/library/index`);
    const token = extractCSRFToken(libraryPage);
    console.log(`  🔑 CSRF Token: ${token ? token.substring(0, 10) + '...' : 'NOT FOUND'}`);

    for (const category of LIBRARY_CATEGORIES) {
      console.log(`\n  📁 Category: ${LIBRARY_NAMES[category]}`);
      
      try {
        const url = `${BASE_URL}/client/library/loadList?cate=${category}&_token=${token || ''}`;
        const html = await this.client.getText(url);
        
        // Save raw HTML
        saveHTML(`library/${category}_raw.html`, html);
        
        // Extract article data
        const articles = extractArticlesFromHTML(html);
        const articleLinks = extractArticleLinks(html);
        
        console.log(`  📝 Found ${articles.length} articles, ${articleLinks.length} links`);

        // Try to fetch individual article content if we have reader links
        const fullArticles = [];
        for (const link of articleLinks) {
          try {
            await delay(500); // Be nice to the server
            const articleUrl = `${BASE_URL}/client/library/seeVideo?id=${link}`;
            const articleHtml = await this.client.getText(articleUrl);
            fullArticles.push({
              id: link,
              content: articleHtml,
              textContent: stripHTML(articleHtml)
            });
            console.log(`    ✅ Fetched article: ${link.substring(0, 20)}...`);
          } catch (e) {
            console.log(`    ⚠️ Failed to fetch article: ${link}`);
          }
        }

        this.results.library[category] = {
          name: LIBRARY_NAMES[category],
          category: category,
          rawHTML: html,
          articles: articles,
          articleLinks: articleLinks,
          fullArticles: fullArticles,
          count: Math.max(articles.length, articleLinks.length)
        };

        // Save individual category data
        saveJSON(`library/${category}.json`, this.results.library[category]);

      } catch (error) {
        console.log(`  ❌ Error scraping ${category}: ${error.message}`);
      }
      
      await delay(800);
    }
  }

  // ========================================
  // ABOUT (Báo cáo phân tích)
  // ========================================
  async scrapeAbout() {
    console.log('\n📊 Scraping Báo cáo phân tích...');

    // Get the about page for CSRF token
    const aboutPage = await this.client.getText(`${BASE_URL}/client/about/index`);
    const token = extractCSRFToken(aboutPage);

    for (const section of ABOUT_ENDPOINTS) {
      console.log(`\n  📁 Section: ${section.name}`);
      
      const allArticles = [];
      let page = 1;
      const perPage = 50; // Get more per page to reduce requests
      let hasMore = true;

      while (hasMore) {
        try {
          const url = `${BASE_URL}/client/about/${section.endpoint}?_token=${token || ''}&offset=${page}&limit=${perPage}&category=${section.category}`;
          const html = await this.client.getText(url);
          
          if (page === 1) {
            saveHTML(`about/${section.endpoint}_page1_raw.html`, html);
          }
          
          const articles = extractArticlesFromHTML(html);
          const articleLinks = extractArticleLinks(html);
          
          if (articles.length === 0 && articleLinks.length === 0) {
            hasMore = false;
            break;
          }
          
          console.log(`    📄 Page ${page}: ${articles.length} articles, ${articleLinks.length} links`);
          
          // Fetch individual article content
          for (const linkId of articleLinks) {
            try {
              await delay(400);
              const readerUrl = `${BASE_URL}/client/about/reader/${linkId}`;
              const readerHtml = await this.client.getText(readerUrl);
              
              // Find matching article or create new
              const existing = articles.find(a => a.id === linkId);
              if (existing) {
                existing.fullContent = readerHtml;
                existing.textContent = stripHTML(readerHtml);
              } else {
                articles.push({
                  id: linkId,
                  fullContent: readerHtml,
                  textContent: stripHTML(readerHtml)
                });
              }
              console.log(`      ✅ Fetched reader: ${linkId.substring(0, 20)}...`);
            } catch (e) {
              console.log(`      ⚠️ Failed reader: ${linkId}`);
            }
          }
          
          allArticles.push(...articles);
          
          // Check if there are more pages
          const hasNextPage = html.includes(`page="${page + 1}"`);
          if (!hasNextPage || articles.length < perPage) {
            hasMore = false;
          }
          
          page++;
          await delay(800);
          
        } catch (error) {
          console.log(`    ❌ Error page ${page}: ${error.message}`);
          hasMore = false;
        }
      }

      this.results.about[section.endpoint] = {
        name: section.name,
        endpoint: section.endpoint,
        category: section.category,
        articles: allArticles,
        count: allArticles.length
      };

      saveJSON(`about/${section.endpoint}.json`, this.results.about[section.endpoint]);
      console.log(`  📊 Total: ${allArticles.length} articles`);
    }
  }

  // ========================================
  // DES (Hướng dẫn đầu tư A-Z)
  // ========================================
  async scrapeDes() {
    console.log('\n📘 Scraping Hướng dẫn đầu tư A-Z...');

    for (const category of DES_CATEGORIES) {
      console.log(`\n  📁 Category: ${category.name}`);
      
      try {
        // Get list of items in this category
        const listUrl = `${BASE_URL}/client/des/list?id=${category.id}`;
        const listHtml = await this.client.getText(listUrl);
        
        saveHTML(`des/${category.id}_list_raw.html`, listHtml);
        
        const items = extractDesItems(listHtml);
        console.log(`  📝 Found ${items.length} items`);

        // Fetch each item's content
        const fullItems = [];
        for (const item of items) {
          try {
            await delay(400);
            const readerUrl = `${BASE_URL}/client/des/reader?id=${item.id}`;
            const readerHtml = await this.client.getText(readerUrl);
            
            fullItems.push({
              id: item.id,
              title: item.title,
              content: readerHtml,
              textContent: stripHTML(readerHtml)
            });
            console.log(`    ✅ Fetched: ${item.title || item.id.substring(0, 20)}...`);
          } catch (e) {
            console.log(`    ⚠️ Failed: ${item.id}`);
            fullItems.push({ id: item.id, title: item.title, error: e.message });
          }
        }

        // Also save the full HTML list which may contain inline content
        this.results.des[category.id] = {
          name: category.name,
          categoryId: category.id,
          listHTML: listHtml,
          items: fullItems,
          count: fullItems.length
        };

        saveJSON(`des/${category.id}.json`, this.results.des[category.id]);

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }

      await delay(800);
    }
  }

  // ========================================
  // STATIC PAGES
  // ========================================
  async scrapeStaticPages() {
    console.log('\n📄 Scraping trang tĩnh...');

    const pages = [
      { name: 'Trang chủ', url: '/client/home/index' },
      { name: 'Giới thiệu', url: '/client/introduce/index' },
      { name: 'Đặc quyền hội viên', url: '/client/privileges/index' },
    ];

    for (const page of pages) {
      try {
        console.log(`  📄 ${page.name}...`);
        const html = await this.client.getText(`${BASE_URL}${page.url}`);
        
        this.results.staticPages[page.name] = {
          url: page.url,
          html: html,
          textContent: stripHTML(html)
        };

        saveHTML(`static/${page.name.replace(/\s+/g, '_')}.html`, html);
        console.log(`  ✅ Saved`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      await delay(500);
    }
  }

  // ========================================
  // LOGIN
  // ========================================
  async login() {
    console.log('\n🔐 Attempting login...');
    
    try {
      // Step 1: Get login page & CSRF token
      const loginPage = await this.client.getText(`${BASE_URL}/login`);
      const token = extractCSRFToken(loginPage);
      
      if (!token) {
        console.log('  ❌ Could not find CSRF token on login page');
        return false;
      }
      
      console.log(`  🔑 CSRF Token: ${token.substring(0, 10)}...`);
      console.log(`  🍪 Cookies: ${Object.keys(this.client.cookies).join(', ')}`);

      // Step 2: Submit login form
      const loginResponse = await this.client.postForm(`${BASE_URL}/system/home`, {
        _token: token,
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD,
      });

      const responseText = await loginResponse.text();
      const finalStatus = loginResponse.status;
      
      console.log(`  📬 Login response status: ${finalStatus}`);
      console.log(`  🍪 Cookies after login: ${Object.keys(this.client.cookies).join(', ')}`);

      // Check if login was successful
      // After login, the page should redirect to system/home or show admin panel
      const isLoggedIn = !responseText.includes('Đăng nhập') || 
                         responseText.includes('Đăng xuất') ||
                         responseText.includes('system/home') ||
                         responseText.includes('admin') ||
                         finalStatus === 200;

      if (isLoggedIn) {
        console.log('  ✅ Login successful!');
        saveHTML('admin/_login_response.html', responseText);
        
        // Check if it's an admin page
        if (responseText.includes('admin') || responseText.includes('system')) {
          console.log('  👑 Admin access detected!');
        }
        
        return true;
      } else {
        console.log('  ⚠️ Login may have failed - checking redirect...');
        saveHTML('admin/_login_response.html', responseText);
        
        // Try to access a protected page to verify
        const testPage = await this.client.getText(`${BASE_URL}/system/home`);
        saveHTML('admin/_system_home.html', testPage);
        
        if (testPage.includes('Đăng xuất') || !testPage.includes('Đăng nhập')) {
          console.log('  ✅ Login verified via system/home!');
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.log(`  ❌ Login error: ${error.message}`);
      return false;
    }
  }

  // ========================================
  // ADMIN PANEL SCRAPING
  // ========================================
  async scrapeAdmin() {
    console.log('\n👑 Scraping Admin Panel...');

    // Try common admin URLs for Laravel
    const adminPages = [
      '/system/home',
      '/system/user',
      '/system/users',
      '/system/blog',
      '/system/blogs',
      '/system/about',
      '/system/library',
      '/system/des',
      '/system/member',
      '/system/members',
      '/system/datafinancial',
      '/system/recommendations',
      '/system/notification',
      '/system/setting',
      '/system/config',
      '/admin',
      '/admin/home',
      '/admin/user',
      '/admin/users',
      '/admin/blog',
      '/admin/blogs',
    ];

    const accessiblePages = [];
    
    for (const adminUrl of adminPages) {
      try {
        await delay(300);
        const html = await this.client.getText(`${BASE_URL}${adminUrl}`);
        
        // Check if we got actual admin content (not redirected to login)
        const isAccessible = !html.includes('Đăng nhập</h3>') && 
                            (html.includes('Đăng xuất') || 
                             html.includes('admin') || 
                             html.includes('system') ||
                             html.length > 2000);
        
        if (isAccessible) {
          console.log(`  ✅ Accessible: ${adminUrl}`);
          saveHTML(`admin${adminUrl.replace(/\//g, '_')}.html`, html);
          accessiblePages.push({
            url: adminUrl,
            size: html.length,
            hasUserList: html.includes('user') || html.includes('thành viên'),
            hasBlogList: html.includes('blog') || html.includes('bài viết')
          });

          // If this looks like a user list, extract user data
          if (html.includes('user') || html.includes('thành viên') || html.includes('email')) {
            await this.extractUsersFromPage(html, adminUrl);
          }
          
          // If this is the admin home, look for navigation links to discover more pages
          if (adminUrl.includes('home')) {
            const moreLinks = this.extractAdminLinks(html);
            console.log(`  🔗 Found ${moreLinks.length} admin navigation links`);
            
            for (const link of moreLinks) {
              if (!adminPages.includes(link)) {
                try {
                  await delay(300);
                  const linkHtml = await this.client.getText(`${BASE_URL}${link}`);
                  if (linkHtml.length > 2000) {
                    console.log(`  ✅ Discovered: ${link}`);
                    saveHTML(`admin${link.replace(/\//g, '_')}.html`, linkHtml);
                    accessiblePages.push({ url: link, size: linkHtml.length });
                  }
                } catch (e) {
                  // Skip
                }
              }
            }
          }
        } else {
          console.log(`  ❌ Not accessible: ${adminUrl}`);
        }
      } catch (error) {
        // Skip errors silently
      }
    }

    this.results.admin.accessiblePages = accessiblePages;
    saveJSON('admin/_accessible_pages.json', accessiblePages);
  }

  /** Extract admin navigation links */
  extractAdminLinks(html) {
    const links = [];
    const linkPattern = /href="([^"]*(?:system|admin)[^"]*?)"/gi;
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      let link = match[1];
      // Normalize to path
      if (link.startsWith(BASE_URL)) {
        link = link.replace(BASE_URL, '');
      }
      if (link.startsWith('/') && !links.includes(link)) {
        links.push(link);
      }
    }
    return links;
  }

  /** Extract user data from an admin page */
  async extractUsersFromPage(html, sourceUrl) {
    console.log(`  👥 Extracting users from ${sourceUrl}...`);
    
    const users = [];
    // Try to find user table rows
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = [...new Set(html.match(emailPattern) || [])];
    
    for (const email of emails) {
      users.push({ email, source: sourceUrl });
    }
    
    if (users.length > 0) {
      console.log(`  👥 Found ${users.length} email addresses`);
      this.results.users.push(...users);
    }

    // Also try to load user list via AJAX if there are pagination indicators
    const loadListPattern = /loadList[^(]*\(/g;
    if (loadListPattern.test(html)) {
      console.log(`  📑 Page has loadList function, attempting to load via API...`);
      
      // Try common user list endpoints
      const userListUrls = [
        '/system/user/loadList',
        '/system/users/loadList', 
        '/system/member/loadList',
        '/system/members/loadList',
      ];
      
      const token = extractCSRFToken(html);
      
      for (const listUrl of userListUrls) {
        try {
          await delay(300);
          const listHtml = await this.client.getText(
            `${BASE_URL}${listUrl}?_token=${token || ''}&offset=1&limit=100`
          );
          if (listHtml.length > 100) {
            console.log(`    ✅ User list found at ${listUrl}`);
            saveHTML(`admin/users_list.html`, listHtml);
            
            // Extract emails from list
            const listEmails = [...new Set(listHtml.match(emailPattern) || [])];
            for (const email of listEmails) {
              if (!this.results.users.find(u => u.email === email)) {
                this.results.users.push({ email, source: listUrl });
              }
            }
            console.log(`    👥 Found ${listEmails.length} emails in list`);
            
            // Try to get more pages
            let page = 2;
            let moreData = true;
            while (moreData && page <= 50) {
              try {
                await delay(300);
                const pageHtml = await this.client.getText(
                  `${BASE_URL}${listUrl}?_token=${token || ''}&offset=${page}&limit=100`
                );
                const pageEmails = [...new Set(pageHtml.match(emailPattern) || [])];
                if (pageEmails.length === 0) {
                  moreData = false;
                } else {
                  for (const email of pageEmails) {
                    if (!this.results.users.find(u => u.email === email)) {
                      this.results.users.push({ email, source: `${listUrl}?page=${page}` });
                    }
                  }
                  console.log(`    📄 Page ${page}: ${pageEmails.length} emails`);
                  page++;
                }
              } catch (e) {
                moreData = false;
              }
            }
            
            break; // Found a working endpoint, stop trying others
          }
        } catch (e) {
          // Skip
        }
      }
    }
  }

  // ========================================
  // VIP CONTENT (after login)
  // ========================================
  async scrapeVIPContent() {
    console.log('\n💎 Scraping VIP Content...');

    // Try to access VIP pages now that we're logged in
    const vipPages = [
      { name: 'Tín hiệu VIP', url: '/client/datafinancial/recommendationsIndex' },
      { name: 'Danh mục VIP', url: '/client/datafinancial/categoryFintopIndex' },
      { name: 'VIP Đầu tư', url: '/client/about/session' },
    ];

    for (const vipPage of vipPages) {
      try {
        console.log(`  💎 ${vipPage.name}...`);
        const html = await this.client.getText(`${BASE_URL}${vipPage.url}`);
        saveHTML(`vip/${vipPage.name.replace(/\s+/g, '_')}.html`, html);
        
        this.results.admin[vipPage.name] = {
          url: vipPage.url,
          html: html,
          size: html.length
        };
        
        console.log(`  ✅ Saved (${html.length} bytes)`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      await delay(500);
    }
  }

  // ========================================
  // SUMMARY
  // ========================================
  printSummary() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║           📊 SCRAPING SUMMARY           ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    
    console.log('📚 CẨM NANG ĐẦU TƯ:');
    for (const [cat, data] of Object.entries(this.results.library)) {
      console.log(`   ${data.name}: ${data.count} items`);
    }
    
    console.log('\n📊 BÁO CÁO PHÂN TÍCH:');
    for (const [endpoint, data] of Object.entries(this.results.about)) {
      console.log(`   ${data.name}: ${data.count} articles`);
    }
    
    console.log('\n📘 HƯỚNG DẪN ĐẦU TƯ A-Z:');
    for (const [id, data] of Object.entries(this.results.des)) {
      console.log(`   ${data.name}: ${data.count} items`);
    }
    
    console.log('\n📄 TRANG TĨNH:');
    for (const [name, data] of Object.entries(this.results.staticPages)) {
      console.log(`   ${name}: ${data.html.length} bytes`);
    }
    
    console.log(`\n👥 USERS: ${this.results.users.length} email addresses found`);
    
    if (this.results.admin.accessiblePages) {
      console.log(`\n👑 ADMIN PAGES: ${this.results.admin.accessiblePages.length} accessible`);
    }
    
    console.log(`\n💾 All data saved to: ${OUTPUT_DIR}`);
    console.log('');
  }
}

// ============================================
// RUN
// ============================================
const scraper = new FinTopScraper();
scraper.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
