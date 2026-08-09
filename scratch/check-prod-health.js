const https = require('https');

function checkHealth() {
  return new Promise((resolve) => {
    https.get('https://api.fintopdata.vn/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', err => resolve({ status: 0, error: err.message }));
  });
}

async function run() {
  const h = await checkHealth();
  console.log('Production Health Check:', h);
}

run();
