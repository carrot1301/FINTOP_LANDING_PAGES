const http = require('https');
const fs = require('fs');

async function download(url, filepath) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        fs.writeFileSync(filepath, data);
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function main() {
  const customCss = await download("https://fintopdata.vn/clients/css/custom.css", "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\9c3dd6fe-782c-4f3e-bf33-d7a2cd917050\\scratch\\custom.css");
  console.log('Downloaded custom.css successfully.');
  
  if (customCss.includes('watermark') || customCss.includes('bg') || customCss.includes('content-reader')) {
    console.log('Found matches in custom.css.');
    // search lines
    customCss.split('\n').forEach((l, idx) => {
      if (l.includes('watermark') || l.includes('content-reader') || l.includes('banner-vertical-center-work')) {
        console.log(`${idx + 1}: ${l.trim()}`);
      }
    });
  }
}

main().catch(console.error);
