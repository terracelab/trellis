#!/usr/bin/env node
// Trellis를 쓰는 서비스 저장소용 도구(D-58). 서비스 저장소 루트에서 실행한다.
//   install [--to .claude/skills/trellis]   에이전트 스킬 복사 + .trellis/skill.lock
//   doctor  [--app apps/web]                빌드 여부 · CSS 순서 · 토큰 밖 값 · 테마 범위 · 오래된 theme.css · 스킬 버전
//   docs    [list | llms | tokens | <컴포넌트> | guide <이름>]   설치된 Trellis 문서 출력
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SKILL_PKG = fileURLToPath(new URL('..', import.meta.url));
const TRELLIS = join(SKILL_PKG, '..', '..');
const DOCS = join(TRELLIS, 'packages', 'react', 'dist', 'docs');
const [cmd = 'help', ...rest] = process.argv.slice(2);
const opt = (name, fallback) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : fallback);
const cwd = process.cwd();

function trellisCommit() {
  try {
    return execFileSync('git', ['-C', TRELLIS, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

// 테마 파일이 덮어도 되는 변수(D-58 · D-97: 회사 색 토큰 21개 + 회색 톤). tokens/theme의 THEME_VARS와 같다(테스트가 확인)
// 번호 붙은 primitive(--tl-color-brand-600 등)와 상태 · 금융 · 결재 · 차트 색은 덮으면 안 된다
export const THEME_ALLOWED = [
  ...['default', 'hover', 'active', 'subtle', 'tint', 'accent', 'on-brand'].map(
    (k) => `--tl-color-brand-${k}`,
  ),
  ...['canvas', 'surface', 'elevated', 'sunken', 'row-selected'].map((k) => `--tl-color-bg-${k}`),
  ...['strong', 'primary', 'secondary', 'tertiary', 'disabled', 'inverse', 'link'].map(
    (k) => `--tl-color-fg-${k}`,
  ),
  ...['default', 'strong', 'hover', 'focus', 'focus-strong', 'divider', 'selected'].map(
    (k) => `--tl-color-border-${k}`,
  ),
  // 사이드바(PR-27 · D-97): 회사 색상의 짙은 면과 그 위 글자 · 면
  '--tl-color-bg-nav',
  ...['fg', 'fg-muted', 'fg-active', 'hover', 'selected', 'border', 'sub', 'focus'].map(
    (k) => `--tl-color-nav-${k}`,
  ),
];

/** primitive 색 변수: 번호 붙은 색 단계 · 사이드바 단계 · 알파 · base · 색각 팔레트(R-T04). semantic(`--tl-color-brand-default`)은 통과 */
export const PRIMITIVE_COLOR =
  /--tl-color-(?:(?:brand|neutral|graphite|shell|blue|red|green|amber|violet|teal)-\d{2,3}\b|alpha-[\w-]+|base-(?:white|black)\b|cvd-[\w-]+)/;
/** 색 함수 리터럴(rgb() · hsl() 등). color-mix(in oklch, …)의 색 공간 이름은 통과 */
const COLOR_FN = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;
/** Trellis 컴포넌트 안쪽 부품 선택자(.tl-button__label). 블록 자기 클래스(.tl-block-*)는 통과 */
const INNER_PART = /\.tl-(?!block-)[a-z0-9]+(?:-[a-z0-9]+)*__[a-z0-9-]+/;

/**
 * 규칙 앞 주석에 `inner-override:`가 있는 CSS 규칙의 머리(주석 + 선택자) 줄 번호(1부터).
 * Trellis 블록은 prop이 없어 안쪽 부품을 덮는 자리에 이 표시와 이유를 적는다(blocks/README.md).
 * 복사해 간 블록의 그 줄을 doctor가 잡지 않게 한다(blocks/scripts/check-blocks.mjs와 같은 규칙)
 */
function markedInnerLines(text) {
  const lines = new Set();
  for (const m of text.matchAll(/([^{}]*)\{/g)) {
    const head = m[1];
    if (!/\/\*[\s\S]*?inner-override:[\s\S]*?\*\//.test(head)) continue;
    const first = text.slice(0, m.index).split('\n').length;
    head.split('\n').forEach((_line, i) => lines.add(first + i));
  }
  return lines;
}

/**
 * 토큰 밖 값 찾기. 줄 끝에 `trellis-ignore`가 있으면 건너뛴다.
 * file을 주면 확장자로 CSS 전용(안쪽 부품 덮기) · TSX 전용(Trellis 컴포넌트의 onClick) 검사를 더한다
 */
export function scanOffToken(text, { file = '' } = {}) {
  const css = file.endsWith('.css');
  const marked = css ? markedInnerLines(text) : new Set();
  const hits = [];
  text.split('\n').forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    // 미디어 · 컨테이너 쿼리는 CSS 변수를 못 쓰므로 px 허용
    if (/trellis-ignore/.test(line) || /^\s*\*/.test(line) || /^\s*@(media|container)\b/.test(line))
      return;
    const hex = code.match(/#[0-9a-fA-F]{3,8}\b/);
    const px = code.match(/(?<![\w-])(?!0px)\d*\.?\d+px\b/);
    const font = code.match(/font-family\s*:(?!\s*var\()[^;]+/);
    const fontJs = code.match(/fontFamily\s*:\s*['"`]/);
    const primitive = code.match(PRIMITIVE_COLOR);
    const colorFn = code.match(COLOR_FN);
    const inner = css && !marked.has(i + 1) ? code.match(INNER_PART) : null;
    for (const [m, kind] of [
      [hex, 'hex 색'],
      [px, 'px 값'],
      [font, 'font-family'],
      [fontJs, 'fontFamily'],
      [primitive, 'primitive 색 토큰'],
      [colorFn, '색 함수'],
      [inner, 'Trellis 안쪽 부품 덮기'],
    ])
      if (m) hits.push({ line: i + 1, kind, text: m[0].trim() });
  });
  if (/\.[jt]sx$/.test(file)) hits.push(...scanOnClick(text));
  return hits.sort((a, b) => a.line - b.line);
}

/** Trellis 컴포넌트(@terracelab/trellis-react에서 가져온 이름)에 onClick을 준 곳. Trellis 이벤트는 onPress */
export function scanOnClick(text) {
  const names = new Set();
  const from =
    /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@terracelab\/trellis-react(?:\/[\w-]+)?['"]/g;
  for (const m of text.matchAll(from))
    for (const part of m[1].split(',')) {
      const local = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (local && /^[A-Z]/.test(local)) names.add(local);
    }
  if (!names.size) return [];
  const lines = text.split('\n');
  const hits = [];
  for (const m of text.matchAll(/\bonClick\s*=/g)) {
    const before = text.slice(0, m.index);
    // 이 속성이 붙은 태그: 앞쪽에서 가장 가까운 여는 태그
    const tag = [...before.matchAll(/<([A-Za-z][\w.]*)/g)].pop()?.[1];
    if (!tag || !names.has(tag)) continue;
    const line = before.split('\n').length;
    if (/trellis-ignore/.test(lines[line - 1] ?? '')) continue;
    hits.push({ line, kind: 'onClick(Trellis는 onPress)', text: `<${tag} onClick>` });
  }
  return hits;
}

/**
 * theme.css가 지금 생성기 결과와 다른가(R-T53). engine = @terracelab/trellis-tokens/theme.
 * 첫 줄에 고른 값이 없으면(기본 테마) null. same: 첫 줄 주석을 뺀 본문이 같다 · missing: 없는 @ 블록 · changed: 없는 줄 수
 */
export function themeStaleness(css, engine) {
  const choice = engine.readThemeChoice(css);
  if (!choice) return null;
  const expected = engine.themeCss(engine.createTheme(choice));
  const body = (s) =>
    s
      .replace(/^\/\*[^\n]*\*\/\n/, '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  const have = body(css);
  const want = body(expected);
  const blocks = (lines) =>
    lines.filter((l) => l.startsWith('@')).map((l) => l.replace(/\s*\{$/, ''));
  const missing = blocks(want).filter((b) => !blocks(have).includes(b));
  // 같은 줄이 여러 블록에 나오므로 개수로 비교한다
  const left = new Map();
  for (const l of have) left.set(l, (left.get(l) ?? 0) + 1);
  let changed = 0;
  for (const l of want) {
    const n = left.get(l) ?? 0;
    if (n > 0) left.set(l, n - 1);
    else changed += 1;
  }
  return { same: have.join('\n') === want.join('\n'), missing, changed };
}

/** 테마 파일에서 허용 범위 밖 변수 */
export function themeViolations(css) {
  return [...css.matchAll(/(--[\w-]+)\s*:/g)]
    .map((m) => m[1])
    .filter((v) => !THEME_ALLOWED.includes(v));
}

/** 진입 파일의 CSS import 순서 */
export function cssOrderProblems(entry) {
  const at = (needle) => entry.indexOf(needle);
  const fonts = at('trellis-tokens/fonts.css');
  const tokens = at('trellis-tokens/tokens.css');
  const styles = at('trellis-react/styles.css');
  const theme = entry.search(/import ['"][^'"]*theme\.css['"]/);
  const ui = at('trellis-blocks/ui.css');
  const out = [];
  if (fonts < 0) out.push('@terracelab/trellis-tokens/fonts.css import가 없다');
  if (tokens < 0) out.push('@terracelab/trellis-tokens/tokens.css import가 없다');
  if (styles < 0) out.push('@terracelab/trellis-react/styles.css import가 없다');
  if (fonts >= 0 && tokens >= 0 && fonts > tokens)
    out.push('fonts.css가 tokens.css보다 먼저여야 한다');
  if (tokens >= 0 && styles >= 0 && tokens > styles)
    out.push('tokens.css가 styles.css보다 먼저여야 한다');
  if (theme >= 0 && tokens >= 0 && theme < tokens)
    out.push('theme.css는 tokens.css 뒤에 와야 덮을 수 있다');
  if (ui >= 0 && styles >= 0 && ui < styles) out.push('블록 ui.css는 styles.css 뒤에 둔다');
  return out;
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

function install() {
  const to = join(cwd, opt('--to', '.claude/skills/trellis'));
  mkdirSync(to, { recursive: true });
  cpSync(join(SKILL_PKG, 'skills', 'trellis'), to, { recursive: true });
  const lock = join(cwd, '.trellis', 'skill.lock');
  mkdirSync(dirname(lock), { recursive: true });
  writeFileSync(lock, `${JSON.stringify({ trellis: trellisCommit() }, null, 2)}\n`);
  console.log(`스킬 설치: ${relative(cwd, to)} · trellis ${trellisCommit()}`);
}

/** 회사 테마 엔진. 하위 모듈의 tokens 소스를 먼저, 없으면 설치된 패키지 */
async function loadThemeEngine() {
  const local = join(TRELLIS, 'packages', 'tokens', 'theme', 'index.mjs');
  for (const spec of [
    existsSync(local) ? pathToFileURL(local).href : null,
    '@terracelab/trellis-tokens/theme',
  ].filter(Boolean)) {
    try {
      return await import(spec);
    } catch {
      /* 다음 후보 */
    }
  }
  return null;
}

async function doctor() {
  const app = join(cwd, opt('--app', 'apps/web'));
  let errors = 0;
  const ok = (m) => console.log(`✓ ${m}`);
  const bad = (m) => {
    errors += 1;
    console.log(`✗ ${m}`);
  };
  const warn = (m) => console.log(`! ${m}`);

  // 1. 빌드
  const built = [
    'packages/tokens/dist/css/tokens.css',
    'packages/icons/src/generated/ui-icons.ts',
    'packages/react/dist/styles.css',
    'packages/react/dist/docs/llms.txt',
  ].filter((f) => !existsSync(join(TRELLIS, f)));
  if (built.length) bad(`Trellis 빌드가 없다(${built.join(', ')}). pnpm ds:build`);
  else ok('Trellis 빌드 있음');

  // 2. CSS 순서
  const entryFile = ['src/main.tsx', 'src/main.ts'].map((f) => join(app, f)).find(existsSync);
  if (!entryFile) bad(`진입 파일 없음: ${relative(cwd, app)}/src/main.tsx`);
  else {
    const problems = cssOrderProblems(readFileSync(entryFile, 'utf8'));
    if (problems.length) problems.forEach((p) => bad(`CSS 순서: ${p}`));
    else ok('CSS import 순서(fonts → tokens → theme → styles → blocks)');
  }

  // 3. 토큰 밖 값(hex · px · 글꼴 · primitive 색 · 색 함수 · 안쪽 부품 덮기 · Trellis 컴포넌트 onClick)
  // 복사한 블록(src/blocks/<id>/)에서 Trellis 원본과 같은 줄은 블록에서 온 것이라 경고로 따로 센다
  const files = walk(join(app, 'src'));
  const hits = [];
  const inherited = [];
  const blocksDir = join(app, 'src', 'blocks');
  for (const f of files) {
    if (/theme\.css$|\.generated\./.test(f)) continue;
    const text = readFileSync(f, 'utf8');
    const lines = text.split('\n');
    const rel = relative(blocksDir, f);
    const original = rel.startsWith('..') ? null : join(TRELLIS, 'blocks', 'src', rel);
    const originalLines =
      original && existsSync(original)
        ? new Set(
            readFileSync(original, 'utf8')
              .split('\n')
              .map((l) => l.trim()),
          )
        : null;
    for (const h of scanOffToken(text, { file: f })) {
      const row = `${relative(cwd, f)}:${h.line} ${h.kind} ${h.text}`;
      if (originalLines?.has((lines[h.line - 1] ?? '').trim())) inherited.push(row);
      else hits.push(row);
    }
  }
  if (hits.length) {
    bad(`토큰 밖 값 ${hits.length}건`);
    hits.slice(0, 30).forEach((h) => console.log(`    ${h}`));
    if (hits.length > 30) console.log(`    … ${hits.length - 30}건 더`);
  } else ok(`토큰 밖 값 0건(${files.length}개 파일)`);
  if (inherited.length) {
    warn(
      `블록 원본에서 그대로 온 줄 ${inherited.length}건. 서비스에서 고치거나 .trellis/requests.md에 남긴다`,
    );
    inherited.slice(0, 10).forEach((h) => console.log(`    ${h}`));
    if (inherited.length > 10) console.log(`    … ${inherited.length - 10}건 더`);
  }

  // 4. 테마 범위 · 생성기와 같은지
  const themeFile = join(app, 'src', 'theme.css');
  if (existsSync(themeFile)) {
    const css = readFileSync(themeFile, 'utf8');
    const v = themeViolations(css);
    if (v.length) bad(`theme.css가 바꿀 수 없는 변수를 덮는다: ${[...new Set(v)].join(', ')}`);
    else ok('theme.css 범위(브랜드 · 회색 톤만)');
    const engine = await loadThemeEngine();
    const stale = engine ? themeStaleness(css, engine) : null;
    if (stale && !stale.same) {
      const why = [
        stale.missing.length ? `없는 블록: ${stale.missing.join(' · ')}` : '',
        stale.changed ? `다른 줄 ${stale.changed}개` : '',
      ]
        .filter(Boolean)
        .join(', ');
      warn(
        `theme.css가 지금 생성기 결과와 다르다(${why || '순서 · 선택자'}). pnpm ds:theme --refresh`,
      );
    } else if (stale) ok('theme.css가 지금 생성기 결과와 같다');
  }

  // 5. 스킬 버전
  const lockFile = join(cwd, '.trellis', 'skill.lock');
  if (!existsSync(lockFile)) warn('스킬 설치 기록 없음. pnpm ds:skill');
  else {
    const { trellis } = JSON.parse(readFileSync(lockFile, 'utf8'));
    const now = trellisCommit();
    if (trellis !== now)
      warn(`스킬은 trellis ${trellis} 기준, 지금은 ${now}. pnpm ds:skill로 다시 설치`);
    else ok(`스킬 버전(trellis ${now})`);
  }

  console.log(errors ? `\n점검 실패 ${errors}건` : '\n점검 통과');
  process.exit(errors ? 1 : 0);
}

function docs() {
  if (!existsSync(DOCS)) {
    console.error('문서 없음. pnpm ds:build');
    process.exit(1);
  }
  const [what = 'llms', name] = rest;
  const print = (p) => {
    if (!existsSync(p)) {
      console.error(`없음: ${relative(DOCS, p)}. docs list로 목록을 보세요`);
      process.exit(1);
    }
    process.stdout.write(readFileSync(p, 'utf8'));
  };
  if (what === 'list') {
    console.log(
      '컴포넌트:',
      readdirSync(join(DOCS, 'components'))
        .map((f) => f.replace(/\.md$/, ''))
        .join(' '),
    );
    console.log(
      '가이드:',
      readdirSync(join(DOCS, 'guides'))
        .map((f) => f.replace(/\.md$/, ''))
        .join(' '),
    );
  } else if (what === 'llms') print(join(DOCS, 'llms.txt'));
  else if (what === 'tokens') print(join(DOCS, 'tokens.md'));
  else if (what === 'guide') print(join(DOCS, 'guides', `${name}.md`));
  else print(join(DOCS, 'components', `${what}.md`));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  if (cmd === 'install') install();
  else if (cmd === 'doctor') await doctor();
  else if (cmd === 'docs') docs();
  else {
    console.log(
      'trellis-skill install | doctor [--app apps/web] | docs [list|llms|tokens|<컴포넌트>|guide <이름>]',
    );
    process.exit(cmd === 'help' ? 0 : 1);
  }
}
