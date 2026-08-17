const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('./assets/images').filter(f => f.toLowerCase().includes('logo'));
const html = `
<!DOCTYPE html>
<html>
<body style="background:#0f0a1e; color:white; padding:20px; font-family:sans-serif;">
<h2>Logo Preview on Email Dark Background (#0f0a1e / #1a1432)</h2>
${files.map(f => `
  <div style="margin:20px; padding:20px; background:#1a1432; border:1px solid #333; border-radius:8px;">
    <h3>${f}</h3>
    <div style="display:flex; gap:20px; align-items:center;">
      <div>
        <p>On Dark Background (#1a1432):</p>
        <img src="../assets/images/${f}" style="max-height:80px;">
      </div>
      <div>
        <p>On Light Background (white):</p>
        <img src="../assets/images/${f}" style="max-height:80px; background:white; padding:5px;">
      </div>
    </div>
  </div>
`).join('')}
</body>
</html>
`;
fs.writeFileSync('./scratch/preview_logos.html', html);
console.log('Created scratch/preview_logos.html');
