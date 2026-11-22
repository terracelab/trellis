// doctor의 판단 함수(파일 내용만 보고 답한다). 파일을 읽고 쓰는 일은 doctor.mjs가 한다
// 토큰 밖 값 · Trellis 컴포넌트의 onClick · 테마 범위 · CSS import 순서

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
 * file을 주면 확장자로 CSS 전용(안쪽 부품 덮기) · JSX 전용(Trellis 컴포넌트의 onClick) 검사를 더한다
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

/** 진입 파일의 CSS import 순서. JS의 import 줄과 CSS의 @import 줄을 같은 방식으로 본다 */
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

/** Trellis 패키지에서 이름을 가져오는 파일인가(CSS만 불러오는 줄은 세지 않는다) */
export function usesTrellis(text) {
  return /from\s*['"]@terracelab\/trellis-(?:react|contracts|icons|tokens)(?:\/[\w./-]+)?['"]/.test(
    text,
  );
}

/** CSS 파일이 Trellis 변수(--tl-*)를 쓰는가 */
export function usesTrellisTokens(text) {
  return /var\(\s*--tl-/.test(text);
}

/** 파일이 상대 경로로 불러오는 CSS(`import './a.css'`). 돌려주는 값은 적힌 경로 그대로 */
export function cssImports(text) {
  return [...text.matchAll(/import\s+(?:[\w*{}\s,]+from\s+)?['"](\.{1,2}\/[^'"]+\.css)['"]/g)].map(
    (m) => m[1],
  );
}
