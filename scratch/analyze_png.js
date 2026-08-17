const fs = require('fs');
const path = require('path');

// Read PNG color type and check bytes
const files = fs.readdirSync('./assets/images').filter(f => f.toLowerCase().includes('logo'));
files.forEach(f => {
  const p = path.join('./assets/images', f);
  const buf = fs.readFileSync(p);
  console.log('---', f, '---');
  console.log('Size:', buf.length);
  if (buf[0] === 0x89) {
    const bitDepth = buf[24];
    const colorType = buf[25]; // 2 = RGB, 6 = RGBA
    console.log('Bit depth:', bitDepth, 'Color type:', colorType === 6 ? 'RGBA' : colorType === 2 ? 'RGB' : colorType);
  }
});
