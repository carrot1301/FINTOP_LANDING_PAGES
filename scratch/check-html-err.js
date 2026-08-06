const https = require('https');

https.get('https://api.fintopdata.vn/auth/login', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", body.substring(0, 500));
  });
}).on('error', console.error);
