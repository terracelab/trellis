// 공유 미리보기 그림(og.png, 1200×630)을 만든다. 표식(src/lib/mark.json)과 글꼴(Pretendard)만으로 그리고, 만든 파일은 커밋한다.
//   node scripts/og.mjs
// 링크를 메신저 · 검색 결과 · 답변 엔진에 붙였을 때 보이는 그림이다. 숫자를 넣지 않아 빌드마다 다시 만들 일이 없다.
// 문서가 따로 올라가는 경우(og:image가 문서 주소를 가리킨다)를 위해 apps/docs/public에도 같은 파일을 둔다.
// 데모의 그림(apps/demo/public/og.jpg)은 글이 아니라 화면이다: 블록 그림(public/blocks, scripts/shots.mjs)의 윗부분을 쓴다.
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const mark = JSON.parse(readFileSync(new URL('../src/lib/mark.json', import.meta.url), 'utf8'));
const FONT = join(ROOT, 'packages/tokens/fonts/PretendardVariable.woff2');
const OUT = [join(ROOT, 'apps/site/public/og.png'), join(ROOT, 'apps/docs/public/og.png')];
/** 데모 미리보기에 쓰는 화면. 1440×900 그림을 1200폭으로 줄여 위에서 630까지 보인다 */
const DEMO_SHOT = join(ROOT, 'apps/site/public/blocks/home--dashboard--trade@2x.jpg');
const DEMO_OUT = join(ROOT, 'apps/demo/public/og.jpg');

const INK = '#111827';
const MUTED = '#5B6472';
const PAPER = '#F3F4F6';

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Pretendard; font-weight: 100 900; src: url('${pathToFileURL(FONT)}') format('woff2'); }
html, body { margin: 0; width: 1200px; height: 630px; background: ${PAPER}; font-family: Pretendard, sans-serif; -webkit-font-smoothing: antialiased; }
.card { box-sizing: border-box; width: 1200px; height: 630px; padding: 88px 96px; display: flex; flex-direction: column; justify-content: space-between; }
.mark { align-self: flex-start; height: 104px; width: auto; }
.name { margin: 0; font-size: 168px; line-height: 1; font-weight: 700; letter-spacing: -0.03em; color: ${INK}; }
.line { margin: 24px 0 0; font-size: 48px; line-height: 1.3; font-weight: 500; color: ${MUTED}; }
.foot { font-size: 30px; font-weight: 500; color: ${MUTED}; }
</style>
<div class="card">
  <svg class="mark" viewBox="0 0 ${mark.width} ${mark.height}" aria-hidden="true"><path d="${mark.d}" fill="${mark.color}"/></svg>
  <div>
    <h1 class="name">Trellis</h1>
    <p class="line">테라스랩의 디자인 시스템</p>
  </div>
  <div class="foot">토큰 · 컴포넌트 · 화면 블록 · 에이전트용 문서</div>
</div>`;

const dir = mkdtempSync(join(tmpdir(), 'trellis-og-'));
const file = join(dir, 'og.html');
writeFileSync(file, html);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  writeFileSync(OUT[0], png);
  copyFileSync(OUT[0], OUT[1]);
  console.log(`og.png ${png.length} bytes → ${OUT.map((p) => p.replace(ROOT, '')).join(' · ')}`);

  writeFileSync(
    file,
    `<!doctype html><meta charset="utf-8"><style>html, body { margin: 0; } img { display: block; width: 1200px; height: 630px; object-fit: cover; object-position: top left; }</style><img src="${pathToFileURL(DEMO_SHOT)}" alt="">`,
  );
  await page.goto(pathToFileURL(file).href);
  await page.waitForFunction(
    () => document.images[0]?.complete && document.images[0].naturalWidth > 0,
  );
  const jpg = await page.screenshot({ type: 'jpeg', quality: 86 });
  writeFileSync(DEMO_OUT, jpg);
  console.log(`og.jpg ${jpg.length} bytes → ${DEMO_OUT.replace(ROOT, '')}`);
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
