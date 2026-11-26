// Static server for local work. Unlike a plain file server it sends "Cache-Control: no-store",
// so the browser never mixes old and new files while the page is being edited.
//   node tools/serve.mjs [port]
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] ?? process.env.PORT ?? 8080);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) { res.writeHead(403).end('Forbidden'); return; }
  try { if (statSync(file).isDirectory()) file = join(file, 'index.html'); } catch { res.writeHead(404).end('Not found'); return; }
  try { statSync(file); } catch { res.writeHead(404).end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`http://localhost:${port}`));
