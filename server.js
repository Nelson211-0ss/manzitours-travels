#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(301, { Location: location });
  res.end();
}

function tryServe(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }
    const ext = path.extname(filePath);
    const contentType = MIME[ext] || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => send(res, 500, 'Internal Server Error'));
    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const [rawPath, rawQuery] = decodeURIComponent(req.url).split('?');
  const query = rawQuery ? `?${rawQuery}` : '';
  let urlPath = rawPath;

  // 1) Redirect /index.html (or /index) → /
  if (urlPath === '/index.html' || urlPath === '/index') {
    return redirect(res, '/' + query);
  }

  // 2) Redirect any /<name>.html → /<name> (clean URLs are canonical)
  //    Skip component partials so the loader can still fetch them.
  if (urlPath.endsWith('.html') && !urlPath.startsWith('/components/')) {
    return redirect(res, urlPath.slice(0, -'.html'.length) + query);
  }

  // 3) Strip trailing slash (except root) for canonical URLs
  if (urlPath.length > 1 && urlPath.endsWith('/')) {
    return redirect(res, urlPath.replace(/\/+$/, '') + query);
  }

  // 4) Root → index.html
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    return send(res, 403, 'Forbidden');
  }

  // 5) If path has no extension, try the .html version (clean URL)
  if (!path.extname(urlPath)) {
    const htmlPath = filePath + '.html';
    return fs.stat(htmlPath, (err, stat) => {
      if (!err && stat.isFile()) return tryServe(res, htmlPath);
      // Fall back to direct file (e.g. directories/static assets without ext)
      tryServe(res, filePath);
    });
  }

  tryServe(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
