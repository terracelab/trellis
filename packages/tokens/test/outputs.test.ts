import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { build } from '../sd.config.mjs';

const EXPECTED = [
  'css/fonts.css',
  'css/tokens.css',
  'docs/tokens.md',
  'figma/variables.json',
  'json/flat.json',
  'json/modules.json',
  'native/index.d.ts',
  'native/index.js',
  'tailwind/theme.css',
  'web/index.d.ts',
  'web/index.js',
];

const out = mkdtempSync(join(tmpdir(), 'trellis-tokens-'));
let written: string[] = [];
const read = (file: string) => readFileSync(join(out, file), 'utf8');

beforeAll(async () => {
  written = await build({ outDir: out });
});
afterAll(() => rmSync(out, { recursive: true, force: true }));

describe('outputs', () => {
  it('tokens.md §4의 산출물 8종(+ 모듈 레지스트리)', () => {
    expect(written).toEqual(EXPECTED);
  });

  it.each(EXPECTED)('%s = 스냅샷', async (file) => {
    await expect(read(file)).toMatchFileSnapshot(`./__snapshots__/outputs/${file}`);
  });

  it('tokens.css: §5 블록 순서, semantic은 var() 참조만', () => {
    const css = read('css/tokens.css');
    const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [...bare.matchAll(/^([^\s{}][^{}]*)\{/gm)].map((m) =>
      m[1]!.trim().replace(/\s+/g, ' '),
    );
    expect(selectors).toEqual([
      ':root',
      ':root, [data-theme="light"]',
      '[data-theme="dark"]',
      // color-scheme(R-37): 브라우저 기본 스크롤바 · 컨트롤이 테마를 따른다
      ':root, [data-theme="light"]',
      '[data-theme="dark"]',
      // 고대비 · 색각 친화 차트(D-97): 안쪽에 다른 테마를 걸어도 이어진다
      '[data-contrast="high"], [data-contrast="high"] [data-theme="light"]',
      '[data-theme="dark"][data-contrast="high"], [data-contrast="high"] [data-theme="dark"], [data-theme="dark"] [data-contrast="high"]',
      // 기기 설정 고대비(R-33): data-contrast가 없을 때만
      '@media (prefers-contrast: more)',
      '[data-chart="cvd"], [data-chart="cvd"] [data-theme="light"]',
      '[data-theme="dark"][data-chart="cvd"], [data-chart="cvd"] [data-theme="dark"], [data-theme="dark"] [data-chart="cvd"]',
      ':root, [data-density="compact"]',
      '[data-density="comfortable"]',
      '[data-density="touch"]',
      '@media (max-width: 639px)',
      ':root',
      // 글자 크기 112 · 125(D-97): compact · comfortable · touch · 휴대폰
      ...(['112', '125'] as const).flatMap((k) => [
        `[data-font-scale="${k}"], [data-font-scale="${k}"] [data-density="compact"]`,
        `[data-font-scale="${k}"][data-density="comfortable"], [data-font-scale="${k}"] [data-density="comfortable"]`,
        `[data-font-scale="${k}"][data-density="touch"], [data-font-scale="${k}"] [data-density="touch"]`,
        '@media (max-width: 639px)',
      ]),
      // 손가락 입력: 입력 칸 글자 16(D-97)
      '@media (pointer: coarse)',
      ':root',
      '@media (prefers-reduced-motion: reduce)',
      "[data-motion='reduce']",
    ]);
    // 종이(D-77): 테마 블록 밖 :root 한 곳. 색은 primitive var(), 크기 · 여백은 mm
    const paper = css.split('/* paper · ')[1]!.split('}')[0]!;
    expect(paper).toContain('--tl-paper-bg: var(--tl-color-base-white);');
    expect(paper).toContain('--tl-paper-size-a4-width: 210mm;');
    // 종이 글자(R-35): pt 값 그대로. type.*를 가리키지 않아 앱이 type.*를 덮어써도 종이는 그대로다
    expect(paper).toContain('--tl-paper-type-body-font-size: 10.5pt;');
    expect(paper).not.toContain('var(--tl-type-');
    expect(css.split('[data-theme="dark"]')[1]!.split('}')[0]).not.toContain('--tl-paper-');
    // color-scheme(R-37): 라이트 · 다크 선택자에 한 번씩
    expect(css).toContain(':root,\n[data-theme="light"] {\n  color-scheme: light;\n}');
    expect(css).toContain('[data-theme="dark"] {\n  color-scheme: dark;\n}');
    const semantic = css
      .split('/* semantic · light (기본) */')[1]!
      .split(':root,\n[data-density')[0]!;
    const values = [...semantic.matchAll(/--tl-[a-z0-9-]+: ([^;]+);/g)].map((m) => m[1]!);
    // semantic 122종(115 + PR-28 brand.tint · brand.accent · bg.rowSelected · fg.strong · border.focusStrong · border.hover · nav.sub, D-97) × 라이트·다크
    // + 고대비 라이트 · 다크 각 43(회사 색 21 · 회색 톤 9 · 상태 · 금융 · 결재 글자 · 차트 13) + 색각 친화 각 6
    expect(values.length).toBe(122 * 2 + 43 * 2 * 2 + 6 * 2);
    for (const v of values) expect(v).toMatch(/^var\(--tl-color-[a-z0-9-]+\)$/);
  });

  it('d.ts가 strict 컴파일을 통과한다', () => {
    const files = ['web/index.d.ts', 'native/index.d.ts'].map((f) => join(out, f));
    const program = ts.createProgram(files, {
      noEmit: true,
      strict: true,
      types: [],
      skipLibCheck: false,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    expect(diagnostics).toEqual([]);
  });

  it('web·native JS 모듈이 규격의 사용 예대로 동작한다', async () => {
    const web = await import(pathToFileURL(join(out, 'web/index.js')).href);
    expect(web.tokens.color.bg.surface).toBe('var(--tl-color-bg-surface)');
    expect(web.tokens.space[16]).toBe('var(--tl-space-16)');
    // 회사 색 기본 = 식자재 ERP 주황(D-98), 고정 파랑은 blue(PR-28 전 brand 값)
    expect(web.primitives.color.brand[500]).toBe('#FE5C2B');
    expect(web.primitives.color.blue[500]).toBe('#2F6BFF');
    expect(web.tokenNames).toContain('color.finance.income');
    expect(web.tokens.paper.bg).toBe('var(--tl-paper-bg)');
    expect(web.tokens.paper.size.a4.width).toBe('var(--tl-paper-size-a4-width)');
    expect(web.tokenNames).toContain('paper.margin.md');
    expect(web.tokens.paper.type.body.fontSize).toBe('var(--tl-paper-type-body-font-size)');

    const native = await import(pathToFileURL(join(out, 'native/index.js')).href);
    expect(Object.keys(native.themes)).toEqual(['light', 'dark']);
    expect(native.themes.light.color.bg.surface).toBe('#FFFFFF');
    // 컨트롤 xs 26 · sm 30 · md 36 · lg 42 · xl 48, touch 44 · 48 · 56(D-97 정한 것 5)
    expect(native.density.compact.control.height.md).toBe(36);
    expect(native.density.comfortable.control.height.xl).toBe(48);
    expect(native.density.touch.control.height.lg).toBe(56);
    expect(native.typography.body).toEqual({
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '400',
      letterSpacing: 0,
    });
    // 종이: 테마와 무관한 한 벌, mm → CSS 기준 픽셀(96dpi)
    expect(native.paper.bg).toBe('#FFFFFF');
    expect(native.paper.size.a4).toEqual({ width: 793.7, height: 1122.52 });
    expect(native.paper.margin.md).toBe(68.03);
    // 종이 글자: pt → CSS 기준 픽셀(× 96 / 72). 화면 type.*와 같은 크기에서 시작한다(가안)
    expect(native.paper.type.body).toEqual({ fontSize: 14, lineHeight: 20 });
    expect(native.paper.type.label).toEqual({ fontSize: 13, lineHeight: 18 });
    expect(native.primitives.shadow.sm).toMatchObject({
      shadowColor: '#000000',
      elevation: expect.any(Number),
    });
  });

  it('figma: 컬렉션 6개, z·breakpoint 제외 · layout 9개 포함(D-118), semantic · paper 색은 Primitives(회사 색은 Company) alias', () => {
    const doc = JSON.parse(read('figma/variables.json')) as {
      collections: {
        name: string;
        modes: string[];
        variables: { name: string; values: Record<string, unknown> }[];
      }[];
      textStyles: unknown[];
    };
    expect(doc.collections.map((c) => [c.name, c.modes])).toEqual([
      ['Primitives', ['Value']],
      // Company 모드 = 회사 색 프리셋 8개(D-101). Semantic의 회사 색 토큰 21개가 가리킨다
      ['Company', ['주황(기본)', '파랑', '초록', '보라', '분홍', '노랑', '하늘', '거의 검정']],
      ['Semantic', ['Light', 'Dark', 'HC Light', 'HC Dark']],
      ['Density', ['Compact', 'Comfortable', 'Touch']],
      ['Typography', ['Value']],
      ['Paper', ['Value']],
    ]);
    const names = doc.collections.flatMap((c) => c.variables.map((v) => v.name));
    expect(names.filter((n) => /^(z|breakpoint)\//.test(n))).toEqual([]);
    expect(names.filter((n) => n.startsWith('layout/')).length).toBe(9);
    const primitiveNames = new Set(
      doc.collections[0]!.variables.map((v) => `Primitives/${v.name}`),
    );
    const companyNames = new Set(doc.collections[1]!.variables.map((v) => `Company/${v.name}`));
    expect(companyNames.size).toBe(21 * 4);
    let toCompany = 0;
    for (const v of doc.collections[2]!.variables) {
      for (const value of Object.values(v.values)) {
        const a = (value as { alias: string }).alias;
        if (a.startsWith('Company/')) toCompany += 1;
        expect(a.startsWith('Company/') ? companyNames : primitiveNames).toContain(a);
      }
    }
    expect(toCompany).toBe(21 * 4);
    // 기본 프리셋(주황) Company 값 = tokens.css 기본 테마
    const brand = doc.collections[1]!.variables.find(
      (v) => v.name === 'light/color/brand/default',
    )!;
    expect(brand.values['주황(기본)']).toBe('#CC3A00');
    const paper = doc.collections[5]!.variables;
    expect(paper.map((v) => v.name)).toContain('paper/size/a4/width');
    expect(paper.find((v) => v.name === 'paper/size/a4/width')!.values['Value']).toBe(793.7);
    expect(paper.find((v) => v.name === 'paper/type/body/fontSize')!.values['Value']).toBe(14);
    for (const v of paper.filter((x) => typeof x.values['Value'] === 'object'))
      expect(primitiveNames).toContain((v.values['Value'] as { alias: string }).alias);
    // 글자 12종(display · h1~h4 · body · label · caption · micro · mono · amount · amountLg, D-97)
    expect(doc.textStyles).toHaveLength(12);
  });
});
