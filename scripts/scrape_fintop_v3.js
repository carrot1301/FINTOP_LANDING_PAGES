/**
 * FinTop DATA - Admin Data Extractor v3
 * Calls the discovered AJAX endpoints to extract admin data:
 * - Blog articles via /system/blog/loadList
 * - User list via /system/user/loadList or /system/client/loadList
 * - Additional admin pages
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://fintopdata.vn';
const LOGIN_EMAIL = 'tuannv7105@gmail.com';
const LOGIN_PASSWORD = 'tuantuan2k5ZXC';
const EXTRACTED_DIR = path.join(__dirname, '..', 'data', 'extracted');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function saveJSON(dir, filename, data) {
  ensureDir(dir);
  const fp = path.join(dir, filename);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  💾 ${fp}`);
}

function extractCSRFToken(html) {
  const m = html.match(/name="_token"[^>]*value="([^"]+)"/);
  if (m) return m[1];
  const m2 = html.match(/id="_token"[^>]*value="([^"]+)"/);
  return m2 ? m2[1] : null;
}

function extractCookiesFromHeaders(headers) {
  const cookies = {};
  const sc = headers.getSetCookie?.() || [];
  for (const c of sc) {
    const [nv] = c.split(';');
    const eq = nv.indexOf('=');
    if (eq > 0) cookies[nv.slice(0, eq).trim()] = nv.slice(eq + 1).trim();
  }
  return cookies;
}

function stripHTML(html) {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/gi, '')
    .replace(/\s+/g, ' ').trim();
}

class Client {
  constructor() { this.cookies = {}; }
  cookieStr() { return Object.entries(this.cookies).map(([k,v])=>`${k}=${v}`).join('; '); }
  
  async req(url, opts = {}) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'X-Requested-With': 'XMLHttpRequest', // Important for AJAX endpoints
      ...opts.headers,
    };
    if (Object.keys(this.cookies).length) headers['Cookie'] = this.cookieStr();
    
    let res = await fetch(url, { ...opts, headers, redirect: 'manual' });
    Object.assign(this.cookies, extractCookiesFromHeaders(res.headers));
    
    let redir = 0;
    while ((res.status >= 301 && res.status <= 303) && redir < 10) {
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

/** Parse blog/user table rows from admin loadList HTML response */
function parseAdminTable(html) {
  const items = [];
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  while ((match = trPattern.exec(html)) !== null) {
    const row = match[1];
    if (row.includes('thead') || row.includes('<th')) continue;
    
    const item = {};
    
    // Extract ID from checkbox
    const idMatch = row.match(/value="([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/);
    if (idMatch) item.id = idMatch[1];
    
    // Extract all <td> contents
    const tds = [];
    const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdPattern.exec(row)) !== null) {
      tds.push(stripHTML(tdMatch[1]).trim());
    }
    item.columns = tds;
    
    // Extract image
    const imgMatch = row.match(/src="([^"]*file-image[^"]*)"/);
    if (imgMatch) item.image = imgMatch[1];
    
    // Extract email
    const emailMatch = row.match(/([\w.-]+@[\w.-]+\.\w{2,})/);
    if (emailMatch) item.email = emailMatch[1];
    
    // Extract onclick edit link
    const editMatch = row.match(/edit\(['"]([^'"]+)['"]\)/);
    if (editMatch) item.editId = editMatch[1];
    
    // Extract infoBlog link
    const infoMatch = row.match(/infoBlog\(['"]([^'"]+)['"]\)/);
    if (infoMatch) item.blogId = infoMatch[1];
    
    if (item.id || tds.length > 0) {
      items.push(item);
    }
  }
  return items;
}

/** Extract pagination total */
function extractTotal(html) {
  const m = html.match(/Có tất cả (\d+)\/(\d+)/);
  return m ? { showing: parseInt(m[1]), total: parseInt(m[2]) } : null;
}

async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  FinTop Admin Data Extractor v3               ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  
  const client = new Client();
  const allData = {};

  // ===== LOGIN =====
  console.log('🔐 Đăng nhập...');
  const loginPage = await client.get(`${BASE_URL}/login`);
  const token = extractCSRFToken(loginPage);
  
  await client.post(`${BASE_URL}/system/home`, {
    _token: token,
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
    acp_checkbox: 'on',
  });
  console.log('  ✅ Đăng nhập xong');

  // Get fresh token from an admin page
  const userPage = await client.get(`${BASE_URL}/system/user/index`);
  const adminToken = extractCSRFToken(userPage);
  console.log(`  🔑 Admin Token: ${adminToken ? adminToken.substring(0, 15) + '...' : 'N/A'}`);

  // ===== BLOG ARTICLES =====
  console.log('\n━━━ BLOG ARTICLES (Tất cả bài viết) ━━━\n');
  
  const blogCategories = [
    { code: '', name: 'Tất cả' },
    { code: 'BAO_CAO_TTTH', name: 'Thị trường tổng hợp' },
    { code: 'BAO_CAO_PTN', name: 'Phân tích ngành' },
    { code: 'BAO_CAO_PTDN', name: 'Phân tích doanh nghiệp' },
    { code: 'BAO_CAO_PTDTVIP', name: 'V.I.P Đầu Tư' },
    { code: 'HD_Bai_Viet', name: 'Bài viết tổng hợp' },
    { code: 'HD2_dautu', name: 'Hướng dẫn đầu tư' },
    { code: 'HD1_giaodich', name: 'Hướng dẫn giao dịch' },
    { code: 'HD4_FA', name: 'Phân tích tài chính DN (FA)' },
    { code: 'HD3_TA', name: 'Phân tích giao dịch biểu đồ (TA)' },
  ];

  allData.blogs = {};
  
  for (const cat of blogCategories) {
    console.log(`📝 ${cat.name}...`);
    let page = 1;
    const limit = 100;
    let allItems = [];
    let hasMore = true;
    
    while (hasMore) {
      try {
        await delay(400);
        const url = `${BASE_URL}/system/blog/loadList?search=&category=${cat.code}&offset=${page}&limit=${limit}`;
        const html = await client.get(url);
        
        const items = parseAdminTable(html);
        const pagination = extractTotal(html);
        
        if (page === 1) {
          ensureDir(path.join(EXTRACTED_DIR, 'blogs'));
          fs.writeFileSync(
            path.join(EXTRACTED_DIR, 'blogs', `${cat.code || 'ALL'}_page1_raw.html`), 
            html, 'utf-8'
          );
        }
        
        if (items.length === 0) {
          hasMore = false;
        } else {
          allItems = allItems.concat(items);
          console.log(`  📄 Page ${page}: ${items.length} items${pagination ? ` (${pagination.showing}/${pagination.total})` : ''}`);
          
          if (pagination && allItems.length >= pagination.total) {
            hasMore = false;
          } else if (items.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        }
      } catch (e) {
        console.log(`  ❌ Error page ${page}: ${e.message}`);
        hasMore = false;
      }
    }
    
    allData.blogs[cat.code || 'ALL'] = {
      name: cat.name,
      items: allItems,
      count: allItems.length,
    };
    
    if (allItems.length > 0) {
      saveJSON(path.join(EXTRACTED_DIR, 'blogs'), `${cat.code || 'ALL'}.json`, allData.blogs[cat.code || 'ALL']);
    }
    console.log(`  ✅ Total: ${allItems.length} articles`);
  }

  // ===== USERS (Nhân sự) =====
  console.log('\n━━━ USERS (Quản trị nhân sự) ━━━\n');
  
  // Try /system/user/loadList
  try {
    let page = 1;
    let allUsers = [];
    let hasMore = true;
    
    while (hasMore) {
      await delay(400);
      const url = `${BASE_URL}/system/user/loadList?search=&offset=${page}&limit=100&_token=${adminToken}`;
      const html = await client.get(url);
      
      if (page === 1) {
        ensureDir(path.join(EXTRACTED_DIR, 'users'));
        fs.writeFileSync(path.join(EXTRACTED_DIR, 'users', 'user_loadList_raw.html'), html, 'utf-8');
      }
      
      const items = parseAdminTable(html);
      const pagination = extractTotal(html);
      
      if (items.length === 0) {
        hasMore = false;
      } else {
        allUsers = allUsers.concat(items);
        console.log(`  📄 Page ${page}: ${items.length} users${pagination ? ` (${pagination.showing}/${pagination.total})` : ''}`);
        
        if (pagination && allUsers.length >= pagination.total) hasMore = false;
        else if (items.length < 100) hasMore = false;
        else page++;
      }
    }
    
    allData.users = { items: allUsers, count: allUsers.length };
    if (allUsers.length > 0) {
      saveJSON(path.join(EXTRACTED_DIR, 'users'), 'users.json', allData.users);
    }
    console.log(`  ✅ Total users (nhân sự): ${allUsers.length}`);
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
  }

  // ===== CLIENTS (Khách hàng) =====
  console.log('\n━━━ CLIENTS (Quản trị khách hàng) ━━━\n');
  
  // First get the client page
  try {
    const clientPage = await client.get(`${BASE_URL}/system/client/index`);
    const clientToken = extractCSRFToken(clientPage);
    
    if (clientPage.includes('Quản trị khách hàng') || clientPage.length > 5000) {
      ensureDir(path.join(EXTRACTED_DIR, 'clients'));
      fs.writeFileSync(path.join(EXTRACTED_DIR, 'clients', 'client_index.html'), clientPage, 'utf-8');
      console.log(`  ✅ Client index page: ${clientPage.length} bytes`);
      
      // Try loadList
      let page = 1;
      let allClients = [];
      let hasMore = true;
      
      while (hasMore) {
        await delay(400);
        const url = `${BASE_URL}/system/client/loadList?search=&offset=${page}&limit=100`;
        const html = await client.get(url);
        
        if (page === 1) {
          fs.writeFileSync(path.join(EXTRACTED_DIR, 'clients', 'client_loadList_raw.html'), html, 'utf-8');
        }
        
        const items = parseAdminTable(html);
        const pagination = extractTotal(html);
        
        if (items.length === 0) {
          hasMore = false;
        } else {
          allClients = allClients.concat(items);
          console.log(`  📄 Page ${page}: ${items.length} clients${pagination ? ` (${pagination.showing}/${pagination.total})` : ''}`);
          
          if (pagination && allClients.length >= pagination.total) hasMore = false;
          else if (items.length < 100) hasMore = false;
          else page++;
        }
      }
      
      allData.clients = { items: allClients, count: allClients.length };
      if (allClients.length > 0) {
        saveJSON(path.join(EXTRACTED_DIR, 'clients'), 'clients.json', allData.clients);
      }
      console.log(`  ✅ Total clients: ${allClients.length}`);
    } else {
      console.log(`  ❌ Client page not accessible`);
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
  }

  // ===== MORE ADMIN PAGES =====
  console.log('\n━━━ ADDITIONAL ADMIN PAGES ━━━\n');
  
  const extraPages = [
    '/system/home/index',
    '/system/approvepayment/index',
    '/system/signal/index',
    '/system/recommended/index',
    '/system/category/index',
    '/system/handbook/index',
    '/system/userInfo/index',
  ];

  allData.adminPages = {};
  for (const route of extraPages) {
    try {
      await delay(300);
      const html = await client.get(`${BASE_URL}${route}`);
      if (html.length > 5000 && !html.includes('Not Found')) {
        const safeName = route.replace(/\//g, '_').replace(/^_/, '');
        ensureDir(path.join(EXTRACTED_DIR, 'admin'));
        fs.writeFileSync(path.join(EXTRACTED_DIR, 'admin', `${safeName}.html`), html, 'utf-8');
        allData.adminPages[route] = { size: html.length, accessible: true };
        console.log(`  ✅ ${route}: ${html.length} bytes`);
        
        // For pages with loadList, try to fetch data
        const pageName = route.split('/')[2]; // e.g., "signal", "recommended"
        try {
          await delay(300);
          const listUrl = `${BASE_URL}/system/${pageName}/loadList?search=&offset=1&limit=100`;
          const listHtml = await client.get(listUrl);
          if (listHtml.length > 100 && !listHtml.includes('Not Found')) {
            fs.writeFileSync(
              path.join(EXTRACTED_DIR, 'admin', `${pageName}_loadList.html`), listHtml, 'utf-8'
            );
            const listItems = parseAdminTable(listHtml);
            console.log(`    📋 ${pageName}/loadList: ${listItems.length} items`);
            if (listItems.length > 0) {
              saveJSON(path.join(EXTRACTED_DIR, 'admin'), `${pageName}_data.json`, {
                source: pageName,
                items: listItems,
                count: listItems.length
              });
            }
          }
        } catch (e) { /* ignore */ }
      } else {
        allData.adminPages[route] = { accessible: false };
        console.log(`  ❌ ${route}`);
      }
    } catch (e) {
      console.log(`  ❌ ${route}: ${e.message}`);
    }
  }

  // ===== SAVE COMPLETE =====
  console.log('\n━━━ SAVING COMPLETE DATA ━━━\n');
  saveJSON(EXTRACTED_DIR, '_admin_complete_data.json', allData);

  // ===== SUMMARY =====
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║               📊 FINAL SUMMARY               ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  console.log('📝 BLOG ARTICLES:');
  let totalBlogs = 0;
  for (const [code, data] of Object.entries(allData.blogs || {})) {
    if (data.count > 0) {
      console.log(`   ${data.name}: ${data.count}`);
      totalBlogs += data.count;
    }
  }
  console.log(`   → Tổng bài viết: ${totalBlogs}`);

  console.log(`\n👥 USERS (Nhân sự): ${allData.users?.count || 0}`);
  console.log(`👥 CLIENTS (Khách hàng): ${allData.clients?.count || 0}`);
  
  console.log(`\n👑 ADMIN PAGES:`);
  for (const [route, info] of Object.entries(allData.adminPages || {})) {
    console.log(`   ${info.accessible ? '✅' : '❌'} ${route}${info.size ? ` (${info.size} bytes)` : ''}`);
  }

  console.log(`\n💾 All data saved to: ${EXTRACTED_DIR}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
