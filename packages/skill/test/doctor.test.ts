// 서비스 점검(doctor)의 판단 함수 — 토큰 밖 값 · 테마 범위 · CSS 순서
import { describe, expect, it } from 'vitest';
// @ts-expect-error — mjs 모듈(타입 없음)
import {
  THEME_ALLOWED,
  cssOrderProblems,
  scanOffToken,
  scanOnClick,
  themeStaleness,
  themeViolations,
} from '../bin/trellis-skill.mjs';
import * as engine from '../../tokens/theme/index.mjs';

const { THEME_VARS, createTheme, themeCss } = engine;

describe('scanOffToken', () => {
  it('hex · px · font-family를 잡는다', () => {
    const hits = scanOffToken(
      ['.a { color: #1f56e2; }', '.b { padding: 12px; }', '.c { font-family: Arial; }'].join('\n'),
    );
    expect(hits.map((h: { kind: string }) => h.kind)).toEqual(['hex 색', 'px 값', 'font-family']);
  });
  it('토큰 · 0px · 주석 · trellis-ignore는 통과', () => {
    const text = [
      '.a { color: var(--tl-color-fg-primary); padding: var(--tl-space-12); }',
      '.b { margin: 0px; font-family: var(--tl-font-family-sans); }',
      '// #ffffff 주석',
      '.c { width: 10px; } /* trellis-ignore */',
      '@media (max-width: 1023px) {',
    ].join('\n');
    expect(scanOffToken(text)).toEqual([]);
  });
  it('JSX 인라인 스타일도 잡는다', () => {
    const hits = scanOffToken(`<div style={{ color: '#fff', fontFamily: 'Arial' }} />`);
    expect(hits.length).toBe(2);
  });

  const kinds = (text: string, file = '') =>
    scanOffToken(text, { file }).map((h: { kind: string }) => h.kind);

  it('primitive 색 변수(번호 · 사이드바 · 알파 · base · 색각)를 잡고 semantic은 통과(R-T04)', () => {
    for (const v of [
      '--tl-color-brand-500',
      '--tl-color-neutral-50',
      '--tl-color-shell-800',
      '--tl-color-alpha-brand-16',
      '--tl-color-alpha-black-40',
      '--tl-color-base-white',
      '--tl-color-cvd-dark-blue',
    ])
      expect(kinds(`.a { color: var(${v}); }`, 'a.css'), v).toEqual(['primitive 색 토큰']);
    for (const v of [
      '--tl-color-brand-default',
      '--tl-color-brand-on-brand',
      '--tl-color-chart-series-1',
      '--tl-color-avatar-1-bg',
      '--tl-color-nav-fg-muted',
      '--tl-space-12',
    ])
      expect(kinds(`.a { color: var(${v}); }`, 'a.css'), v).toEqual([]);
    expect(kinds(`const c = 'var(--tl-color-blue-600)';`, 'a.ts')).toEqual(['primitive 색 토큰']);
  });

  it('rgb() · hsl() 같은 색 함수를 잡고 color-mix 색 공간 이름 · label()은 통과', () => {
    expect(kinds('.a { background: rgb(0 0 0 / 40%); }', 'a.css')).toEqual(['색 함수']);
    expect(kinds('.a { color: hsla(210, 50%, 40%, 0.5); }', 'a.css')).toEqual(['색 함수']);
    expect(kinds(`const s = { color: 'oklch(0.6 0.1 30)' };`, 'a.tsx')).toEqual(['색 함수']);
    expect(
      kinds('.a { background: color-mix(in oklch, var(--tl-color-bg-surface), transparent); }'),
    ).toEqual([]);
    expect(kinds('const t = label(x);', 'a.ts')).toEqual([]);
  });

  it('서비스 CSS에서 Trellis 안쪽 부품(.tl-<이름>__<부품>)을 덮으면 잡는다', () => {
    expect(kinds('.my .tl-button__label { gap: var(--tl-space-4); }', 'a.css')).toEqual([
      'Trellis 안쪽 부품 덮기',
    ]);
    expect(kinds('.tl-data-grid__table { width: 100%; }', 'a.css')).toEqual([
      'Trellis 안쪽 부품 덮기',
    ]);
    // 블록 자기 클래스 · 컴포넌트 루트 · TS 안 문자열은 이 검사 밖
    expect(kinds('.tl-block-hrm__list { gap: var(--tl-space-4); }', 'a.css')).toEqual([]);
    expect(kinds('.my .tl-button { gap: var(--tl-space-4); }', 'a.css')).toEqual([]);
    expect(kinds(`const c = 'tl-button__label';`, 'a.tsx')).toEqual([]);
    expect(kinds('.my .tl-button__label { gap: 0; } /* trellis-ignore */', 'a.css')).toEqual([]);
  });

  it('규칙 위 주석에 inner-override:로 표시한 안쪽 덮기는 통과한다(복사한 블록의 표시)', () => {
    const marked = [
      '/* inner-override: DataGrid에 표 최소 폭 prop이 없다(보강 요청).',
      '   좁은 화면에서 표는 자기 상자 안에서 가로로 넘긴다 */',
      '.tl-block-inbox-grid .tl-data-grid__table {',
      '  min-width: calc(var(--tl-space-64) * 17);',
      '}',
    ].join('\n');
    expect(kinds(marked, 'a.css')).toEqual([]);
    // 표시는 바로 그 규칙에만 듣는다. 다음 규칙은 잡는다
    expect(kinds(`${marked}\n.b .tl-data-grid__table { width: 100%; }`, 'a.css')).toEqual([
      'Trellis 안쪽 부품 덮기',
    ]);
    // 미디어 쿼리 안의 표시한 규칙도 통과
    expect(
      kinds(
        '@media (max-width: 639px) {\n  /* inner-override: 이유 */\n  .a .tl-data-grid__table {\n    width: 100%;\n  }\n}',
        'a.css',
      ),
    ).toEqual([]);
  });

  it('Trellis 컴포넌트에 준 onClick을 잡는다(여러 줄 props 포함). 직접 그린 요소 · trellis-ignore는 통과', () => {
    const tsx = [
      "import { Button, IconButton as IB } from '@terracelab/trellis-react';",
      "import { ChartCard } from '@terracelab/trellis-react/charts';",
      'export function A() {',
      '  return (',
      '    <>',
      '      <Button',
      '        variant="primary"',
      '        onClick={() => go()}',
      '      >',
      '        저장',
      '      </Button>',
      '      <IB icon="x" label="닫기" onClick={close} />',
      '      <ChartCard title="t" onClick={() => {}} />',
      '      <button type="button" onClick={() => go()}>직접</button>',
      '      <Button onClick={go} /> {/* trellis-ignore */}',
      '      <Button onPress={go} />',
      '    </>',
      '  );',
      '}',
    ].join('\n');
    const hits = scanOnClick(tsx);
    expect(hits.map((h: { line: number; text: string }) => [h.line, h.text])).toEqual([
      [8, '<Button onClick>'],
      [12, '<IB onClick>'],
      [13, '<ChartCard onClick>'],
    ]);
    expect(kinds(tsx, 'A.tsx').filter((k: string) => k.startsWith('onClick'))).toHaveLength(3);
    expect(kinds(tsx, 'A.css')).toEqual([]);
    expect(scanOnClick('<Button onClick={go} />')).toEqual([]);
  });
});

describe('themeStaleness(R-T53)', () => {
  const css = themeCss(createTheme({ brand: '#0B7A5C', neutral: 'warm' }), {
    header: '생성물 — pnpm ds:theme --brand #0B7A5C --neutral warm',
  });
  it('지금 생성기와 같으면 same', () => {
    expect(themeStaleness(css, engine)).toEqual({ same: true, missing: [], changed: 0 });
  });
  it('고대비 @media 블록이 없는 예전 파일을 알린다', () => {
    const old = `${css.slice(0, css.indexOf('\n\n@media'))}\n`;
    const r = themeStaleness(old, engine);
    expect(r.same).toBe(false);
    expect(r.missing).toEqual(['@media (prefers-contrast: more)']);
  });
  it('값이 바뀌면 다른 줄 수를 센다', () => {
    const edited = css.replace(
      /--tl-color-brand-default: #[0-9A-F]{6};/,
      '--tl-color-brand-default: #000000;',
    );
    expect(themeStaleness(edited, engine)).toMatchObject({ same: false, missing: [] });
    expect(themeStaleness(edited, engine).changed).toBeGreaterThan(0);
  });
  it('고른 값 줄이 없으면(기본 테마) 보지 않는다', () => {
    expect(themeStaleness('/* 서비스 테마. 비어 있으면 Trellis 기본값 */\n', engine)).toBeNull();
  });
});

describe('themeViolations', () => {
  it('허용 목록이 테마 생성기의 THEME_VARS와 같다', () => {
    expect([...THEME_ALLOWED].sort()).toEqual([...THEME_VARS].sort());
  });
  it('번호 붙은 primitive는 막는다', () => {
    expect(themeViolations(':root { --tl-color-brand-600: #000; }')).toEqual([
      '--tl-color-brand-600',
    ]);
  });
  it('브랜드 · bg · fg · border만 허용', () => {
    const css = `:root { --tl-color-brand-default: #000; --tl-color-bg-canvas: #fff; --tl-color-finance-income: red; --tl-space-4: 2px; }`;
    expect(themeViolations(css)).toEqual(['--tl-color-finance-income', '--tl-space-4']);
  });
});

describe('cssOrderProblems', () => {
  const good = [
    "import '@terracelab/trellis-tokens/fonts.css';",
    "import '@terracelab/trellis-tokens/tokens.css';",
    "import './theme.css';",
    "import '@terracelab/trellis-react/styles.css';",
    "import '@terracelab/trellis-blocks/ui.css';",
  ].join('\n');
  it('바른 순서는 통과', () => expect(cssOrderProblems(good)).toEqual([]));
  it('theme이 tokens보다 앞이면 실패', () => {
    const bad = good
      .replace("import './theme.css';\n", '')
      .replace(
        "import '@terracelab/trellis-tokens/fonts.css';",
        "import './theme.css';\nimport '@terracelab/trellis-tokens/fonts.css';",
      );
    expect(cssOrderProblems(bad)).toContain('theme.css는 tokens.css 뒤에 와야 덮을 수 있다');
  });
  it('빠진 import를 알린다', () => {
    expect(cssOrderProblems("import '@terracelab/trellis-react/styles.css';").length).toBe(2);
  });
});
