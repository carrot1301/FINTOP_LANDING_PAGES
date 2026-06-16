const fs = require('fs');

const html = fs.readFileSync('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\9c3dd6fe-782c-4f3e-bf33-d7a2cd917050\\scratch\\raw_old_reader.html', 'utf8');

// Print all image sources
console.log('--- Images found ---');
const imgRegex = /<img[^>]+src="([^">]+)"/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
  console.log(match[1]);
}

// Print lines containing content-reader
console.log('\n--- Content reader lines ---');
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('content-reader') || l.includes('banner-vertical-center-work')) {
    console.log(`${idx + 1}: ${l.trim()}`);
  }
});

// Search for any style tags or stylesheets
console.log('\n--- Stylesheets found ---');
const linkRegex = /<link[^>]+href="([^">]+)"/g;
while ((match = linkRegex.exec(html)) !== null) {
  console.log(match[1]);
}
