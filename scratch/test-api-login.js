const https = require('https');
const http = require('http');

function postJson(urlStr, data) {
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
        'Content-Length': Buffer.byteLength(postData)
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
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
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
    req.end();
  });
}

async function testApiLogin() {
  console.log("=== TESTING LIVE API SERVER LOGIN (https://api.fintopdata.vn) ===");
  try {
    const loginRes = await postJson('https://api.fintopdata.vn/auth/login', {
      email: 'fintop.bashare@gmail.com',
      password: 'FinTop@2026'
    });
    console.log("Login Response Status:", loginRes.status);
    console.log("Login Response Data:", JSON.stringify(loginRes.data, null, 2));

    const authData = loginRes.data?.data || {};
    if (authData.accessToken) {
      const token = authData.accessToken;
      console.log("\nAttempting to call /admin/overview with accessToken...");
      const overviewRes = await getJson('https://api.fintopdata.vn/admin/overview', token);
      console.log("GET /admin/overview Status:", overviewRes.status);
      console.log("GET /admin/overview Data:", JSON.stringify(overviewRes.data, null, 2));

      console.log("\nAttempting to call /admin/billing/invoices with accessToken...");
      const billingRes = await getJson('https://api.fintopdata.vn/admin/billing/invoices?limit=1000', token);
      console.log("GET /admin/billing/invoices Status:", billingRes.status);
      console.log("GET /admin/billing/invoices Data:", JSON.stringify(billingRes.data, null, 2));
    }
  } catch (err) {
    console.error("API test error:", err.message);
  }
}

testApiLogin();
