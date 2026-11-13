// 넘침 점검: 조립된 묶음(dist)의 문서 · 소개 사이트 페이지와 데모 화면을 여러 폭으로 열어
// 글자 · 표가 제 상자 밖으로 나간 곳을 찾는다(PR-39). 하나라도 있으면 exit 1.
//   node scripts/overflow.mjs [--only <주소에 든 글자>] [--widths 1440,390] [--demo-widths 1440,390]
//                             [--skip-pages] [--skip-demo] [--json <파일>]
//   SITE_BASE=/trellis/ node scripts/overflow.mjs   경로 아래에 놓이게 빌드한 묶음(같은 값으로 빌드한 dist)
//   SITE_DIST=<폴더> node scripts/overflow.mjs      다른 폴더의 묶음
// 찾는 것:
//   cell-escape        표 칸(td · th · role=cell 등) 안 글자가 칸 밖에서 보인다
//   cell-child-escape  칸 안 요소(배지 · 단추)가 칸 밖으로 나갔다
//   cell-hard-cut      칸 안 글자가 말줄임 없이 잘렸다
//   cell-number-cut    칸 안 숫자가 잘렸다(말줄임이어도 센다. 숫자는 자르지 않는다)
//   table-escape · table-cut  표가 스크롤 칸 없이 밖으로 나갔거나 잘렸다
//   box-escape         글자가 테두리 · 바탕이 있는 가장 가까운 상자 밖에서 보인다
//   text-hard-cut      글자가 말줄임 없이 가로로 잘렸다
//   page-overflow      페이지에 가로 스크롤이 생겼다(읽어 주기 전용 글의 기준 블록이 없을 때도 여기서 잡힌다)
// 스크롤 칸(overflow auto · scroll)이 자른 것, 말줄임으로 줄인 글자, 통째로 가려진 글자는 세지 않는다.
// 기본 폭은 문서 · 소개 사이트 1920 · 1440 · 1280 · 1024 · 768 · 600 · 390, 데모 1920 · 1440 · 1024 · 390이다.
// 전부 돌리면 5분쯤 걸린다. CI에는 넣지 않았고 화면 · 문서 CSS를 고친 뒤 손으로 돌린다.
import {
  createReadStream,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const DIST = join(
  process.env.SITE_DIST
    ? resolve(process.env.SITE_DIST)
    : fileURLToPath(new URL('../dist', import.meta.url)),
  '/',
);
const BLOCKS = fileURLToPath(new URL('../../../blocks/src/', import.meta.url));
/** 사이트 경로. BASE는 끝에 /가 있고('/' · '/trellis/'), PREFIX는 없다('' · '/trellis') */
const BASE = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');
const PREFIX = BASE.slice(0, -1);

const args = process.argv.slice(2);
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const widths = (name, fallback) =>
  (value(name)?.split(',').map(Number) ?? fallback).filter(Boolean);
const ONLY = value('--only');
const PAGE_WIDTHS = widths('--widths', [1920, 1440, 1280, 1024, 768, 600, 390]);
const DEMO_WIDTHS = widths('--demo-widths', [1920, 1440, 1024, 390]);
const JSON_OUT = value('--json');

/**
 * 알려진 자리. 이 안에서 찾은 것은 실패로 세지 않고 따로 적는다.
 * - 컴포넌트 목록의 미리보기 칸은 화면 조각을 줄여 넣고 넘치는 쪽을 일부러 자르고 흐린다(components.css data-crop)
 * - AppShell 휴대폰 바의 brand는 행동 단추가 많으면 말줄임 없이 잘린다(backlog 2026-11-13)
 */
const KNOWN = [
  ['.tl-site-gallery-well', '줄인 미리보기'],
  ['.tl-app-shell__brand', 'AppShell brand(backlog)'],
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

/** 묶음 안의 모든 페이지(데모 · 생성물 폴더 제외) */
function pagePaths(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (dir === DIST.slice(0, -1) && ['_astro', 'pagefind', 'api', 'demo'].includes(name))
        continue;
      pagePaths(p, out);
    } else if (name === 'index.html') {
      const rel = relative(DIST, dir).replaceAll('\\', '/');
      out.push(rel ? `/${rel}/` : '/');
    }
  }
  return out;
}

/** 데모의 모든 화면(블록마다 하나) */
function demoPaths() {
  const ids = [];
  for (const g of readdirSync(BLOCKS)) {
    if (g.startsWith('_') || !statSync(join(BLOCKS, g)).isDirectory()) continue;
    for (const m of readdirSync(join(BLOCKS, g)))
      for (const s of readdirSync(join(BLOCKS, g, m))) {
        const file = join(BLOCKS, g, m, s, 'block.json');
        if (existsSync(file)) ids.push(JSON.parse(readFileSync(file, 'utf8')).id);
      }
  }
  return ['/demo/', '/demo/#/blocks', ...ids.map((id) => `/demo/#/${id}`)];
}

const pick = (list) => list.filter((p) => !ONLY || p.includes(ONLY)).sort();
const jobs = [];
if (!args.includes('--skip-pages'))
  for (const width of PAGE_WIDTHS)
    for (const path of pick(pagePaths(DIST.slice(0, -1)))) jobs.push({ width, path });
if (!args.includes('--skip-demo') && existsSync(join(DIST, 'demo/index.html')))
  for (const width of DEMO_WIDTHS) for (const path of pick(demoPaths())) jobs.push({ width, path });
const total = jobs.length;
if (total === 0) {
  console.error('볼 페이지가 없다(--only 값을 확인한다)');
  process.exit(1);
}

const server = createServer((req, res) => {
  const full = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!full.startsWith(BASE)) return res.writeHead(404).end();
  let file = normalize(join(DIST, full.slice(PREFIX.length)));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

/** 페이지 안에서 도는 검사 */
function probe(known) {
  const TOL = 1.5;
  const out = [];
  /** 알려진 자리(일부러 자르는 미리보기 등) 안의 것은 known으로 표시해 따로 센다 */
  const report = (el, finding) => {
    const hit = known.find(([selector]) => el.closest?.(selector));
    out.push(hit ? { ...finding, known: hit[1] } : finding);
  };
  const CELL =
    'td, th, [role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]';
  const desc = (el) => {
    const parts = [];
    for (let n = el, i = 0; n && n.nodeType === 1 && i < 5; n = n.parentElement, i++) {
      let s = n.tagName.toLowerCase();
      const cls = [...n.classList].filter((c) => !c.startsWith('astro-')).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const styleOf = (() => {
    const m = new WeakMap();
    return (el) => {
      let c = m.get(el);
      if (!c) m.set(el, (c = getComputedStyle(el)));
      return c;
    };
  })();
  const shown = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = styleOf(n);
      if (c.display === 'none' || c.visibility === 'hidden' || Number(c.opacity) === 0)
        return false;
      if (c.clipPath === 'inset(50%)' || c.clip === 'rect(0px, 0px, 0px, 0px)') return false;
      if (c.position === 'absolute' && n.offsetWidth <= 1 && n.offsetHeight <= 1) return false;
    }
    return true;
  };
  const clipsX = (c) => c.overflowX !== 'visible';
  const clipsY = (c) => c.overflowY !== 'visible';
  /**
   * 글자 상자 r이 실제로 보이는 부분: r에서 stop(포함하지 않음)까지의 조상 가운데 잘라 내는 것과 겹친 부분.
   * cut = 잘린 양(px), ellipsis = 말줄임으로 자른 것인가, scroll = 스크롤 칸이 자른 것인가
   */
  const visiblePart = (r, from, stop) => {
    let left = r.left,
      right = r.right,
      top = r.top,
      bottom = r.bottom;
    let cutX = 0,
      cutY = 0,
      ellipsis = false,
      scroll = false,
      gone = false;
    for (let n = from; n && n !== stop && n.nodeType === 1; n = n.parentElement) {
      const c = styleOf(n);
      if (c.display === 'inline') continue;
      const b = n.getBoundingClientRect();
      if (clipsX(c)) {
        const nl = Math.max(left, b.left),
          nr = Math.min(right, b.right);
        const d = nl - left + (right - nr);
        if (d > 0.5) {
          cutX += d;
          if (c.textOverflow === 'ellipsis' || c.webkitLineClamp !== 'none') ellipsis = true;
          if (c.overflowX === 'auto' || c.overflowX === 'scroll') scroll = true;
        }
        if (nr - nl <= 0.5) gone = true;
        left = nl;
        right = Math.max(nl, nr);
      }
      if (clipsY(c)) {
        const nt = Math.max(top, b.top),
          nb = Math.min(bottom, b.bottom);
        const d = nt - top + (bottom - nb);
        if (d > 0.5) {
          cutY += d;
          if (c.webkitLineClamp !== 'none' && c.webkitLineClamp !== '') ellipsis = true;
          if (c.overflowY === 'auto' || c.overflowY === 'scroll') scroll = true;
        }
        if (nb - nt <= 0.5) gone = true;
        top = nt;
        bottom = Math.max(nt, nb);
      }
    }
    return { left, right, top, bottom, cutX, cutY, ellipsis, scroll, gone };
  };
  const main = document.querySelector('main') ?? document.body;
  const isNum = (s) =>
    /^[\s−\-+]?[\d,.]+\s*(원|%|건|개|EA|SET|kg|g|L|box|BOX|명|일|시간|h|분|억|만|천)?$/.test(
      s.trim(),
    );

  // 1) 표 칸: 칸 안 글자가 (a) 칸 밖에서 보이는가 (b) 말줄임 없이 잘렸는가 (c) 숫자가 잘렸는가
  for (const cell of main.querySelectorAll(CELL)) {
    if (!shown(cell)) continue;
    const box = cell.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    const cc = styleOf(cell);
    // 칸 자신이 자르면 그 안쪽 상자가 한계다
    const selfClip = clipsX(cc) || clipsY(cc);
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    let esc = 0,
      escSample = '',
      escSide = '';
    let hard = 0,
      hardSample = '';
    let num = 0,
      numSample = '';
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const text = t.nodeValue.trim();
      if (!text) continue;
      const pe = t.parentElement;
      if (!pe || pe.closest('svg, select, option')) continue;
      if (pe.closest(CELL) !== cell) continue;
      if (!shown(pe)) continue;
      const range = document.createRange();
      range.selectNodeContents(t);
      for (const r of range.getClientRects()) {
        if (r.width === 0 || r.height === 0) continue;
        // 칸 안쪽 조상이 자른 뒤 보이는 부분
        const v = visiblePart(r, pe, cell);
        if (v.gone) continue;
        // 화면 밖 조상(스크롤 칸 · 숨긴 서랍)이 통째로 가린 글자는 보이지 않는다
        if (visiblePart(r, pe, document.documentElement).gone) continue;
        const over = Math.max(
          v.right - box.right,
          box.left - v.left,
          v.bottom - box.bottom,
          box.top - v.top,
        );
        if (over > TOL && !selfClip && over > esc) {
          esc = over;
          escSample = text.slice(0, 60);
          escSide =
            v.right - box.right === over
              ? 'right'
              : box.left - v.left === over
                ? 'left'
                : v.bottom - box.bottom === over
                  ? 'bottom'
                  : 'top';
        }
        // 칸 자신이 자르는 경우까지 넣어 잘린 양을 센다
        const w = visiblePart(r, pe, cell.parentElement);
        const cut = Math.max(w.cutX, w.cutY);
        const cellEllipsis = cc.textOverflow === 'ellipsis';
        if (cut > TOL && !w.scroll) {
          if (!(w.ellipsis || cellEllipsis) && cut > hard) {
            hard = cut;
            hardSample = text.slice(0, 60);
          }
          if (isNum(text) && cut > num) {
            num = cut;
            numSample = text.slice(0, 60);
          }
        }
      }
    }
    if (esc > TOL)
      report(cell, {
        kind: 'cell-escape',
        over: Math.round(esc),
        side: escSide,
        sample: escSample,
        where: desc(cell),
      });
    if (hard > TOL)
      report(cell, {
        kind: 'cell-hard-cut',
        over: Math.round(hard),
        side: 'x',
        sample: hardSample,
        where: desc(cell),
      });
    if (num > TOL)
      report(cell, {
        kind: 'cell-number-cut',
        over: Math.round(num),
        side: 'x',
        sample: numSample,
        where: desc(cell),
      });
    // 글자가 아닌 것(배지 · 단추 · 확인란)이 칸 밖으로
    if (!selfClip)
      for (const child of cell.querySelectorAll('*')) {
        if (child.closest('svg') && child.tagName !== 'svg') continue;
        if (child.closest(CELL) !== cell || !shown(child)) continue;
        const r = child.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const v = visiblePart(r, child.parentElement, cell);
        if (v.gone || visiblePart(r, child.parentElement, document.documentElement).gone) continue;
        const over = Math.max(v.right - box.right, box.left - v.left);
        if (over > TOL) {
          report(child, {
            kind: 'cell-child-escape',
            over: Math.round(over),
            side: v.right - box.right === over ? 'right' : 'left',
            sample: (child.textContent ?? '').trim().slice(0, 60),
            where: desc(child),
          });
          break;
        }
      }
  }

  // 2) 표 자체가 스크롤 칸 없이 밖으로 나갔거나 잘렸는가
  for (const table of main.querySelectorAll(
    'table, [role="table"], [role="grid"], [role="treegrid"]',
  )) {
    if (!shown(table)) continue;
    const r = table.getBoundingClientRect();
    if (r.width === 0) continue;
    const own = styleOf(table);
    if (own.overflowX === 'auto' || own.overflowX === 'scroll') continue;
    let c = null;
    for (let n = table.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const cs = styleOf(n);
      if (cs.overflowX !== 'visible') {
        c = { el: n, mode: cs.overflowX };
        break;
      }
    }
    if (c && (c.mode === 'auto' || c.mode === 'scroll')) continue;
    const limit = c ? c.el.getBoundingClientRect() : main.getBoundingClientRect();
    const over = r.right - limit.right;
    if (over > TOL)
      report(table, {
        kind: c ? 'table-cut' : 'table-escape',
        over: Math.round(over),
        side: 'right',
        sample: (table.textContent ?? '').trim().slice(0, 50),
        where: desc(table),
      });
  }

  // 3) 본문 어디서든: 글자가 가장 가까운 상자(테두리 · 배경) 밖에서 보이거나, 말줄임 없이 잘렸는가
  const boxy = (n) => {
    const c = styleOf(n);
    const bw =
      parseFloat(c.borderLeftWidth) +
      parseFloat(c.borderRightWidth) +
      parseFloat(c.borderTopWidth) +
      parseFloat(c.borderBottomWidth);
    const bg = c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent';
    return bw > 0 || bg;
  };
  const seen = new Set();
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const text = t.nodeValue.trim();
    if (!text) continue;
    const pe = t.parentElement;
    if (!pe || pe.closest('svg, script, style, select, option, canvas, pre')) continue;
    if (pe.closest(CELL)) continue; // 1)이 본다
    if (!shown(pe)) continue;
    let box = null;
    for (let n = pe; n && n !== main; n = n.parentElement) {
      if (styleOf(n).display === 'inline') continue;
      if (boxy(n)) {
        box = n;
        break;
      }
    }
    const range = document.createRange();
    range.selectNodeContents(t);
    for (const r of range.getClientRects()) {
      if (r.width === 0 || r.height === 0) continue;
      const all = visiblePart(r, pe, document.documentElement);
      if (all.gone) continue;
      if (box && !seen.has(box)) {
        const b = box.getBoundingClientRect();
        const v = visiblePart(r, pe, box);
        const bc = styleOf(box);
        const over = Math.max(v.right - b.right, b.left - v.left);
        if (!v.gone && over > TOL && !clipsX(bc)) {
          seen.add(box);
          report(box, {
            kind: 'box-escape',
            over: Math.round(over),
            side: 'x',
            sample: text.slice(0, 60),
            where: desc(box),
          });
        }
      }
      // 말줄임 없이 가로로 잘린 글자(스크롤 칸 제외)
      const w = visiblePart(r, pe, main);
      if (!w.gone && w.cutX > 3 && !w.ellipsis && !w.scroll) {
        const key = pe;
        if (!seen.has(key)) {
          seen.add(key);
          report(pe, {
            kind: 'text-hard-cut',
            over: Math.round(w.cutX),
            side: 'x',
            sample: text.slice(0, 60),
            where: desc(pe),
          });
        }
      }
    }
  }

  // 4) 페이지 가로 넘침
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) {
    // 누가 밀어냈는지 찾는다
    let culprit = '';
    let worst = 0;
    for (const el of main.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || !shown(el)) continue;
      const over = r.right - de.clientWidth;
      if (over > worst) {
        // 스크롤 칸 안에 있으면 제외
        let inScroll = false;
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const c = styleOf(n);
          if (c.overflowX !== 'visible') {
            inScroll = true;
            break;
          }
        }
        if (!inScroll) {
          worst = over;
          culprit = desc(el);
        }
      }
    }
    out.push({
      kind: 'page-overflow',
      over: de.scrollWidth - de.clientWidth,
      side: 'right',
      sample: '',
      where: culprit || 'html',
    });
  }
  return out;
}

const browser = await chromium.launch();
const findings = [];
const errors = [];
let done = 0;
async function worker() {
  const contexts = new Map();
  for (;;) {
    const job = jobs.shift();
    if (!job) break;
    let context = contexts.get(job.width);
    if (!context) {
      context = await browser.newContext({
        viewport: { width: job.width, height: 900 },
        reducedMotion: 'reduce',
      });
      contexts.set(job.width, context);
    }
    const page = await context.newPage();
    try {
      await page.goto(ORIGIN + PREFIX + job.path, { waitUntil: 'load', timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      // client:visible 섬이 전부 그려지게 끝까지 내린다
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(250);
      for (const f of await page.evaluate(probe, KNOWN)) findings.push({ ...job, ...f });
    } catch (e) {
      errors.push(`${job.path} @${job.width}: ${String(e.message).split('\n')[0]}`);
    } finally {
      await page.close();
      done++;
      if (done % 200 === 0) console.log(`… ${done}/${total}`);
    }
  }
  for (const context of contexts.values()) await context.close();
}
await Promise.all(Array.from({ length: 6 }, worker));
await browser.close();
server.close();

if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ total, findings, errors }, null, 1));

/** 같은 자리 · 같은 종류를 한 줄로 묶는다 */
function grouped(list) {
  const groups = new Map();
  for (const f of list) {
    const key = `${f.kind} | ${f.where}`;
    const g = groups.get(key) ?? {
      n: 0,
      pages: new Set(),
      widths: new Set(),
      max: 0,
      sample: f.sample,
    };
    g.n++;
    g.pages.add(f.path);
    g.widths.add(f.width);
    g.max = Math.max(g.max, f.over);
    groups.set(key, g);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}
const failed = findings.filter((f) => !f.known);
const known = findings.filter((f) => f.known);
for (const [key, g] of grouped(failed))
  console.log(
    `✗ ${key}\n    ${g.n}곳 · 최대 ${g.max}px · 폭 ${[...g.widths].sort((a, b) => a - b).join(' · ')} · "${g.sample}"\n    ${[...g.pages].slice(0, 3).join(' ')}`,
  );
for (const e of errors) console.log(`✗ 열지 못함 ${e}`);
const knownBy = new Map();
for (const f of known) knownBy.set(f.known, (knownBy.get(f.known) ?? 0) + 1);
console.log(
  `넘침 점검: ${total}번 열기 · 넘침 ${failed.length}곳${
    known.length
      ? ` · 알려진 자리 ${known.length}곳(${[...knownBy].map(([k, n]) => `${k} ${n}`).join(' · ')})`
      : ''
  }${errors.length ? ` · 열지 못한 페이지 ${errors.length}` : ''}`,
);
if (failed.length || errors.length) process.exit(1);
console.log('통과');
