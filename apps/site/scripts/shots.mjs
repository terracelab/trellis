// 화면 블록 미리보기 그림을 만든다: 빌드된 데모(apps/demo/dist)에서 블록마다 라이트 · 다크를 찍어 public/blocks/에 둔다.
//   node scripts/shots.mjs [--only <블록 id 접두>]
// 그림은 커밋한다(블록이 바뀌면 다시 돌린다). check.mjs가 블록마다 그림이 있는지 본다.
// 기본 크기는 1440×900을 절반으로 줄인 720×450, 휴대폰 전용 블록(sizes가 390뿐)은 390×844.
// 큰 자리에 쓰는 블록(LARGE)은 1440×900 원본도 찍는다(<id>@2x).
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

// DEMO_DIST로 다른 빌드 폴더를 가리킬 수 있다(끝에 / 포함)
const DEMO = process.env.DEMO_DIST ?? fileURLToPath(new URL('../../demo/dist/', import.meta.url));
const BLOCKS = fileURLToPath(new URL('../../../blocks/src/', import.meta.url));
const OUT = fileURLToPath(new URL('../public/blocks/', import.meta.url));
const LARGE = new Set(
  JSON.parse(readFileSync(new URL('../src/lib/featured.json', import.meta.url), 'utf8')).large,
);
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

if (!existsSync(join(DEMO, 'index.html'))) {
  console.error('데모 빌드가 없다. 먼저 pnpm --filter @terracelab/demo build');
  process.exit(1);
}
// 데모가 어느 경로 기준으로 빌드됐는지 index.html에서 읽는다(/demo/ 또는 /<base>/demo/)
const base = /(?:src|href)="([^"]*\/)assets\//.exec(
  readFileSync(join(DEMO, 'index.html'), 'utf8'),
)?.[1];
if (!base) {
  console.error('데모 index.html에서 기준 경로를 읽지 못했다');
  process.exit(1);
}

const blocks = [];
for (const g of readdirSync(BLOCKS)) {
  if (g.startsWith('_') || !statSync(join(BLOCKS, g)).isDirectory()) continue;
  for (const m of readdirSync(join(BLOCKS, g)))
    for (const s of readdirSync(join(BLOCKS, g, m))) {
      const file = join(BLOCKS, g, m, s, 'block.json');
      if (existsSync(file)) blocks.push(JSON.parse(readFileSync(file, 'utf8')));
    }
}
const targets = blocks.filter((b) => !only || b.id.startsWith(only));

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!url.startsWith(base)) return res.writeHead(404).end();
  let file = normalize(join(DEMO, url.slice(base.length)));
  if (!file.startsWith(normalize(DEMO))) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
mkdirSync(OUT, { recursive: true });

const fileOf = (id) => id.replaceAll('/', '--');
const browser = await chromium.launch();
const failures = [];
let done = 0;

async function shoot(block, theme, scale) {
  const phone = !block.sizes.includes(1440);
  const context = await browser.newContext({
    viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: phone ? 1 : scale,
    reducedMotion: 'reduce',
    colorScheme: theme,
  });
  await context.addInitScript((t) => localStorage.setItem('tl-demo-theme', t), theme);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(`${ORIGIN}${base}#/${block.id}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    const name = `${fileOf(block.id)}${scale === 1 && !phone ? '@2x' : ''}${theme === 'dark' ? '--dark' : ''}.jpg`;
    await page.screenshot({ path: join(OUT, name), type: 'jpeg', quality: 80 });
    if (errors.length) failures.push(`${block.id} ${theme}: ${errors[0]}`);
  } catch (e) {
    failures.push(`${block.id} ${theme}: ${String(e).slice(0, 160)}`);
  } finally {
    await context.close();
  }
}

const jobs = [];
for (const block of targets)
  for (const theme of ['light', 'dark']) {
    jobs.push([block, theme, 0.5]);
    if (LARGE.has(block.id)) jobs.push([block, theme, 1]);
  }
const workers = Array.from({ length: 4 }, async () => {
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    await shoot(...job);
    done += 1;
    if (done % 20 === 0) console.log(`${done}장`);
  }
});
await Promise.all(workers);
await browser.close();
server.close();

console.log(`블록 ${targets.length}개 · 그림 ${done}장 → public/blocks/`);
if (failures.length) {
  console.error(`실패:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
