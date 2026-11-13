// 빌드된 preview.html 검사: 크기 ≤ 5MB, 외부 요청 0, axe critical·serious 0, 번들 서체 사용, 1440 · 390 가로 넘침 0.
// 대비 승인 대기 조합(data-contrast-pending, docs/plan/notes/contrast-2026-11.md)의 color-contrast는
// 실패로 세지 않고 따로 보고한다(D-33).
import { statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const FILE = fileURLToPath(new URL('../dist/preview.html', import.meta.url));
const LIMIT = 5 * 1024 * 1024;
const failures = [];

const size = statSync(FILE).size;
console.log(`크기: ${(size / 1024 / 1024).toFixed(2)}MB (한도 5MB)`);
if (size > LIMIT) failures.push(`크기 초과: ${size}`);

const browser = await chromium.launch();
try {
  // reduced-motion이면 토큰이 duration을 0ms로 만든다. 테마 전환 중간색을 재지 않게 한다.
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const external = [];
  page.on('request', (req) => {
    if (!/^(file|data|blob|about):/.test(req.url())) external.push(req.url());
  });
  await page.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  const font = await page.evaluate(() => ({
    loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
    body: getComputedStyle(document.querySelector('.tl-preview-app')).fontFamily.split(',')[0],
  }));
  console.log(`서체: 본문 ${font.body}, 로드됨 ${JSON.stringify(font.loaded)}`);
  if (!font.loaded.some((f) => f.includes('Pretendard Variable')))
    failures.push('Pretendard Variable이 로드되지 않음');

  for (const theme of ['light', 'dark']) {
    for (const density of ['compact', 'comfortable']) {
      await page.evaluate(
        ([t, d]) =>
          Object.assign(document.querySelector('.tl-preview-app').dataset, {
            theme: t,
            density: d,
          }),
        [theme, density],
      );
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const results = await new AxeBuilder({ page }).analyze();
      const blocking = [];
      const pending = new Map();
      for (const violation of results.violations.filter((v) =>
        ['critical', 'serious'].includes(v.impact),
      )) {
        for (const node of violation.nodes) {
          const selector = node.target.join(' ');
          const tag =
            violation.id === 'color-contrast'
              ? await page.evaluate(
                  (sel) =>
                    document
                      .querySelector(sel)
                      ?.closest('[data-contrast-pending]')
                      ?.getAttribute('data-contrast-pending') ?? null,
                  selector,
                )
              : null;
          if (tag) pending.set(tag, (pending.get(tag) ?? 0) + 1);
          else
            blocking.push(
              `${violation.id} (${violation.impact}): ${selector} — ${node.failureSummary?.split('\n')[1]?.trim() ?? ''}`,
            );
        }
      }
      const label = `${theme}·${density}`;
      console.log(
        `axe ${label}: critical·serious ${blocking.length}건` +
          (pending.size
            ? `, 승인 대기 대비 ${[...pending].map(([k, n]) => `${k}×${n}`).join(' ')}`
            : ''),
      );
      for (const b of blocking) console.log(`  ${b}`);
      if (blocking.length) failures.push(`axe ${label}: ${blocking.length}건`);
    }
  }

  // 가로 넘침: 1440 · 390에서 문서 폭이 창보다 넓으면 실패(쇼케이스는 판 안에서 자른다, PG-04)
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(
      (w) =>
        Object.assign(document.querySelector('.tl-preview-app').dataset, {
          theme: 'light',
          density: 'compact',
          width: String(w),
        }),
      width,
    );
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    console.log(`가로 넘침 ${width}: ${over}px`);
    if (over > 0) failures.push(`가로 넘침 ${width}: ${over}px`);
  }

  console.log(`외부 요청: ${external.length}건`);
  for (const url of external) console.log(`  ${url}`);
  if (external.length) failures.push(`외부 요청 ${external.length}건`);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`실패: ${failures.join(' / ')}`);
  process.exit(1);
}
console.log('통과');
