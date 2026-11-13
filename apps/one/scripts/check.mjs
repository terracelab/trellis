// 빌드된 테라스원 사이트 검사: 1440 라이트·다크 · 1024 · 390에서 axe critical·serious 0, 외부 요청 0, 콘솔 오류 0,
// 차트 마운트, 섹션 앵커. 대비 승인 대기(data-contrast-pending)는 따로 센다(D-33).
//   node scripts/check.mjs [스크린샷 폴더]
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SHOTS = process.argv[2];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};
if (!existsSync(DIST)) {
  console.error('dist 없음. 먼저 pnpm --filter @terracelab/one build');
  process.exit(1);
}
const server = createServer((req, res) => {
  let file = normalize(join(DIST, decodeURIComponent((req.url ?? '/').split('?')[0])));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const failures = [];
const pending = new Map();
const browser = await chromium.launch();
try {
  for (const [width, theme] of [
    [1440, 'light'],
    [1440, 'dark'],
    [1100, 'light'],
    [390, 'light'],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    await context.addInitScript((t) => localStorage.setItem('one-theme', t), theme);
    const page = await context.newPage();
    const external = [];
    const errors = [];
    page.on('request', (r) => {
      if (!r.url().startsWith(ORIGIN) && !/^(data|blob|about):/.test(r.url()))
        external.push(r.url());
    });
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => {
      const root = document.querySelector('.tl-site-one');
      return {
        width: root.dataset.width,
        theme: root.dataset.theme,
        charts: document.querySelectorAll('[data-mount="home-sales"] .recharts-wrapper').length,
        anchors: ['process', 'modules', 'industries', 'home', 'devices', 'trellis'].filter(
          (id) => !document.getElementById(id),
        ),
      };
    });
    const label = `${width} ${theme} (data-width ${state.width})`;
    if (state.theme !== theme) failures.push(`${label}: 테마 적용 실패`);
    if (state.charts < 1) failures.push(`${label}: 업무 홈 매출 차트가 마운트되지 않음`);
    if (state.anchors.length) failures.push(`${label}: 앵커 없음 ${state.anchors}`);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = [];
    for (const v of results.violations.filter((x) => ['critical', 'serious'].includes(x.impact))) {
      for (const node of v.nodes) {
        const sel = node.target.join(' ');
        const tag =
          v.id === 'color-contrast'
            ? await page.evaluate(
                (s) =>
                  document
                    .querySelector(s)
                    ?.closest('[data-contrast-pending]')
                    ?.getAttribute('data-contrast-pending') ?? null,
                sel,
              )
            : null;
        if (tag) pending.set(tag, (pending.get(tag) ?? 0) + 1);
        else
          blocking.push(`${v.id}: ${sel} — ${node.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
      }
    }
    console.log(
      `${label}: axe ${blocking.length}건 · 차트 ${state.charts} · 외부 요청 ${external.length} · 콘솔 오류 ${errors.length}`,
    );
    for (const b of blocking.slice(0, 8)) console.log(`   ${b}`);
    for (const e of errors.slice(0, 5)) console.log(`   ! ${e}`);
    if (blocking.length) failures.push(`${label}: axe ${blocking.length}건`);
    if (external.length) failures.push(`${label}: 외부 요청 ${external.length}건`);
    if (errors.length) failures.push(`${label}: 콘솔 오류 ${errors.length}건`);
    if (SHOTS) {
      mkdirSync(SHOTS, { recursive: true });
      await page.screenshot({ path: join(SHOTS, `one-${width}-${theme}.png`), fullPage: true });
    }
    await context.close();
  }
  if (pending.size)
    console.log(`승인 대기 대비: ${[...pending].map(([k, n]) => `${k}×${n}`).join(' ')}`);
} finally {
  await browser.close();
  server.close();
}
if (failures.length) {
  console.error(`실패:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('통과');
