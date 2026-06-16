const https = require('https');
const fs = require('fs');

const url = 'https://fintopdata.vn/clients/img/LogoFinTop_notbg.jpg';
const dest = 'C:\\Users\\Admin\\FINTOP_LANDING_PAGES\\assets\\images\\LogoFinTop_notbg.jpg';

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download: Status Code ${res.statusCode}`);
    return;
  }
  const fileStream = fs.createWriteStream(dest);
  res.pipe(fileStream);
  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Download complete: ' + dest);
  });
}).on('error', (err) => {
  console.error('Error: ' + err.message);
});
