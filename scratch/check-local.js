const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = http.request(options, (res) => {
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

async function main() {
  console.log("Testing POST http://127.0.0.1:3000/auth/login...");
  const res = await postJson('http://127.0.0.1:3000/auth/login', {
    email: 'fintop.bashare@gmail.com',
    password: 'FinTop@2026'
  });
  console.log("Result Status:", res.status);
  console.log("Response Body:", JSON.stringify(res.data, null, 2));
}

main();
