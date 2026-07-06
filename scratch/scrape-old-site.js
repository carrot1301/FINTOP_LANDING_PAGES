/**
 * Script to scrape user data from old fintopdata.vn admin panel
 * Uses correct POST action: https://fintopdata.vn/system/home
 */

const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const querystring = require('querystring');

const BASE_URL = 'https://fintopdata.vn';
const LOGIN_PAGE_URL = `${BASE_URL}/login`;
const POST_LOGIN_URL = `${BASE_URL}/system/home`;

const STAFF_URL = `${BASE_URL}/system/staff/index`;
const CLIENT_URL = `${BASE_URL}/system/client/index`;

const CREDENTIALS = {
  email: 'tuannv7105@gmail.com',
  password: 'tuantuan2k5ZXC'
};

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
  console.log('=== Step 1: GET login page ===');
  const loginPage = await httpsRequest(LOGIN_PAGE_URL);
  console.log('Status:', loginPage.status);

  // Extract CSRF token
  const csrfMatch = loginPage.body.match(/name="_token"\s*value="([^"]+)"/);
  const token = csrfMatch ? csrfMatch[1] : null;
  console.log('CSRF Token:', token ? token.substring(0, 30) + '...' : 'NOT FOUND');

  const xsrfCookie = allCookies['XSRF-TOKEN'];
  const xsrfDecoded = xsrfCookie ? decodeURIComponent(xsrfCookie) : '';

  console.log('\n=== Step 2: POST login to /system/home ===');
  const formBody = querystring.stringify({
    _token: token,
    email: CREDENTIALS.email,
    password: CREDENTIALS.password,
  });

  const loginRes = await httpsRequest(POST_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(formBody).toString(),
      'Referer': LOGIN_PAGE_URL,
      'Origin': BASE_URL,
      'X-XSRF-TOKEN': xsrfDecoded,
    },
    body: formBody,
  });

  console.log('Login Status:', loginRes.status);
  console.log('Location:', loginRes.location);

  if (loginRes.status === 302 && loginRes.location) {
    console.log('Following redirect to:', loginRes.location);
    const redir = loginRes.location.startsWith('http') ? loginRes.location : BASE_URL + loginRes.location;
    const redirRes = await httpsRequest(redir);
    console.log('Redirect page status:', redirRes.status);
    
    if (redirRes.body.includes('Quản trị') || redirRes.body.includes('Trang Chủ') || redirRes.body.includes('Nguyễn Văn Tuấn')) {
      console.log('✅ LOGIN SUCCESS!');
      return true;
    }
  }

  if (loginRes.status === 200) {
    if (loginRes.body.includes('Quản trị') || loginRes.body.includes('Đăng xuất') || loginRes.body.includes('Nhân sự')) {
      console.log('✅ LOGIN SUCCESS (200)!');
      return true;
    }
  }

  return false;
}

async function fetchPage(url) {
  const res = await httpsRequest(url);
  console.log(`Fetch ${url} -> Status: ${res.status}`);
  return res.body;
}

function parseStaff(html) {
  const records = [];
  
  // Let's use a very robust regex for table body rows
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return records;
  
  const tbodyHtml = tbodyMatch[1];
  const trMatches = tbodyHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!trMatches) return records;

  for (const trHtml of trMatches) {
    // Check if it has key fields
    if (!trHtml.includes('Email') && !trHtml.includes('Tên')) continue;
    
    const record = {};
    
    // Clean text helper
    const clean = (str) => {
      if (!str) return '';
      return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    };

    // Extract fields
    const nameMatch = trHtml.match(/Tên\s*:\s*([^<\n]+)/i);
    const codeMatch = trHtml.match(/ID nhân sự\s*:\s*([^<\n]+)/i);
    const phoneMatch = trHtml.match(/Số điện thoại\s*:\s*([^<\n]+)/i) || trHtml.match(/Số điện thoai\s*:\s*([^<\n]+)/i);
    const emailMatch = trHtml.match(/Địa chỉ Email\s*:\s*([^<\n]+)/i) || trHtml.match(/Email\s*:\s*([^<\n]+)/i);
    const addressMatch = trHtml.match(/Địa chỉ\s*:\s*([^<\n]+)/i);
    const dobMatch = trHtml.match(/Ngày sinh\s*:\s*([^<\n]+)/i);
    const roleMatch = trHtml.match(/Quyền truy cập\s*:\s*([^<\n]+)/i);

    if (nameMatch) record.fullName = clean(nameMatch[1]);
    if (codeMatch) record.staffCode = clean(codeMatch[1]);
    if (phoneMatch) record.phone = clean(phoneMatch[1]);
    if (emailMatch) record.email = clean(emailMatch[1]);
    if (addressMatch) record.address = clean(addressMatch[1]);
    if (dobMatch) record.dob = clean(dobMatch[1]);
    if (roleMatch) record.role = clean(roleMatch[1]);

    if (record.email || record.fullName) {
      records.push(record);
    }
  }

  return records;
}

function parseClients(html) {
  const records = [];
  
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return records;
  
  const tbodyHtml = tbodyMatch[1];
  const trMatches = tbodyHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!trMatches) return records;

  for (const trHtml of trMatches) {
    if (!trHtml.includes('Email') && !trHtml.includes('Tên')) continue;
    
    const record = {};
    const clean = (str) => {
      if (!str) return '';
      return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    };

    const nameMatch = trHtml.match(/Tên khách hàng\s*:\s*([^<\n]+)/i) || trHtml.match(/Tên\s*:\s*([^<\n]+)/i);
    const phoneMatch = trHtml.match(/Số điện thoại\s*:\s*([^<\n]+)/i) || trHtml.match(/Số điện thoai\s*:\s*([^<\n]+)/i);
    const emailMatch = trHtml.match(/Địa chỉ Email\s*:\s*([^<\n]+)/i) || trHtml.match(/Email\s*:\s*([^<\n]+)/i);
    const addressMatch = trHtml.match(/Địa chỉ\s*:\s*([^<\n]+)/i);
    const dobMatch = trHtml.match(/Ngày sinh\s*:\s*([^<\n]+)/i);
    const joinDateMatch = trHtml.match(/Ngày gia nhập\s*:\s*([^<\n]+)/i);
    const durationMatch = trHtml.match(/Thời gian đầu tư\s*:\s*([^<\n]*)/i);
    const styleMatch = trHtml.match(/Khẩu vị đầu tư\s*:\s*([^<\n]+)/i);
    const brokerMatch = trHtml.match(/Công ty chứng khoán\s*:\s*([^<\n]+)/i);
    const stockAccMatch = trHtml.match(/Số TKCK[^:]*:\s*([^<\n]*)/i);
    const tierMatch = trHtml.match(/Loại tài khoản\s*:\s*([^<\n]+)/i);
    const roleMatch = trHtml.match(/Quyền truy cập\s*:\s*([^<\n]+)/i);

    if (nameMatch) record.fullName = clean(nameMatch[1]);
    if (phoneMatch) record.phone = clean(phoneMatch[1]);
    if (emailMatch) record.email = clean(emailMatch[1]);
    if (addressMatch) record.address = clean(addressMatch[1]);
    if (dobMatch) record.dob = clean(dobMatch[1]);
    if (joinDateMatch) record.joinDate = clean(joinDateMatch[1]);
    
    // Clean up duration formatting
    if (durationMatch) {
      record.investmentDuration = clean(durationMatch[1]).replace(/Khẩu vị đầu tư.*/i, '').trim();
    }
    if (styleMatch) record.investmentStyle = clean(styleMatch[1]);
    if (brokerMatch) record.stockCompany = clean(brokerMatch[1]);
    if (stockAccMatch) record.stockAccount = clean(stockAccMatch[1]).replace(/Loại tài khoản.*/i, '').trim();
    if (tierMatch) record.tierLevel = clean(tierMatch[1]);
    if (roleMatch) record.role = clean(roleMatch[1]);

    if (record.email || record.fullName) {
      records.push(record);
    }
  }

  return records;
}

async function main() {
  try {
    const loggedIn = await login();
    if (!loggedIn) {
      console.log('❌ Could not authenticate.');
      return;
    }

    console.log('\nFetching staff...');
    const staffHtml = await fetchPage(STAFF_URL);
    const staff = parseStaff(staffHtml);
    fs.writeFileSync('staff_data.json', JSON.stringify(staff, null, 2));
    console.log(`✅ Saved ${staff.length} staff records to staff_data.json`);

    console.log('\nFetching clients...');
    const clientHtml = await fetchPage(CLIENT_URL);
    const clients = parseClients(clientHtml);
    fs.writeFileSync('client_data.json', JSON.stringify(clients, null, 2));
    console.log(`✅ Saved ${clients.length} client records to client_data.json`);

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
