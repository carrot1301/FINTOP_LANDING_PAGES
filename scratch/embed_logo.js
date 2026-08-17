const fs = require('fs');
const path = require('path');

const logoBuf = fs.readFileSync('./assets/images/fintop-logo-circle-128.png');
const logoBase64 = `data:image/png;base64,${logoBuf.toString('base64')}`;

const mailServicePath = './fintop-backend/src/common/mail/mail.service.ts';
let content = fs.readFileSync(mailServicePath, 'utf-8');

// Add constant for LOGO_BASE64 at top of file
const logoConstant = `const LOGO_BASE64 = '${logoBase64}';\n\n@Injectable()`;
content = content.replace('@Injectable()', logoConstant);

// Replace logo img tags with LOGO_BASE64 and fallback
content = content.replaceAll(
  'src="https://fintopdata.vn/assets/images/fintop-logo-circle-icon.png"',
  `src="\${LOGO_BASE64}"`
);

fs.writeFileSync(mailServicePath, content);
console.log('Successfully updated mail.service.ts with inline LOGO_BASE64');
