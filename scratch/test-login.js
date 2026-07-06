const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const querystring = require('querystring');

const BASE_URL = 'https://fintopdata.vn';
const LOGIN_PAGE_URL = `${BASE_URL}/login`;
const POST_LOGIN_URL = `${BASE_URL}/system/home`;

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

async function test() {
  const page = await httpsRequest(LOGIN_PAGE_URL);
  const csrfMatch = page.body.match(/name="_token"\s*value="([^"]+)"/);
  const token = csrfMatch ? csrfMatch[1] : '';
  console.log('CSRF Token:', token);

  const formBody = querystring.stringify({
    _token: token,
    email: 'tuannv7105@gmail.com',
    password: 'tuantuan2k5ZXC',
    acp_checkbox: 'on'
  });

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

  console.log('Status:', res.status);
  console.log('Location:', res.location);
  fs.writeFileSync('response_body.html', res.body);
  console.log('Saved response to response_body.html');
}

test();
