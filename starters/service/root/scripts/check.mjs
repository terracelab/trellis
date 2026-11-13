// 전 화면 검사: 화면마다 폭 344 · 720 · 1024 · 1440 × 라이트 · 다크
//  - axe(WCAG 2.1 A · AA) critical · serious 0
//  - 가로 넘침 0: 문서 · 본문(main)의 scrollWidth, 가로 스크롤 틀 밖에서 화면 오른쪽을 넘는 요소(잘린 글자 · 단추)
//  - 콘솔 오류 · 화면 오류 0
//  - 스크린샷: check-results/<테마>-<폭>-<화면>.png. AppShell은 본문(main) 안에서 스크롤하므로 창을 본문 높이만큼 늘려 한 장으로 찍는다
// 화면 목록은 apps/web/src/nav.ts의 경로(id: '/…')와 아래 EXTRA_ROUTES. 개발 서버는 이 스크립트가 직접 띄운다.
//   pnpm check                                   전부
//   pnpm check --only /settings --widths 344,1440 --themes dark --no-shots
//   BASE=http://localhost:5173 pnpm check        이미 켠 서버로
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

/** 메뉴에 없는 화면(상세 · 탭 · 쿼리)을 여기에 더한다: ['/approval/doc?id=LV-2611-0021'] */
const EXTRA_ROUTES = [];

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const WIDTHS = (opt('--widths') ?? '344,720,1024,1440').split(',').map(Number);
const THEMES = (opt('--themes') ?? 'light,dark').split(',');
const ONLY = opt('--only');
const SHOTS = !args.includes('--no-shots');
const OUT = 'check-results';

const nav = readFileSync('apps/web/src/nav.ts', 'utf8');
const routes = [
  ...new Set([...[...nav.matchAll(/id:\s*'(\/[^']*)'/g)].map((m) => m[1]), ...EXTRA_ROUTES]),
].filter((r) => !ONLY || r.startsWith(ONLY));
if (!routes.length) {
  console.error('검사할 화면이 없다. apps/web/src/nav.ts의 id 또는 EXTRA_ROUTES를 본다');
  process.exit(1);
}

// 개발 서버: BASE가 없으면 Vite를 이 프로세스에서 띄운다
let server = null;
let BASE = process.env.BASE;
if (!BASE) {
  const { createServer } = await import('vite');
  server = await createServer({
    root: 'apps/web',
    configFile: 'apps/web/vite.config.mjs',
    logLevel: 'error',
    server: { port: 0, host: '127.0.0.1' },
  });
  await server.listen();
  BASE = server.resolvedUrls.local[0].replace(/\/$/, '');
}

const slug = (route) => route.replace(/^\//, '').replace(/[^\w-]+/g, '_') || 'home';
const browser = await chromium.launch();
const results = [];
let fail = 0;
if (SHOTS) mkdirSync(OUT, { recursive: true });

try {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript((t) => {
        try {
          localStorage.setItem('theme', t);
          localStorage.removeItem('density');
        } catch {
          /* 저장소를 못 쓰면 기본값 */
        }
      }, theme);
      const page = await context.newPage();
      for (const route of routes) {
        const errors = [];
        const onError = (e) => errors.push(String(e));
        const onConsole = (m) => m.type() === 'error' && errors.push(m.text());
        page.on('pageerror', onError);
        page.on('console', onConsole);
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        // 스켈레톤(150ms) · 들어오는 움직임이 끝나기를 기다린다
        await page.waitForTimeout(350);
        const layout = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const doc = document.documentElement.scrollWidth - vw;
          const main =
            document.querySelector('.tl-app-shell__main') ?? document.querySelector('main');
          const mainOver = main ? main.scrollWidth - main.clientWidth : 0;
          // 가로 스크롤 틀(overflow-x auto · scroll) 안은 넘쳐도 된다
          const scrollsX = (el) => {
            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
              const s = getComputedStyle(p);
              if (
                (s.overflowX === 'auto' || s.overflowX === 'scroll') &&
                p.scrollWidth > p.clientWidth
              )
                return true;
            }
            return false;
          };
          const clipped = [];
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            const s = getComputedStyle(el);
            if (s.visibility === 'hidden' || s.display === 'contents') continue;
            // 화면 밖에 숨겨 둔 것(덮개 사이드바)은 왼쪽이 화면 밖이라 뺀다
            if (r.right > vw + 1 && r.left < vw && r.left >= -1 && !scrollsX(el)) {
              const label = (el.getAttribute('aria-label') || el.textContent || el.tagName)
                .trim()
                .slice(0, 40);
              clipped.push(
                `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${label}" right=${Math.round(r.right)}`,
              );
            }
          }
          return { doc, mainOver, clipped: clipped.slice(0, 5), clippedCount: clipped.length };
        });
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const bad = axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
        if (SHOTS) {
          const height = await page.evaluate(() => {
            const main =
              document.querySelector('.tl-app-shell__main') ?? document.querySelector('main');
            const extra = main ? window.innerHeight - main.clientHeight : 0;
            return Math.max(
              document.documentElement.scrollHeight,
              main ? main.scrollHeight + extra : 0,
            );
          });
          await page.setViewportSize({ width, height: Math.min(Math.max(900, height), 6000) });
          await page.waitForTimeout(100);
          await page.screenshot({ path: join(OUT, `${theme}-${width}-${slug(route)}.png`) });
          await page.setViewportSize({ width, height: 900 });
        }
        page.off('pageerror', onError);
        page.off('console', onConsole);
        const ok =
          bad.length === 0 &&
          layout.doc <= 0 &&
          layout.mainOver <= 0 &&
          layout.clippedCount === 0 &&
          errors.length === 0;
        if (!ok) fail += 1;
        results.push({
          ok,
          theme,
          width,
          route,
          overflow: {
            doc: layout.doc,
            main: layout.mainOver,
            clipped: layout.clippedCount,
            sample: layout.clipped,
          },
          axe: bad.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
            sample: v.nodes
              .slice(0, 2)
              .map(
                (n) => `${n.target.join(' ')} :: ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`,
              ),
          })),
          errors: errors.slice(0, 3),
        });
        console.log(
          `${ok ? 'ok  ' : 'FAIL'} ${theme.padEnd(5)} ${String(width).padStart(4)} ${route}` +
            (ok
              ? ''
              : ` | axe ${bad.map((v) => `${v.id}(${v.nodes.length})`).join(',') || 0}` +
                ` | 넘침 doc ${layout.doc} main ${layout.mainOver} 잘림 ${layout.clippedCount}` +
                ` | 오류 ${errors.length}`),
        );
        if (!ok) {
          for (const v of bad) console.log(`       axe ${v.id}: ${v.nodes[0]?.target.join(' ')}`);
          for (const c of layout.clipped) console.log(`       잘림 ${c}`);
          for (const e of errors.slice(0, 3)) console.log(`       오류 ${e.slice(0, 160)}`);
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server?.close();
}

mkdirSync(OUT, { recursive: true });
writeFileSync(
  join(OUT, 'result.json'),
  `${JSON.stringify({ base: BASE, total: results.length, fail, results }, null, 2)}\n`,
);
console.log(
  `\n검사 ${results.length}건(화면 ${routes.length} × 폭 ${WIDTHS.length} × 테마 ${THEMES.length}) · 실패 ${fail}건 → ${OUT}/`,
);
process.exit(fail ? 1 : 0);
