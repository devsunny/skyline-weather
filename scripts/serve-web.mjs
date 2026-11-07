import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.argv[2] ?? 8088);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === '/') pathname = '/index.html';

  let file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  if (!existsSync(file) || !statSync(file).isFile()) {
    if (!path.extname(pathname)) {
      file = path.join(root, 'index.html');
    } else {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
  }

  const ext = path.extname(file).toLowerCase();
  res.setHeader('Content-Type', mime[ext] ?? 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  createReadStream(file).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Skyline preview at http://127.0.0.1:${port}`);
});
