// Trellis 표식(src/lib/mark.json) 하나로 아이콘 파일을 전부 만든다(D-149). 만든 파일은 커밋한다.
//   node scripts/favicons.mjs
// favicon.svg(탭) · favicon.ico(16 · 32 · 48, 오래된 브라우저와 주소 루트 요청) · apple-touch-icon.png(180, 흰 바탕)
// · icon-192 · icon-512.png + site.webmanifest(홈 화면에 추가). 표식을 바꾸면 mark.json만 고치고 다시 돌린다.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const mark = JSON.parse(readFileSync(new URL('../src/lib/mark.json', import.meta.url), 'utf8'));
const CANVAS = 512;
const PAPER = '#FFFFFF';

/** 어디에 무엇을 둘지. 문서 · 테라스원 · 데모는 따로 빌드해도 같은 아이콘이 나오게 같은 파일을 갖는다 */
const WEB = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'];
const TARGETS = {
  'apps/site/public': [...WEB, 'icon-192.png', 'icon-512.png', 'site.webmanifest'],
  'apps/docs/public': WEB,
  'apps/one/public': WEB,
  'apps/demo/public': WEB,
  'apps/site/pages-root': WEB,
  'starters/service/app/public': ['favicon.svg'],
};

/** 정사각 캔버스 가운데에 표식을 놓는다. ratio = 캔버스 폭에서 표식이 차지하는 비율 */
function square(ratio, background) {
  const scale = (CANVAS * ratio) / mark.width;
  const x = (CANVAS - mark.width * scale) / 2;
  const y = (CANVAS - mark.height * scale) / 2;
  const round = (n) => Math.round(n * 1000) / 1000;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}">` +
    (background ? `<rect width="${CANVAS}" height="${CANVAS}" fill="${background}"/>` : '') +
    `<path fill="${mark.color}" transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})" d="${mark.d}"/>` +
    `</svg>\n`
  );
}

const browser = await chromium.launch();
async function png(svg, size) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  const buffer = await page.screenshot({ omitBackground: true, type: 'png' });
  await page.close();
  return buffer;
}

/** PNG 여러 장을 .ico 하나로 묶는다(ICO는 PNG를 그대로 담을 수 있다) */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// 탭 아이콘은 바탕 없이 꽉 차게, 홈 화면 아이콘은 흰 바탕에 여백을 둔다
const tab = square(0.94);
const home = square(0.6, PAPER);
const files = {
  'favicon.svg': Buffer.from(tab),
  'favicon.ico': ico(
    await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tab, size) }))),
  ),
  'apple-touch-icon.png': await png(home, 180),
  'icon-192.png': await png(home, 192),
  'icon-512.png': await png(home, 512),
  'site.webmanifest': Buffer.from(
    `${JSON.stringify(
      {
        name: 'Trellis',
        short_name: 'Trellis',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: mark.color,
        background_color: PAPER,
        display: 'browser',
      },
      null,
      2,
    )}\n`,
  ),
};
await browser.close();

let count = 0;
for (const [dir, names] of Object.entries(TARGETS)) {
  mkdirSync(join(ROOT, dir), { recursive: true });
  for (const name of names) {
    writeFileSync(join(ROOT, dir, name), files[name]);
    count += 1;
  }
}
console.log(
  `아이콘 ${Object.keys(files).length}종 · 파일 ${count}개 → ${Object.keys(TARGETS).join(' · ')}`,
);
