// Storybook a11y 검사(DoD 6): storybook-static의 모든 스토리 × 라이트 · 다크에서 axe 위반 0.
// 회사 색 변형(파랑 · 노랑)은 VRT 대표 컴포넌트만 라이트에서 더 본다.
//   node scripts/a11y.mjs [--only <id 접두>]
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { BRAND_COMPONENTS, BRAND_VARIANTS, STATIC_DIR } from '../vrt/targets.mjs';

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
if (!existsSync(join(STATIC_DIR, 'index.json'))) {
  console.error('storybook-static 없음. 먼저 pnpm storybook:build');
  process.exit(1);
}
const index = JSON.parse(readFileSync(join(STATIC_DIR, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter(
  (e) => e.type === 'story' && (!only || e.id.startsWith(only)),
);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = normalize(join(STATIC_DIR, url));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(STATIC_DIR) || !existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const runs = stories.flatMap((s) => [
  ...['light', 'dark'].map((theme) => ({ s, theme, brand: 'orange' })),
  ...(BRAND_COMPONENTS.includes(s.title.split('/').pop())
    ? BRAND_VARIANTS.map((brand) => ({ s, theme: 'light', brand }))
    : []),
]);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const failures = [];
for (const { s, theme, brand } of runs) {
  await page.goto(
    `${origin}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme};density:compact;locale:ko;brand:${brand}`,
  );
  await page
    .waitForFunction(
      (t) =>
        document.body.classList.contains('sb-show-main') &&
        document.documentElement.dataset['theme'] === t,
      theme,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForTimeout(150);
  const result = await new AxeBuilder({ page })
    .include('#storybook-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  for (const v of result.violations)
    failures.push(
      `${s.id} [${theme}${brand === 'orange' ? '' : ` · ${brand}`}] ${v.id}(${v.impact}) ×${v.nodes.length}: ${v.nodes[0]?.target.join(' ')}`,
    );
}
await browser.close();
server.close();
console.log(`스토리 ${stories.length}개 · 검사 ${runs.length}회 · 위반 ${failures.length}건`);
for (const f of failures.slice(0, 80)) console.log(`✗ ${f}`);
process.exit(failures.length ? 1 : 0);
