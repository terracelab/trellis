import rule from '../src/rules/no-px.js';
import { tester, tsx } from './tester.js';

tester.run(
  'no-px',
  rule,
  tsx({
    valid: [
      // 토큰 변수 · calc 안의 변수
      `const a = <div style={{ padding: 'var(--tl-space-8)', minWidth: \`calc(var(--tl-space-64) * \${n})\` }} />;`,
      // 0px · 단위 없는 숫자 속성 · 0
      `const b = <div style={{ margin: '0px', flex: 1, opacity: 0.5, zIndex: 10, lineHeight: 1.5, padding: 0 }} />;`,
      // 식에 px를 붙이는 단위 변환(리터럴 숫자가 없다)
      `const c = <div style={{ ['--tl-chart-card-height' as string]: \`\${height}px\` }} />;`,
      // 사람이 읽는 문구 · 주석
      `const label = '4px 그리드'; // 16px 주석`,
      // 승인된 미디어 쿼리: breakpoint 값을 끼운다
      'const WIDE = `(min-width: ${primitives.breakpoint.sm})`;',
      // 스타일 객체가 아닌 차트 기하 값
      `const m = <Chart margin={{ top: 12, right: 12 }} />;`,
      `const io = { rootMargin: '-40% 0px -50% 0px' };`,
    ],
    invalid: [
      {
        code: `const a = <div style={{ padding: '4px' }} />;`,
        errors: [{ messageId: 'px', data: { value: '4px' } }],
      },
      {
        code: `const a = <div style={{ width: 120, marginTop: -8 }} />;`,
        errors: [
          { messageId: 'number', data: { prop: 'width', value: '120' } },
          { messageId: 'number', data: { prop: 'marginTop', value: '-8' } },
        ],
      },
      {
        code: `const s: CSSProperties = { gap: 12 };`,
        errors: [{ messageId: 'number', data: { prop: 'gap', value: '12' } }],
      },
      {
        code: 'const html = `<div style="margin: 8px 0; width: calc(100% - 2px)">x</div>`;',
        errors: [
          { messageId: 'px', data: { value: '8px' } },
          { messageId: 'px', data: { value: '2px' } },
        ],
      },
      {
        // 문자열 전체가 CSS 값이면 자리와 상관없이 잡는다
        code: `const size = { inset: '12px' }; const cls = 'w-[16px]';`,
        errors: [
          { messageId: 'px', data: { value: '12px' } },
          { messageId: 'px', data: { value: '16px' } },
        ],
      },
      {
        code: `el.style.height = '24px'; el.style.setProperty('--x', '2px');`,
        errors: [
          { messageId: 'px', data: { value: '24px' } },
          { messageId: 'px', data: { value: '2px' } },
        ],
      },
      {
        code: `const q = window.matchMedia('(max-width: 640px)');`,
        errors: [{ messageId: 'media', data: { value: '640px' } }],
      },
      {
        code: `const t = <Tooltip contentStyle={{ fontSize: 12 }} />;`,
        errors: [{ messageId: 'number', data: { prop: 'fontSize', value: '12' } }],
      },
    ],
  }),
);
