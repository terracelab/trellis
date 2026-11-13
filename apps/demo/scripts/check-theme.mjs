// 회사 테마 엔진(D-98)이 같은 입력에 Node와 브라우저에서 같은 값을 내는지 본다.
// 검증 색 10개 + 극단 20색 × 회색 톤 3 + 주 버튼 규칙 2 → JSON을 그대로 대조한다.
//   node scripts/check-theme.mjs   (Chromium, 설치돼 있으면 WebKit · Firefox도)
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import { createTheme } from '@terracelab/trellis-tokens/theme';

const TOKENS = fileURLToPath(new URL('../../../packages/tokens/', import.meta.url));
const COLORS = [
  '#FE5C2B',
  '#1F56E2',
  '#0B7A5C',
  '#6D28D9',
  '#DB2777',
  '#E11D2A',
  '#FFD400',
  '#38BDF8',
  '#111111',
  '#6B7280',
  '#FFFF00',
  '#00FF00',
  '#FF0000',
  '#000000',
  '#FFFFFF',
  '#808080',
  '#FF69B4',
  '#00FFFF',
  '#FFA500',
  '#1E90FF',
  '#8B4513',
  '#F0E68C',
  '#2F4F4F',
  '#9400D3',
  '#DC143C',
  '#00CED1',
  '#ADFF2F',
  '#191970',
  '#E6E6FA',
  '#FF1493',
];
const INPUTS = COLORS.flatMap((brand) =>
  ['cool', 'neutral', 'warm'].flatMap((neutral) =>
    ['white', 'input'].map((buttonText) => ({ brand, neutral, buttonText })),
  ),
);
const strip = (t) => ({ ...t, warnings: t.warnings.map((w) => ({ ...w })) });
const node = JSON.stringify(INPUTS.map((i) => strip(createTheme(i))));

const TYPES = { '.mjs': 'text/javascript', '.json': 'application/json', '.html': 'text/html' };
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (url === '/')
    return res
      .writeHead(200, { 'content-type': 'text/html' })
      .end('<!doctype html><title>theme</title>');
  const file = normalize(join(TOKENS, url));
  if (!file.startsWith(TOKENS) || !existsSync(file) || statSync(file).isDirectory())
    return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

let failed = false;
for (const [name, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
  ['firefox', firefox],
]) {
  let browser;
  try {
    browser = await type.launch();
  } catch {
    if (name === 'chromium') throw new Error('Chromium을 열 수 없다');
    console.log(`- ${name}: 설치되지 않아 건너뜀`);
    continue;
  }
  const page = await browser.newPage();
  await page.goto(origin);
  const out = await page.evaluate(async (inputs) => {
    const m = await import('/theme/index.mjs');
    return JSON.stringify(
      inputs.map((i) => {
        const t = m.createTheme(i);
        return { ...t, warnings: t.warnings.map((w) => ({ ...w })) };
      }),
    );
  }, INPUTS);
  const same = out === node;
  if (!same) failed = true;
  console.log(
    `${same ? '✓' : '✗'} ${name}: ${INPUTS.length}개 입력 ${same ? 'Node와 같다' : 'Node와 다르다'}`,
  );
  await browser.close();
}
server.close();
process.exit(failed ? 1 : 0);
