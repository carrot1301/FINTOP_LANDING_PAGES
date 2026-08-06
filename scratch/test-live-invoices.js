const https = require('https');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
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
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function testLiveEndpoints() {
  console.log("1. Login as DEVELOPER on Live (https://api.fintopdata.vn)...");
  const loginRes = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'fintop.bashare@gmail.com',
    password: 'FinTop@2026'
  });
  const token = loginRes.data?.data?.accessToken;
  console.log("   Live Login Status:", loginRes.status);

  if (token) {
    console.log("2. GET https://api.fintopdata.vn/admin/billing/invoices?limit=1000...");
    const invRes = await getJson('https://api.fintopdata.vn/admin/billing/invoices?limit=1000', token);
    console.log("   Live Invoices Status:", invRes.status);

    console.log("3. GET https://api.fintopdata.vn/admin/billing/plans...");
    const planRes = await getJson('https://api.fintopdata.vn/admin/billing/plans', token);
    console.log("   Live Plans Status:", planRes.status);
  }
}

testLiveEndpoints();
