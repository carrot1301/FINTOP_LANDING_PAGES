const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, length: data.length }));
    }).on('error', reject);
  });
}

async function test() {
  const urls = [
    'http://127.0.0.1:8080/stock-data/pro-data/index.html',
    'http://127.0.0.1:8080/fintop_frontend/stock-data/dinh-luong/index.html',
    'http://127.0.0.1:8080/assets/css/variables.css',
    'http://127.0.0.1:8080/assets/css/demo-pages.css',
    'http://127.0.0.1:8080/assets/js/core/index.js',
    'http://127.0.0.1:8080/assets/js/demo-nav.js'
  ];

  for (const url of urls) {
    try {
      const res = await get(url);
      console.log(`[${res.status}] ${url} (${res.length} bytes)`);
    } catch (err) {
      console.log(`[ERR] ${url}: ${err.message}`);
    }
  }
}

test();
