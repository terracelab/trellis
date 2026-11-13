import rule from '../src/rules/no-font-family.js';
import { tester, tsx } from './tester.js';

tester.run(
  'no-font-family',
  rule,
  tsx({
    valid: [
      `const a = <div style={{ fontFamily: 'var(--tl-font-family-mono)' }} />;`,
      `const b = <div style={{ fontFamily: tokens.font.family.sans, font: 'inherit' }} />;`,
      'const c = `<code style="font-family: var(--tl-font-family-mono)">x</code>`;',
      'const d = `font-family: ${tokens.font.family.sans};`;',
      // 스타일이 아닌 자리의 font
      `const meta = { font: 'Pretendard' };`,
    ],
    invalid: [
      {
        code: `const a = <div style={{ fontFamily: 'Arial, sans-serif' }} />;`,
        errors: [{ messageId: 'family', data: { value: 'Arial, sans-serif' } }],
      },
      {
        code: `const s = { fontFamily: '"Pretendard Variable"' };`,
        errors: [{ messageId: 'family' }],
      },
      {
        code: 'const html = `<p style="color: var(--tl-color-fg-primary); font-family: Menlo">x</p>`;',
        errors: [{ messageId: 'family', data: { value: 'Menlo' } }],
      },
      {
        code: `const t = <text fontFamily="monospace">1</text>;`,
        errors: [{ messageId: 'family', data: { value: 'monospace' } }],
      },
      {
        code: `el.style.fontFamily = 'serif';`,
        errors: [{ messageId: 'family', data: { value: 'serif' } }],
      },
      {
        code: `const a = <div style={{ font: '600 1rem Inter' }} />;`,
        errors: [{ messageId: 'family', data: { value: '600 1rem Inter' } }],
      },
    ],
  }),
);
