// 데모 검사: 모든 블록 화면 × 라이트 · 다크에서 axe critical · serious 0, 외부 요청 0, 콘솔 오류 0, 화면 오류 0.
// 대비 승인 대기 조합(data-contrast-pending)은 따로 센다(D-33).
//   node scripts/check.mjs [스크린샷 폴더] [--only <블록 id 접두>] [--width 1440]
// 폭은 기본 1440(데스크톱) · 390(휴대폰). 휴대폰에서는 가로 넘침도 실패로 센다(D-61).
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
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const APP = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(APP, 'dist');
/** 데모가 놓이는 경로. 사이트가 경로 아래에 있으면(SITE_BASE=/trellis/) /trellis/demo/ — 같은 값으로 빌드한 dist여야 한다 */
const DEMO_BASE = `${(process.env.SITE_BASE ?? '/').replace(/\/?$/, '/')}demo/`;
const BLOCKS = fileURLToPath(new URL('../../../blocks/src/', import.meta.url));
const args = process.argv.slice(2);
const SHOTS = args[0] && !args[0].startsWith('--') ? args[0] : null;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const widths = args.includes('--width') ? [Number(args[args.indexOf('--width') + 1])] : [1440, 390];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

if (!existsSync(DIST)) {
  console.error('dist 없음. 먼저 pnpm --filter @terracelab/demo build');
  process.exit(1);
}

const ids = [];
for (const g of readdirSync(BLOCKS)) {
  if (g.startsWith('_') || !statSync(join(BLOCKS, g)).isDirectory()) continue;
  for (const m of readdirSync(join(BLOCKS, g)))
    for (const s of readdirSync(join(BLOCKS, g, m)))
      if (existsSync(join(BLOCKS, g, m, s, 'block.json')))
        ids.push(JSON.parse(readFileSync(join(BLOCKS, g, m, s, 'block.json'), 'utf8')).id);
}
const routes = ['', 'blocks', ...ids].filter((r) => !only || r.startsWith(only));

const server = createServer((req, res) => {
  const full = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!full.startsWith(DEMO_BASE)) return res.writeHead(404).end();
  const url = full.slice(DEMO_BASE.length - 1);
  let file = normalize(join(DIST, url));
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
/** 휴대폰에서 40px보다 낮은 누르는 요소(화면별). 실패는 아니고 보고만 한다 */
const smallTargets = new Map();
/** 화면 → 240px 넘게 벌어진 열 높이 차(경고) */
const columnGaps = new Map();
const external = new Set();
const consoleErrors = [];
// 네이티브 날짜 입력이 한국어 형식으로 보이게
const browser = await chromium.launch({ args: ['--lang=ko-KR'] });
try {
  for (const width of widths) {
    // 테마마다 따로 연다(해시 이동은 새로 고침이 아니라 테마가 바뀌지 않는다)
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width, height: width < 640 ? 844 : 900 },
        reducedMotion: 'reduce',
        locale: 'ko-KR',
        ...(width < 640 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
      });
      await context.addInitScript((t) => {
        try {
          localStorage.setItem('tl-demo-theme', t);
        } catch {
          /* about:blank */
        }
      }, theme);
      const page = await context.newPage();
      page.on('request', (r) => {
        if (!r.url().startsWith(ORIGIN) && !/^(data|blob|about):/.test(r.url()))
          external.add(r.url());
      });
      page.on(
        'console',
        (m) => m.type() === 'error' && consoleErrors.push(`${page.url()} ${m.text()}`),
      );
      page.on('pageerror', (e) => consoleErrors.push(`${page.url()} ${e.message}`));
      for (const route of routes) {
        await page.goto('about:blank');
        await page.goto(`${ORIGIN}${DEMO_BASE}#/${route}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(250);
        const actual = await page.evaluate(() => document.documentElement.dataset.theme);
        if (actual !== theme)
          failures.push(`${route || '(홈)'}: 테마 ${theme} 적용 실패(${actual})`);
        const broken = await page.evaluate(() => {
          const t = document.querySelector('.tl-demo-message h1')?.textContent ?? '';
          return t.includes('그리지 못했습니다') || t.includes('없는 화면') ? t : '';
        });
        if (broken) failures.push(`${route || '(홈)'}: ${broken}`);
        // 가로 넘침: 페이지가 뷰포트보다 넓으면 어딘가 고정 폭이 있다
        const overflow = await page.evaluate(() => {
          const main = document.querySelector('.tl-app-shell__main');
          return Math.max(
            document.documentElement.scrollWidth - window.innerWidth,
            main ? main.scrollWidth - main.clientWidth : 0,
          );
        });
        if (overflow > 1) failures.push(`가로 넘침 ${width} ${route || '(홈)'}: ${overflow}px`);
        // 나란한 열 높이 차(PR-26, platform.md 조립 규칙): 한 줄에 놓인 칸의 내용 끝이 카드 1장(240px)보다
        // 더 벌어지면 한쪽 아래가 빈 면으로 남는다. 경고만(재배치는 사람이 고른다)
        if (width >= 1280) {
          const gaps = await page.evaluate(() => {
            const out = [];
            for (const grid of document.querySelectorAll('.tl-dashboard-grid')) {
              const rows = new Map();
              for (const col of grid.children) {
                const r = col.getBoundingClientRect();
                if (!r.height) continue;
                const kids = [...col.children].map((k) => k.getBoundingClientRect().bottom);
                const bottom = kids.length ? Math.max(...kids) : r.bottom;
                const top = Math.round(r.top);
                rows.set(top, [...(rows.get(top) ?? []), bottom]);
              }
              for (const bottoms of rows.values())
                if (bottoms.length > 1) {
                  const gap = Math.round(Math.max(...bottoms) - Math.min(...bottoms));
                  if (gap > 240) out.push(gap);
                }
            }
            return out;
          });
          if (gaps.length) columnGaps.set(route || '(홈)', gaps);
        }
        if (width < 640) {
          const small = await page.evaluate(() => {
            const min = 40;
            return [
              ...document.querySelectorAll(
                'button, a[href], input:not([type="checkbox"]), select, textarea',
              ),
            ]
              .filter((e) => {
                // 입력은 감싼 칸(.tl-input 등)이 누르는 영역이다. 화면 밖(덮개 사이드바 · 건너뛰기 링크)은 뺀다
                const box = e.matches('input, textarea') ? (e.parentElement ?? e) : e;
                const r = box.getBoundingClientRect();
                const visible =
                  r.width > 0 &&
                  r.height > 0 &&
                  r.bottom > 0 &&
                  r.top < window.innerHeight &&
                  r.right > 0 &&
                  r.left < window.innerWidth;
                return visible && r.height < min;
              })
              .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`);
          });
          smallTargets.set(route || '(홈)', small);
        }
        const results = await new AxeBuilder({ page }).analyze();
        const blocking = [];
        for (const v of results.violations.filter((x) =>
          ['critical', 'serious'].includes(x.impact),
        )) {
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
              blocking.push(
                `${v.id}: ${sel} — ${node.failureSummary?.split('\n')[1]?.trim() ?? ''}`,
              );
          }
        }
        console.log(
          `${String(width).padEnd(4)} ${theme.padEnd(5)} ${route || '(홈)'}: axe ${blocking.length}건`,
        );
        for (const b of blocking.slice(0, 6)) console.log(`   ${b}`);
        if (blocking.length)
          failures.push(`axe ${width} ${theme} ${route || '(홈)'}: ${blocking.length}건`);
        if (SHOTS) {
          mkdirSync(SHOTS, { recursive: true });
          const name = `${(route || 'home').replace(/\//g, '_')}-${width}-${theme}.png`;
          await page.screenshot({ path: join(SHOTS, name), fullPage: false });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
if (columnGaps.size) {
  console.log(`나란한 열 높이 차 240px 넘음(경고): ${columnGaps.size}화면`);
  for (const [route, v] of [...columnGaps.entries()].slice(0, 12))
    console.log(`   ${route}: ${v.map((g) => `${g}px`).join(', ')}`);
}
if (smallTargets.size) {
  const counted = [...smallTargets.entries()].filter(([, v]) => v.length);
  const total = counted.reduce((a, [, v]) => a + v.length, 0);
  console.log(`휴대폰 40px 미만 누르는 요소: ${total}개(${counted.length}화면)`);
  for (const [route, v] of counted.slice(0, 8))
    console.log(
      `   ${route}: ${[...new Set(v)].slice(0, 5).join(', ')}${v.length > 5 ? ` 외 ${v.length - 5}` : ''}`,
    );
}
console.log(`화면 ${routes.length}개 × ${widths.length}폭 × 라이트 · 다크`);
console.log(`외부 요청: ${external.size}건`);
for (const u of external) console.log(`   ${u}`);
if (external.size) failures.push(`외부 요청 ${external.size}건`);
console.log(`콘솔 오류: ${consoleErrors.length}건`);
for (const e of consoleErrors.slice(0, 10)) console.log(`   ${e}`);
if (consoleErrors.length) failures.push(`콘솔 오류 ${consoleErrors.length}건`);
if (pending.size)
  console.log(`승인 대기 대비: ${[...pending].map(([k, n]) => `${k}×${n}`).join(' ')}`);
if (failures.length) {
  console.error(`실패:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('통과');
