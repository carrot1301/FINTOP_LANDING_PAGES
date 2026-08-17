const fs = require('fs');
const http = require('https');

// Check accessibility of logo image URLs on fintopdata.vn
const urls = [
  'https://fintopdata.vn/assets/images/fintop-logo.png',
  'https://fintopdata.vn/assets/images/fintop-logo-full.png',
  'https://fintopdata.vn/assets/images/fintop-logo-circle-icon.png',
  'https://fintopdata.vn/assets/images/fintop-logo-circle.png',
  'https://fintopdata.vn/assets/images/fintop-logo-new.png'
];

urls.forEach(url => {
  http.get(url, res => {
    console.log(url, '=> Status:', res.statusCode, 'Length:', res.headers['content-length']);
  }).on('error', err => {
    console.log(url, '=> Error:', err.message);
  });
});
