const http = require('https');
const fs = require('fs');

const url = "https://fintopdata.vn/client/about/reader/3719c6eb-8f41-4011-a63a-c4c4ca1c756f";

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\9c3dd6fe-782c-4f3e-bf33-d7a2cd917050\\scratch\\raw_old_reader.html', data);
    console.log('Downloaded raw HTML successfully.');
  });
}).on('error', (err) => {
  console.error('Error downloading:', err.message);
});
