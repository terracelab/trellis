// 회사 테마 엔진(D-58 → D-97 · D-98 · D-99). 회사 메인 색 hex 하나 → "회사 색을 따라가는" semantic 토큰
// × 라이트 · 다크 · 고대비 라이트 · 고대비 다크. 기본 테마는 createTheme(DEFAULT_BRAND)의 결과다(D-98):
// scripts/gen-default-theme.mjs가 이 결과로 primitive brand · shell · alpha.brand와 semantic alias를 쓰고,
// test/default-theme.test.ts가 한 값이라도 다르면 실패한다.
//
// 브라우저 · Node 둘 다에서 돈다(외부 라이브러리 없음, 같은 입력 = 같은 결과). 색 계산은 OKLCH, 대비는 WCAG 2.x.
// 바꾸지 않는 것: status · finance(수입 빨강 · 지출 파랑) · approval · module · chart · 글꼴 · 간격 · 크기.
import palette from '../src/primitive/color.json' with { type: 'json' };
import scales from '../scales.config.json' with { type: 'json' };

export const DEFAULT_BRAND = '#FE5C2B';
const WHITE = '#FFFFFF';
const BLACK = '#000000';
export const MODES = ['light', 'dark', 'hcLight', 'hcDark'];

/* ---------- 색 계산 ----------
 * 같은 입력이면 엔진마다 같은 hex가 나오도록 중간값을 자른다(Math.cbrt · cos · pow의 마지막 자리 차이를 지운다). */
const q = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(String(hex).trim());
  if (!m) throw new Error(`색은 #RRGGBB 형식이어야 한다: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

/** #RRGGBB 대문자. 잘못된 형식이면 throw */
export function normalizeHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
  if (!m) throw new Error(`색은 #RRGGBB 형식이어야 한다: ${hex}`);
  return `#${m[1].toUpperCase()}`;
}

const rgbToHex = (rgb) =>
  `#${rgb
    .map((v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase()}`;

function hexToOklab(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function hexToOklch(hex) {
  const [L, A, B] = hexToOklab(hex);
  const c = Math.hypot(A, B);
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: q(L, 6), c: q(c, 6), h: q(h, 3) };
}

function oklchToLinear({ l: L, c, h }) {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = L + 0.3963377774 * A + 0.2158037573 * B;
  const m = L - 0.1055613458 * A - 0.0638541728 * B;
  const s = L - 0.0894841775 * A - 1.291485548 * B;
  const [l3, m3, s3] = [l * l * l, m * m * m, s * s * s];
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

const inGamut = (lin) => lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** sRGB 밖이면 L · H를 고정한 채 C만 줄인다(gen-color-scale.mjs와 같은 방식) */
export function oklchToHex(color) {
  const c0 = { l: q(color.l, 6), c: q(Math.max(0, color.c), 6), h: q(color.h, 3) };
  let lin = oklchToLinear(c0);
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = c0.c;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...c0, c: mid }))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear({ ...c0, c: lo });
  }
  return rgbToHex(lin.map((v) => toGamma(Math.min(1, Math.max(0, v)))));
}

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.x 대비(소수 넷째 자리에서 자른다). 알파 색은 넘기기 전에 합성한다 */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, r) => r - p);
  return Math.floor(((x + 0.05) / (y + 0.05)) * 10000) / 10000;
}

/** OKLab 유클리드 색차 × 100(ΔEOK). 2 이하는 눈으로 거의 구분되지 않는다 */
export function deltaE(a, b) {
  const [p, r] = [hexToOklab(a), hexToOklab(b)];
  return q(Math.hypot(p[0] - r[0], p[1] - r[1], p[2] - r[2]) * 100, 3);
}

/** #RRGGBBAA를 바탕 위에 합성한 불투명 hex(대비를 재려고) */
export function composite(fg, bg) {
  if (fg.length !== 9) return fg;
  const a = parseInt(fg.slice(7), 16) / 255;
  const [f, b] = [hexToRgb(fg.slice(0, 7)), hexToRgb(bg)];
  return rgbToHex(f.map((v, i) => v * a + b[i] * (1 - a)));
}

const alphaHex = (hex, alpha) =>
  `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()}`;

/* ---------- 단계 ---------- */
export const STEPS = scales.steps;
const hexOf = (group, keys = STEPS) => Object.fromEntries(keys.map((s) => [s, group[s].$value]));
export const BASE_NEUTRAL = hexOf(palette.color.neutral);
export const BASE_GRAPHITE = hexOf(palette.color.graphite);
const BASE_BLUE = hexOf(palette.color.blue);

const { lightEnd: LIGHT_END, darkEnd: DARK_END, towardLight, towardDark } = scales.lightness;
const CHROMA = scales.chroma;
/** 500 자리에 둘 수 있는 가장 밝은 L. 더 밝은 색(노랑 · 흰색)은 L만 내린다 — 옅은 단계(50 · 100)가 남게 */
const L500_MAX = 0.85;
/** 주 버튼 바탕을 옮길 때(500이 흰 글자 4.5 미달) 600 단계의 흰 글자 목표. 4.5 경계값은 반올림 · 화면 차로 미달한다 */
export const BUTTON_TARGET = 5;

/**
 * 회사 색 하나로 50~950 단계. 500 = 입력 색(너무 밝으면 L만 내림).
 * 500 위 흰 글자가 4.5 미만이면 600을 "흰 글자 5:1을 넘는 가장 밝은 같은 색상"에 두고 700~950을 그 아래로 편다.
 * 그 밖에는 gen-color-scale.mjs와 같은 곡선이다.
 */
export function brandScale(hex) {
  const input = hexToOklch(normalizeHex(hex));
  const l500 = Math.min(L500_MAX, input.l);
  const moved = l500 !== input.l;
  const { c, h } = input;
  const out = {};
  out[500] = moved ? oklchToHex({ l: l500, c, h }) : normalizeHex(hex);
  for (const s of STEPS.filter((x) => x < 500))
    out[s] = oklchToHex({ l: l500 + (LIGHT_END - l500) * towardLight[s], c: c * CHROMA[s], h });

  const darkEnd = Math.min(DARK_END, l500 * 0.6);
  const t600 = towardDark[600];
  let l600 = l500 - (l500 - darkEnd) * t600;
  let anchored = false;
  if (contrast(WHITE, out[500]) < 4.5) {
    // 흰 글자 BUTTON_TARGET을 넘는 가장 밝은 L(밝을수록 대비가 줄어 이분 탐색)
    let lo = 0;
    let hi = l500;
    for (let i = 0; i < 32; i += 1) {
      const mid = (lo + hi) / 2;
      if (contrast(WHITE, oklchToHex({ l: mid, c: c * CHROMA[600], h })) >= BUTTON_TARGET) lo = mid;
      else hi = mid;
    }
    l600 = q(lo, 6);
    anchored = true;
  }
  out[600] = oklchToHex({ l: l600, c: c * CHROMA[600], h });
  for (const s of STEPS.filter((x) => x > 600)) {
    const r = (towardDark[s] - t600) / (1 - t600);
    out[s] = oklchToHex({ l: l600 - (l600 - darkEnd) * r, c: c * CHROMA[s], h });
  }
  return { scale: out, moved, anchored };
}

/**
 * 사이드바 톤(D-97 정한 것 2): 회사 색상(hue)의 저채도 짙은 톤. L은 식자재 ERP 코코아 단계, C는 회사 색 채도에 비례
 * (코코아 C 0.011 ÷ 주황 C 0.206). 주황을 넣으면 코코아 #3A3330과 ΔEOK 2 이하.
 */
export const SHELL_L = {
  100: 0.915, // nav 글자(코코아 100 #E7E2DD)
  300: 0.778, // nav 흐린 글자(코코아 300 #BDB5AE)
  600: 0.45, // 고대비 구분선
  700: 0.389, // 라이트 선택 면(코코아 800 #4A4341)
  750: 0.357, // 라이트 가리킴 · 구분선(코코아 900 위 흰 5%)
  800: 0.327, // 라이트 사이드바 면(코코아 900 #3A3330) · 다크 선택 면
  850: 0.307, // 라이트 하위 메뉴 면(코코아 925 #342E2B)
  900: 0.3, // 다크 가리킴 · 구분선(코코아 950 위 흰 5%)
  925: 0.269, // 다크 사이드바 면(코코아 950 #2A2522)
  950: 0.244, // 다크 하위 메뉴 면(코코아 975 #241F1D)
};
export const SHELL_CHROMA = 0.011 / 0.206;
const SHELL_CHROMA_MAX = 0.016;

export function shellScale(hex) {
  const { c, h } = hexToOklch(normalizeHex(hex));
  const chroma = Math.min(SHELL_CHROMA_MAX, c * SHELL_CHROMA);
  return Object.fromEntries(
    Object.entries(SHELL_L).map(([k, l]) => [k, oklchToHex({ l, c: chroma, h })]),
  );
}

export const NEUTRAL_TONES = [
  {
    id: 'cool',
    label: '기본',
    description: '라이트는 푸른 기가 조금 도는 회색, 다크는 무채색',
  },
  { id: 'neutral', label: '중립', description: '색기가 없는 회색' },
  { id: 'warm', label: '따뜻한', description: '누런 기가 조금 도는 회색' },
];

/** 회색 톤: 명도(L)는 그대로 두고 색상만 바꿔 대비가 유지된다. 라이트 회색(neutral) · 다크 회색(graphite) 둘 다 */
function toneOf(base, tone) {
  const out = {};
  for (const step of STEPS) {
    const c = hexToOklch(base[step]);
    out[step] =
      tone === 'neutral'
        ? oklchToHex({ l: c.l, c: 0, h: 0 })
        : oklchToHex({ l: c.l, c: Math.max(c.c, 0.006) * 0.9, h: 75 });
  }
  return out;
}
export function neutralScale(tone) {
  return tone === 'cool' ? { ...BASE_NEUTRAL } : toneOf(BASE_NEUTRAL, tone);
}
export function graphiteScale(tone) {
  return tone === 'cool' ? { ...BASE_GRAPHITE } : toneOf(BASE_GRAPHITE, tone);
}

/* ---------- 회색 톤이 정하는 semantic(기본 cool은 semantic 파일 그대로, D-97 정한 것 3) ---------- */
export const NEUTRAL_MAP = {
  light: {
    'bg.canvas': 'neutral.100',
    'bg.surface': 'base.white',
    'bg.elevated': 'base.white',
    'bg.sunken': 'neutral.50',
    'fg.strong': 'neutral.900',
    'fg.primary': 'neutral.800',
    'fg.secondary': 'neutral.700',
    'fg.tertiary': 'neutral.500',
    'fg.disabled': 'neutral.400',
    'fg.inverse': 'base.white',
    'border.default': 'neutral.200',
    'border.strong': 'neutral.300',
    'border.hover': 'neutral.400',
    'border.divider': 'neutral.200',
  },
  dark: {
    'bg.canvas': 'graphite.950',
    'bg.surface': 'graphite.900',
    'bg.elevated': 'graphite.700',
    'bg.sunken': 'graphite.800',
    'fg.strong': 'graphite.50',
    'fg.primary': 'graphite.100',
    'fg.secondary': 'graphite.200',
    'fg.tertiary': 'graphite.300',
    'fg.disabled': 'graphite.400',
    'fg.inverse': 'neutral.900',
    'border.default': 'graphite.600',
    'border.strong': 'graphite.500',
    'border.hover': 'graphite.400',
    'border.divider': 'graphite.600',
  },
  // 고대비: 글자 · 선을 한두 단계 진하게(밝게). 면은 그대로
  hcLight: {
    'fg.strong': 'neutral.950',
    'fg.primary': 'neutral.900',
    'fg.secondary': 'neutral.700',
    'fg.tertiary': 'neutral.600',
    'fg.disabled': 'neutral.500',
    'border.default': 'neutral.500',
    'border.strong': 'neutral.600',
    'border.hover': 'neutral.700',
    'border.divider': 'neutral.400',
  },
  hcDark: {
    'fg.strong': 'base.white',
    'fg.primary': 'graphite.50',
    'fg.secondary': 'graphite.100',
    'fg.tertiary': 'graphite.200',
    'fg.disabled': 'graphite.300',
    'border.default': 'graphite.300',
    'border.strong': 'graphite.200',
    'border.hover': 'graphite.100',
    'border.divider': 'graphite.400',
  },
};

/** 회사 색을 따라가는 semantic(D-97 정한 것 · 대응표의 "회사 색을 따라감") */
export const BRAND_TOKENS = [
  'brand.default',
  'brand.hover',
  'brand.active',
  'brand.subtle',
  'brand.tint',
  'brand.accent',
  'brand.onBrand',
  'bg.rowSelected',
  'fg.link',
  'border.focus',
  'border.focusStrong',
  'border.selected',
  'bg.nav',
  'nav.fg',
  'nav.fgMuted',
  'nav.fgActive',
  'nav.hover',
  'nav.selected',
  'nav.border',
  'nav.sub',
  'nav.focus',
];

const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
export const cssVarOf = (path) => `--tl-color-${path.split('.').map(kebab).join('-')}`;

/** 테마가 덮을 수 있는 변수(doctor의 범위 검사와 같다) */
export const THEME_VARS = [
  ...new Set([
    ...BRAND_TOKENS,
    ...Object.keys(NEUTRAL_MAP.light),
    ...Object.keys(NEUTRAL_MAP.dark),
  ]),
].map(cssVarOf);

/* ---------- 겹침 경고(D-99) ---------- */
/** 바뀌지 않는 색: 회사 색이 이 색과 가까우면 뜻이 섞인다. 경로는 semantic 파일과 같다(test/theme.test.ts가 대조) */
export const FIXED_COLORS = [
  { id: 'danger', label: '위험', path: 'status.danger.default', light: 'red.600', dark: 'red.400' },
  { id: 'income', label: '수입', path: 'finance.income', light: 'red.600', dark: 'red.400' },
  {
    id: 'success',
    label: '성공',
    path: 'status.success.default',
    light: 'green.600',
    dark: 'green.400',
  },
  {
    id: 'warning',
    label: '경고',
    path: 'status.warning.default',
    light: 'amber.600',
    dark: 'amber.400',
  },
  { id: 'expense', label: '지출', path: 'finance.expense', light: 'blue.600', dark: 'blue.400' },
  { id: 'info', label: '정보', path: 'status.info.default', light: 'blue.600', dark: 'blue.400' },
  {
    id: 'chart1',
    label: '차트 첫 계열',
    path: 'chart.series.1',
    light: 'blue.500',
    dark: 'blue.400',
  },
];
/** ΔEOK가 이보다 작으면 겹친다(D-99) */
export const OVERLAP_DE = 9;
/** 규칙 A가 주 버튼 · 강조를 둘 다 입력 색에서 이만큼(ΔEOK) 멀리 옮기면 화면에 회사 색이 보이지 않는다(R-T52) */
export const FAR_FROM_INPUT_DE = 15;

const primitive = (ref) => {
  const [group, step] = ref.split('.');
  return palette.color[group][step].$value;
};

/* ---------- 테마 ---------- */
/**
 * 단계를 하나씩 옮기며 test를 넘는 첫 단계를 찾는다.
 * @returns {{ step, moved, ok }}
 */
function walk(scale, start, dir, test) {
  let i = STEPS.indexOf(start);
  let moved = 0;
  while (!test(scale[STEPS[i]])) {
    const next = i + dir;
    if (next < 0 || next >= STEPS.length) return { step: STEPS[i], moved, ok: false };
    i = next;
    moved += 1;
  }
  return { step: STEPS[i], moved, ok: true };
}

const minContrast = (fg, bgs) => Math.min(...bgs.map((bg) => contrast(fg, bg)));

/**
 * 테마를 만든다.
 * @param {{ brand?: string, neutral?: 'cool'|'neutral'|'warm', buttonText?: 'white'|'input' }} input
 *   buttonText 'white'(기본, D-97 정한 것 1 A): 흰 글자가 4.5를 넘을 때까지 주 버튼 바탕을 같은 색상에서 진하게 옮긴다.
 *   'input'(B): 바탕은 입력 색 그대로, 글자는 흰색 · 짙은 색 중 대비를 넘는 쪽.
 */
export function createTheme({
  brand = DEFAULT_BRAND,
  neutral: tone = 'cool',
  buttonText = 'white',
} = {}) {
  if (!NEUTRAL_TONES.some((t) => t.id === tone))
    throw new Error(`회색 톤은 cool · neutral · warm: ${tone}`);
  if (buttonText !== 'white' && buttonText !== 'input')
    throw new Error(`주 버튼 글자 규칙은 white · input: ${buttonText}`);
  const input = normalizeHex(brand);
  const { scale: b, moved, anchored } = brandScale(input);
  const shell = shellScale(input);
  const n = neutralScale(tone);
  const g = graphiteScale(tone);
  const notes = [];
  if (moved) notes.push(`입력 색이 너무 밝아 500 단계 명도를 ${L500_MAX}로 내렸다(${b[500]})`);

  const pal = { neutral: n, graphite: g, brand: b, shell, base: { white: WHITE, black: BLACK } };
  const hexOfRef = (ref) => {
    const [group, step] = ref.split('.');
    return pal[group][step];
  };
  // 면(회색 톤을 따른다)
  const face = {
    light: {
      surface: WHITE,
      canvas: hexOfRef(NEUTRAL_MAP.light['bg.canvas']),
      sunken: hexOfRef(NEUTRAL_MAP.light['bg.sunken']),
      elevated: WHITE,
    },
    dark: {
      surface: hexOfRef(NEUTRAL_MAP.dark['bg.surface']),
      canvas: hexOfRef(NEUTRAL_MAP.dark['bg.canvas']),
      sunken: hexOfRef(NEUTRAL_MAP.dark['bg.sunken']),
      elevated: hexOfRef(NEUTRAL_MAP.dark['bg.elevated']),
    },
  };
  face.hcLight = face.light;
  face.hcDark = face.dark;

  // 다크 알파 바탕의 원색: 400 단계. 다크 면과 2 이상 구분되지 않으면(검정에 가까운 회사 색) 더 밝은 단계
  const alphaBase = walk(
    b,
    400,
    -1,
    (x) => deltaE(composite(alphaHex(x, 0.16), face.dark.surface), face.dark.surface) >= 2,
  ).step;
  const alpha = {
    8: alphaHex(b[alphaBase], 0.08),
    16: alphaHex(b[alphaBase], 0.16),
    24: alphaHex(b[alphaBase], 0.24),
  };
  pal.alpha = alpha;

  const refs = {};
  const checks = [];
  const reasons = [];
  const add = (mode, name, fg, bg, min) => {
    const ratio = contrast(fg, bg);
    checks.push({
      mode,
      name,
      fg,
      bg,
      ratio: Math.round(ratio * 100) / 100,
      min,
      pass: ratio >= min,
    });
  };

  // 주 버튼(라이트 · 고대비 라이트에서 고르고 다크는 같은 값, D-89)
  const pickButton = (min, label) => {
    if (buttonText === 'white') {
      const r = walk(b, 500, 1, (x) => contrast(WHITE, x) >= min);
      if (r.moved)
        reasons.push(
          `${label}: 회사 색 위 흰 글자 ${contrast(WHITE, b[500]).toFixed(2)} < ${min} → ${r.step} 단계(${contrast(WHITE, b[r.step]).toFixed(2)})로 옮겼다. 입력 색은 강조(brand.accent)에 쓴다`,
        );
      if (r.ok) return { step: r.step, on: 'base.white', dir: 1 };
      reasons.push(`${label}: 어느 단계도 흰 글자 ${min}를 넘지 못해 짙은 글자로 바꿨다`);
    }
    // B(또는 A가 실패): 바탕은 500, 글자는 흰색 → 짙은 회색 → 검정 중 대비를 넘는 첫 색
    for (const on of ['base.white', 'neutral.950', 'base.black']) {
      if (contrast(hexOfRef(on), b[500]) >= min)
        return { step: 500, on, dir: on === 'base.white' ? 1 : -1 };
    }
    // 어느 글자도 넘지 못하면(고대비 7) 검정 글자로 바탕을 밝게 옮긴다
    const r = walk(b, 500, -1, (x) => contrast(BLACK, x) >= min);
    reasons.push(`${label}: 입력 색 위 글자가 ${min}를 넘지 못해 바탕을 ${r.step} 단계로 옮겼다`);
    return { step: r.step, on: 'base.black', dir: -1 };
  };
  const btn = { normal: pickButton(4.5, '주 버튼'), hc: pickButton(7, '고대비 주 버튼') };
  // 가리킴 · 누름: 글자에서 멀어지는 쪽 한두 단계를 먼저 보고, 주 버튼과 색차 3 이상 · 글자 대비 유지를 찾는다
  const near = (start, dir, order, min, onHex, avoid = []) => {
    const i0 = STEPS.indexOf(start);
    for (const k of order) {
      const i = i0 + dir * k;
      if (i < 0 || i >= STEPS.length) continue;
      const x = b[STEPS[i]];
      if (
        deltaE(x, b[start]) >= 3 &&
        contrast(onHex, x) >= min &&
        avoid.every((a) => deltaE(x, b[a]) >= 2)
      )
        return STEPS[i];
    }
    return start;
  };
  const states = (B, min) => {
    const on = hexOfRef(B.on);
    const hover = near(B.step, B.dir, [1, -1, 2, -2, 3, -3], min, on);
    const active = near(B.step, B.dir, [2, 3, -2, 1, -1, 4, -3, 5, -4], min, on, [hover]);
    return { hover, active };
  };
  btn.normal.states = states(btn.normal, 4.5);
  btn.hc.states = states(btn.hc, 7);

  for (const mode of MODES) {
    const dark = mode === 'dark' || mode === 'hcDark';
    const hc = mode === 'hcLight' || mode === 'hcDark';
    const f = face[mode];
    const textMin = hc ? 7 : 4.5;
    const uiMin = hc ? 4.5 : 3;
    const r = {};
    const set = (path, ref) => {
      r[path] = ref;
    };
    const tag = { light: '라이트', dark: '다크', hcLight: '고대비 라이트', hcDark: '고대비 다크' }[
      mode
    ];
    const moveNote = (what, from, res, min, bgs) => {
      if (res.moved)
        reasons.push(
          `${tag}: ${what} ${from} 단계가 ${min}:1 미달(${minContrast(b[from], bgs).toFixed(2)}) → ${res.step} 단계(${minContrast(b[res.step], bgs).toFixed(2)})`,
        );
    };

    // 주 버튼 · 가리킴 · 누름 · 글자
    const B = hc ? btn.hc : btn.normal;
    set('brand.default', `brand.${B.step}`);
    set('brand.hover', `brand.${B.states.hover}`);
    set('brand.active', `brand.${B.states.active}`);
    set('brand.onBrand', B.on);

    // 옅은 바탕: 라이트는 50 · 100 단계, 다크는 알파(면 위에 합성해 잰다)
    if (dark) {
      set('brand.subtle', 'alpha.brand.16');
      set('brand.tint', 'alpha.brand.24');
      set('bg.rowSelected', 'alpha.brand.16');
    } else {
      const sub = walk(b, 50, 1, (x) => deltaE(x, f.surface) >= 2).step;
      set('brand.subtle', `brand.${sub}`);
      set('brand.tint', `brand.${STEPS[Math.min(STEPS.indexOf(sub) + 1, 4)]}`);
      // 선택 행: 400 단계 8% 알파. 면과 거의 같으면(흰색에 가까운 회사 색) 선택 바탕 단계
      const row = composite(alpha[8], f.surface);
      set('bg.rowSelected', deltaE(row, f.surface) >= 1.5 ? 'alpha.brand.8' : `brand.${sub}`);
    }
    const solid = (path) => {
      const v = hexOfRef(r[path].replace('alpha.brand.', 'alpha.'));
      return composite(v, f.surface);
    };
    // tints[0] 선택 바탕(브랜드 글자를 얹는다) · [1] 옅은 강조 면(본문 글자를 얹는다) · [2] 선택 행
    const tints = ['brand.subtle', 'brand.tint', 'bg.rowSelected'].map(solid);

    // 강조(입력 색): 글자 아닌 표시(진행 막대 · 로고 · 선택 표시). 면 위 3:1(고대비 4.5)
    const accent = walk(b, 500, dark ? -1 : 1, (x) => contrast(x, f.surface) >= uiMin);
    moveNote('강조(입력 색)', 500, accent, uiMin, [f.surface]);
    set('brand.accent', `brand.${accent.step}`);

    // 링크 · 브랜드 글자: 면 · 바탕 · 옅은 칸 · 옅은 바탕 위 4.5(고대비 7)
    const textBgs = [f.surface, f.canvas, f.sunken, f.elevated, tints[0], tints[2]];
    const linkStart = dark ? 400 : 500;
    const link = walk(b, linkStart, dark ? -1 : 1, (x) => minContrast(x, textBgs) >= textMin);
    moveNote('링크 · 브랜드 글자', linkStart, link, textMin, textBgs);
    set('fg.link', `brand.${link.step}`);

    // 포커스 링 · 선택 테두리: 면 · 바탕 위 3:1(고대비 4.5). 포커스 강조는 4.5(고대비 7)
    const lineBgs = [f.surface, f.canvas];
    const lineStart = dark ? 400 : 500;
    const focus = walk(b, lineStart, dark ? -1 : 1, (x) => minContrast(x, lineBgs) >= uiMin);
    moveNote('포커스 링', lineStart, focus, uiMin, lineBgs);
    set('border.focus', `brand.${focus.step}`);
    const strongMin = hc ? 7 : 4.5;
    // 포커스 강조는 포커스보다 한 단계 더 진하게(다크는 밝게)
    const fi = STEPS.indexOf(focus.step);
    const strongStart = dark
      ? STEPS[Math.max(0, fi - 1)]
      : STEPS[Math.min(STEPS.length - 1, Math.max(fi + 1, STEPS.indexOf(600)))];
    const strong = walk(b, strongStart, dark ? -1 : 1, (x) => minContrast(x, lineBgs) >= strongMin);
    set('border.focusStrong', `brand.${strong.step}`);
    const selected = walk(b, lineStart, dark ? -1 : 1, (x) => minContrast(x, lineBgs) >= uiMin);
    moveNote('선택 테두리 · 탭 밑줄', lineStart, selected, uiMin, lineBgs);
    set('border.selected', `brand.${selected.step}`);

    // 사이드바(D-97 정한 것 2)
    const navBg = dark ? 'shell.925' : 'shell.800';
    set('bg.nav', navBg);
    set('nav.sub', dark ? 'shell.950' : 'shell.850');
    set('nav.fgActive', 'base.white');
    if (hc) {
      set('nav.fg', 'base.white');
      set('nav.fgMuted', 'shell.100');
      set('nav.hover', dark ? 'shell.800' : 'shell.700');
      // 고대비 지금 화면 = 주 버튼 색(흰 글자일 때). 짙은 글자 버튼이면 밝은 사이드바 톤
      set('nav.selected', B.on === 'base.white' ? `brand.${B.step}` : 'shell.600');
      set('nav.border', 'shell.600');
      set('nav.focus', 'base.white');
    } else {
      set('nav.fg', 'shell.100');
      set('nav.fgMuted', 'shell.300');
      set('nav.hover', dark ? 'shell.900' : 'shell.750');
      set('nav.selected', dark ? 'shell.800' : 'shell.700');
      set('nav.border', dark ? 'shell.900' : 'shell.750');
      const navBgs = [
        shell[navBg.split('.')[1]],
        hexOfRef(r['nav.hover']),
        hexOfRef(r['nav.selected']),
      ];
      const nf = walk(b, 500, -1, (x) => minContrast(x, navBgs) >= uiMin);
      if (nf.moved)
        reasons.push(
          `${tag}: 사이드바 포커스 링 500 단계가 짙은 면 위 ${uiMin}:1 미달 → ${nf.step} 단계`,
        );
      set('nav.focus', `brand.${nf.step}`);
    }

    // 회색 톤(기본 cool은 semantic 파일 값, 다른 톤만 덮는다)
    for (const [path, ref] of Object.entries(NEUTRAL_MAP[mode] ?? {})) set(path, ref);
    refs[mode] = r;

    // 대비 기록
    const H = (path) => solid(path);
    const fg = (path) => hexOfRef(r[path] ?? NEUTRAL_MAP[dark ? 'dark' : 'light'][path]);
    add(mode, '주 버튼 글자', hexOfRef(B.on), b[B.step], textMin);
    add(mode, '주 버튼 글자 / 가리킴', hexOfRef(B.on), H('brand.hover'), textMin);
    add(mode, '주 버튼 글자 / 누름', hexOfRef(B.on), H('brand.active'), textMin);
    for (const [name, bg] of [
      ['면', f.surface],
      ['바탕', f.canvas],
      ['옅은 칸', f.sunken],
      ['팝업 면', f.elevated],
      ['선택 바탕', tints[0]],
      ['선택 행', tints[2]],
    ])
      add(mode, `링크 · 브랜드 글자 / ${name}`, H('fg.link'), bg, textMin);
    add(mode, '본문 / 선택 행', fg('fg.primary'), tints[2], textMin);
    add(mode, '본문 / 옅은 강조 면', fg('fg.primary'), tints[1], textMin);
    add(mode, '강조(입력 색) / 면', H('brand.accent'), f.surface, uiMin);
    for (const [name, bg] of [
      ['면', f.surface],
      ['바탕', f.canvas],
    ]) {
      add(mode, `포커스 링 / ${name}`, H('border.focus'), bg, uiMin);
      add(mode, `포커스 강조 / ${name}`, H('border.focusStrong'), bg, strongMin);
      add(mode, `선택 테두리 · 탭 밑줄 / ${name}`, H('border.selected'), bg, uiMin);
    }
    const nb = H('bg.nav');
    add(mode, '사이드바 글자', H('nav.fg'), nb, textMin);
    add(mode, '사이드바 글자 / 가리킴', H('nav.fg'), H('nav.hover'), textMin);
    add(mode, '사이드바 흐린 글자', H('nav.fgMuted'), nb, hc ? 7 : 4.5);
    add(mode, '사이드바 흐린 글자 / 하위 메뉴', H('nav.fgMuted'), H('nav.sub'), 4.5);
    add(mode, '사이드바 흐린 글자 / 가리킴', H('nav.fgMuted'), H('nav.hover'), uiMin);
    add(mode, '사이드바 지금 화면 글자', H('nav.fgActive'), H('nav.selected'), textMin);
    add(mode, '사이드바 가리킴 글자', H('nav.fgActive'), H('nav.hover'), textMin);
    add(mode, '사이드바 포커스 링', H('nav.focus'), nb, uiMin);
    add(mode, '사이드바 포커스 링 / 선택', H('nav.focus'), H('nav.selected'), uiMin);
    add(mode, '사이드바 포커스 링 / 가리킴', H('nav.focus'), H('nav.hover'), uiMin);
    for (const [name, bg] of [
      ['면', f.surface],
      ['바탕', f.canvas],
      ['팝업 면', f.elevated],
    ]) {
      add(mode, `본문 / ${name}`, fg('fg.primary'), bg, name === '면' ? 12 : 7);
      add(mode, `보조 글자 / ${name}`, fg('fg.secondary'), bg, hc ? 7 : 4.5);
      add(mode, `흐린 글자 / ${name}`, fg('fg.tertiary'), bg, 4.5);
    }
    // 옅은 바탕은 면과 구분되어야 한다
    for (const [name, v] of [
      ['선택 바탕', tints[0]],
      ['선택 행', tints[2]],
    ])
      checks.push({
        mode,
        name: `${name}가 면과 구분됨(ΔEOK)`,
        fg: v,
        bg: f.surface,
        ratio: deltaE(v, f.surface),
        min: 1.5,
        pass: deltaE(v, f.surface) >= 1.5,
      });
  }

  // CSS 변수
  const value = (ref) => {
    if (ref.startsWith('alpha.brand.')) return alpha[ref.split('.')[2]];
    return hexOfRef(ref);
  };
  const vars = {};
  for (const mode of MODES) {
    vars[mode] = {};
    for (const path of BRAND_TOKENS) vars[mode][cssVarOf(path)] = value(refs[mode][path]);
    if (tone !== 'cool')
      for (const path of Object.keys(NEUTRAL_MAP[mode] ?? {}))
        vars[mode][cssVarOf(path)] = value(refs[mode][path]);
  }

  const warnings = overlapWarnings({ input, refs, value, buttonText });
  const suggestions =
    buttonText === 'white' ? inputRuleSuggestion(input, tone, vars, warnings) : [];
  return {
    input,
    tone,
    buttonText,
    brand: b,
    shell,
    alpha,
    anchored,
    neutral: n,
    graphite: g,
    refs,
    light: vars.light,
    dark: vars.dark,
    hcLight: vars.hcLight,
    hcDark: vars.hcDark,
    checks,
    ok: checks.every((c) => c.pass),
    notes: [...notes, ...reasons],
    warnings,
    suggestions,
  };
}

/**
 * 아주 밝은 회사 색(노랑 · 하늘 · 연두): 흰 글자 규칙(A)이 주 버튼과 강조를 둘 다 어둡게 옮겼고,
 * 입력 색 바탕(B)이 대비 검사를 모두 넘고 겹침 경고를 늘리지 않으면 B를 제안한다. 값은 바꾸지 않는다.
 */
function inputRuleSuggestion(input, tone, vars, warnings) {
  const button = vars.light['--tl-color-brand-default'];
  const accent = vars.light['--tl-color-brand-accent'];
  const far = Math.min(deltaE(button, input), deltaE(accent, input));
  if (far < FAR_FROM_INPUT_DE) return [];
  const b = createTheme({ brand: input, neutral: tone, buttonText: 'input' });
  const before = new Set(warnings.map((w) => w.id));
  if (!b.ok || b.warnings.some((w) => !before.has(w.id))) return [];
  const inputButton = b.light['--tl-color-brand-default'];
  return [
    {
      buttonText: 'input',
      button,
      inputButton,
      deltaE: Math.round(far * 10) / 10,
      message: `흰 글자 규칙이 주 버튼 · 강조를 ${button}(으)로 옮겨 회사 색(${input})과 멀다(ΔEOK ${far.toFixed(1)} ≥ ${FAR_FROM_INPUT_DE}). 입력 색 바탕 규칙(--button-text input)은 대비 검사를 모두 넘고 주 버튼이 ${inputButton} · 짙은 글자다`,
    },
  ];
}

/** 회사 색(주 버튼 · 강조)이 바뀌지 않는 색과 ΔEOK OVERLAP_DE 미만이면 경고 + 대안 */
function overlapWarnings({ input, refs, value, buttonText }) {
  const near = nearestFixed(input, refs, value);
  if (!near.length) return [];
  const alternatives = suggestAlternatives(input);
  // 주 버튼만 겹치고 입력 색 바탕(B)으로는 안 겹치면 B를 대안으로
  const lite = createThemeLite(input, 'input');
  const inputRule = buttonText === 'white' && !nearestFixed(input, lite.refs, lite.value).length;
  return near.map((w) => ({
    ...w,
    alternatives,
    buttonTextAlternative: inputRule ? 'input' : null,
    message: `회사 색(${w.role} ${w.brand})이 ${w.label} 색(${w.fixed})과 가깝다(ΔEOK ${w.deltaE.toFixed(1)} < ${OVERLAP_DE}). ${w.label} 표시는 아이콘 · 글자와 함께 쓰고, 가능하면 대안 색을 고른다`,
  }));
}

function nearestFixed(input, refs, value) {
  const out = [];
  for (const fx of FIXED_COLORS) {
    let best = null;
    for (const mode of ['light', 'dark']) {
      const fixed = primitive(fx[mode]);
      for (const [role, path] of [
        ['입력 색', null],
        ['주 버튼', 'brand.default'],
        ['강조', 'brand.accent'],
      ]) {
        const brand = path ? value(refs[mode][path]) : input;
        const d = deltaE(brand, fixed);
        if (!best || d < best.deltaE)
          best = { id: fx.id, label: fx.label, mode, role, brand, fixed, deltaE: d };
      }
    }
    if (best.deltaE < OVERLAP_DE) out.push(best);
  }
  return out;
}

/** 같은 명도 · 채도에서 색상(hue)만 돌려 겹치지 않는 가장 가까운 색을 양쪽으로 하나씩 */
function suggestAlternatives(input) {
  const base = hexToOklch(input);
  if (base.c < 0.04) return [];
  const found = [];
  for (const dir of [1, -1]) {
    for (let k = 1; k <= 24; k += 1) {
      const hex = oklchToHex({ l: base.l, c: base.c, h: (base.h + dir * k * 5 + 360) % 360 });
      const t = createThemeLite(hex);
      if (!nearestFixed(hex, t.refs, t.value).length) {
        found.push(hex);
        break;
      }
    }
  }
  return found;
}

/** 경고 대안 계산용: 주 버튼 · 강조만 */
function createThemeLite(hex, buttonText = 'white') {
  const { scale: b } = brandScale(hex);
  const refs = {};
  for (const mode of ['light', 'dark']) {
    const surface = mode === 'dark' ? BASE_GRAPHITE[900] : WHITE;
    const d = buttonText === 'input' ? 500 : walk(b, 500, 1, (x) => contrast(WHITE, x) >= 4.5).step;
    const a = walk(b, 500, mode === 'dark' ? -1 : 1, (x) => contrast(x, surface) >= 3).step;
    refs[mode] = { 'brand.default': `brand.${d}`, 'brand.accent': `brand.${a}` };
  }
  return { refs, value: (ref) => b[ref.split('.')[1]] };
}

/* ---------- CSS ---------- */
const T = (v) => `[data-theme="${v}"]`;
const HC = '[data-contrast="high"]';
/** tokens.css와 같은 선택자. 안쪽에 다른 테마 · 고대비를 걸어도 이어진다 */
export const MODE_SELECTORS = {
  light: [':root', T('light')],
  dark: [T('dark')],
  hcLight: [HC, `${HC} ${T('light')}`],
  hcDark: [`${T('dark')}${HC}`, `${HC} ${T('dark')}`, `${T('dark')} ${HC}`],
};

/** 기기 설정 고대비(prefers-contrast: more): 앱이 data-contrast를 걸지 않았을 때만(R-33). data-contrast="normal"이면 끈다 */
export const PREFERS_CONTRAST_SELECTORS = {
  hcLight: [':root:not([data-contrast])'],
  hcDark: [`:root${T('dark')}:not([data-contrast])`, `:root:not([data-contrast]) ${T('dark')}`],
};

/**
 * 범위 지정(한 화면 · 미리보기 안에서만, D-98). scope = '[data-tl-theme="x"]' 같은 선택자.
 * 범위 요소 자신 · 바깥 테마 · 안쪽 테마 세 경우를 모두 받는다.
 */
export function scopedSelectors(scope) {
  // 범위 선택자를 두 번 겹쳐 우선도를 한 단계 올린다: 전역 theme.css · tokens.css의 [data-theme]가 범위 요소에 걸려도 이긴다
  const s = `${scope}${scope}`;
  return {
    light: [s, `${s} ${T('light')}`],
    dark: [`${s}${T('dark')}`, `${T('dark')} ${s}`, `${s} ${T('dark')}`],
    hcLight: [
      `${s}${HC}`,
      `${HC} ${s}`,
      `${s} ${HC}`,
      `${s}${HC} ${T('light')}`,
      `${s} ${HC} ${T('light')}`,
    ],
    hcDark: [
      `${s}${T('dark')}${HC}`,
      `${T('dark')}${HC} ${s}`,
      `${T('dark')} ${s}${HC}`,
      `${HC} ${s}${T('dark')}`,
      `${T('dark')} ${HC} ${s}`,
      `${HC} ${T('dark')} ${s}`,
      `${s} ${T('dark')}${HC}`,
      `${s}${HC} ${T('dark')}`,
      `${s}${T('dark')} ${HC}`,
      `${s} ${HC} ${T('dark')}`,
      `${s} ${T('dark')} ${HC}`,
    ],
  };
}

/** theme.css 본문. tokens.css 뒤에 import하면 덮는다.
 * 첫 줄 주석에 고른 값(trellis-theme {...})을 남겨 앱이 지금 테마를 읽을 수 있게 한다 */
export function themeCss(theme, { header = '', scope } = {}) {
  const choice = JSON.stringify({
    brand: theme.brand[500],
    neutral: theme.tone,
    input: theme.input,
    ...(theme.buttonText !== 'white' ? { buttonText: theme.buttonText } : {}),
  });
  const sel = scope ? scopedSelectors(scope) : MODE_SELECTORS;
  const block = (mode) =>
    `${sel[mode].join(',\n')} {\n${Object.entries(theme[mode])
      .map(([k, x]) => `  ${k}: ${x};`)
      .join('\n')}\n}`;
  const media = scope
    ? ''
    : `\n\n@media (prefers-contrast: more) {\n${['hcLight', 'hcDark']
        .map(
          (mode) =>
            `${PREFERS_CONTRAST_SELECTORS[mode].join(',\n')} {\n${Object.entries(theme[mode])
              .map(([k, x]) => `  ${k}: ${x};`)
              .join('\n')}\n}`,
        )
        .join('\n\n')}\n}`;
  return `/* trellis-theme ${choice}${header ? ` · ${header}` : ''} */\n${MODES.map(block).join('\n\n')}${media}\n`;
}

/** 컬러칩: 대비를 통과한 고르기 쉬운 조합. 서비스 테마의 출발점(D-58, 고객 값이라 토큰 승인 대상이 아니다) */
export const THEME_PRESETS = [
  { id: 'orange', label: '주황', brand: DEFAULT_BRAND, neutral: 'cool' },
  { id: 'blue', label: '파랑', brand: BASE_BLUE[500], neutral: 'cool' },
  { id: 'indigo', label: '남색', brand: '#4F5BD5', neutral: 'cool' },
  { id: 'violet', label: '보라', brand: '#7C5CFF', neutral: 'neutral' },
  { id: 'teal', label: '청록', brand: '#0F9A9A', neutral: 'cool' },
  { id: 'ocean', label: '바다', brand: '#0B7FC1', neutral: 'cool' },
  { id: 'forest', label: '숲', brand: '#2F8F5B', neutral: 'warm' },
  { id: 'ink', label: '먹', brand: '#3D4A5C', neutral: 'neutral' },
  { id: 'clay', label: '흙', brand: '#B4652A', neutral: 'warm' },
];

/** theme.css 첫 줄에서 고른 값을 읽는다. 없으면 null(기본 테마) */
export function readThemeChoice(css) {
  const m = /trellis-theme (\{[^}]*\})/.exec(css ?? '');
  if (!m) return null;
  try {
    const v = JSON.parse(m[1]);
    return {
      brand: v.input ?? v.brand,
      neutral: v.neutral,
      ...(v.buttonText ? { buttonText: v.buttonText } : {}),
    };
  } catch {
    return null;
  }
}

export const BASE_BRAND = brandScale(DEFAULT_BRAND).scale;
