import rule from '../src/rules/no-raw-color.js';
import { tester, tsx } from './tester.js';

tester.run(
  'no-raw-color',
  rule,
  tsx({
    valid: [
      // semantic 변수
      `const a = <div style={{ color: 'var(--tl-color-fg-primary)', background: 'var(--tl-color-bg-surface)' }} />;`,
      `const s = { borderColor: tokens.color.border.default };`,
      // 색 아닌 #: 앵커 · SVG 참조 · HTML 엔티티
      `const a = <a href="#feed">위로</a>;`,
      `const f = <path fill={\`url(#\${id})\`} />;`,
      `const e = '&#123;';`,
      // transparent · currentColor · none, 슬롯 이름
      `const g = <svg fill="none" stroke="currentColor"><rect fill="transparent" /></svg>;`,
      `const series = [{ label: '전년', color: 'compare' }, { label: '수입', color: 'income' }];`,
      // 색 속성이 아닌 자리의 영단어, 주석
      `const hues = ['red', 'green']; // #fff 주석은 보지 않는다`,
      // var() 안의 이름은 색 이름이 아니다
      `const b = { border: '1px solid var(--tl-color-red-500)' };`,
    ],
    invalid: [
      {
        code: `const a = <div style={{ color: '#fff' }} />;`,
        errors: [{ messageId: 'raw', data: { value: '#fff' } }],
      },
      {
        code: `const s = { background: '#1F56E2CC' };`,
        errors: [{ messageId: 'raw', data: { value: '#1F56E2CC' } }],
      },
      {
        code: 'const html = `<span style="background: rgba(0, 0, 0, 0.4); color: hsl(220 10% 20%)">x</span>`;',
        errors: [
          { messageId: 'raw', data: { value: 'rgba(' } },
          { messageId: 'raw', data: { value: 'hsl(' } },
        ],
      },
      {
        code: `const c = \`oklch(0.7 0.1 \${hue})\`;`,
        errors: [{ messageId: 'raw', data: { value: 'oklch(' } }],
      },
      {
        code: `const g = <svg><circle fill="red" /></svg>;`,
        errors: [{ messageId: 'named', data: { value: 'red' } }],
      },
      {
        code: `el.style.borderColor = 'white';`,
        errors: [{ messageId: 'named', data: { value: 'white' } }],
      },
      {
        code: 'const t = `<div style="border: 1px solid black">x</div>`;',
        errors: [{ messageId: 'named', data: { value: 'black' } }],
      },
      {
        // 위치: 여러 줄 템플릿에서도 그 줄을 가리킨다
        code: 'const t = `\n<b>x</b>\n<i style="color: #abcdef">y</i>`;',
        errors: [{ messageId: 'raw', line: 3, column: 18 }],
      },
    ],
  }),
);
