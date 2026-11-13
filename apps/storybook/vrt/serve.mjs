// storybook-static 정적 서버(외부 의존 없음). Playwright webServer가 띄운다.
//   node vrt/serve.mjs [port]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { STATIC_DIR } from './targets.mjs';

const PORT = Number(process.argv[2] ?? process.env['VRT_PORT'] ?? 6107);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

if (!existsSync(join(STATIC_DIR, 'index.json'))) {
  console.error('storybook-static 없음. 먼저 pnpm storybook:build');
  process.exit(1);
}

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = normalize(join(STATIC_DIR, url));
  if (!file.startsWith(STATIC_DIR)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`storybook-static → http://127.0.0.1:${PORT}`));
