// 데모 화면 → html_to_figma용 정적 HTML 묶음. 화면마다 .cap(폭 × 내용 높이), CSS는 그 폭 기준으로 미디어쿼리를 펼친다.
//   node scripts/figma/capture-demo.mjs <out.html> <폭> <light | dark> <블록 id,...>   (home = 홈)
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../apps/demo/package.json', import.meta.url));
const { chromium } = require('playwright');
const DIST = new URL('../../apps/demo/dist', import.meta.url).pathname;
const [out, widthArg, theme, idsArg] = process.argv.slice(2);
const width = Number(widthArg);
const ids = idsArg.split(',').map((s) => (s === 'home' ? '' : s));
const T = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/demo/, '') || '/';
  let f = normalize(join(DIST, url));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width, height: 900 },
  locale: 'ko-KR',
  reducedMotion: 'reduce',
});
await ctx.addInitScript((t) => {
  try {
    localStorage.setItem('tl-demo-theme', t);
    localStorage.removeItem('tl-demo-brand');
    localStorage.setItem('tl-demo-density', 'compact');
  } catch {
    /* 무시 */
  }
}, theme);
const page = await ctx.newPage();
const caps = [];
let first = true;
for (const id of ids) {
  if (first) {
    await page.goto(`${origin}/demo/#/${id}`);
    first = false;
  } else
    await page.evaluate((h) => {
      location.hash = h;
    }, `/${id}`);
  await page.waitForSelector('.tl-app-shell, .tl-block-auth, main', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  await page.evaluate(() => document.fonts.ready);
  const cap = await page.evaluate(async () => {
    // 스크롤 영역의 실제 높이까지 늘린 높이
    const main = document.querySelector('.tl-app-shell__main');
    const shell = document.querySelector('.tl-app-shell');
    let h = window.innerHeight;
    if (shell && main) h = Math.max(h, window.innerHeight - main.clientHeight + main.scrollHeight);
    else h = Math.max(h, document.documentElement.scrollHeight);
    // 이미지를 data URI로
    for (const img of document.querySelectorAll('#root img')) {
      if (img.src.startsWith('data:')) continue;
      try {
        const blob = await (await fetch(img.src)).blob();
        img.src = await new Promise((r) => {
          const fr = new FileReader();
          fr.onload = () => r(fr.result);
          fr.readAsDataURL(blob);
        });
      } catch {
        /* 무시 */
      }
    }
    // 입력값을 속성으로
    for (const el of document.querySelectorAll('#root input, #root textarea')) {
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) el.setAttribute('checked', '');
        else el.removeAttribute('checked');
      } else el.setAttribute('value', el.value);
    }
    const title = document.querySelector('.tl-page-header__title, h1')?.textContent?.trim() ?? '';
    return { h: Math.ceil(h), html: document.getElementById('root').innerHTML, title };
  });
  caps.push({ id: id || 'home', ...cap });
  console.error(`${id || 'home'} ${cap.h}px ${cap.title}`);
}
// 지금 폭 기준으로 미디어쿼리를 펼친 CSS
const css = await page.evaluate(() => {
  const out = [];
  const walk = (rules) => {
    for (const r of rules) {
      if (r instanceof CSSFontFaceRule) continue;
      if (r instanceof CSSMediaRule) {
        if (window.matchMedia(r.conditionText).matches) walk(r.cssRules);
        continue;
      }
      if (r instanceof CSSSupportsRule) {
        if (CSS.supports(r.conditionText)) walk(r.cssRules);
        continue;
      }
      if (r instanceof CSSLayerBlockRule) {
        walk(r.cssRules);
        continue;
      }
      out.push(r.cssText);
    }
  };
  for (const s of document.styleSheets) {
    try {
      walk(s.cssRules);
    } catch {
      /* 무시 */
    }
  }
  return out.join('\n');
});
await browser.close();
server.close();
const fixed = css.replaceAll('Pretendard Variable', 'Pretendard');
const overrides = `
html, body { margin: 0; min-width: ${width + 160}px; background: #ffffff; }
body { display: flex; flex-direction: column; align-items: flex-start; gap: 120px; padding: 80px; }
.cap { position: relative; flex: none; overflow: hidden; background: var(--tl-color-bg-canvas); font-family: var(--tl-font-family-sans); color: var(--tl-color-fg-primary); }
.cap .tl-app-shell { height: 100% !important; }
/* 변환기는 표 글자 크기를 기본값으로 되돌린다(quirks 규칙). 상속으로 고정 */
.cap table { font-size: inherit; line-height: inherit; font-weight: inherit; color: inherit; }
`;
const body = caps
  .map(
    (c) =>
      `<div class="cap" id="cap-${c.id.replaceAll('/', '--')}" data-theme="${theme}" data-density="compact" style="width:${width}px;height:${c.h}px">${c.html}</div>`,
  )
  .join('\n');
const doc = `<!doctype html><html lang="ko" data-theme="${theme}" data-density="compact"><head><meta charset="utf-8"><style>${fixed}\n${overrides}</style></head><body>${body}</body></html>`;
writeFileSync(out, doc);
writeFileSync(
  out.replace(/\.html$/, '.json'),
  JSON.stringify(
    caps.map((c) => ({ id: c.id, h: c.h, title: c.title })),
    null,
    1,
  ),
);
console.error(`→ ${out} ${(doc.length / 1024 / 1024).toFixed(2)}MB, ${caps.length}개`);
