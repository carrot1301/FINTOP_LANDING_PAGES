const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers,
      timeout: 5000,
    };
    const req = http.request(options, (res) => {
      let rd = '';
      res.on('data', (c) => { rd += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(rd) }); } catch { resolve({ status: res.statusCode, body: rd }); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

async function checkUser122() {
  const login = await request('POST', '/auth/login', { email: 'admin@fintop.vn', password: 'FinTop@2026' });
  const token = (login.body.data || login.body).accessToken;

  const patchRes = await request('PATCH', '/admin/users/122', { emailVerifiedAt: null }, token);
  console.log('PATCH 122 Status:', patchRes.status);
  console.log('PATCH 122 Body:', patchRes.body);

  const detailRes = await request('GET', '/admin/users/122', null, token);
  console.log('User 122 Detail:', detailRes.body?.data || detailRes.body);
}

checkUser122().catch(console.error);
