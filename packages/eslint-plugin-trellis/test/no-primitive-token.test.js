import rule from '../src/rules/no-primitive-token.js';
import { tester, tsx } from './tester.js';

tester.run(
  'no-primitive-token',
  rule,
  tsx({
    valid: [
      // semantic CSS 변수(brand-default는 semantic)
      `const a = <div style={{ color: 'var(--tl-color-fg-primary)', background: 'var(--tl-color-brand-default)' }} />;`,
      // 동적 semantic 이름
      'const b = `var(--tl-color-module-${group}-default)`; const c = `var(--tl-color-chart-series-${n})`;',
      'const s = `var(--tl-color-brand-${state})`;',
      // primitives.breakpoint는 허용(matchMedia)
      `import { primitives } from '@terracelab/trellis-tokens';\nconst WIDE = \`(min-width: \${primitives.breakpoint.sm})\`;`,
      // semantic TS 토큰
      `import { tokens } from '@terracelab/trellis-tokens';\nconst x = tokens.color.brand.default; const y = tokens.color.status.danger.default;`,
      // tokens 패키지가 아닌 같은 이름 객체
      `const primitives = { color: 1 }; const z = primitives.color;`,
    ],
    invalid: [
      // PR-28 hue(D-97): 고정 파랑 · 다크 회색 · 사이드바 톤 · 색각 친화 원색
      {
        code: `const p = <div style={{ color: 'var(--tl-color-blue-600)', background: 'var(--tl-color-graphite-900)' }} />;`,
        errors: [
          { messageId: 'cssVar', data: { value: '--tl-color-blue-600' } },
          { messageId: 'cssVar', data: { value: '--tl-color-graphite-900' } },
        ],
      },
      {
        code: `const q = <div style={{ background: 'var(--tl-color-shell-800)', color: 'var(--tl-color-cvd-vermilion)' }} />;`,
        errors: [
          { messageId: 'cssVar', data: { value: '--tl-color-shell-800' } },
          { messageId: 'cssVar', data: { value: '--tl-color-cvd-vermilion' } },
        ],
      },
      {
        code: `const a = <div style={{ color: 'var(--tl-color-neutral-700)' }} />;`,
        errors: [{ messageId: 'cssVar', data: { value: '--tl-color-neutral-700' } }],
      },
      {
        code: 'const b = `<i style="background: var(--tl-color-brand-500); color: var(--tl-color-base-white)">x</i>`;',
        errors: [
          { messageId: 'cssVar', data: { value: '--tl-color-brand-500' } },
          { messageId: 'cssVar', data: { value: '--tl-color-base-white' } },
        ],
      },
      {
        code: `const c = 'var(--tl-color-alpha-black-48)'; const d = \`var(--tl-color-\${hue}-500)\`;`,
        errors: [
          { messageId: 'cssVar', data: { value: '--tl-color-alpha-black-48' } },
          { messageId: 'cssVar', data: { value: '--tl-color-${…}-500' } },
        ],
      },
      {
        code: `import { tokens } from '@terracelab/trellis-tokens';\nconst x = tokens.color.neutral[700]; const y = tokens.color.brand['500'];`,
        errors: [
          { messageId: 'member', data: { value: 'tokens.color.neutral[700]' } },
          { messageId: 'member', data: { value: "tokens.color.brand['500']" } },
        ],
      },
      {
        code: `import { primitives } from '@terracelab/trellis-tokens';\nconst x = primitives.color.brand[500]; const { space } = primitives;`,
        errors: [
          { messageId: 'primitives', data: { value: 'color' } },
          { messageId: 'primitives', data: { value: '*' } },
        ],
      },
      {
        code: `import * as T from '@terracelab/trellis-tokens';\nconst x = T.primitives.color.red[500];`,
        errors: [{ messageId: 'primitives', data: { value: 'color' } }],
      },
    ],
  }),
);
