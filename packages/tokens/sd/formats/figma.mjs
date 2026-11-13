// dist/figma/variables.json — docs/spec/tokens.md §6. 코드 → Figma 단방향(D-6)
import { BRAND_TOKENS, MODES, createTheme, cssVarOf } from '../../theme/index.mjs';
import { aliasPath } from '../transforms/name.mjs';

/** Company 컬렉션 모드 = 회사 색 프리셋(PR-29 검증 색, Figma Pro 컬렉션당 10모드 이내). 첫 모드가 기본 */
export const FIGMA_COMPANY_PRESETS = [
  ['주황(기본)', '#FE5C2B'],
  ['파랑', '#1F56E2'],
  ['초록', '#0B7A5C'],
  ['보라', '#6D28D9'],
  ['분홍', '#DB2777'],
  ['노랑', '#FFD400'],
  ['하늘', '#38BDF8'],
  ['거의 검정', '#111111'],
];
/** Semantic 모드 이름 ↔ 엔진 모드 */
const SEMANTIC_MODES = [
  ['Light', 'light'],
  ['Dark', 'dark'],
  ['HC Light', 'hcLight'],
  ['HC Dark', 'hcDark'],
];

// layout.*은 AppShell 치수를 Figma에서 묶으려고 올린다(D-118). z · breakpoint는 Figma에 대응이 없어 뺀다
const EXCLUDED_ROOTS = new Set(['z', 'breakpoint']);

/** Figma 변수 타입. 대응 타입이 없는 shadow·cubicBezier와 em 단위 치수는 null(제외, D-26) */
function figmaType(t) {
  if (t.$type === 'color') return 'COLOR';
  if (t.$type === 'dimension') return String(t.original.$value).endsWith('em') ? null : 'FLOAT';
  if (['number', 'fontWeight', 'duration'].includes(t.$type)) return 'FLOAT';
  if (['fontFamily', 'string'].includes(t.$type)) return 'STRING';
  return null;
}

const figmaValue = (t, type) => (type === 'FLOAT' ? Number(t.$value) : String(t.$value));
const name = (path) => path.join('/');

export function figma(b) {
  const primitives = b.native.primitive
    .filter((t) => !EXCLUDED_ROOTS.has(t.path[0]))
    .map((t) => [t, figmaType(t)])
    .filter(([, type]) => type)
    .map(([t, type]) => ({ name: name(t.path), type, values: { Value: figmaValue(t, type) } }));

  // Semantic 4모드(D-97): 라이트 · 다크 + 고대비 2(바뀌는 토큰만 담은 세트를 기본 모드 위에 얹는다)
  const byPath = (list) => new Map(list.map((t) => [name(t.path), t]));
  const dark = byPath(b.native.semanticDark);
  const hcLight = byPath(b.native.semanticHcLight);
  const hcDark = byPath(b.native.semanticHcDark);
  const alias = (t) => ({ alias: `Primitives/${name(aliasPath(t.original.$value))}` });
  // 회사 색 토큰은 Company 컬렉션의 같은 모드 변수를 가리킨다: 프레임에서 Company 모드만 바꾸면 회사 색이 바뀐다(D-101)
  const company = new Set(BRAND_TOKENS.map((p) => `color/${p.replace(/\./g, '/')}`));
  const semantic = b.native.semanticLight.map((t) => {
    const n = name(t.path);
    const pick = {
      Light: t,
      Dark: dark.get(n),
      'HC Light': hcLight.get(n) ?? t,
      'HC Dark': hcDark.get(n) ?? dark.get(n),
    };
    const values = Object.fromEntries(
      SEMANTIC_MODES.map(([mode, engine]) => [
        mode,
        company.has(n) ? { alias: `Company/${engine}/${n}` } : alias(pick[mode]),
      ]),
    );
    return { name: n, type: 'COLOR', values };
  });

  // Company: 회사 색 토큰 21개 × 엔진 모드 4 = 84 변수, 모드 = 프리셋. 값은 createTheme 결과(알파는 #RRGGBBAA)
  const themes = FIGMA_COMPANY_PRESETS.map(([label, hex]) => [label, createTheme({ brand: hex })]);
  const companyVars = MODES.flatMap((engine) =>
    BRAND_TOKENS.map((p) => ({
      name: `${engine}/color/${p.replace(/\./g, '/')}`,
      type: 'COLOR',
      values: Object.fromEntries(themes.map(([label, th]) => [label, th[engine][cssVarOf(p)]])),
    })),
  );

  const comfortable = new Map(b.native.densityComfortable.map((t) => [name(t.path), t]));
  const touch = new Map(b.native.densityTouch.map((t) => [name(t.path), t]));
  const density = b.native.densityCompact.map((t) => ({
    name: name(t.path),
    type: 'FLOAT',
    values: {
      Compact: Number(t.$value),
      Comfortable: Number(comfortable.get(name(t.path)).$value),
      Touch: Number(touch.get(name(t.path)).$value),
    },
  }));

  const typography = b.native.typography
    .filter((t) => t.path[2] !== 'letterSpacing')
    .map((t) => {
      const ref = aliasPath(t.original.$value);
      return {
        name: name(t.path),
        type: 'FLOAT',
        values: { Value: ref ? { alias: `Primitives/${name(ref)}` } : Number(t.$value) },
      };
    });

  // 종이(D-77): 모드 하나. 색은 Primitives alias, 크기 · 여백 · 글자는 px(96dpi), 그림자는 대응 타입이 없어 뺀다
  const paper = b.native.paper
    .map((t) => [t, figmaType(t)])
    .filter(([, type]) => type)
    .map(([t, type]) => {
      const ref = aliasPath(t.original.$value);
      return {
        name: name(t.path),
        type,
        values: { Value: ref ? { alias: `Primitives/${name(ref)}` } : figmaValue(t, type) },
      };
    });

  const family = b.native.primitive.find((t) => name(t.path) === 'font/family/sans').$value;
  const styles = [...new Set(b.native.typography.map((t) => t.path[1]))].map((style) => {
    const get = (prop) =>
      b.native.typography.find((t) => t.path[1] === style && t.path[2] === prop).$value;
    return {
      name: style,
      fontFamily: family,
      fontSize: get('fontSize'),
      lineHeight: get('lineHeight'),
      fontWeight: Number(get('fontWeight')),
      letterSpacing: Math.round(get('letterSpacing') * 100 * 100) / 100 + 0,
      letterSpacingUnit: 'PERCENT',
    };
  });

  const doc = {
    version: '0.1.0',
    collections: [
      { name: 'Primitives', modes: ['Value'], variables: primitives },
      {
        name: 'Company',
        modes: FIGMA_COMPANY_PRESETS.map(([label]) => label),
        variables: companyVars,
      },
      { name: 'Semantic', modes: SEMANTIC_MODES.map(([m]) => m), variables: semantic },
      { name: 'Density', modes: ['Compact', 'Comfortable', 'Touch'], variables: density },
      { name: 'Typography', modes: ['Value'], variables: typography },
      { name: 'Paper', modes: ['Value'], variables: paper },
    ],
    textStyles: styles,
  };
  return `${JSON.stringify(doc, null, 2)}\n`;
}
