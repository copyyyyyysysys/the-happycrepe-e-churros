const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  // Parse clean URL and ignore query strings
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Security check: block path traversal
  const safePath = path.normalize(path.join(ROOT, pathname));
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    return res.end('403 Proibido');
  }

  // Handle directory or root
  let targetFile = safePath;
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(targetFile, 'index.html');
  }

  // If file doesn't exist, check 404
  if (!fs.existsSync(targetFile)) {
    const notFoundFile = path.join(ROOT, '404.html');
    if (fs.existsSync(notFoundFile)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      return fs.createReadStream(notFoundFile).pipe(res);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });

  fs.createReadStream(targetFile).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  HAPPY CREPE & CHURROS — SERVIDOR LOCAL ATIVO`);
  console.log(`  Acesse no navegador: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
