const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://fintopdata.vn';
const LOGIN_EMAIL = 'tuannv7105@gmail.com';
const LOGIN_PASSWORD = 'tuantuan2k5ZXC';

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
}

async function main() {
  const client = new Client();
  console.log('Logging in...');
  const loginPage = await client.get(`${BASE_URL}/login`);
  const token = extractCSRFToken(loginPage);
  
  await client.post(`${BASE_URL}/system/home`, {
    _token: token,
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
    acp_checkbox: 'on',
  });
  console.log('Logged in successfully.');

  const blogId = '3719c6eb-8f41-4011-a63a-c4c4ca1c756f'; // VIB 2026 article

  // 1. Try infoBlog endpoint (GET /system/blog/infor?id={id})
  console.log(`\n--- Fetching /system/blog/infor?id=${blogId} ---`);
  const infoHtml = await client.get(`${BASE_URL}/system/blog/infor?id=${blogId}`);
  console.log(`Length: ${infoHtml.length} bytes`);
  fs.writeFileSync('scratch/blog_infor_sample.html', infoHtml, 'utf-8');
  console.log('Saved to scratch/blog_infor_sample.html');

  // 2. Try edit endpoint (POST /system/blog/edit with id)
  console.log(`\n--- Fetching /system/blog/edit (POST) with id=${blogId} ---`);
  const editPage = await client.get(`${BASE_URL}/system/blog/index`);
  const adminToken = extractCSRFToken(editPage);
  const editRes = await client.post(`${BASE_URL}/system/blog/edit`, {
    _token: adminToken,
    id: blogId
  });
  const editHtml = await editRes.text();
  console.log(`Length: ${editHtml.length} bytes`);
  fs.writeFileSync('scratch/blog_edit_sample.html', editHtml, 'utf-8');
  console.log('Saved to scratch/blog_edit_sample.html');
}

main().catch(console.error);
