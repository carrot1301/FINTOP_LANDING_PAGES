const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 3000,
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
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 3000,
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

async function main() {
  console.log("1. Login as DEVELOPER (fintop.bashare@gmail.com)...");
  const loginRes = await postJson('http://127.0.0.1:3000/auth/login', {
    email: 'fintop.bashare@gmail.com',
    password: 'FinTop@2026'
  });
  const token = loginRes.data?.data?.accessToken;
  console.log("   Login Status:", loginRes.status);

  if (token) {
    console.log("2. GET http://127.0.0.1:3000/admin/billing/invoices?limit=1000...");
    const invRes = await getJson('http://127.0.0.1:3000/admin/billing/invoices?limit=1000', token);
    console.log("   Invoices Status:", invRes.status);
    console.log("   Invoices Data Count:", Array.isArray(invRes.data) ? invRes.data.length : invRes.data?.data?.length || JSON.stringify(invRes.data));
  }
}

main();
