const https = require('https');

function triggerDeploy() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.fintopdata.vn',
      path: '/deploy-webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
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
    req.end();
  });
}

async function main() {
  console.log("Triggering live production deployment via POST https://api.fintopdata.vn/deploy-webhook...");
  try {
    const res = await triggerDeploy();
    console.log("Deploy Webhook Status:", res.status);
    console.log("Deploy Webhook Response:", res.data);
  } catch (err) {
    console.log("Webhook error:", err.message);
  }
}

main();
