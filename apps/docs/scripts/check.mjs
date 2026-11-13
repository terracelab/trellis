// 빌드된 사이트 검사: 주요 페이지 × 라이트·다크 axe critical·serious 0, 외부 요청 0, 콘솔 오류 0,
// 내부 링크 깨짐 0, /llms.txt · /api/latest/manifest.json 응답. 대비 승인 대기 조합(data-contrast-pending)은 따로 센다(D-33).
// 영어판(PR-12): 같은 페이지를 /en/에서 한 번 더 — lang="en", 언어 선택, Starlight 대체 본문(번역 없음) 0,
// 라이브 예시의 컴포넌트 문구가 영어(TrellisProvider locale="en").
//   node scripts/check.mjs [스크린샷 폴더]
//   SITE_BASE=/trellis/ node scripts/check.mjs   경로 아래에 놓이게 빌드한 것(D-148). 같은 값으로 빌드한 dist여야 한다
//   DOCS_CHECK_SHARD=1/4 node scripts/check.mjs    전체를 4묶음으로 나눈 첫 묶음(1/4~4/4를 동시에 돌리면 전체 검사와 같다)
//   DOCS_DIST=<폴더> node scripts/check.mjs        다른 폴더에 빌드한 것(astro build --outDir <폴더>)
//   DOCS_CHECK_ONLY=month-calendar,guide/patterns node scripts/check.mjs   일부 페이지만(주소에 든 글자, 쉼표로 여럿)
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const DIST = process.env.DOCS_DIST
  ? join(resolve(process.env.DOCS_DIST), '/')
  : fileURLToPath(new URL('../dist/', import.meta.url));
/** 사이트 경로. BASE는 끝에 /가 있고('/' · '/trellis/'), PREFIX는 없다('' · '/trellis') */
const BASE = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');
const PREFIX = BASE.slice(0, -1);
const SHOTS = process.argv[2];
const MANIFEST = JSON.parse(
  readFileSync(new URL('../public/api/latest/manifest.json', import.meta.url), 'utf8'),
);
const COMPONENT_PAGES = MANIFEST.components.map(
  (c) => `/docs/components/${c.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}/`,
);
// 사이트의 모든 페이지(브랜드 · 가이드 전부 · 컴포넌트 전부 · 기초 · 변경 이력)
const PAGES_KO = [
  '/',
  ...MANIFEST.guides.map((g) => `/docs/guide/${g.slug}/`),
  '/docs/components/',
  ...COMPONENT_PAGES,
  '/docs/foundations/tokens/',
  '/docs/foundations/modules/',
  '/docs/changelog/',
];
const PAGES_EN = PAGES_KO.map((p) => (p === '/' ? '/en/' : `/en${p}`));
const ONLY = process.env.DOCS_CHECK_ONLY?.split(',').filter(Boolean);
/** 'i/n' — 전체 페이지를 n묶음으로 나눈 i번째(1부터). 긴 전체 검사를 나눠 동시에 돌릴 때 쓴다 */
const SHARD = /^(\d+)\/(\d+)$/
  .exec(process.env.DOCS_CHECK_SHARD ?? '')
  ?.slice(1)
  .map(Number);
const PAGES = [...PAGES_KO, ...PAGES_EN]
  .filter((p) => !ONLY || ONLY.some((o) => p.includes(o)))
  .filter((_p, i) => !SHARD || i % SHARD[1] === SHARD[0] - 1);
/** 라이브 예시 문구가 locale을 따르는지 — 페이지 HTML(접근성 이름 포함)에 있어야 하는 글자 */
const LOCALE_TEXT = {
  '/docs/components/pagination/': '다음 페이지',
  '/en/docs/components/pagination/': 'Next page',
  '/docs/components/data-grid/': '전체 선택',
  '/en/docs/components/data-grid/': 'Select all',
};
const UNTRANSLATED = 'This content is not available in your language yet.';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.md': 'text/markdown; charset=utf-8',
};

if (!existsSync(DIST)) {
  console.error('dist 없음. 먼저 pnpm --filter @terracelab/docs build');
  process.exit(1);
}

const server = createServer((req, res) => {
  const full = decodeURIComponent((req.url ?? '/').split('?')[0]);
  // 사이트 경로 밖의 주소는 이 사이트가 아니다(경로를 안 붙인 링크를 여기서 잡는다)
  if (!full.startsWith(BASE)) return res.writeHead(404).end();
  const url = full.slice(PREFIX.length);
  let file = normalize(join(DIST, url));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return createReadStream(join(DIST, '404.html')).pipe(res);
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const failures = [];
const pendingTotals = new Map();
const inactiveTotals = new Map();

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const external = new Set();
  const consoleErrors = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(ORIGIN) && !/^(data|blob|about):/.test(r.url())) external.add(r.url());
  });
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`${page.url()} ${m.text()}`);
  });
  page.on('pageerror', (e) => consoleErrors.push(`${page.url()} ${e.message}`));

  const links = new Set();
  /** 라이브 예시 안에서 앱 라우터가 받는 경로(사이트 링크 아님) */
  const appRoutes = new Set();
  for (const path of PAGES) {
    for (const theme of ['light', 'dark']) {
      await page.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme);
      await page.goto(ORIGIN + PREFIX + path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const actual = await page.evaluate(() => document.documentElement.dataset.theme);
      if (actual !== theme) failures.push(`${path}: 테마 ${theme} 적용 실패(${actual})`);
      // client:visible 섬이 전부 그려지도록 끝까지 스크롤
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);
      if (theme === 'light') {
        const info = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          langSelect: Boolean(document.querySelector('starlight-lang-select')),
          html: document.documentElement.outerHTML,
        }));
        if (!info.langSelect) failures.push(`${path}: 언어 선택 없음`);
        if (path.startsWith('/en/')) {
          if (info.lang !== 'en') failures.push(`${path}: lang="${info.lang}"(en이어야 함)`);
          if (info.html.includes(UNTRANSLATED))
            failures.push(`${path}: 영어 본문 없음(한국어 대체)`);
        }
        const expected = LOCALE_TEXT[path];
        if (expected && !info.html.includes(expected))
          failures.push(`${path}: 예시 문구 "${expected}" 없음(TrellisProvider locale)`);
      }
      // 제외: 코드 블록(Expressive Code 테마), Starlight 검색 버튼 — 보이는 라벨 "검색" = 접근성 이름이고
      // 남는 글자는 단축키 힌트(<kbd>Ctrl K</kbd>)라 label-content-name-mismatch가 오탐한다(업스트림 마크업)
      const results = await new AxeBuilder({ page })
        .exclude('.expressive-code')
        .exclude('button[data-open-modal]')
        .analyze();
      const blocking = [];
      for (const v of results.violations.filter((x) =>
        ['critical', 'serious'].includes(x.impact),
      )) {
        for (const node of v.nodes) {
          const sel = node.target.join(' ');
          // 대비: 승인 대기 조합(D-33)과 비활성 컴포넌트 안의 글자(WCAG 1.4.3 예외)는 따로 센다.
          // 비활성 AmountInput의 단위는 영어 "KRW"만 잡힌다. 한국어 "원"은 한 글자라 axe가 판정하지 않는다
          const tag =
            v.id === 'color-contrast'
              ? await page.evaluate((s) => {
                  const el = document.querySelector(s);
                  const pending = el?.closest('[data-contrast-pending]');
                  if (pending)
                    return { kind: 'pending', key: pending.getAttribute('data-contrast-pending') };
                  const inactive = el?.closest('[data-state="disabled"], [aria-disabled="true"]');
                  return inactive
                    ? { kind: 'inactive', key: inactive.className.split(' ')[0] }
                    : null;
                }, sel)
              : null;
          if (tag?.kind === 'pending')
            pendingTotals.set(tag.key, (pendingTotals.get(tag.key) ?? 0) + 1);
          else if (tag?.kind === 'inactive')
            inactiveTotals.set(tag.key, (inactiveTotals.get(tag.key) ?? 0) + 1);
          else
            blocking.push(`${v.id}: ${sel} — ${node.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
        }
      }
      console.log(`axe ${theme.padEnd(5)} ${path}: ${blocking.length}건`);
      for (const b of blocking.slice(0, 8)) console.log(`   ${b}`);
      if (blocking.length) failures.push(`axe ${theme} ${path}: ${blocking.length}건`);
      if (theme === 'light')
        for (const { href, app } of await page.$$eval('a[href^="/"]', (as) =>
          as.map((a) => {
            const href = a.getAttribute('href');
            if (!a.closest('.tl-site-example')) return { href, app: false };
            // 라이브 예시 안 링크: 누름을 예시의 앱 라우터(TrellisProvider navigate · onLinkPress)가 받으면
            // 사이트 링크가 아니라 예시 앱의 경로다. 주소를 잠깐 떼고 눌러 보아(이동 없음) 기본 동작을 막는지 본다.
            // 받지 않는 링크는 브라우저가 따라가므로 사이트 링크로 검사한다(components.md §6 예시 주소)
            let app = false;
            const probe = (e) => {
              app = e.defaultPrevented;
            };
            a.removeAttribute('href');
            window.addEventListener('click', probe);
            a.dispatchEvent(
              new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
            );
            window.removeEventListener('click', probe);
            a.setAttribute('href', href);
            return { href, app };
          }),
        ))
          (app ? appRoutes : links).add(href.split('#')[0]);
      if (SHOTS) {
        mkdirSync(SHOTS, { recursive: true });
        const name = `${path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home'}-${theme}.png`;
        if (!/^(\/en)?\/docs\/components\//.test(path) || /trend-chart|bullet-bar/.test(path))
          await page.screenshot({
            path: join(SHOTS, name),
            fullPage: path === '/' || path === '/en/',
          });
      }
    }
  }
  // 모바일 390 브랜드 페이지
  if (SHOTS) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem('starlight-theme', 'light'));
    for (const [path, name] of [
      ['/', 'home-390.png'],
      ['/en/', 'en-home-390.png'],
    ]) {
      await page.goto(`${ORIGIN}${PREFIX}${path}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: join(SHOTS, name), fullPage: true });
    }
  }
  for (const extra of [
    '/llms.txt',
    '/llms-full.txt',
    '/api/latest/manifest.json',
    // 릴리즈마다 남는 그 버전의 문서(/api/v<major.minor>/). 버전은 manifest에서 읽는다
    `/api/${MANIFEST.docsVersion}/llms.txt`,
    '/robots.txt',
    '/sitemap-index.xml',
  ])
    links.add(PREFIX + extra);
  let broken = 0;
  for (const href of links) {
    const r = await fetch(ORIGIN + href);
    // 본문을 끝까지 읽어 연결을 닫는다. 읽지 않고 두면 소켓이 남아 검사가 통과하고도 프로세스가 끝나지 않는다
    await r.arrayBuffer();
    if (r.status !== 200) {
      broken += 1;
      failures.push(`링크 ${href} → ${r.status}`);
    }
  }
  console.log(
    ONLY || SHARD
      ? `페이지: 일부 ${PAGES.length}개만(${ONLY ? `DOCS_CHECK_ONLY=${ONLY.join(',')}` : `DOCS_CHECK_SHARD=${SHARD.join('/')}`}). 전체 검사가 아니다`
      : `페이지: 한국어 ${PAGES_KO.length} · 영어 ${PAGES_EN.length} (각각 라이트 · 다크)`,
  );
  console.log(`내부 링크 ${links.size}개 확인, 깨짐 ${broken}`);
  if (appRoutes.size)
    console.log(`예시 앱 경로(navigate가 받음, 사이트 링크 아님): ${[...appRoutes].join(' ')}`);
  const manifest = await (await fetch(`${ORIGIN}${PREFIX}/api/latest/manifest.json`)).json();
  console.log(`manifest ${manifest.version} · 컴포넌트 ${manifest.components.length}`);
  console.log(`외부 요청: ${external.size}건`);
  for (const u of external) console.log(`   ${u}`);
  if (external.size) failures.push(`외부 요청 ${external.size}건`);
  console.log(`콘솔 오류: ${consoleErrors.length}건`);
  for (const e of consoleErrors.slice(0, 10)) console.log(`   ${e}`);
  if (consoleErrors.length) failures.push(`콘솔 오류 ${consoleErrors.length}건`);
  if (pendingTotals.size)
    console.log(`승인 대기 대비: ${[...pendingTotals].map(([k, n]) => `${k}×${n}`).join(' ')}`);
  if (inactiveTotals.size)
    console.log(
      `비활성 컴포넌트 대비(WCAG 1.4.3 예외, 실패 아님): ${[...inactiveTotals].map(([k, n]) => `${k}×${n}`).join(' ')}`,
    );
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`실패:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('통과');
