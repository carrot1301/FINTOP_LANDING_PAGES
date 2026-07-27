const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const PROJECT_ROOT = __dirname;
const FRONTEND_ROOT = path.join(PROJECT_ROOT, 'fintop_frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  console.log(`[Static Server] ${req.method} ${req.url}`);
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  // Parse URL and strip query parameters
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/data/stock-filter-data.js') {
    res.writeHead(403, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    res.end('Protected stock filter data must be served through an authenticated API.');
    return;
  }

  if (pathname === '/hoi-vien' || pathname === '/hoi-vien/' || pathname === '/hoi-vien/index.html') {
    res.writeHead(302, {
      'Location': '/index.html#panel-hoivien',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    res.end();
    return;
  }

  // Determine target physical file path
  let filePath = '';

  // 1. Root index.html or empty path goes to PROJECT_ROOT/index.html
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(PROJECT_ROOT, 'index.html');
  }
  // 2. /assets/* or /data/* goes to PROJECT_ROOT/*
  else if (pathname.startsWith('/assets/') || pathname.startsWith('/data/')) {
    filePath = path.join(PROJECT_ROOT, pathname);
  }
  // 3. Subpages and resources served from fintop_frontend
  else {
    filePath = path.join(FRONTEND_ROOT, pathname);
  }

  // Helper to serve file with multi-path resolution
  function serveFile(targetPath, isFallback = false) {
    fs.stat(targetPath, (err, stats) => {
      if (err) {
        // Fallback 1: Try checking inside PROJECT_ROOT if failed in FRONTEND_ROOT (or vice versa)
        if (!isFallback) {
          const alternatePath = targetPath.startsWith(FRONTEND_ROOT) 
            ? path.join(PROJECT_ROOT, pathname) 
            : path.join(FRONTEND_ROOT, pathname);
          if (alternatePath !== targetPath) {
            serveFile(alternatePath, true);
            return;
          }
        }
        // Fallback 2: File not found fallback for dynamic route subpages (like /chuyen-gia/)
        if (pathname.startsWith('/chuyen-gia/') && path.extname(pathname) === '') {
          const fallbackPath = path.join(FRONTEND_ROOT, 'chuyen-gia', 'index.html');
          if (targetPath !== fallbackPath) {
            serveFile(fallbackPath, true);
            return;
          }
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${pathname}`);
        return;
      }

      if (stats.isDirectory()) {
        // If it's a directory, check for index.html inside it
        const indexHtmlPath = path.join(targetPath, 'index.html');
        serveFile(indexHtmlPath);
        return;
      }

      // Check if file is a file
      if (!stats.isFile()) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Bad Request');
        return;
      }

      // Determine content type
      const ext = path.extname(targetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Smart Cache Control:
      // Media, images and fonts should be cached in the browser to prevent performance stuttering (especially the 65MB video)
      let cacheControl = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      const cacheableExtensions = ['.mp4', '.webm', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf'];
      
      if (cacheableExtensions.includes(ext)) {
        cacheControl = 'public, max-age=86400'; // Cache for 24 hours
      }

      // Read and stream file
      const stream = fs.createReadStream(targetPath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': cacheControl
      });
      stream.pipe(res);
      stream.on('error', (streamErr) => {
        console.error(`Stream error serving ${targetPath}:`, streamErr);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Internal Server Error');
        }
      });
    });
  }

  serveFile(filePath);
});

const HOST = '0.0.0.0';
function startServer(p) {
  server.listen(p, HOST, () => {
    console.log(`[FinTop Static Server] Running at http://${HOST}:${p}/index.html`);
    console.log(`[FinTop Static Server] Project root: ${PROJECT_ROOT}`);
    console.log(`[FinTop Static Server] Frontend subpages root: ${FRONTEND_ROOT}`);
    console.log('Press Ctrl+C to stop.');
  });
}

server.on('error', (err) => {
  if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
    if (PORT === 8080 && !process.env.PORT) {
      console.warn(`[FinTop Static Server] Port 8080 is reserved or in use. Falling back to port 8081...`);
      PORT = 8081;
      startServer(PORT);
    } else {
      console.error(`[FinTop Static Server] Failed to bind to port ${PORT}:`, err.message);
      process.exit(1);
    }
  } else {
    console.error(`[FinTop Static Server] Server error:`, err.message);
    process.exit(1);
  }
});

startServer(PORT);
