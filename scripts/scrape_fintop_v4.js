/**
 * FinTop DATA - Data Migration Script (v4)
 * Performs the following actions:
 * 1. Log in to fintopdata.vn admin panel.
 * 2. Read unique blog IDs from extracted blog list JSONs.
 * 3. Fetch detailed information for all blogs using the `/system/blog/infor` endpoint.
 * 4. Decode HTML content and extract metadata (title, category, date, status, creator, featured image).
 * 5. Extract all embedded media links (images/files) in the HTML content.
 * 6. Download all featured and embedded media files to `data/extracted/media/` and update references to local relative paths.
 * 7. Parse raw client table data from `data/extracted/clients/clients.json` into structured properties.
 * 8. Save the cleanly structured parsed blogs and clients lists to JSON files.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://fintopdata.vn';
const LOGIN_EMAIL = 'tuannv7105@gmail.com';
const LOGIN_PASSWORD = 'tuantuan2k5ZXC';

const EXTRACTED_DIR = path.join(__dirname, '..', 'data', 'extracted');
const MEDIA_DIR = path.join(EXTRACTED_DIR, 'media');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function decodeHTMLEntities(str) {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&hellip;/g, '…')
    .replace(/&middot;/g, '·')
    .replace(/&bull;/g, '•')
    .replace(/&deg;/g, '°')
    .replace(/&micro;/g, 'µ')
    .replace(/&plusmn;/g, '±')
    .replace(/&sup2;/g, '²')
    .replace(/&sup3;/g, '³')
    .replace(/&frac14;/g, '¼')
    .replace(/&frac12;/g, '½')
    .replace(/&frac34;/g, '¾')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&pound;/g, '£')
    .replace(/&euro;/g, '€')
    .replace(/&yen;/g, '¥')
    .replace(/&sect;/g, '§')
    .replace(/&para;/g, '¶')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&bull;/g, '•')
    .replace(/&ordf;/g, 'ª')
    .replace(/&ordm;/g, 'º')
    .replace(/&aacute;/g, 'á')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&atilde;/g, 'ã')
    .replace(/&auml;/g, 'ä')
    .replace(/&aring;/g, 'å')
    .replace(/&aelig;/g, 'æ')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&euml;/g, 'ë')
    .replace(/&iacute;/g, 'í')
    .replace(/&igrave;/g, 'ì')
    .replace(/&icirc;/g, 'î')
    .replace(/&iuml;/g, 'ï')
    .replace(/&eth;/g, 'ð')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&oacute;/g, 'ó')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&otilde;/g, 'õ')
    .replace(/&ouml;/g, 'ö')
    .replace(/&oslash;/g, 'ø')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ucirc;/g, 'û')
    .replace(/&uuml;/g, 'ü')
    .replace(/&yacute;/g, 'ý')
    .replace(/&thorn;/g, 'þ')
    .replace(/&yuml;/g, 'ÿ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Agrave;/g, 'À')
    .replace(/&Acirc;/g, 'Â')
    .replace(/&Atilde;/g, 'Ã')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Aring;/g, 'Å')
    .replace(/&AElig;/g, 'Æ')
    .replace(/&Ccedil;/g, 'Ç')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Egrave;/g, 'È')
    .replace(/&Ecirc;/g, 'Ê')
    .replace(/&Euml;/g, 'Ë')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Igrave;/g, 'Ì')
    .replace(/&Icirc;/g, 'Î')
    .replace(/&Iuml;/g, 'Ï')
    .replace(/&ETH;/g, 'Ð')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Ograve;/g, 'Ò')
    .replace(/&Ocirc;/g, 'Ô')
    .replace(/&Otilde;/g, 'Õ')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Oslash;/g, 'Ø')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ugrave;/g, 'Ù')
    .replace(/&Ucirc;/g, 'Û')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&Yacute;/g, 'Ý')
    .replace(/&THORN;/g, 'Þ')
    .replace(/&quot;/g, '"');
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

class Client {
  constructor() { this.cookies = {}; }
  cookieStr() { return Object.entries(this.cookies).map(([k,v])=>`${k}=${v}`).join('; '); }
  
  async req(url, opts = {}) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'X-Requested-With': 'XMLHttpRequest',
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

  async download(url, destPath) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Cookie': this.cookieStr()
    };
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
  }
}

/** Parses one client raw string */
function parseClientText(text) {
  const fields = {
    name: '',
    staffId: '',
    phone: '',
    email: '',
    address: '',
    dob: '',
    joinDate: '',
    investHorizon: '',
    riskTaste: '',
    brokerCompany: '',
    brokerAccount: '',
    accountType: '',
    role: ''
  };

  const nameMatch = text.match(/Tên khách hàng:\s*(.*?)\s*ID nhân sự/i);
  if (nameMatch) fields.name = nameMatch[1].trim();

  const staffMatch = text.match(/ID nhân sự\s*:\s*(.*?)\s*-->\s*Số điện thoại/i) || text.match(/ID nhân sự\s*:\s*(.*?)\s*Số điện thoại/i);
  if (staffMatch) fields.staffId = staffMatch[1].replace(/-->/g, '').trim();

  const phoneMatch = text.match(/Số điện thoại\s*:\s*(.*?)\s*Địa chỉ Email/i);
  if (phoneMatch) fields.phone = phoneMatch[1].trim();

  const emailMatch = text.match(/Địa chỉ Email\s*:\s*(.*?)\s*Địa chỉ\s*:/i);
  if (emailMatch) fields.email = emailMatch[1].trim();

  const addressMatch = text.match(/Địa chỉ\s*:\s*(.*?)\s*Ngày sinh/i);
  if (addressMatch) fields.address = addressMatch[1].trim();

  const dobMatch = text.match(/Ngày sinh\s*:\s*(.*?)\s*Ngày gia nhập/i);
  if (dobMatch) fields.dob = dobMatch[1].trim();

  const joinMatch = text.match(/Ngày gia nhập\s*:\s*(.*?)\s*Thời gian đầu tư/i);
  if (joinMatch) fields.joinDate = joinMatch[1].trim();

  const horizonMatch = text.match(/Thời gian đầu tư:\s*(.*?)\s*Khẩu vị đầu tư/i);
  if (horizonMatch) fields.investHorizon = horizonMatch[1].trim();

  const riskMatch = text.match(/Khẩu vị đầu tư\s*:\s*(.*?)\s*Công ty chứng khoán/i);
  if (riskMatch) fields.riskTaste = riskMatch[1].trim();

  const brokerMatch = text.match(/Công ty chứng khoán\s*:\s*(.*?)\s*Số TKCK VPS/i);
  if (brokerMatch) fields.brokerCompany = brokerMatch[1].trim();

  const brokerAccMatch = text.match(/Số TKCK VPS\s*\(nếu có\)\s*:\s*(.*?)\s*Loại tài khoản/i);
  if (brokerAccMatch) fields.brokerAccount = brokerAccMatch[1].trim();

  const typeMatch = text.match(/Loại tài khoản\s*:\s*(.*?)\s*Quyền truy cập/i);
  if (typeMatch) fields.accountType = typeMatch[1].trim();

  const roleMatch = text.match(/Quyền truy cập\s*:\s*(.*?)$/i);
  if (roleMatch) fields.role = roleMatch[1].trim();

  return fields;
}

async function main() {
  console.log('==================================================');
  console.log('🚀 FinTop Data Migration & Scraper Script (v4)');
  console.log('==================================================\n');

  ensureDir(MEDIA_DIR);

  // 1. Gather all unique blog IDs from lists
  console.log('📂 Collecting unique blog IDs...');
  const blogListDir = path.join(EXTRACTED_DIR, 'blogs');
  const uniqueBlogs = new Map();

  if (fs.existsSync(blogListDir)) {
    const files = fs.readdirSync(blogListDir).filter(f => f.endsWith('.json') && f !== 'ALL.json');
    // Read ALL.json first to prioritize it, then add categories
    const allFiles = ['ALL.json', ...files];
    
    for (const f of allFiles) {
      const fp = path.join(blogListDir, f);
      if (!fs.existsSync(fp)) continue;
      try {
        const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        const items = data.items || [];
        for (const item of items) {
          if (item.id && !uniqueBlogs.has(item.id)) {
            uniqueBlogs.set(item.id, {
              id: item.id,
              listTitle: item.columns ? item.columns[3] || item.columns[2] : '',
              listCategory: data.name || '',
              listImage: item.image || '',
              type: item.columns ? item.columns[5] || '' : ''
            });
          }
        }
      } catch (err) {
        console.error(`  ❌ Error reading ${f}: ${err.message}`);
      }
    }
  }

  console.log(`  📊 Found ${uniqueBlogs.size} unique blog articles.`);

  // 2. Login
  const client = new Client();
  console.log('\n🔐 Logging in to admin panel...');
  try {
    const loginPage = await client.get(`${BASE_URL}/login`);
    const token = extractCSRFToken(loginPage);
    await client.post(`${BASE_URL}/system/home`, {
      _token: token,
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
      acp_checkbox: 'on',
    });
    console.log('  ✅ Login successful.');
  } catch (err) {
    console.error('  ❌ Login failed:', err.message);
    process.exit(1);
  }

  // 3. Fetch details for each blog
  console.log('\n📝 Fetching and parsing detailed content for each blog...');
  const parsedBlogs = [];
  let blogIndex = 1;

  for (const [id, meta] of uniqueBlogs.entries()) {
    console.log(`  [${blogIndex}/${uniqueBlogs.size}] Fetching content for ID: ${id}`);
    try {
      await delay(350); // delay to prevent rate limit
      const html = await client.get(`${BASE_URL}/system/blog/infor?id=${id}`);
      
      // Parse values from html
      const creatorMatch = html.match(/class="form-control-label">Người tạo<\/p>\s*<input class="form-control" type="text" value="([^"]*)"/);
      const dateMatch = html.match(/class="form-control-label">Ngày tạo bài viết<\/p>\s*<input class="form-control" type="text" value="([^"]*)"/);
      const categoryMatch = html.match(/class="form-control-label">Thể loại<\/p>\s*<input class="form-control" type="text" value="([^"]*)"/);
      const statusMatch = html.match(/class="form-control-label">Trạng thái<\/p>\s*<input class="form-control" type="text" value="([^"]*)"/);
      const titleMatch = html.match(/class="form-control-label">Tên bài viết<\/p>\s*<input class="form-control" type="text" value="([^"]*)"/);
      const contentMatch = html.match(/<textarea[^>]*class="form-control"[^>]*>([\s\S]*?)<\/textarea>/);
      const imgMatch = html.match(/<img\s+src="([^"]*file-image-client[^"]*)"/);

      const creator = creatorMatch ? creatorMatch[1].trim() : 'FinTop_Admin';
      const createdDate = dateMatch ? dateMatch[1].trim() : '';
      const category = categoryMatch ? categoryMatch[1].trim() : meta.listCategory;
      const status = statusMatch ? statusMatch[1].trim() : 'Hoạt động';
      const title = titleMatch ? decodeHTMLEntities(titleMatch[1].trim()) : meta.listTitle;
      const rawHTML = contentMatch ? contentMatch[1] : '';
      const decodedHTML = decodeHTMLEntities(rawHTML);
      const featuredImage = imgMatch ? imgMatch[1] : meta.listImage;

      // Extract images in HTML content
      const embeddedImages = [];
      const imgRegex = /src="([^"]*file-image[^"]*)"/gi;
      let imgM;
      while ((imgM = imgRegex.exec(decodedHTML)) !== null) {
        if (!embeddedImages.includes(imgM[1])) {
          embeddedImages.push(imgM[1]);
        }
      }

      parsedBlogs.push({
        id,
        title,
        creator,
        createdDate,
        category,
        status,
        featuredImage,
        embeddedImages,
        contentHTML: decodedHTML,
        metaType: meta.type
      });
      console.log(`    ✅ Title: "${title.substring(0, 40)}..."`);
    } catch (err) {
      console.error(`    ❌ Error fetching ID ${id}: ${err.message}`);
    }
    blogIndex++;
  }

  // 4. Download media files and rewrite URLs
  console.log('\n🖼️ Downloading media files and rewording image URLs to local folder...');
  const mediaMap = {}; // mapping old URL -> local URL
  
  for (const blog of parsedBlogs) {
    const urlsToDownload = [];
    if (blog.featuredImage && !blog.featuredImage.includes('avatar_default')) {
      urlsToDownload.push({ url: blog.featuredImage, type: 'featured' });
    }
    for (const imgUrl of blog.embeddedImages) {
      urlsToDownload.push({ url: imgUrl, type: 'embedded' });
    }

    for (const item of urlsToDownload) {
      const oldUrl = item.url;
      if (mediaMap[oldUrl]) continue; // already downloaded

      // Compute safe filename
      let fileName = path.basename(oldUrl.split('!~!').pop() || oldUrl.split('/').pop() || '');
      // strip query params or symbols
      fileName = fileName.replace(/[?#].*$/, '').replace(/[^a-zA-Z0-9.-]/g, '_');
      if (!fileName) fileName = `media_${Date.now()}_${Math.floor(Math.random()*1000)}.jpg`;
      
      const localPath = path.join(MEDIA_DIR, fileName);
      const relativeLocalUrl = `/data/extracted/media/${fileName}`; // serve relative path

      try {
        console.log(`  Downloading: ${oldUrl} -> ${fileName}`);
        await delay(200);
        // Ensure absolute url
        const absoluteUrl = oldUrl.startsWith('http') ? oldUrl : `${BASE_URL}${oldUrl}`;
        await client.download(absoluteUrl, localPath);
        mediaMap[oldUrl] = relativeLocalUrl;
        console.log(`    ✅ Saved.`);
      } catch (err) {
        console.error(`    ⚠️ Failed to download ${oldUrl}: ${err.message}`);
      }
    }

    // Rewrite URLs in blog object
    if (blog.featuredImage && mediaMap[blog.featuredImage]) {
      blog.featuredImageLocal = mediaMap[blog.featuredImage];
    } else {
      blog.featuredImageLocal = blog.featuredImage;
    }

    let updatedHTML = blog.contentHTML;
    for (const [oldUrl, localUrl] of Object.entries(mediaMap)) {
      // replace occurrences of oldUrl
      updatedHTML = updatedHTML.split(oldUrl).join(localUrl);
    }
    blog.contentHTML = updatedHTML;
  }

  // Save parsed blogs
  fs.writeFileSync(
    path.join(EXTRACTED_DIR, 'parsed_blogs.json'),
    JSON.stringify(parsedBlogs, null, 2),
    'utf-8'
  );
  console.log(`\n💾 Saved ${parsedBlogs.length} parsed blogs to parsed_blogs.json`);

  // 5. Parse clients data
  console.log('\n👥 Parsing client table data...');
  const clientsRawPath = path.join(EXTRACTED_DIR, 'clients', 'clients.json');
  if (fs.existsSync(clientsRawPath)) {
    try {
      const clientsData = JSON.parse(fs.readFileSync(clientsRawPath, 'utf-8'));
      const items = clientsData.items || [];
      const parsedClients = [];

      for (const item of items) {
        // Skip header
        if (item.columns && item.columns[2] === 'Thông tin người dùng') continue;
        
        if (item.columns && item.columns[2]) {
          const rawText = item.columns[2];
          const parsed = parseClientText(rawText);
          parsed.id = item.id;
          parsed.email = item.email || parsed.email;
          parsed.avatar = item.image || '';
          parsed.manager = item.columns[3] || '-';
          
          parsedClients.push(parsed);
        }
      }

      fs.writeFileSync(
        path.join(EXTRACTED_DIR, 'parsed_clients.json'),
        JSON.stringify(parsedClients, null, 2),
        'utf-8'
      );
      console.log(`  ✅ Successfully parsed ${parsedClients.length} clients and saved to parsed_clients.json`);
    } catch (err) {
      console.error('  ❌ Error parsing clients:', err.message);
    }
  } else {
    console.log('  ⚠️ Clients raw JSON not found.');
  }

  // 6. Report map of downloads
  fs.writeFileSync(
    path.join(EXTRACTED_DIR, 'media_map.json'),
    JSON.stringify(mediaMap, null, 2),
    'utf-8'
  );
  console.log('💾 Media mapping saved to media_map.json');

  console.log('\n╔═════════════════════════════════════════════════╗');
  console.log('║               🎉 MIGRATION SUCCESS              ║');
  console.log('╚═════════════════════════════════════════════════╝');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
