// 토큰 밖 값에 대신 쓸 토큰 후보를 찾는다. 설치된 tokens.css(라이트 값)를 읽어 값 → 변수 이름으로 뒤집는다.
// 색 후보는 semantic 토큰만 낸다(primitive는 doctor가 막는다). 크기 후보는 간격 · 반경 · 테두리 굵기
import { PRIMITIVE_COLOR } from './checks.mjs';

/** `선택자 {` 로 시작하는 첫 블록의 `--이름: 값;` 줄들 */
function block(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return new Map();
  const end = css.indexOf('\n}', start);
  const out = new Map();
  for (const m of css
    .slice(start, end < 0 ? undefined : end)
    .matchAll(/(--tl-[\w-]+)\s*:\s*([^;]+);/g))
    out.set(m[1], m[2].trim());
  return out;
}

/** #abc · #abcd · #aabbcc · #aabbccdd → 대문자 6자리 또는 8자리 */
export function normalizeHex(hex) {
  const h = hex.replace('#', '');
  const full = h.length <= 4 ? [...h].map((c) => c + c).join('') : h;
  return `#${full.toUpperCase()}`;
}

/** 색 후보를 내는 순서: 면 → 글자 → 테두리 → 그 밖 */
const COLOR_ORDER = ['--tl-color-bg-', '--tl-color-fg-', '--tl-color-border-'];
/** 크기 후보로 내는 변수(배치 폭 · 중단점 · 아이콘 크기는 뜻이 달라 내지 않는다) */
const SIZE_ORDER = ['--tl-space-', '--tl-radius-', '--tl-border-width-'];

const rank = (order) => (name) => {
  const i = order.findIndex((p) => name.startsWith(p));
  return i < 0 ? order.length : i;
};

/**
 * @param {string} tokensCss  @terracelab/trellis-tokens의 tokens.css 내용
 * @returns {{ colors: Map<string, string[]>, sizes: Map<string, string[]> }}
 */
export function tokenIndex(tokensCss) {
  const primitives = block(tokensCss, ':root');
  const light = block(tokensCss, '[data-theme="light"]');
  const all = new Map([...primitives, ...light]);
  const resolve = (value, depth = 0) => {
    const ref = value.match(/^var\((--tl-[\w-]+)\)$/);
    if (!ref || depth > 8) return value;
    const next = all.get(ref[1]);
    return next ? resolve(next, depth + 1) : value;
  };

  const colors = new Map();
  const byColor = rank(COLOR_ORDER);
  for (const [name, value] of light) {
    if (PRIMITIVE_COLOR.test(name)) continue;
    const resolved = resolve(value);
    if (!/^#[0-9a-fA-F]{3,8}$/.test(resolved)) continue;
    const key = normalizeHex(resolved);
    colors.set(key, [...(colors.get(key) ?? []), name]);
  }
  for (const names of colors.values()) names.sort((a, b) => byColor(a) - byColor(b));

  const sizes = new Map();
  for (const [name, value] of primitives) {
    if (!/^\d*\.?\d+px$/.test(value) || !SIZE_ORDER.some((p) => name.startsWith(p))) continue;
    sizes.set(value, [...(sizes.get(value) ?? []), name]);
  }
  const bySize = rank(SIZE_ORDER);
  for (const names of sizes.values()) names.sort((a, b) => bySize(a) - bySize(b));

  return { colors, sizes };
}

/** scanOffToken이 찾은 한 건의 후보 토큰(최대 3개). 없으면 빈 배열 */
export function suggestTokens(hit, index, max = 3) {
  if (!index) return [];
  if (hit.kind === 'hex 색') return (index.colors.get(normalizeHex(hit.text)) ?? []).slice(0, max);
  if (hit.kind === 'px 값') return (index.sizes.get(hit.text) ?? []).slice(0, max);
  return [];
}
