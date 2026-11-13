// 조립된 묶음(dist = 소개 사이트 + 문서 + 데모) 검사. 소개 사이트의 모든 페이지를 1440 라이트 · 1440 다크 · 390 라이트로 열어
// axe critical · serious 0, 외부 요청 0, 콘솔 오류 0, 404 응답 0, 깨진 내부 링크 0, 390 가로 넘침 0을 본다.
// 문서 · 데모 쪽 화면은 각자의 검사(apps/docs · apps/demo check)가 보고, 여기서는 그리로 가는 링크가 열리는지만 본다.
// 대비 승인 대기 조합(data-contrast-pending)은 따로 센다(D-33).
// 검색 · 답변 엔진 값(SEO · AEO · GEO)은 scripts/seo.mjs가 묶음의 모든 페이지(문서 포함)를 글로 읽어 먼저 본다.
//   node scripts/check.mjs [스크린샷 폴더]
//   SITE_BASE=/trellis/ SITE_URL=https://… node scripts/check.mjs   경로 아래에 놓이게 빌드한 묶음(같은 값으로 빌드한 dist)
//   SITE_DIST=<폴더> node scripts/check.mjs                         다른 폴더의 묶음
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { auditSeo, report } from './seo.mjs';

const DIST = join(
  process.env.SITE_DIST
    ? resolve(process.env.SITE_DIST)
    : fileURLToPath(new URL('../dist', import.meta.url)),
  '/',
);
const SHOTS = process.argv[2];
/** 사이트 경로. BASE는 끝에 /가 있고('/' · '/trellis/'), PREFIX는 없다('' · '/trellis') */
const BASE = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');
const PREFIX = BASE.slice(0, -1);
/** 동봉 문서에 적힌 원본 주소(scripts/build-docs.mjs). 다른 곳에 올린 묶음의 /llms.txt에는 남아 있으면 안 된다 */
const CANONICAL = 'https://trellis.terracelab.co.kr';
/** 소개 사이트가 아닌 폴더(문서 · 데모 · 생성물). 이 안의 페이지는 열지 않는다 */
const NOT_SITE = ['docs', 'en', 'demo', 'api', 'pagefind', '_astro'];
const REQUIRED = ['demo/index.html', 'docs/guide/overview/index.html', 'llms.txt', '.nojekyll'];
const VIEWS = [
  [1440, 'light'],
  [1440, 'dark'],
  [390, 'light'],
];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.md': 'text/markdown; charset=utf-8',
};

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist 없음. 먼저 pnpm turbo run build --filter=@terracelab/site...');
  process.exit(1);
}

const failures = [];

// ── 파일 검사 ────────────────────────────────────────────────
for (const file of REQUIRED)
  if (!existsSync(join(DIST, file)))
    failures.push(`${file} 없음(조립이 덜 됐다: node scripts/assemble.mjs)`);
const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
if (siteUrl && siteUrl !== CANONICAL && existsSync(join(DIST, 'llms.txt'))) {
  const llms = readFileSync(join(DIST, 'llms.txt'), 'utf8');
  if (llms.includes(CANONICAL))
    failures.push(
      `llms.txt에 원본 주소(${CANONICAL})가 남아 있다. 문서를 같은 SITE_URL로 빌드한다`,
    );
  if (!llms.includes(`${siteUrl}${PREFIX}/`))
    failures.push(`llms.txt에 배포 주소(${siteUrl}${PREFIX}/)가 없다`);
}

// ── 검색 · 답변 엔진 값: 제목 · 설명 · canonical · 공유 그림 · robots · 구조화 데이터 · 언어 짝 · 사이트맵 ──
const seo = auditSeo({
  dist: DIST,
  base: BASE,
  siteUrl: process.env.SITE_URL,
  indexable: process.env.SITE_INDEXABLE === '1',
});
console.log(report(seo.stats));
for (const note of seo.notes) console.log(`참고: ${note}`);
failures.push(...seo.failures.map((f) => `SEO ${f}`));

/** 소개 사이트 페이지: NOT_SITE 밖의 모든 index.html(+ 404.html) → 사이트 안 경로('/' · '/components/') */
function pages(dir = DIST, rel = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (rel === '' && NOT_SITE.includes(entry.name)) continue;
      out.push(...pages(join(dir, entry.name), `${rel}${entry.name}/`));
    } else if (entry.name === 'index.html') out.push(`/${rel}`);
    else if (rel === '' && entry.name === '404.html') out.push('/404.html');
  }
  return out.sort();
}
const PAGES = pages();

/** 사이트 안 경로 → dist 파일. 폴더는 index.html, 끝 / 없는 폴더 주소도 호스팅이 /를 붙여 주므로 같다 */
function fileOf(path) {
  const file = normalize(join(DIST, decodeURIComponent(path)));
  if (!file.startsWith(DIST) && `${file}/` !== DIST) return null;
  if (existsSync(file) && statSync(file).isDirectory()) {
    const index = join(file, 'index.html');
    return existsSync(index) ? index : null;
  }
  return existsSync(file) ? file : null;
}

const server = createServer((req, res) => {
  const full = (req.url ?? '/').split('?')[0];
  // 사이트 경로 밖의 주소는 이 사이트가 아니다(경로를 안 붙인 링크 · 자산을 여기서 잡는다)
  const file = full.startsWith(BASE) ? fileOf(full.slice(PREFIX.length)) : null;
  if (!file) {
    const notFound = join(DIST, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return existsSync(notFound) ? createReadStream(notFound).pipe(res) : res.end();
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const pending = new Map();
const links = new Map();
const browser = await chromium.launch();
try {
  for (const [width, theme] of VIEWS) {
    const context = await browser.newContext({
      viewport: { width, height: width < 640 ? 844 : 900 },
      reducedMotion: 'reduce',
      locale: 'ko-KR',
    });
    await context.addInitScript((t) => {
      try {
        localStorage.setItem('trellis-site-theme', t);
      } catch {
        /* about:blank */
      }
    }, theme);
    const page = await context.newPage();
    let external = [];
    let errors = [];
    let missing = [];
    page.on('request', (r) => {
      if (!r.url().startsWith(ORIGIN) && !/^(data|blob|about):/.test(r.url()))
        external.push(r.url());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) missing.push(`${r.status()} ${r.url().slice(ORIGIN.length)}`);
    });
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    for (const path of PAGES) {
      external = [];
      errors = [];
      missing = [];
      const label = `${width} ${theme} ${path}`;
      const response = await page.goto(ORIGIN + PREFIX + path, { waitUntil: 'networkidle' });
      if (response?.status() !== 200) failures.push(`${label}: 응답 ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      // client:visible 섬과 늦게 불러오는 그림이 전부 뜨도록 끝까지 스크롤
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      const state = await page.evaluate(() => ({
        theme: document.documentElement.dataset.theme,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.href),
      }));
      if (state.theme !== theme) failures.push(`${label}: 테마 적용 실패(${state.theme})`);
      if (width < 640 && state.overflow > 1)
        failures.push(`${label}: 가로 넘침 ${state.overflow}px`);
      // 내부 링크는 첫 보기(1440 라이트)에서 한 번만 모은다. 숨은 링크도 DOM에 있어 폭과 관계없다
      if (width === VIEWS[0][0] && theme === VIEWS[0][1])
        for (const href of state.hrefs) {
          if (!href.startsWith(`${ORIGIN}/`)) continue;
          const target = new URL(href).pathname;
          if (!links.has(target)) links.set(target, path);
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
            blocking.push(`${v.id}: ${sel} — ${node.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
        }
      }
      console.log(
        `${label}: axe ${blocking.length}건 · 외부 요청 ${external.length} · 콘솔 오류 ${errors.length} · 404 ${missing.length}`,
      );
      for (const b of blocking.slice(0, 8)) console.log(`   ${b}`);
      for (const e of errors.slice(0, 5)) console.log(`   ! ${e}`);
      for (const m of missing.slice(0, 5)) console.log(`   ${m}`);
      for (const u of external.slice(0, 5)) console.log(`   → ${u}`);
      if (blocking.length) failures.push(`${label}: axe ${blocking.length}건`);
      if (external.length) failures.push(`${label}: 외부 요청 ${external.length}건`);
      // 404 페이지는 일부러 없는 주소가 아니라 /404.html로 열어서 응답 오류가 없어야 한다
      if (missing.length) failures.push(`${label}: 404 응답 ${missing.length}건(${missing[0]})`);
      // 브라우저가 실패한 요청마다 남기는 콘솔 줄은 위 404로 이미 셌다
      const real = errors.filter((e) => !e.startsWith('Failed to load resource'));
      if (real.length) failures.push(`${label}: 콘솔 오류 ${real.length}건`);
      if (SHOTS) {
        mkdirSync(SHOTS, { recursive: true });
        const name =
          path
            .replace(/\.html$/, '')
            .replace(/\//g, '_')
            .replace(/^_|_$/g, '') || 'home';
        await page.screenshot({
          path: join(SHOTS, `${name}-${width}-${theme}.png`),
          fullPage: true,
        });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

// ── 내부 링크: 사이트 경로 안에 있고, 가리키는 파일이 dist에 있어야 한다(#… 은 주소에서 빠져 있다. demo/#/… = demo/) ──
let broken = 0;
for (const [target, from] of links) {
  if (!target.startsWith(BASE) && target !== PREFIX) {
    broken += 1;
    failures.push(`링크 ${target}: 사이트 경로(${BASE}) 밖이다 ← ${from}`);
  } else if (!fileOf(target.slice(PREFIX.length) || '/')) {
    broken += 1;
    failures.push(`링크 ${target}: 파일 없음 ← ${from}`);
  }
}
console.log(
  `페이지 ${PAGES.length}개 × ${VIEWS.map(([w, t]) => `${w} ${t}`).join(' · ')} · 내부 링크 ${links.size}개 확인, 깨짐 ${broken} · 경로 ${BASE}`,
);
if (pending.size)
  console.log(`승인 대기 대비: ${[...pending].map(([k, n]) => `${k}×${n}`).join(' ')}`);

if (failures.length) {
  console.error(`실패:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('통과');
