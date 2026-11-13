// dist/native — themes(semantic 해석값), density, primitives, typography(RN 형식)
import { HEADER, js, treeOf, ts } from './_util.mjs';

/** 리프 값을 타입 이름으로 넓힌다(라이트·다크처럼 값이 다른 트리의 공통 타입) */
function widen(value) {
  if (Array.isArray(value)) return value.map(widen);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, widen(v)]));
  return { __type: typeof value };
}
function tsWide(value, indent = 0) {
  return ts(widen(value), indent).replace(/\{\n\s*readonly __type: "(\w+)";\n\s*\}/g, '$1');
}

export function native(b) {
  const value = (t) => t.$value;
  const themes = {
    light: treeOf(b.native.semanticLight, value),
    dark: treeOf(b.native.semanticDark, value),
  };
  const density = {
    compact: treeOf(b.native.densityCompact, value, 1),
    comfortable: treeOf(b.native.densityComfortable, value, 1),
    touch: treeOf(b.native.densityTouch, value, 1),
  };
  const primitives = treeOf(b.native.primitive, value);
  // 종이(D-77): 테마와 무관한 한 벌. 크기 · 여백은 mm, 글자는 pt를 CSS 기준 픽셀(96dpi)로 바꾼 값
  const paper = treeOf(b.native.paper, value, 1);
  const byStyle = treeOf(b.native.typography, value, 1);
  const typography = Object.fromEntries(
    Object.entries(byStyle).map(([name, s]) => [
      name,
      {
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        fontWeight: s.fontWeight,
        // RN letterSpacing은 pt 단위다: em × fontSize
        letterSpacing: Math.round(s.letterSpacing * s.fontSize * 100) / 100 + 0,
      },
    ]),
  );
  return {
    'native/index.js': `// ${HEADER}
export const themes = ${js(themes)};

export const density = ${js(density)};

/** 단위 없는 숫자. font.letterSpacing은 em 배율이다. */
export const primitives = ${js(primitives)};

export const typography = ${js(typography)};

/** 종이 서식(테마와 무관). 크기 · 여백은 mm × 96 / 25.4, 글자(type)는 pt × 96 / 72 */
export const paper = ${js(paper)};
`,
    'native/index.d.ts': `// ${HEADER}
export type Theme = ${tsWide(themes.light)};
export type ThemeName = 'light' | 'dark';
export declare const themes: { readonly light: Theme; readonly dark: Theme };

export type Density = ${tsWide(density.compact)};
export type DensityName = 'compact' | 'comfortable' | 'touch';
export declare const density: {
  readonly compact: Density;
  readonly comfortable: Density;
  readonly touch: Density;
};

/** 단위 없는 숫자. font.letterSpacing은 em 배율이다. */
export declare const primitives: ${ts(primitives)};

export interface TextStyle {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: '400' | '500' | '600' | '700';
  readonly letterSpacing: number;
}
export type TypographyName = ${Object.keys(typography)
      .map((n) => JSON.stringify(n))
      .join(' | ')};
export declare const typography: { readonly [K in TypographyName]: TextStyle };

/** 종이 서식(테마와 무관). 크기 · 여백은 mm × 96 / 25.4, 글자(type)는 pt × 96 / 72 */
export declare const paper: ${ts(paper)};
`,
  };
}
