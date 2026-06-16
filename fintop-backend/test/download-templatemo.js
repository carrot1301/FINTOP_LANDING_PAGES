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
  const css = await download("https://fintopdata.vn/clients/css/templatemo.css", "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\9c3dd6fe-782c-4f3e-bf33-d7a2cd917050\\scratch\\templatemo.css");
  console.log('Downloaded templatemo.css successfully.');
  
  const searchTerms = ['watermark', 'content-reader', 'background', 'clients/img/'];
  searchTerms.forEach(term => {
    if (css.includes(term)) {
      console.log(`Found match for "${term}":`);
      css.split('\n').forEach((l, idx) => {
        if (l.includes(term)) {
          console.log(`${idx + 1}: ${l.trim()}`);
        }
      });
    }
  });
}

main().catch(console.error);
