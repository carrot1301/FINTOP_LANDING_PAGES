/**
 * Scraper using direct loadList AJAX endpoints with limit=100.
 */

const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const BASE_URL = 'https://fintopdata.vn';
const LOGIN_PAGE_URL = `${BASE_URL}/login`;
const POST_LOGIN_URL = `${BASE_URL}/system/home`;

const STAFF_LOADLIST_URL = `${BASE_URL}/system/user/loadList`;
const CLIENT_LOADLIST_URL = `${BASE_URL}/system/client/loadList`;

let allCookies = {};

function setCookies(setCookieHeaders) {
  if (!setCookieHeaders) return;
  for (const c of setCookieHeaders) {
    const parts = c.split(';')[0].split('=');
    const name = parts[0];
    const value = parts.slice(1).join('=');
    allCookies[name] = value;
  }
}

function cookieHeader() {
  return Object.entries(allCookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      'Connection': 'keep-alive',
      ...(Object.keys(allCookies).length > 0 ? { 'Cookie': cookieHeader() } : {}),
      ...(options.headers || {}),
    };

    const reqOptions = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers,
    };

    const req = https.request(reqOptions, (res) => {
      setCookies(res.headers['set-cookie']);
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body, location: res.headers.location });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function login() {
  console.log('=== GET login page ===');
  const loginPage = await httpsRequest(LOGIN_PAGE_URL);
  const token = loginPage.body.match(/name="_token"\s*value="([^"]+)"/)[1];

  const formBody = querystring.stringify({
    _token: token,
    email: 'tuannv7105@gmail.com',
    password: 'tuantuan2k5ZXC',
    acp_checkbox: 'on'
  });

  console.log('=== POST login ===');
  const res = await httpsRequest(POST_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(formBody).toString(),
      'Referer': LOGIN_PAGE_URL,
      'Origin': BASE_URL,
    },
    body: formBody,
  });

  return res.status === 302;
}

function parseStaff(html) {
  const records = [];
  const collapsed = html.replace(/\s+/g, ' ');
  const trMatches = collapsed.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!trMatches) return records;

  for (const trHtml of trMatches) {
    if (!trHtml.includes('Email') && !trHtml.includes('Tên')) continue;
    
    const textContent = trHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/[ \t]+/g, ' ')
      .trim();

    const record = {};
    const get = (pattern) => {
      const m = textContent.match(pattern);
      return m ? m[1].trim() : '';
    };

    record.fullName = get(/Tên[ \t]*:[ \t]*([^\r\n]*)/i);
    record.staffCode = get(/ID nhân sự[ \t]*:[ \t]*([^\r\n]*)/i);
    record.phone = get(/Số điện thoại[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Số điện thoai[ \t]*:[ \t]*([^\r\n]*)/i);
    record.email = get(/Địa chỉ Email[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Email[ \t]*:[ \t]*([^\r\n]*)/i);
    record.address = get(/Địa chỉ[ \t]*:[ \t]*([^\r\n]*)/i);
    record.dob = get(/Ngày sinh[ \t]*:[ \t]*([^\r\n]*)/i);
    record.role = get(/Quyền truy cập[ \t]*:[ \t]*([^\r\n]*)/i);

    if (record.email || record.fullName) {
      records.push(record);
    }
  }

  return records;
}

function parseClients(html) {
  const records = [];
  const collapsed = html.replace(/\s+/g, ' ');
  const trMatches = collapsed.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!trMatches) return records;

  for (const trHtml of trMatches) {
    if (!trHtml.includes('Email') && !trHtml.includes('Tên')) continue;
    
    const textContent = trHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/[ \t]+/g, ' ')
      .trim();

    const record = {};
    const get = (pattern) => {
      const m = textContent.match(pattern);
      return m ? m[1].trim() : '';
    };

    record.fullName = get(/Tên khách hàng[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Tên[ \t]*:[ \t]*([^\r\n]*)/i);
    record.phone = get(/Số điện thoại[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Số điện thoai[ \t]*:[ \t]*([^\r\n]*)/i);
    record.email = get(/Địa chỉ Email[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Email[ \t]*:[ \t]*([^\r\n]*)/i);
    record.address = get(/Địa chỉ[ \t]*:[ \t]*([^\r\n]*)/i);
    record.dob = get(/Ngày sinh[ \t]*:[ \t]*([^\r\n]*)/i);
    record.joinDate = get(/Ngày gia nhập[ \t]*:[ \t]*([^\r\n]*)/i);
    record.investmentDuration = get(/Thời gian đầu tư[ \t]*:[ \t]*([^\r\n]*)/i);
    record.investmentStyle = get(/Khẩu vị đầu tư[ \t]*:[ \t]*([^\r\n]*)/i);
    record.stockCompany = get(/Công ty chứng khoán[ \t]*:[ \t]*([^\r\n]*)/i);
    record.stockAccount = get(/Số TKCK VPS \(nếu có\)[ \t]*:[ \t]*([^\r\n]*)/i) || get(/Số TKCK[ \t]*:[ \t]*([^\r\n]*)/i);
    record.tierLevel = get(/Loại tài khoản[ \t]*:[ \t]*([^\r\n]*)/i);
    record.role = get(/Quyền truy cập[ \t]*:[ \t]*([^\r\n]*)/i);

    const tdMatches = trHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    let manager = '';
    if (tdMatches && tdMatches.length >= 4) {
      manager = tdMatches[3]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .trim();
    }
    record.manager = manager || '-';

    if (record.email || record.fullName) {
      records.push(record);
    }
  }

  return records;
}

async function main() {
  try {
    const success = await login();
    if (!success) {
      console.log('Login failed.');
      return;
    }

    // Fetch staff loadList
    console.log('Fetching staff loadList...');
    const staffRes = await httpsRequest(`${STAFF_LOADLIST_URL}?limit=100&offset=1&role=&search=`);
    fs.writeFileSync(path.join(__dirname, 'staff_loadlist.html'), staffRes.body);
    const staff = parseStaff(staffRes.body);
    fs.writeFileSync(path.join(__dirname, 'staff_data.json'), JSON.stringify(staff, null, 2));
    console.log(`Parsed ${staff.length} staff records.`);

    // Fetch client loadList
    console.log('Fetching client loadList...');
    const clientRes = await httpsRequest(`${CLIENT_LOADLIST_URL}?limit=100&offset=1`);
    fs.writeFileSync(path.join(__dirname, 'client_loadlist.html'), clientRes.body);
    const clients = parseClients(clientRes.body);
    fs.writeFileSync(path.join(__dirname, 'client_data.json'), JSON.stringify(clients, null, 2));
    console.log(`Parsed ${clients.length} client records.`);

  } catch (e) {
    console.error(e);
  }
}

main();
