const https = require('https');

const urls = [
  { label: 'BIN 970422 no amount', url: 'https://img.vietqr.io/image/970422-862862438886-compact2.png?addInfo=TEST' },
  { label: 'MB no amount',         url: 'https://img.vietqr.io/image/MB-862862438886-compact2.png?addInfo=TEST' },
  { label: 'MB with amount',       url: 'https://img.vietqr.io/image/MB-862862438886-compact2.png?amount=2500000&addInfo=TEST' },
  { label: 'BIN 970422 with amount', url: 'https://img.vietqr.io/image/970422-862862438886-compact2.png?amount=2500000&addInfo=TEST' },
  { label: 'MB qr_only no amount', url: 'https://img.vietqr.io/image/MB-862862438886-qr_only.png?addInfo=TEST' },
];

async function testUrl(label, url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const ct = res.headers['content-type'] || 'unknown';
      const cl = res.headers['content-length'] || 'unknown';
      console.log(`[${res.statusCode}] ${label} -> type=${ct} size=${cl}`);
      res.resume();
      resolve();
    }).on('error', (e) => {
      console.log(`[ERR] ${label} -> ${e.message}`);
      resolve();
    });
  });
}

(async () => {
  for (const u of urls) {
    await testUrl(u.label, u.url);
  }
})();
