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

function patchJson(urlStr, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
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

async function fixCeoPasswordOnLive() {
  console.log("Login as DEVELOPER (fintop.bashare@gmail.com)...");
  const devLogin = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'fintop.bashare@gmail.com',
    password: 'FinTop@2026'
  });
  const devToken = devLogin.data?.data?.accessToken;
  if (!devToken) {
    console.error("Failed to login as DEVELOPER");
    return;
  }

  console.log("Resetting fintop.ba@gmail.com password to FinTop@2026 via Admin API...");
  const patchRes = await patchJson('https://api.fintopdata.vn/admin/users/110', {
    password: 'FinTop@2026',
    status: 'ACTIVE'
  }, devToken);
  console.log("Patch Result Status:", patchRes.status, patchRes.data?.message || patchRes.data?.email || '');

  console.log("Testing CEO login (fintop.ba@gmail.com)...");
  const ceoLogin = await postJson('https://api.fintopdata.vn/auth/login', {
    email: 'fintop.ba@gmail.com',
    password: 'FinTop@2026'
  });
  console.log("CEO Login Status:", ceoLogin.status, ceoLogin.data?.user || ceoLogin.data?.message || '');
}

fixCeoPasswordOnLive();
