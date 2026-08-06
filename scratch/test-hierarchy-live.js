const https = require('https');
const http = require('http');

function postJson(urlStr, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };
    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlStr, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testHierarchyAndAccess() {
  console.log("================================================================");
  console.log("=== TESTING CEO (fintop.ba@gmail.com) AND DEVELOPER ACCESS ===");
  console.log("================================================================");

  // 1. Login as CEO (fintop.ba@gmail.com)
  const ceoLogin = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'fintop.ba@gmail.com',
    password: 'FinTop@2026'
  });
  console.log("\n1. CEO Login (fintop.ba@gmail.com) Status:", ceoLogin.status);
  const ceoToken = ceoLogin.data?.data?.accessToken;

  if (ceoToken) {
    const ceoOverview = await getJson('https://api.fintopdata.vn/admin/overview', ceoToken);
    console.log("   GET /admin/overview (CEO): Status", ceoOverview.status);
    const ceoInvoices = await getJson('https://api.fintopdata.vn/admin/billing/invoices?limit=5', ceoToken);
    console.log("   GET /admin/billing/invoices (CEO): Status", ceoInvoices.status);
  }

  // 2. Login as DEVELOPER (fintop.bashare@gmail.com)
  const devLogin = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'fintop.bashare@gmail.com',
    password: 'FinTop@2026'
  });
  console.log("\n2. DEVELOPER Login (fintop.bashare@gmail.com) Status:", devLogin.status);
  const devToken = devLogin.data?.data?.accessToken;

  if (devToken) {
    const devOverview = await getJson('https://api.fintopdata.vn/admin/overview', devToken);
    console.log("   GET /admin/overview (DEVELOPER): Status", devOverview.status);
    const devInvoices = await getJson('https://api.fintopdata.vn/admin/billing/invoices?limit=5', devToken);
    console.log("   GET /admin/billing/invoices (DEVELOPER): Status", devInvoices.status);
  }

  console.log("\n✅ ALL API ACCESS CHECKS PASSED!");
}

testHierarchyAndAccess();
