import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.env.STATIC_DIRECTORY || 'out');
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';
const port = Number(process.env.PORT || 3100);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (prefix && pathname === prefix) {
      response
        .writeHead(308, {
          Location: `${prefix}/${new URL(request.url, 'http://localhost').search}`,
        })
        .end();
      return;
    }
    if (prefix && !pathname.startsWith(`${prefix}/`)) throw new Error('Outside base path');
    const relative = pathname.slice(prefix.length);
    let filename = path.resolve(root, `.${relative}`);
    if (!filename.startsWith(`${root}${path.sep}`) && filename !== root)
      throw new Error('Invalid path');
    if (!path.extname(filename)) {
      if (!relative.endsWith('/')) {
        response
          .writeHead(308, {
            Location: `${pathname}/${new URL(request.url, 'http://localhost').search}`,
          })
          .end();
        return;
      }
      filename = path.join(filename, 'index.html');
    }
    const body = await readFile(filename);
    response
      .writeHead(200, {
        'Content-Type': types[path.extname(filename)] || 'application/octet-stream',
      })
      .end(body);
  } catch {
    const body = await readFile(path.join(root, '404.html')).catch(() => 'Not found');
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Static preview: http://127.0.0.1:${port}${prefix}/`),
);
