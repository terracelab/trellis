// dist/tailwind/theme.css — 소비 앱용 Tailwind v4 preset. 값은 전부 --tl-* 변수를 가리킨다.
import { cssName, kebab } from '../transforms/name.mjs';
import { HEADER } from './_util.mjs';

export function tailwind(b) {
  const v = (t) => `var(--${cssName(t.path)})`;
  const lines = [];
  const section = (comment, entries) => {
    lines.push(`  /* ${comment} */`, ...entries.map(([k, val]) => `  ${k}: ${val};`));
  };
  section(
    'color.* → --color-* (semantic만)',
    b.css.semanticLight.map((t) => [`--color-${t.path.slice(1).map(kebab).join('-')}`, v(t)]),
  );
  section(
    'paper.* 색 → --color-paper-* (종이 서식, 테마와 무관)',
    b.css.paper
      .filter((t) => t.$type === 'color')
      .map((t) => [`--color-${t.path.map(kebab).join('-')}`, v(t)]),
  );
  const prim = (root) => b.css.primitive.filter((t) => t.path[0] === root);
  section(
    'space.* → --spacing-*',
    prim('space').map((t) => [`--spacing-${t.path[1]}`, v(t)]),
  );
  section(
    'radius.* → --radius-*',
    prim('radius').map((t) => [`--radius-${t.path[1]}`, v(t)]),
  );
  section(
    'shadow.* → --shadow-*',
    prim('shadow').map((t) => [`--shadow-${t.path[1]}`, v(t)]),
  );
  section(
    'easing.* → --ease-*',
    prim('easing').map((t) => [`--ease-${t.path[1]}`, v(t)]),
  );
  section(
    'font.family.* → --font-*',
    prim('font')
      .filter((t) => t.path[1] === 'family')
      .map((t) => [`--font-${t.path[2]}`, v(t)]),
  );
  const text = [];
  const styles = [...new Set(b.css.typography.map((t) => t.path[1]))];
  for (const style of styles) {
    const get = (prop) => b.css.typography.find((t) => t.path[1] === style && t.path[2] === prop);
    const name = kebab(style);
    text.push([`--text-${name}`, v(get('fontSize'))]);
    text.push([`--text-${name}--line-height`, v(get('lineHeight'))]);
    text.push([`--text-${name}--font-weight`, v(get('fontWeight'))]);
    text.push([`--text-${name}--letter-spacing`, v(get('letterSpacing'))]);
  }
  section('type.*.fontSize → --text-* (+ line-height·font-weight·letter-spacing)', text);
  const bp = prim('breakpoint').map((t) => `  --breakpoint-${t.path[1]}: ${t.$value};`);
  return `/* ${HEADER} */
/* 사용: @import "tailwindcss"; @import "@terracelab/trellis-tokens/tokens.css"; @import "@terracelab/trellis-tokens/tailwind"; */
@theme inline {
${lines.join('\n')}
}

/* 미디어 쿼리는 var()를 못 쓰므로 breakpoint만 값으로 둔다 */
@theme {
${bp.join('\n')}
}
`;
}
