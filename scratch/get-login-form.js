const https = require('https');
const fs = require('fs');

https.get('https://fintopdata.vn/login', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    fs.writeFileSync('login_form.html', body);
    console.log('Saved to login_form.html');
    
    // Find forms
    const forms = body.match(/<form[\s\S]*?<\/form>/gi);
    if (forms) {
      forms.forEach((f, i) => {
        console.log(`Form #${i}:`);
        console.log(f.substring(0, 1000));
      });
    } else {
      console.log('No form tag found!');
    }
  });
});
