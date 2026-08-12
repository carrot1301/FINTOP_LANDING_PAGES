const https = require('https');

function checkFrontend() {
  return new Promise((resolve) => {
    https.get('https://fintopdata.vn', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length }));
    }).on('error', err => resolve({ status: 0, error: err.message }));
  });
}

async function run() {
  const f = await checkFrontend();
  console.log('Frontend Check (https://fintopdata.vn):', f);
}

run();
