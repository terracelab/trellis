// dist/web — tokens(CSS 변수 참조 문자열), primitives(raw 값), tokenNames
import { cssVar } from '../transforms/name.mjs';
import { HEADER, js, pathOf, treeOf, ts } from './_util.mjs';

export function web(b) {
  const all = [
    ...b.css.primitive,
    ...b.css.semanticLight,
    ...b.css.densityCompact,
    ...b.css.typography,
    ...b.css.paper,
  ];
  const tokens = treeOf(all, (t) => cssVar(t.path));
  const primitives = treeOf(b.css.primitive, (t) => t.$value);
  const names = all.map(pathOf);
  const list = `[\n${names.map((n) => `  ${JSON.stringify(n)},`).join('\n')}\n]`;
  return {
    'web/index.js': `// ${HEADER}
/** CSS 변수 참조. tokens.color.bg.surface === 'var(--tl-color-bg-surface)' */
export const tokens = ${js(tokens)};

/** primitive raw 값(CSS 표기). 컴포넌트 코드에서는 쓰지 않는다. */
export const primitives = ${js(primitives)};

/** 모든 토큰 경로 */
export const tokenNames = ${list};
`,
    'web/index.d.ts': `// ${HEADER}
/** CSS 변수 참조. tokens.color.bg.surface === 'var(--tl-color-bg-surface)' */
export declare const tokens: ${ts(tokens)};

/** primitive raw 값(CSS 표기). 컴포넌트 코드에서는 쓰지 않는다. */
export declare const primitives: ${ts(primitives)};

export type TokenName =
${names.map((n) => `  | ${JSON.stringify(n)}`).join('\n')};

/** 모든 토큰 경로 */
export declare const tokenNames: readonly TokenName[];
`,
  };
}
