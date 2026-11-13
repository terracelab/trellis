#!/usr/bin/env node
// Components 파일의 `Usage · <Name>` 프레임(figma-sync 3절, PG-12). 코드가 원본이고 Figma는 생성물이다.
//   node .claude/skills/ds/figma-sync/usage.mjs --data Button Card     spec.md · contract에서 뽑은 글(JSON)
//   node .claude/skills/ds/figma-sync/usage.mjs --emit Button Card     use_figma에 보낼 코드(키트 v2 + 글 + usage-frame.js)
//   node .claude/skills/ds/figma-sync/usage.mjs --run Button Card      --emit이 문서에 남긴 생성기로 짧게 돌린다. 끝나면 --clear
// 글은 spec.md의 해부 · 용도 · 금지 사항(+ 키 표)과 contract a11y.keyboard에서만 온다.
// 아래 CONFIG는 보기 견본 변형 · 해부 이름과 레이어 이름의 대응 · 화면 예 조립법 같은 그림 설정이다.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const LIMIT = 50000;

/** 견본 변형 · 켤 속성 · 해부 이름 → 레이어 이름('@root' = 견본 전체) · 용도 문장 분류 덮어쓰기 · 금지 조각 합치기 */
export const CONFIG = {
  Button: { v: 'variant=primary, size=md, state=default', on: { icon: true } },
  IconButton: {
    v: 'variant=secondary, size=md, countTone=neutral, state=default',
    alias: { '정사각 root': '@root' },
  },
  Badge: {
    v: 'tone=info, approval=none, variant=subtle, size=md',
    on: { dot: true },
    join: ['결재 색을 주문'],
  },
  Avatar: { v: 'size=48, status=online, shape=square', alias: { image: 'frame' } },
  ModuleIcon: { v: 'size=48' },
  Card: { v: 'padding=default' },
  NotificationCard: { v: 'tone=neutral, state=default', join: ['제목에 인사말', '느낌표'] },
  Input: {
    v: 'size=md, align=left, state=default',
    on: { icon: true, suffix: true, clearable: true },
    alias: { control: 'value' },
  },
  Checkbox: {
    v: 'state=default',
    on: { checked: true, description: true },
    alias: { indicator: 'checked' },
  },
  RadioGroup: {
    v: 'orientation=vertical, state=default',
    alias: { option: 'option 1', label: 'label 1' },
  },
  Switch: { v: 'size=md, state=default', on: { checked: true, description: true } },
  Select: {
    v: 'size=md, width=auto, state=default',
    on: { mark: true },
    alias: { trigger: '@root' },
    join: ['점 색을 hex'],
  },
  Tabs: {
    v: 'size=md, state=default',
    alias: { list: '@root', tab: 'tab 1', count: 'count 1' },
  },
  Dialog: { v: 'size=sm, tone=default', alias: { popup: '@root' } },
  Drawer: { v: 'side=right, width=md, height=auto', alias: { panel: '@root' } },
  Toast: { v: 'tone=success', on: { count: true } },
  AppShell: { v: 'fill=viewport, state=default', join: ['범위 스위처'] },
  DataGrid: {
    v: 'height=auto, mobile=cards, dividers=rows, state=default',
    alias: { wrapper: '@root', row: 'row 1', foot: 'summary' },
  },
  PageHeader: { v: null },
  FilterBar: { v: 'layout=inline, columns=2' },
  ActionBar: { v: 'align=end, sticky=false' },
  Pagination: { v: 'state=default', alias: { page: 'page 1' } },
  KpiCard: { v: 'size=md, state=default', join: ['카드 안에 스파크라인'] },
  SideNav: {
    v: 'collapsed=false, state=default',
    on: { header: true, footer: true },
    alias: { section: 'section 1', item: '대시보드', 'child item': '세금계산서' },
  },
  LineItemsEditor: { v: 'state=default', alias: { wrapper: '@root', row: 'line 1' } },
};

const COMPONENTS = new Set(
  readdirSync(`${ROOT}packages/contracts/src`, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^[A-Z]/.test(d.name))
    .map((d) => d.name),
);

/** 괄호 · 따옴표 · 코드 표시 밖에서만 sep로 나눈다 */
export function splitTop(s, sep) {
  const out = [];
  let depth = 0;
  let code = false;
  let quote = false;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '`') code = !code;
    else if (!code && ch === '"') quote = !quote;
    else if (!code && !quote && '([{'.includes(ch)) depth++;
    else if (!code && !quote && ')]}'.includes(ch)) depth = Math.max(0, depth - 1);
    if (depth === 0 && !code && !quote && s.startsWith(sep, i)) {
      out.push(cur);
      cur = '';
      i += sep.length - 1;
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

/** 문장 나누기: 괄호 밖의 '. ' */
export const sentences = (s) =>
  splitTop(s.replace(/\s+/g, ' ').trim(), '. ').map((x) => x.replace(/\.$/, '').trim());

/** spec.md의 `## <제목>` 절 본문 */
export function section(md, title) {
  const lines = md.split('\n');
  const i = lines.findIndex((l) => l.startsWith('## ') && l.slice(3).startsWith(title));
  if (i === -1) return '';
  const end = lines.findIndex((l, j) => j > i && l.startsWith('## '));
  return lines
    .slice(i + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim();
}

const plain = (s) => s.replace(/`/g, '').replace(/\s+/g, ' ').trim();
const noReview = (s) =>
  s
    .replace(/\s*(→|—|-)\s*리뷰(\([^)]*\))?\.?$/u, '')
    .replace(/\s*→\s*리뷰.*$/u, '')
    .trim();

/** 괄호 안 설명을 쉼표 두 덩어리 · 80자 안으로 */
function shortDetail(d) {
  let s = plain(sentences(d)[0] ?? '').replace(/\b(PR|PG|D)-\d+:\s*/g, '');
  s = splitTop(s, ', ').slice(0, 2).join(', ');
  if (s.length > 80) {
    const cut = s.lastIndexOf(', ', 80);
    s = cut > 20 ? s.slice(0, cut) : s.slice(0, s.lastIndexOf(' ', 80));
    s = s.replace(/[\s+·,]+$/u, '');
  }
  return s;
}

/** 해부 첫 문장의 ' · ' 항목 → { n, d } (최대 10) */
export function anatomy(md) {
  const first = sentences(section(md, '해부').split('\n')[0] ?? '')[0] ?? '';
  const seen = new Set();
  const out = [];
  for (const item of splitTop(first, ' · ')) {
    const p = splitTop(item, '(');
    const k = item.indexOf('(');
    const n = plain(k === -1 ? item : item.slice(0, k)).replace(/:$/, '');
    if (!n || seen.has(n)) continue;
    seen.add(n);
    let d = '';
    if (k !== -1) {
      let depth = 0;
      for (let i = k; i < item.length; i++) {
        if (item[i] === '(') depth++;
        if (item[i] === ')' && --depth === 0) {
          d = item.slice(k + 1, i);
          break;
        }
      }
    }
    out.push({ n, d: shortDetail(d) });
    void p;
  }
  return out.slice(0, 10);
}

/** 금지 사항 → 항목. 짧은 낱말 조각과 CONFIG.join에 적은 조각은 다음 조각과 다시 붙인다 */
export function donts(md, join = []) {
  const out = [];
  for (const sen of sentences(section(md, '금지 사항').split('\n')[0] ?? '')) {
    const parts = splitTop(noReview(sen), ' · ');
    for (let i = 0; i < parts.length; i++) {
      let p = parts[i];
      while (i + 1 < parts.length && (!/\s/.test(p) || join.some((j) => p.endsWith(j))))
        p = `${p} · ${parts[++i]}`;
      p = plain(noReview(p));
      // 금지 목록 뒤에 붙은 설명 문장(…한다)은 항목이 아니다
      if (p && !/^(components|content)\.md/.test(p) && !/다$/.test(p)) out.push(p);
    }
  }
  return out;
}

/** 용도 문장 → 쓰는 곳 · 다른 컴포넌트로 보내는 문장 */
export function uses(md, self) {
  const use = [];
  const redirect = [];
  for (const s of sentences(section(md, '용도'))) {
    const p = plain(s);
    const others = (p.match(/\b[A-Z][A-Za-z]+\b/g) ?? []).filter(
      (w) => w !== self && COMPONENTS.has(w),
    );
    const placement = /(에 둔다|에 쓴다|에 쓰고|둔다$|이 컴포넌트)/.test(p);
    if (!placement && (others.length || /링크로$|쓰지 않는다/.test(p))) redirect.push(p);
    else use.push(p);
  }
  return { use, redirect };
}

const ARROW = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };

/** 키: spec의 `| 키 | 동작 |` 표가 있으면 그것, 없으면 contract a11y.keyboard */
export function keys(md, contract) {
  const table = md
    .split('\n')
    .filter((l) => /^\|/.test(l))
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((x) => x.trim()),
    );
  const head = table.findIndex((r) => r[0] === '키');
  if (head !== -1)
    return table
      .slice(head + 1)
      .filter((r) => !/^-+$/.test(r[0]))
      .map(([k, a]) => ({ k: plain(k), a: sentences(plain(a ?? ''))[0] ?? '' }));
  const m = contract.match(/keyboard:\s*\[([\s\S]*?)\]/);
  if (!m) return [];
  return [...m[1].matchAll(/'([^']*)'/g)].map(([, s]) => {
    const i = s.indexOf('(');
    const k = (i === -1 ? s : s.slice(0, i)).trim();
    return { k: ARROW[k] ?? k, a: i === -1 ? '' : s.slice(i + 1, s.lastIndexOf(')')) };
  });
}

export function dataFor(name) {
  const md = readFileSync(`${ROOT}packages/contracts/src/${name}/spec.md`, 'utf8');
  const contract = readFileSync(
    `${ROOT}packages/contracts/src/${name}/${name}.contract.ts`,
    'utf8',
  );
  const cfg = CONFIG[name] ?? {};
  const u = uses(md, name);
  return {
    name,
    page: name,
    v: cfg.v ?? null,
    on: cfg.on ?? {},
    alias: cfg.alias ?? {},
    anatomy: anatomy(md),
    use: u.use.slice(0, 4),
    dont: [...u.redirect, ...donts(md, cfg.join)].slice(0, 6),
    keys: keys(md, contract).slice(0, 8),
  };
}

/** SKILL.md 3절의 키트 v2 블록 */
function kit() {
  const md = readFileSync(`${HERE}SKILL.md`, 'utf8');
  const a = md.indexOf('// ===== Trellis component kit v2');
  const b = md.indexOf('// ===== end kit v2 =====');
  if (a === -1 || b === -1) throw new Error('SKILL.md에서 키트 v2를 찾지 못했다');
  return md.slice(a, b);
}

const KEY = "figma.root.getSharedPluginData('trellis', 'usage')";

function main(argv) {
  const mode = argv[0];
  const names = argv.slice(1);
  if (mode === '--clear') {
    console.log(`figma.root.setSharedPluginData('trellis', 'usage', '');\nreturn ${KEY}.length;`);
    return 0;
  }
  if (!['--data', '--emit', '--run'].includes(mode) || names.length === 0) {
    console.error('사용: usage.mjs --data|--emit|--run <Name>… · usage.mjs --clear');
    return 2;
  }
  const data = names.map(dataFor);
  if (mode === '--data') {
    console.log(JSON.stringify(data, null, 2));
    return 0;
  }
  const tail = `const DATA = ${JSON.stringify(data)};\nreturn await buildUsage(DATA);\n`;
  // --emit: 키트 v2 + 생성기를 함수 하나로 감싸 돌리고, 그 함수 글을 문서 plugin data에 남긴다.
  // --run: 남긴 글을 AsyncFunction으로 되살려 돌린다(호출마다 30KB를 보내지 않는다). 다 끝나면 --clear
  const code =
    mode === '--run'
      ? `const SRC = ${KEY};\nif (!SRC) throw new Error('usage 생성기 없음: usage.mjs --emit을 먼저 돌린다');\nconst AF = Object.getPrototypeOf(async function () {}).constructor;\nconst buildUsage = await new AF('figma', 'return await (' + SRC + ')(figma);')(figma);\n${tail}`
      : `async function usageKit(figma) {\n${kit()}\n${readFileSync(`${HERE}usage-frame.js`, 'utf8')}\nreturn buildUsage;\n}\nfigma.root.setSharedPluginData('trellis', 'usage', usageKit.toString());\nconst buildUsage = await usageKit(figma);\n${tail}`;
  if (code.length > LIMIT)
    console.error(`경고: 코드 ${code.length}자 > ${LIMIT}. 이름을 나눠 보낸다`);
  console.log(code);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  process.exit(main(process.argv.slice(2)));
