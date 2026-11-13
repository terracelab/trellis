// G2 증거 캡처(P2-13): 검토 7화면 × 회사 색 3 × 모드 3(라이트 · 다크 · 고대비) × 폭 3을 찍고 장마다 axe를 돌린 뒤,
// 화면 × 폭마다 대조표 JPEG 한 장(행 = 회사 색, 열 = 모드)을 만든다. 대조표는 스크린샷을 HTML 격자로 놓고 Playwright로 찍는다.
//   pnpm --filter @terracelab/demo build
//   node scripts/g2-capture.mjs [--out <캡처 폴더>] [--sheets <대조표 폴더>] [--only <화면 키>] [--width 1440]
//     [--mode light|dark|hc] [--color orange|blue|yellow] [--states] [--no-sheets] [--extras] [--skip-matrix]
// --states: 상호작용 상태(역할 넷 · 보기 바꾸는 중 · 휴가 신청 검사와 결과 · 반려 사유 창 · 초성 검색)
// --extras: G2 항목 보조 증거(표 확대 · 금액 칸 · 색각 시뮬레이션 · 알림 카드 홈 3폭 · 포커스 링 순회). 결과 extras.json
// 기본: 캡처 apps/demo/.shots/g2(커밋하지 않는다), 대조표 docs/plan/notes/g2-2026-11. 회사 색은 createTheme 결과를
// <style>로 덧입힌다(기본 주황은 tokens.css 그대로). 결과 JSON(axe 건수)은 캡처 폴더의 results.json.
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { createTheme, themeCss } from '@terracelab/trellis-tokens/theme';
import { chromium } from 'playwright';

const APP = fileURLToPath(new URL('..', import.meta.url));
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const DIST = join(APP, 'dist');
/** 데모가 놓이는 경로. 사이트가 경로 아래에 있으면(SITE_BASE=/trellis/) /trellis/demo/ — 같은 값으로 빌드한 dist여야 한다 */
const DEMO_BASE = `${(process.env.SITE_BASE ?? '/').replace(/\/?$/, '/')}demo/`;
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const OUT = opt('--out', join(APP, '.shots', 'g2'));
const SHEETS = opt('--sheets', join(ROOT, 'docs', 'plan', 'notes', 'g2-2026-11'));
const only = opt('--only', null);
const onlyWidth = opt('--width', null);
const withStates = args.includes('--states');
const noSheets = args.includes('--no-sheets');
const onlyMode = opt('--mode', null);
const onlyColor = opt('--color', null);
const withExtras = args.includes('--extras');
const skipMatrix = args.includes('--skip-matrix');
/** 대조표 한 장의 상한(바이트). 넘으면 품질을 낮추고, 그래도 넘으면 칸을 줄인다 */
const SHEET_MAX = 400 * 1024;

/** 검토 7화면(G2 · Theme A). key = 대조표 파일 이름 */
const SCREENS = [
  { key: 'role-home', id: 'home/dashboard/people', title: '역할별 홈', block: 'new' },
  { key: 'employees', id: 'erp/hr-payroll/employees', title: '구성원 목록', block: 'reused' },
  {
    key: 'leave-request',
    id: 'groupware/attendance/leave-request',
    title: '휴가 신청',
    block: 'new',
  },
  {
    key: 'approval-document',
    id: 'groupware/approval/document',
    title: '결재 상세',
    block: 'changed',
  },
  { key: 'payslip', id: 'erp/hr-payroll/payslip', title: '급여 명세', block: 'reused' },
  { key: 'launcher', id: 'home/launcher/modules', title: '모듈 런처', block: 'new' },
  { key: 'mobile-home', id: 'home/dashboard/mobile', title: '휴대폰 홈', block: 'new' },
].filter((s) => !only || s.key === only);

/** 회사 색: 기본 주황(theme.css 없음) · 파랑 · 노랑 */
const COLORS = [
  { key: 'orange', label: '주황', hex: '#FE5C2B', css: null },
  { key: 'blue', label: '파랑', hex: '#1F56E2', css: themeCss(createTheme({ brand: '#1F56E2' })) },
  {
    key: 'yellow',
    label: '노랑',
    hex: '#FFD400',
    css: themeCss(createTheme({ brand: '#FFD400' })),
  },
].filter((c) => !onlyColor || c.key === onlyColor);
const MODES = [
  { key: 'light', label: '라이트', theme: 'light', contrast: null },
  { key: 'dark', label: '다크', theme: 'dark', contrast: null },
  { key: 'hc', label: '고대비', theme: 'light', contrast: 'high' },
].filter((m) => !onlyMode || m.key === onlyMode);
const WIDTHS = [1440, 1024, 390].filter((w) => !onlyWidth || w === Number(onlyWidth));
const HEIGHT = { 1440: 900, 1024: 768, 390: 844 };

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

if (!existsSync(DIST)) {
  console.error('dist 없음. 먼저 pnpm --filter @terracelab/demo build');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });
mkdirSync(SHEETS, { recursive: true });

const server = createServer((req, res) => {
  const full = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!full.startsWith(DEMO_BASE)) return res.writeHead(404).end();
  const url = full.slice(DEMO_BASE.length - 1);
  let file = normalize(join(DIST, url));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

const shotName = (s, c, m, w) => `${s.key}-${w}-${c.key}-${m.key}.png`;

/** axe: critical · serious는 막는 건수, 승인 대기 대비(data-contrast-pending)는 따로 */
async function audit(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const out = { critical: 0, serious: 0, moderate: 0, minor: 0, pending: 0, rules: [] };
  for (const v of results.violations) {
    for (const node of v.nodes) {
      const pendingTag =
        v.id === 'color-contrast'
          ? await page.evaluate(
              (s) =>
                document
                  .querySelector(s)
                  ?.closest('[data-contrast-pending]')
                  ?.getAttribute('data-contrast-pending') ?? null,
              node.target.join(' '),
            )
          : null;
      if (pendingTag) {
        out.pending += 1;
        continue;
      }
      out[v.impact] = (out[v.impact] ?? 0) + 1;
      if (v.impact === 'critical' || v.impact === 'serious')
        out.rules.push(`${v.id}: ${node.target.join(' ')}`);
    }
  }
  return out;
}

/** 한 장 준비: 해시 이동 → 글꼴 → 회사 색 → 고대비 → 잠시 */
async function show(page, route, color, mode) {
  await page.goto('about:blank');
  await page.goto(`${ORIGIN}${DEMO_BASE}#/${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (color.css) await page.addStyleTag({ content: color.css });
  await page.evaluate((c) => {
    if (c) document.documentElement.setAttribute('data-contrast', c);
    else document.documentElement.removeAttribute('data-contrast');
  }, mode.contrast);
  await page.waitForTimeout(300);
}

async function context(browser, width, mode) {
  const ctx = await browser.newContext({
    viewport: { width, height: HEIGHT[width] },
    reducedMotion: 'reduce',
    locale: 'ko-KR',
    ...(width < 640 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
  });
  await ctx.addInitScript((m) => {
    try {
      localStorage.setItem('tl-demo-theme', m.theme);
    } catch {
      /* about:blank */
    }
  }, mode);
  return ctx;
}

const results = [];
const external = new Set();
const consoleErrors = [];
const browser = await chromium.launch({ args: ['--lang=ko-KR'] });
const started = Date.now();
try {
  for (const width of skipMatrix ? [] : WIDTHS) {
    for (const mode of MODES) {
      const ctx = await context(browser, width, mode);
      const page = await ctx.newPage();
      page.on('request', (r) => {
        if (!r.url().startsWith(ORIGIN) && !/^(data|blob|about):/.test(r.url()))
          external.add(r.url());
      });
      page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
      page.on('pageerror', (e) => consoleErrors.push(e.message));
      for (const color of COLORS) {
        for (const s of SCREENS) {
          await show(page, s.id, color, mode);
          const file = join(OUT, shotName(s, color, mode, width));
          await page.screenshot({ path: file, fullPage: false });
          const overflow = await page.evaluate(() => {
            const main = document.querySelector('.tl-app-shell__main');
            return Math.max(
              document.documentElement.scrollWidth - window.innerWidth,
              main ? main.scrollWidth - main.clientWidth : 0,
            );
          });
          const a = await audit(page);
          results.push({
            screen: s.key,
            id: s.id,
            width,
            color: color.key,
            mode: mode.key,
            overflow,
            ...a,
          });
          const blocking = a.critical + a.serious;
          console.log(
            `${String(width).padEnd(4)} ${mode.key.padEnd(5)} ${color.key.padEnd(6)} ${s.key}: axe ${blocking}${a.pending ? ` (대기 ${a.pending})` : ''}${overflow > 1 ? ` · 가로 넘침 ${overflow}px` : ''}`,
          );
          for (const r of a.rules.slice(0, 4)) console.log(`   ${r}`);
        }
      }
      await ctx.close();
    }
  }

  // 대조표: 화면 × 폭마다 3 × 3(행 = 회사 색, 열 = 모드)
  const sheetPage = await browser.newPage();
  const sheets = [];
  for (const s of noSheets || skipMatrix ? [] : SCREENS) {
    for (const width of WIDTHS) {
      const out = join(SHEETS, `${s.key}-${width}.jpg`);
      const size = await sheet(sheetPage, s, width, out);
      sheets.push({ screen: s.key, width, file: relative(ROOT, out), bytes: size });
      console.log(`대조표 ${relative(ROOT, out)} ${(size / 1024).toFixed(0)}KB`);
    }
  }
  await sheetPage.close();

  // 상호작용 상태(반려 사유 창 · 휴가 신청 검사와 결과 · 역할 넷 · 초성 검색)
  const states = withStates ? await captureStates(browser) : [];
  const extras = withExtras ? await captureExtras(browser) : null;
  if (skipMatrix) {
    writeFileSync(join(OUT, 'extras.json'), JSON.stringify({ states, extras }, null, 2));
    console.log(`결과 ${relative(ROOT, join(OUT, 'extras.json'))}`);
  }

  const summary = {
    capturedAt: new Date().toISOString(),
    seconds: Math.round((Date.now() - started) / 1000),
    screens: SCREENS.map(({ key, id, title, block }) => ({ key, id, title, block })),
    colors: COLORS.map(({ key, label, hex }) => ({ key, label, hex })),
    modes: MODES.map(({ key, label }) => ({ key, label })),
    widths: WIDTHS,
    captures: results.length,
    blocking: results.reduce((a, r) => a + r.critical + r.serious, 0),
    pending: results.reduce((a, r) => a + r.pending, 0),
    moderate: results.reduce((a, r) => a + r.moderate, 0),
    minor: results.reduce((a, r) => a + r.minor, 0),
    overflow390: results.filter((r) => r.width === 390 && r.overflow > 1).length,
    external: [...external],
    consoleErrors: consoleErrors.length,
    sheets,
    states,
    results,
  };
  if (!skipMatrix) {
    writeFileSync(join(OUT, 'results.json'), JSON.stringify(summary, null, 2));
    console.log(
      `캡처 ${summary.captures}장 · axe critical · serious ${summary.blocking}건 · 승인 대기 대비 ${summary.pending}건 · moderate ${summary.moderate} · minor ${summary.minor} · 390 가로 넘침 ${summary.overflow390} · 외부 요청 ${external.size} · 콘솔 오류 ${consoleErrors.length} · ${summary.seconds}초`,
    );
    console.log(`결과 ${relative(ROOT, join(OUT, 'results.json'))}`);
  }
  if (summary.blocking || summary.overflow390 || external.size || consoleErrors.length)
    process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}

/** 대조표 한 장. 칸 폭은 화면 폭에 맞춰 줄이고, 파일이 상한을 넘으면 품질 → 칸 순으로 낮춘다 */
async function sheet(page, s, width, out) {
  const img = (c, m) =>
    `data:image/png;base64,${readFileSync(join(OUT, shotName(s, c, m, width))).toString('base64')}`;
  let cell = width === 390 ? 300 : width === 1024 ? 520 : 600;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 20px; background: #E9EAEE; color: #1D2027;
        font: 14px/1.4 -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
      h1 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
      p { margin: 0 0 16px; color: #4A505C; font-size: 13px; }
      table { border-collapse: separate; border-spacing: 12px; margin: -12px; }
      th { font-weight: 600; font-size: 13px; text-align: left; padding: 0 2px; }
      th.row { width: 84px; vertical-align: top; padding-top: 4px; }
      .sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
      .hex { display: block; color: #4A505C; font-weight: 400; font-size: 12px; font-variant-numeric: tabular-nums; }
      img { display: block; width: ${cell}px; height: auto; border: 1px solid #C9CCD3; border-radius: 6px; background: #fff; }
    </style><body>
      <h1>${s.title} · ${width}</h1>
      <p>${s.id} · 행 = 회사 색, 열 = 모드(라이트 · 다크 · 고대비) · TODAY 2026-11-06 · 첫 화면(뷰포트 ${width}×${HEIGHT[width]})</p>
      <table><tr><th></th>${MODES.map((m) => `<th>${m.label}</th>`).join('')}</tr>
      ${COLORS.map(
        (c) =>
          `<tr><th class="row"><span class="sw" style="background:${c.hex}"></span>${c.label}<span class="hex">${c.hex}</span></th>${MODES.map(
            (m) => `<td><img src="${img(c, m)}" alt=""></td>`,
          ).join('')}</tr>`,
      ).join('')}
      </table></body></html>`;
    await page.setViewportSize({ width: 200, height: 200 });
    await page.setContent(html, { waitUntil: 'load' });
    const box = await page.evaluate(() => ({
      w: Math.ceil(document.body.scrollWidth),
      h: Math.ceil(document.body.scrollHeight),
    }));
    await page.setViewportSize({ width: box.w, height: box.h });
    for (const quality of [78, 68, 58]) {
      await page.screenshot({ path: out, type: 'jpeg', quality, fullPage: true });
      const bytes = statSync(out).size;
      if (bytes <= SHEET_MAX) return bytes;
    }
    cell = Math.round(cell * 0.85);
  }
  return statSync(out).size;
}

/** 상호작용 상태 캡처(1440 · 390 라이트, 기본 주황). 대조표 states-<폭>.jpg */
async function captureStates(browser) {
  const list = [];
  for (const width of [1440, 390]) {
    const ctx = await context(browser, width, MODES[0]);
    const page = await ctx.newPage();
    const shots = [];
    const snap = async (key, title, { top = false } = {}) => {
      const file = join(OUT, `state-${key}-${width}.png`);
      await page.waitForTimeout(350);
      if (top)
        await page.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          document.querySelector('.tl-app-shell__main')?.scrollTo(0, 0);
          window.scrollTo(0, 0);
        });
      await page.screenshot({ path: file, fullPage: false });
      const a = await audit(page);
      shots.push({ key, title, file, axe: a.critical + a.serious });
      console.log(`상태 ${width} ${key}: axe ${a.critical + a.serious}`);
      for (const r of a.rules.slice(0, 4)) console.log(`   ${r}`);
    };
    for (const role of ['ceo', 'hr', 'lead', 'member']) {
      await show(page, `home/dashboard/people?role=${role}`, COLORS[0], MODES[0]);
      await snap(
        `role-${role}`,
        `역할별 홈 · ${{ ceo: '대표', hr: '인사 담당', lead: '팀장', member: '구성원' }[role]}`,
      );
    }
    // 보기 바꾸는 중(Skeleton): 움직임 줄이기라 바로 보인다
    await show(page, 'home/dashboard/people?role=ceo', COLORS[0], MODES[0]);
    await page.getByRole('radio', { name: '팀장' }).click();
    await page.waitForTimeout(60);
    await page.screenshot({ path: join(OUT, `state-role-loading-${width}.png`) });
    shots.push({
      key: 'role-loading',
      title: '역할별 홈 · 보기 바꾸는 중',
      file: join(OUT, `state-role-loading-${width}.png`),
      axe: null,
    });
    // 휴가 신청: 빈 사유로 신청 → 검사 요약 · 칸 오류, 사유를 쓰고 신청 → 진행 · 토스트
    await show(page, 'groupware/attendance/leave-request', COLORS[0], MODES[0]);
    await page.getByRole('button', { name: '신청', exact: true }).click();
    await snap('leave-errors', '휴가 신청 · 검사 오류');
    await page.getByRole('textbox', { name: /사유/ }).fill('가족 행사로 연차를 씁니다');
    await page.getByRole('button', { name: '신청', exact: true }).click();
    await snap('leave-sent', '휴가 신청 · 신청 뒤(진행)', { top: true });
    // 결재 상세: 반려 사유 창(ReasonDialog)
    await show(page, 'groupware/approval/document', COLORS[0], MODES[0]);
    const reject = page.getByRole('button', { name: '반려', exact: true });
    if (await reject.count()) {
      await reject.first().click();
      await page.getByRole('textbox', { name: /반려 사유/ }).fill('증빙');
      await snap('reason-dialog', '결재 상세 · 반려 사유(5자 미만이면 반려 꺼짐)');
      await page.keyboard.press('Escape');
    }
    // 모듈 런처: 초성 검색
    await show(page, 'home/launcher/modules', COLORS[0], MODES[0]);
    await page.getByRole('searchbox', { name: '모듈 검색' }).fill('ㅈㄱ');
    await snap('launcher-search', '모듈 런처 · 초성 검색 ㅈㄱ');
    await ctx.close();
    list.push({ width, shots: shots.map(({ key, title, axe }) => ({ key, title, axe })) });
    // 상태 대조표: 한 줄에 넷
    const out = join(SHEETS, `states-${width}.jpg`);
    const page2 = await browser.newPage();
    let cell = width === 390 ? 260 : 560;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><style>
        * { box-sizing: border-box; } body { margin: 0; padding: 20px; background: #E9EAEE; color: #1D2027;
        font: 13px/1.4 -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
        h1 { margin: 0 0 12px; font-size: 18px; font-weight: 600; }
        .g { display: grid; grid-template-columns: repeat(${width === 390 ? 4 : 3}, ${cell}px); gap: 16px 12px; }
        figure { margin: 0; } figcaption { margin-bottom: 6px; font-weight: 600; }
        img { display: block; width: ${cell}px; border: 1px solid #C9CCD3; border-radius: 6px; background: #fff; }
      </style><body><h1>상호작용 상태 · ${width} · 라이트 · 주황</h1><div class="g">
      ${shots
        .map(
          (x) =>
            `<figure><figcaption>${x.title}</figcaption><img src="data:image/png;base64,${readFileSync(x.file).toString('base64')}" alt=""></figure>`,
        )
        .join('')}</div></body></html>`;
      await page2.setViewportSize({ width: 200, height: 200 });
      await page2.setContent(html, { waitUntil: 'load' });
      const box = await page2.evaluate(() => ({
        w: Math.ceil(document.body.scrollWidth),
        h: Math.ceil(document.body.scrollHeight),
      }));
      await page2.setViewportSize({ width: box.w, height: box.h });
      let ok = false;
      for (const quality of [78, 68, 58]) {
        await page2.screenshot({ path: out, type: 'jpeg', quality, fullPage: true });
        if (statSync(out).size <= SHEET_MAX) {
          ok = true;
          break;
        }
      }
      if (ok) break;
      cell = Math.round(cell * 0.85);
    }
    await page2.close();
    console.log(`대조표 ${relative(ROOT, out)} ${(statSync(out).size / 1024).toFixed(0)}KB`);
    list[list.length - 1].sheet = relative(ROOT, out);
    list[list.length - 1].bytes = statSync(out).size;
  }
  return list;
}

/** 그림 여러 장을 한 장의 JPEG로(제목 + 칸 격자). 상한을 넘으면 품질 → 칸 폭 순으로 낮춘다 */
async function gridSheet(browser, { title, note = '', columns, cell, items, out }) {
  const page = await browser.newPage();
  let w = cell;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><style>
      * { box-sizing: border-box; } body { margin: 0; padding: 20px; background: #E9EAEE; color: #1D2027;
      font: 13px/1.4 -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
      h1 { margin: 0 0 4px; font-size: 18px; font-weight: 600; } p { margin: 0 0 14px; color: #4A505C; }
      .g { display: grid; grid-template-columns: repeat(${columns}, ${w}px); gap: 16px 12px; align-items: start; }
      figure { margin: 0; } figcaption { margin-bottom: 6px; font-weight: 600; }
      img { display: block; max-width: ${w}px; border: 1px solid #C9CCD3; border-radius: 6px; background: #fff; }
    </style><body><h1>${title}</h1><p>${note}</p><div class="g">${items
      .map(
        (x) =>
          `<figure><figcaption>${x.title}</figcaption><img src="data:image/png;base64,${readFileSync(x.file).toString('base64')}" alt=""></figure>`,
      )
      .join('')}</div></body></html>`;
    await page.setViewportSize({ width: 200, height: 200 });
    await page.setContent(html, { waitUntil: 'load' });
    const box = await page.evaluate(() => ({
      w: Math.ceil(document.body.scrollWidth),
      h: Math.ceil(document.body.scrollHeight),
    }));
    await page.setViewportSize({ width: box.w, height: box.h });
    for (const quality of [80, 70, 60]) {
      await page.screenshot({ path: out, type: 'jpeg', quality, fullPage: true });
      if (statSync(out).size <= SHEET_MAX) {
        await page.close();
        console.log(`대조표 ${relative(ROOT, out)} ${(statSync(out).size / 1024).toFixed(0)}KB`);
        return { sheet: relative(ROOT, out), bytes: statSync(out).size };
      }
    }
    w = Math.round(w * 0.85);
  }
  await page.close();
  return { sheet: relative(ROOT, out), bytes: statSync(out).size };
}

/** G2 항목 보조 증거. 라이트 · 다크, 기본 주황 */
async function captureExtras(browser) {
  const report = {};
  const orange = COLORS.find((c) => c.key === 'orange') ?? COLORS[0];
  const light = { key: 'light', label: '라이트', theme: 'light', contrast: null };
  const dark = { key: 'dark', label: '다크', theme: 'dark', contrast: null };

  // 1) compact 표 · 금액 칸 확대(2배): 행 높이 · 본문 글자 · 금액 정렬을 잰다
  const zoom = [];
  report.measure = {};
  for (const mode of [light, dark]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
      locale: 'ko-KR',
    });
    await ctx.addInitScript((m) => {
      try {
        localStorage.setItem('tl-demo-theme', m.theme);
      } catch {
        /* about:blank */
      }
    }, mode);
    const page = await ctx.newPage();
    await show(page, 'erp/hr-payroll/employees', orange, mode);
    const gb = await page.locator('.tl-data-grid').first().boundingBox();
    if (gb) {
      const file = join(OUT, `extra-zoom-grid-${mode.key}.png`);
      await page.screenshot({
        path: file,
        clip: {
          x: gb.x,
          y: gb.y,
          width: Math.min(gb.width, 540),
          height: Math.min(gb.height, 300),
        },
      });
      zoom.push({ title: `인사 기록 표 · ${mode.label} · 2배`, file });
    }
    report.measure[`grid-${mode.key}`] = await page.evaluate(() => {
      const row = document.querySelector('.tl-data-grid tbody tr');
      const cell = row?.querySelector('td');
      const cs = cell ? getComputedStyle(cell) : null;
      return {
        rowHeight: row ? Math.round(row.getBoundingClientRect().height) : null,
        fontSize: cs?.fontSize ?? null,
        density: document.documentElement.dataset.density ?? 'compact',
      };
    });
    await show(page, 'erp/hr-payroll/payslip', orange, mode);
    const sb = await page.locator('.tl-payslip__table').first().boundingBox();
    if (sb) {
      const file = join(OUT, `extra-zoom-amount-${mode.key}.png`);
      await page.screenshot({
        path: file,
        clip: {
          x: sb.x,
          y: sb.y,
          width: Math.min(sb.width, 540),
          height: Math.min(sb.height, 300),
        },
      });
      zoom.push({ title: `임금명세서 금액 칸 · ${mode.label} · 2배`, file });
    }
    report.measure[`amount-${mode.key}`] = await page.evaluate(() => {
      const td = document.querySelector('.tl-payslip__table td[data-numeric]');
      const cs = td ? getComputedStyle(td) : null;
      return {
        sample: td?.textContent ?? null,
        textAlign: cs?.textAlign ?? null,
        numeric: cs?.fontVariantNumeric ?? null,
      };
    });
    await ctx.close();
  }
  const m = report.measure;
  report.zoom = await gridSheet(browser, {
    title: 'compact 표 · 금액 칸 확대(2배)',
    note: `표 행 높이 ${m['grid-light']?.rowHeight}px · 본문 ${m['grid-light']?.fontSize} · 금액 칸 ${m['amount-light']?.textAlign} 정렬 · ${m['amount-light']?.numeric} · 예 ${m['amount-light']?.sample}`,
    columns: 2,
    cell: 720,
    items: zoom,
    out: join(SHEETS, 'zoom-grid-amount.jpg'),
  });

  // 2) 색각 시뮬레이션(Chromium Emulation.setEmulatedVisionDeficiency): 모듈 타일 · 그룹 점, 수입 · 지출 색
  const VISION = [
    { type: 'none', label: '일반' },
    { type: 'protanopia', label: '적색맹' },
    { type: 'deuteranopia', label: '녹색맹' },
    { type: 'tritanopia', label: '청색맹' },
  ];
  const cvdItems = [];
  for (const [route, name] of [
    ['home/launcher/modules', '모듈 런처'],
    ['erp/treasury/daily-cash', '자금 일보(수입 · 지출)'],
  ]) {
    for (const mode of [light, dark]) {
      const ctx = await context(browser, 1440, mode);
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      for (const v of VISION) {
        await show(page, route, orange, mode);
        await cdp.send('Emulation.setEmulatedVisionDeficiency', { type: v.type });
        await page.waitForTimeout(150);
        const file = join(OUT, `extra-cvd-${route.replace(/\//g, '_')}-${mode.key}-${v.type}.png`);
        await page.screenshot({ path: file });
        cvdItems.push({ title: `${name} · ${mode.label} · ${v.label}`, file });
      }
      await ctx.close();
    }
  }
  report.cvd = await gridSheet(browser, {
    title: '색각 시뮬레이션 · 1440',
    note: '행 = 화면 × 모드, 열 = 일반 · 적색맹 · 녹색맹 · 청색맹(Chromium 시뮬레이션)',
    columns: 4,
    cell: 430,
    items: cvdItems,
    out: join(SHEETS, 'cvd-1440.jpg'),
  });

  // 3) 알림 카드 홈(home/dashboard/trade) 3폭
  const homeItems = [];
  report.notificationAxe = [];
  for (const width of [1440, 1024, 390]) {
    const ctx = await context(browser, width, light);
    const page = await ctx.newPage();
    await show(page, 'home/dashboard/trade', orange, light);
    const file = join(OUT, `extra-notification-home-${width}.png`);
    await page.screenshot({ path: file, fullPage: false });
    const a = await audit(page);
    report.notificationAxe.push({ width, axe: a.critical + a.serious });
    homeItems.push({ title: `알림 카드 홈 · ${width} · axe ${a.critical + a.serious}`, file });
    await ctx.close();
  }
  report.notificationHome = await gridSheet(browser, {
    title: '알림 카드 홈 · 1440 · 1024 · 390',
    note: 'home/dashboard/trade · 라이트 · 주황',
    columns: 3,
    cell: 520,
    items: homeItems,
    out: join(SHEETS, 'notification-home.jpg'),
  });

  // 4) 포커스 링 순회: 휴가 신청에서 Tab을 차례로 눌러 포커스가 닿은 요소 둘레를 찍는다
  const focusItems = [];
  for (const mode of [light, dark]) {
    const ctx = await context(browser, 1440, mode);
    const page = await ctx.newPage();
    await show(page, 'groupware/attendance/leave-request', orange, mode);
    await page.keyboard.press('Tab');
    await page.evaluate(() => {
      const first = document.querySelector('.tl-block-page [role="radio"]');
      if (first instanceof HTMLElement) first.focus();
    });
    for (let i = 0; i < 6; i += 1) {
      const box = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          name:
            el.getAttribute('aria-label') ||
            el.textContent?.trim().slice(0, 14) ||
            el.getAttribute('placeholder') ||
            el.tagName.toLowerCase(),
        };
      });
      if (box && box.width > 0) {
        const pad = 16;
        const file = join(OUT, `extra-focus-${mode.key}-${i}.png`);
        await page.screenshot({
          path: file,
          clip: {
            x: Math.max(0, box.x - pad),
            y: Math.max(0, box.y - pad),
            width: Math.min(box.width + pad * 2, 700),
            height: Math.min(box.height + pad * 2, 200),
          },
        });
        focusItems.push({ title: `${mode.label} · Tab ${i + 1} · ${box.name}`, file });
      }
      await page.keyboard.press('Tab');
      await page.waitForTimeout(80);
    }
    await ctx.close();
  }
  report.focus = await gridSheet(browser, {
    title: '포커스 링 순회 · 휴가 신청 · 1440',
    note: '키보드 Tab으로 차례로 닿은 요소(라이트 위 줄, 다크 아래 줄)',
    columns: 6,
    cell: 260,
    items: focusItems,
    out: join(SHEETS, 'focus-leave-request.jpg'),
  });
  return report;
}
