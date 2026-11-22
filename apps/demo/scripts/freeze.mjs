// 데모 굳히기: 모든 블록 화면을 390 휴대폰 폭으로 띄워, 뷰포트에 기대지 않는 정적 HTML 묶음으로 만든다.
// Figma의 HTML 가져오기(html_to_figma, cssSelector ".cap")에 넣어 화면마다 프레임 하나를 얻는 데 쓴다.
// 절차와 함정은 .claude/skills/ds/figma-sync/SKILL.md 7절에 있다.
//   node scripts/freeze.mjs <out 폴더> [--only <블록 id 접두,...>] [--overlays] [--per 20]
// 산출: parts/<이름>.json(화면 조각) · shots/<이름>.png(굳힌 CSS로 띄운 실제 화면)
//       doc-<n>.html(.cap 요소 하나가 화면 하나) · doc-<n>.json(문서 안 화면 순서) · verify.json(묶음을 1440 뷰포트에서 다시 띄워 비교한 결과)
// 굳히는 방법: @media · @supports를 390 휴대폰 조건으로 풀어 쓰고, vh · vw를 px로 바꾸고, 본문 스크롤을 끝까지 펼친다.
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const APP = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(APP, 'dist');
const BLOCKS = fileURLToPath(new URL('../../../blocks/src/', import.meta.url));
/** 데모가 놓이는 경로. check.mjs와 같다 */
const DEMO_BASE = `${(process.env.SITE_BASE ?? '/').replace(/\/?$/, '/')}demo/`;
const args = process.argv.slice(2);
const OUT = args[0];
if (!OUT || OUT.startsWith('--')) {
  console.error(
    '쓰는 법: node scripts/freeze.mjs <out 폴더> [--only <접두,...>] [--overlays] [--per 20]',
  );
  process.exit(1);
}
if (!existsSync(DIST)) {
  console.error('dist 없음. 먼저 pnpm --filter @terracelab/demo build');
  process.exit(1);
}
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const only = opt('--only', null);
const PER = Number(opt('--per', 20));
const withOverlays = args.includes('--overlays');
const W = 390;
const H = 844;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};
for (const d of ['', 'parts', 'shots']) mkdirSync(join(OUT, d), { recursive: true });

const blocks = [];
for (const g of readdirSync(BLOCKS)) {
  if (g.startsWith('_') || !statSync(join(BLOCKS, g)).isDirectory()) continue;
  for (const m of readdirSync(join(BLOCKS, g)))
    for (const s of readdirSync(join(BLOCKS, g, m))) {
      const f = join(BLOCKS, g, m, s, 'block.json');
      if (existsSync(f)) blocks.push(JSON.parse(readFileSync(f, 'utf8')));
    }
}
blocks.sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id));

/** 겹침 화면(서랍 · 시트). 844 높이 그대로 찍는다 */
const OVERLAYS = [
  {
    key: 'menu',
    title: '전체 메뉴',
    route: 'erp/tax/invoice-list',
    open: (p) => p.locator('.tl-app-shell__tabs button').last().click({ timeout: 5000 }),
  },
  {
    key: 'notifications',
    title: '알림',
    route: 'erp/tax/invoice-list',
    open: (p) =>
      p
        .locator('.tl-app-shell__bar')
        .getByRole('button', { name: /^알림/ })
        .click({ timeout: 5000 }),
  },
  {
    key: 'assistant',
    title: '업무 도우미',
    route: 'erp/tax/invoice-list',
    open: (p) =>
      p
        .locator('.tl-app-shell__bar')
        .getByRole('button', { name: '업무 도우미' })
        .click({ timeout: 5000 }),
  },
  {
    key: 'settings',
    title: '데모 설정',
    route: 'erp/tax/invoice-list',
    open: (p) =>
      p
        .locator('.tl-app-shell__bar')
        .getByRole('button', { name: '데모 설정' })
        .click({ timeout: 5000 }),
  },
  {
    key: 'filter',
    title: '필터 시트',
    route: 'erp/tax/invoice-list',
    open: (p) => p.getByRole('button', { name: '필터' }).first().click({ timeout: 5000 }),
  },
  {
    key: 'period',
    title: '기간 시트',
    route: 'erp/tax/invoice-list',
    open: (p) => p.locator('button.tl-period-picker').first().click({ timeout: 5000 }),
  },
  {
    key: 'row',
    title: '목록 행 상세',
    route: 'erp/tax/invoice-list',
    open: (p) =>
      p.locator('.tl-data-grid__card .tl-data-grid__card-body').first().click({ timeout: 5000 }),
  },
  {
    key: 'select',
    title: '선택 시트',
    route: 'groupware/attendance/leave-request',
    open: (p) => p.locator('.tl-select').first().click({ timeout: 5000 }),
  },
  {
    key: 'date',
    title: '날짜 시트',
    route: 'groupware/attendance/leave-request',
    open: (p) => p.locator('.tl-date-field button').first().click({ timeout: 5000 }),
  },
];

const routes = [
  { id: '', title: '데모 홈', group: 'home' },
  { id: 'blocks', title: '화면 블록 목록', group: 'home' },
  ...blocks.map((b) => ({
    id: b.id,
    title: b.title,
    group: b.id.split('/')[0],
    pattern: b.pattern,
  })),
]
  .filter((r) => !only || only.split(',').some((o) => r.id.startsWith(o)))
  .map((r) => ({ ...r, name: (r.id || 'home').replace(/\//g, '_') }));
const overlays = withOverlays
  ? OVERLAYS.map((o) => ({
      id: o.route,
      title: o.title,
      group: 'overlay',
      name: `overlay_${o.key}`,
      overlay: o,
    }))
  : [];

const fontFile = readdirSync(join(DIST, 'assets')).find((f) =>
  /^PretendardVariable.*\.woff2$/.test(f),
);
const FONT = readFileSync(join(DIST, 'assets', fontFile)).toString('base64');

const server = createServer((req, res) => {
  const full = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!full.startsWith(DEMO_BASE)) return res.writeHead(404).end();
  let file = normalize(join(DIST, full.slice(DEMO_BASE.length - 1)));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

/** 1단계(브라우저): 넘치는 높이를 재고, 시트마다 CSS를 뷰포트에 기대지 않게 굳혀 갈아 끼운다 */
function freezeCss({ W, H, fixed }) {
  const main = document.querySelector('.tl-app-shell__main');
  const de = document.documentElement;
  const extra = fixed
    ? 0
    : Math.max(
        main ? main.scrollHeight - main.clientHeight : 0,
        de.scrollHeight - window.innerHeight,
        0,
      );
  const walk = (rules) => {
    let s = '';
    for (const r of rules) {
      if (r instanceof CSSMediaRule) {
        if (window.matchMedia(r.media.mediaText).matches) s += walk(r.cssRules);
      } else if (r instanceof CSSSupportsRule) {
        if (CSS.supports(r.conditionText)) s += walk(r.cssRules);
      } else if (typeof CSSLayerBlockRule !== 'undefined' && r instanceof CSSLayerBlockRule) {
        s += `@layer ${r.name}{${walk(r.cssRules)}}`;
      } else if (r instanceof CSSFontFaceRule) {
        /* 글꼴은 문서에 따로 넣는다 */
      } else if (r instanceof CSSImportRule) {
        if (r.styleSheet) s += walk(r.styleSheet.cssRules);
      } else if (r instanceof CSSStyleRule && r.cssRules && r.cssRules.length) {
        s += `${r.selectorText}{${r.style.cssText}${walk(r.cssRules)}}`;
      } else s += r.cssText;
      s += '\n';
    }
    return s;
  };
  const fix = (css) =>
    css
      .replace(/(?<![\w.-])(\d*\.?\d+)(?:d|s|l)?vh\b/g, (_, n) =>
        Number(n) === 100 ? 'var(--cap-h)' : `calc(var(--cap-vh) * ${n})`,
      )
      .replace(/(?<![\w.-])(\d*\.?\d+)(?:d|s|l)?vw\b/g, (_, n) => `${(Number(n) * W) / 100}px`)
      .replace(/(['"]?)Pretendard Variable\1\s*,\s*Pretendard/g, 'Pretendard');
  const sheets = [];
  let i = 0;
  for (const sheet of [...document.styleSheets, ...(document.adoptedStyleSheets ?? [])]) {
    let css;
    try {
      css = fix(walk(sheet.cssRules));
    } catch {
      continue;
    }
    const key = sheet.href ? new URL(sheet.href).pathname.split('/').pop() : `inline-${i++}`;
    sheets.push({ key, css });
  }
  for (const n of document.querySelectorAll('link[rel="stylesheet"], style')) n.remove();
  const style = document.createElement('style');
  style.id = 'cap-css';
  style.textContent = sheets.map((s) => s.css).join('\n');
  document.head.append(style);
  const over = document.createElement('style');
  over.id = 'cap-over';
  document.head.append(over);
  return { extra, full: H + extra, sheets };
}

/** 실제 화면(화면 하나)에 쓰는 덮어쓰기. 묶음 문서의 .cap 규칙과 같은 결과가 나와야 한다 */
const liveCss = (full, fixed) => `
@font-face{font-family:"Pretendard";font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${FONT}) format("woff2")}
:root{--cap-h:${full}px;--cap-vh:${H / 100}px}
html{width:${W}px!important;height:${full}px!important;overflow:visible!important}
body{width:${W}px!important;height:${full}px!important;margin:0!important;position:relative!important;overflow:hidden!important;transform:translateZ(0)}
${fixed ? '' : '.tl-app-shell__main{overflow:visible!important}'}
[data-cap-hide]{display:none!important}
`;

/** 묶음 문서의 공통 CSS */
const docCss = () => `
@font-face{font-family:"Pretendard";font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${FONT}) format("woff2")}
:root{--cap-vh:${H / 100}px}
html{height:auto!important;overflow:visible!important}
body{height:auto!important;margin:0!important;overflow:visible!important;display:flex;flex-direction:column;align-items:flex-start;gap:40px}
.cap{width:${W}px;flex:none;position:relative;overflow:hidden;transform:translateZ(0);background:var(--tl-color-bg-canvas);color:var(--tl-color-fg-primary);font-family:var(--tl-font-family-sans);-webkit-font-smoothing:antialiased}
.cap:not([data-fixed]) .tl-app-shell__main{overflow:visible!important}
[data-cap-hide]{display:none!important}
`;

/** 2단계(브라우저): 화면 밖 · 1px 보조 요소를 가리고, 입력 값과 그림을 문서 안에 넣은 뒤 조각을 돌려준다 */
async function serialize({ W, full }) {
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') {
      el.setAttribute('data-cap-hide', '');
      continue;
    }
    if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
    const r = el.getBoundingClientRect();
    const tiny = r.width <= 1.5 && r.height <= 1.5;
    const outside = r.right <= 0 || r.left >= W || r.bottom <= 0 || r.top >= full;
    if (tiny || outside || cs.visibility === 'hidden') el.setAttribute('data-cap-hide', '');
  }
  for (const el of document.querySelectorAll('input')) {
    if (el.type === 'checkbox' || el.type === 'radio') el.toggleAttribute('checked', el.checked);
    else el.setAttribute('value', el.value);
  }
  for (const el of document.querySelectorAll('textarea')) el.textContent = el.value;
  for (const el of document.querySelectorAll('select'))
    for (const o of el.options) o.toggleAttribute('selected', o.selected);
  for (const c of document.querySelectorAll('canvas')) {
    const img = document.createElement('img');
    img.src = c.toDataURL();
    img.style.cssText = c.style.cssText;
    img.className = c.className;
    img.width = c.clientWidth;
    img.height = c.clientHeight;
    c.replaceWith(img);
  }
  for (const img of document.querySelectorAll('img')) {
    if (img.src.startsWith('data:')) continue;
    try {
      const blob = await (await fetch(img.src)).blob();
      img.src = await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(blob);
      });
      img.removeAttribute('srcset');
    } catch {
      /* 그대로 둔다 */
    }
  }
  const body = document.body.cloneNode(true);
  for (const n of body.querySelectorAll('script, link, noscript, template, style')) n.remove();
  // 스크롤된 칸의 위치는 HTML에 남지 않는다. 세로로 스크롤된 칸(대화 끝 등)만 적어 둔다
  return {
    inner: body.innerHTML,
    bodyClass: document.body.className,
    htmlStyle: document.documentElement.getAttribute('style') ?? '',
    htmlAttrs: [...document.documentElement.attributes]
      .filter((a) => a.name !== 'style')
      .map((a) => ` ${a.name}="${a.value.replace(/"/g, '&quot;')}"`)
      .join(''),
    fonts: [
      ...new Set(
        [...document.body.querySelectorAll('*')]
          .filter(
            (e) =>
              e.childNodes.length &&
              [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
          )
          .map((e) => getComputedStyle(e).fontFamily.split(',')[0].trim()),
      ),
    ],
  };
}

const SHEETS = new Map();
const browser = await chromium.launch({ args: ['--lang=ko-KR'] });
const index = [];
try {
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    reducedMotion: 'reduce',
    locale: 'ko-KR',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem('tl-demo-theme', 'light');
    } catch {
      /* about:blank */
    }
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`${page.url()} ${e.message}`));
  const setOver = (css) =>
    page.evaluate((c) => (document.getElementById('cap-over').textContent = c), css);

  for (const route of [...routes, ...overlays]) {
    const fixed = Boolean(route.overlay);
    await page.setViewportSize({ width: W, height: H });
    await page.goto('about:blank');
    await page.goto(`${ORIGIN}${DEMO_BASE}#/${route.id}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    if (route.overlay) {
      try {
        await route.overlay.open(page);
        await page.waitForTimeout(600);
      } catch (e) {
        console.log(`${route.name}: 열지 못함 — ${String(e.message).split('\n')[0]}`);
        continue;
      }
    }
    const m = await page.evaluate(freezeCss, { W, H, fixed });
    for (const s of m.sheets) {
      if (!SHEETS.has(s.key)) SHEETS.set(s.key, s.css);
      else if (SHEETS.get(s.key) !== s.css)
        console.log(`  ! 시트 ${s.key} 내용이 화면마다 다르다(${route.name})`);
    }
    let full = Math.ceil(m.full);
    await setOver(liveCss(full, fixed));
    await page.setViewportSize({ width: W, height: full });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    for (let i = 0; i < 3 && !fixed; i++) {
      const more = await page.evaluate(() => {
        const main = document.querySelector('.tl-app-shell__main');
        if (!main) return document.documentElement.scrollHeight - document.body.offsetHeight;
        const kids = [...main.children].map((k) => k.getBoundingClientRect().bottom);
        return Math.ceil(Math.max(0, ...kids) - main.getBoundingClientRect().bottom);
      });
      if (more <= 1) break;
      full += more;
      await setOver(liveCss(full, fixed));
      await page.setViewportSize({ width: W, height: full });
      await page.waitForTimeout(150);
    }
    await page.screenshot({ path: join(OUT, 'shots', `${route.name}.png`), fullPage: false });
    const part = await page.evaluate(serialize, { W, full });
    const meta = { ...route };
    delete meta.overlay;
    const rec = {
      ...meta,
      height: full,
      fixed,
      sheets: m.sheets.map((s) => s.key),
      fonts: part.fonts,
    };
    writeFileSync(join(OUT, 'parts', `${route.name}.json`), JSON.stringify({ ...rec, ...part }));
    index.push({ ...rec, htmlAttrs: part.htmlAttrs, bytes: part.inner.length });
    console.log(
      `${route.name.padEnd(40)} ${String(full).padStart(5)}px ${(part.inner.length / 1e3).toFixed(0).padStart(5)}KB  ${part.fonts.join(' | ')}`,
    );
  }
  if (errors.length) console.log(`화면 오류 ${errors.length}건\n${errors.slice(0, 5).join('\n')}`);

  // 묶음 문서: html 속성이 같은 화면끼리, 한 문서에 PER개까지
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const docs = [];
  const byAttr = new Map();
  for (const r of index) byAttr.set(r.htmlAttrs, [...(byAttr.get(r.htmlAttrs) ?? []), r]);
  for (const [attrs, list] of byAttr)
    for (let i = 0; i < list.length; i += PER) docs.push({ attrs, list: list.slice(i, i + PER) });
  const order = [...SHEETS.keys()];
  docs.forEach((d, n) => {
    const keys = order.filter((k) => d.list.some((r) => r.sheets.includes(k)));
    const css = keys.map((k) => SHEETS.get(k)).join('\n');
    const caps = d.list
      .map((r) => {
        const p = JSON.parse(readFileSync(join(OUT, 'parts', `${r.name}.json`), 'utf8'));
        return `<div class="cap ${esc(p.bodyClass)}" data-cap="${r.name}"${r.fixed ? ' data-fixed' : ''} role="region" aria-label="${esc(`${r.title} · ${r.id || 'home'}`)}" style="--cap-h:${r.height}px;height:${r.height}px;${esc(p.htmlStyle)}">${p.inner}</div>`;
      })
      .join('\n');
    const html = `<!doctype html><html${d.attrs}><head><meta charset="utf-8"><title>Trellis 데모 390 · ${n + 1}</title><style>${css}</style><style>${docCss()}</style></head><body>${caps}</body></html>`;
    writeFileSync(join(OUT, `doc-${n + 1}.html`), html);
    writeFileSync(join(OUT, `doc-${n + 1}.json`), JSON.stringify(d.list, null, 2));
    console.log(`doc-${n + 1}.html  화면 ${d.list.length}개  ${(html.length / 1e6).toFixed(2)}MB`);
  });

  // 확인: 묶음 문서를 1440 데스크톱 뷰포트에서 띄워 .cap마다 실제 화면과 픽셀을 비교한다
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const vpage = await desktop.newPage();
  const cmp = await desktop.newPage();
  const verify = [];
  for (let n = 0; n < docs.length; n++) {
    await vpage.setContent(readFileSync(join(OUT, `doc-${n + 1}.html`), 'utf8'), {
      waitUntil: 'load',
    });
    await vpage.evaluate(() => document.fonts.ready);
    await vpage.waitForTimeout(300);
    for (const r of docs[n].list) {
      const a = await vpage.locator(`.cap[data-cap="${r.name}"]`).screenshot();
      const b = readFileSync(join(OUT, 'shots', `${r.name}.png`));
      const res = await cmp.evaluate(
        async ([x, y]) => {
          const load = async (s) => {
            const img = new Image();
            img.src = `data:image/png;base64,${s}`;
            await img.decode();
            const c = new OffscreenCanvas(img.width, img.height);
            const g = c.getContext('2d');
            g.drawImage(img, 0, 0);
            return {
              w: img.width,
              h: img.height,
              d: g.getImageData(0, 0, img.width, img.height).data,
            };
          };
          const [p, q] = [await load(x), await load(y)];
          if (p.w !== q.w || p.h !== q.h)
            return { size: `${p.w}x${p.h} ≠ ${q.w}x${q.h}`, diff: -1 };
          let diff = 0;
          for (let i = 0; i < p.d.length; i += 4)
            if (
              Math.abs(p.d[i] - q.d[i]) +
                Math.abs(p.d[i + 1] - q.d[i + 1]) +
                Math.abs(p.d[i + 2] - q.d[i + 2]) >
              48
            )
              diff++;
          return { diff, ratio: diff / (p.w * p.h) };
        },
        [a.toString('base64'), b.toString('base64')],
      );
      verify.push({ name: r.name, doc: n + 1, ...res });
      if (res.diff !== 0) {
        writeFileSync(join(OUT, 'shots', `${r.name}.doc.png`), a);
        console.log(
          `  다름 ${r.name}: ${res.size ?? `${res.diff}px (${(res.ratio * 100).toFixed(3)}%)`}`,
        );
      }
    }
  }
  writeFileSync(join(OUT, 'verify.json'), JSON.stringify(verify, null, 2));
  console.log(
    `확인: ${verify.filter((v) => v.diff === 0).length}/${verify.length} 화면이 픽셀까지 같다`,
  );
} finally {
  await browser.close();
  server.close();
}
writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 2));
console.log(`화면 ${index.length}개 → ${OUT}`);
