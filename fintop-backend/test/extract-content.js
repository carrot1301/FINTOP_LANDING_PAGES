const fs = require('fs');

const html = fs.readFileSync('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\9c3dd6fe-782c-4f3e-bf33-d7a2cd917050\\scratch\\raw_old_reader.html', 'utf8');

const startIdx = html.indexOf('<div class="banner-content col-lg-10 col-10 m-lg-auto text-left content-reader" id="content-reader">');
if (startIdx === -1) {
  console.log('Could not find content-reader container start.');
  return;
}

const rest = html.substring(startIdx);
const endIdx = rest.indexOf('</div>\n    </div>\n    <!-- End Service -->');
if (endIdx === -1) {
  console.log('Could not find content-reader container end.');
  // Let's just write the first 10000 chars of rest
  fs.writeFileSync('C:\\Users\\Admin\\.gemini\antigravity-ide\\brain\\9c3dd6fe-782c-4f3e-bf33-d7a2cd917050\\scratch\\extracted_content.html', rest.substring(0, 15000));
} else {
  fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\9c3dd6fe-782c-4f3e-bf33-d7a2cd917050\\scratch\\extracted_content.html', rest.substring(0, endIdx + 6));
}

console.log('Extracted content HTML successfully.');
