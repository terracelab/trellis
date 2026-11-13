// dist/css/tokens.css — docs/spec/tokens.md §5 구조. semantic·typography의 alias는 var() 참조로 남긴다.
import { MODE_SELECTORS, PREFERS_CONTRAST_SELECTORS } from '../../theme/index.mjs';
import { aliasPath, cssVar } from '../transforms/name.mjs';
import { HEADER } from './_util.mjs';

const T = (v) => `[data-theme="${v}"]`;
const CVD = '[data-chart="cvd"]';
/** 색각 친화 차트: 고대비와 같은 방식(안쪽에 다른 테마를 걸어도 이어진다) */
const CVD_SELECTORS = {
  light: [CVD, `${CVD} ${T('light')}`],
  dark: [`${T('dark')}${CVD}`, `${CVD} ${T('dark')}`, `${T('dark')} ${CVD}`],
};

/** 글자 크기 모드(D-97, 식자재 ERP data-font-scale): 112 · 125. 20~24px 제목은 절반만, 28px 이상은 그대로 */
const FONT_SCALES = { 112: [1.125, 1.0625], 125: [1.25, 1.125] };
const px = (v) => `${Math.round(parseFloat(v) * 100) / 100}px`;
function scaledType(tokens, [full, half]) {
  const out = [];
  for (const t of tokens) {
    const prop = t.path.at(-1);
    if (prop !== 'fontSize' && prop !== 'lineHeight') continue;
    const size = parseFloat(
      tokens.find((x) => x.path.join('.') === [...t.path.slice(0, -1), 'fontSize'].join('.'))
        .$value,
    );
    const k = size >= 28 ? 1 : size >= 20 ? half : full;
    if (k !== 1) out.push(`--${t.name}: ${px(parseFloat(t.$value) * k)};`);
  }
  return out;
}
function scaledDensity(tokens, [full]) {
  return tokens
    .filter((t) =>
      ['density.body.fontSize', 'density.body.lineHeight', 'density.input.fontSize'].includes(
        t.path.join('.'),
      ),
    )
    .map((t) => `--${t.name}: ${px(parseFloat(t.$value) * full)};`);
}
function fontScaleBlocks(b) {
  const sm = parseInt(b.css.primitive.find((t) => t.path.join('.') === 'breakpoint.sm').$value, 10);
  const lines = (arr, pad = '  ') => arr.map((l) => `${pad}${l}`).join('\n');
  return Object.entries(FONT_SCALES).flatMap(([id, k]) => {
    const F = `[data-font-scale="${id}"]`;
    return [
      `${F},\n${F} [data-density="compact"] {\n  /* 글자 크기 ${id}% · compact */\n${lines([...scaledType(b.css.typography, k), ...scaledDensity(b.css.densityCompact, k)])}\n}`,
      `${F}[data-density="comfortable"],\n${F} [data-density="comfortable"] {\n  /* 글자 크기 ${id}% · comfortable */\n${lines(scaledDensity(b.css.densityComfortable, k))}\n}`,
      `${F}[data-density="touch"],\n${F} [data-density="touch"] {\n  /* 글자 크기 ${id}% · touch */\n${lines(scaledDensity(b.css.densityTouch, k))}\n}`,
      `@media (max-width: ${sm - 1}px) {\n  ${F} {\n    /* 글자 크기 ${id}% · touch(휴대폰, 루트만) */\n${lines(scaledDensity(b.css.densityTouch, k), '    ')}\n  }\n}`,
    ];
  });
}

/** 손가락 입력 기기(pointer: coarse): 입력 칸 글자를 touch 값(16px)으로. iOS는 16px 미만 입력 칸에 초점이 가면 화면을 키운다(D-97, 식자재 ERP) */
function coarseBlock(b) {
  const input = b.css.densityTouch.find((t) => t.path.join('.') === 'density.input.fontSize');
  return `@media (pointer: coarse) {\n  :root,\n  [data-density],\n  [data-font-scale] {\n    /* 손가락 입력: 입력 칸 글자 */\n    --${input.name}: ${input.$value};\n  }\n}`;
}

export function cssValue(token) {
  const ref = aliasPath(token.original.$value);
  return ref ? cssVar(ref) : String(token.$value);
}

function block(selector, tokens, comment) {
  const lines = tokens.map((t) => `  --${t.name}: ${cssValue(t)};`);
  return `${selector} {\n  /* ${comment} */\n${lines.join('\n')}\n}`;
}

/** 휴대폰(breakpoint.sm 미만)은 루트 밀도가 touch다. 안쪽 요소에 건 data-density는 그대로 남는다(D-61) */
function touchBlock(b) {
  const sm = parseInt(b.css.primitive.find((t) => t.path.join('.') === 'breakpoint.sm').$value, 10);
  const lines = b.css.densityTouch.map((t) => `    --${t.name}: ${cssValue(t)};`);
  return `@media (max-width: ${sm - 1}px) {\n  :root {\n    /* density · touch (휴대폰, 루트만) */\n${lines.join('\n')}\n  }\n}`;
}

export function tokensCss(b) {
  // 움직임 줄이기: duration.essential(상태를 알리는 회전)만 남기고 0으로
  const durations = b.css.primitive.filter(
    (t) => t.path[0] === 'duration' && t.path[1] !== 'essential',
  );
  return `${[
    `/* ${HEADER} */`,
    block(':root', b.css.primitive, 'primitives'),
    block(':root,\n[data-theme="light"]', b.css.semanticLight, 'semantic · light (기본)'),
    block('[data-theme="dark"]', b.css.semanticDark, 'semantic · dark'),
    // 브라우저 기본 스크롤바 · 입력 컨트롤 · 빈 캔버스가 테마를 따른다(R-37). 토큰이 아니라 테마 선택자의 속성이다
    `/* color-scheme · 테마마다(R-37) */\n:root,\n[data-theme="light"] {\n  color-scheme: light;\n}\n\n[data-theme="dark"] {\n  color-scheme: dark;\n}`,
    block(
      MODE_SELECTORS.hcLight.join(',\n'),
      b.css.semanticHcLight,
      'semantic · 고대비 라이트(data-contrast="high", D-97)',
    ),
    block(MODE_SELECTORS.hcDark.join(',\n'), b.css.semanticHcDark, 'semantic · 고대비 다크'),
    `@media (prefers-contrast: more) {\n${[
      block(
        PREFERS_CONTRAST_SELECTORS.hcLight.join(',\n'),
        b.css.semanticHcLight,
        '기기 설정 고대비 · 라이트(data-contrast 없을 때, R-33)',
      ),
      block(
        PREFERS_CONTRAST_SELECTORS.hcDark.join(',\n'),
        b.css.semanticHcDark,
        '기기 설정 고대비 · 다크',
      ),
    ]
      .join('\n\n')
      .replace(/^/gm, '  ')}\n}`,
    block(
      CVD_SELECTORS.light.join(',\n'),
      b.css.chartCvdLight,
      '차트 · 색각 친화(data-chart="cvd", D-97)',
    ),
    block(CVD_SELECTORS.dark.join(',\n'), b.css.chartCvdDark, '차트 · 색각 친화 · 다크'),
    block(':root,\n[data-density="compact"]', b.css.densityCompact, 'density · compact (기본)'),
    block('[data-density="comfortable"]', b.css.densityComfortable, 'density · comfortable'),
    block('[data-density="touch"]', b.css.densityTouch, 'density · touch'),
    touchBlock(b),
    block(':root', b.css.typography, 'typography'),
    ...fontScaleBlocks(b),
    coarseBlock(b),
    block(':root', b.css.paper, 'paper · 테마와 무관(D-77). 라이트 · 다크 같은 값'),
    `@media (prefers-reduced-motion: reduce) {\n  :root {\n${durations.map((t) => `    --${t.name}: 0ms;`).join('\n')}\n  }\n}`,
    // 앱 설정으로 켜는 움직임 줄이기(R-33): <html data-motion="reduce">. 기기 설정과 같은 값
    `/* motion · data-motion="reduce"(앱 설정) */\n[data-motion='reduce'] {\n${durations.map((t) => `  --${t.name}: 0ms;`).join('\n')}\n}`,
  ].join('\n\n')}\n`;
}

/** dist/css/fonts.css — 서체 파일은 패키지의 fonts/ 하나만 둔다(D-27). */
export function fontsCss(b) {
  const family = b.native.primitive.find((t) => t.path.join('.') === 'font.family.sans').$value;
  return `/* ${HEADER} */
@font-face {
  font-family: ${JSON.stringify(family)};
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../../fonts/PretendardVariable.woff2") format("woff2");
}
`;
}
