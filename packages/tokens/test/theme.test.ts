// 회사 테마 엔진(D-58 → D-97 · D-98 · D-99): 검증 색 대비 · 겹침 경고 · 바꾸는 변수 범위 · 범위 지정 CSS
import { differenceCiede2000 } from 'culori';
import { describe, expect, it } from 'vitest';
import {
  BASE_BRAND,
  BASE_GRAPHITE,
  BASE_NEUTRAL,
  BRAND_TOKENS,
  DEFAULT_BRAND,
  FAR_FROM_INPUT_DE,
  FIXED_COLORS,
  MODES,
  OVERLAP_DE,
  THEME_PRESETS,
  THEME_VARS,
  brandScale,
  contrast,
  createTheme,
  cssVarOf,
  deltaE,
  graphiteScale,
  neutralScale,
  readThemeChoice,
  scopedSelectors,
  themeCss,
} from '../theme/index.mjs';
import { MODE_SETS, resolver } from './helpers';

/** PR-29 검증 색(사람이 고른 10색) */
const VERIFY = {
  '#FE5C2B': '식자재 ERP 주황(기본)',
  '#1F56E2': 'PR-28 전 Trellis 파랑',
  '#0B7A5C': '초록',
  '#6D28D9': '보라',
  '#DB2777': '분홍',
  '#E11D2A': '빨강',
  '#FFD400': '노랑',
  '#38BDF8': '하늘',
  '#111111': '거의 검정',
  '#6B7280': '회색',
} as const;
/** 겹침 경고가 떠야 하는 색 → 겹치는 고정 색. 나머지 검증 색은 경고가 없어야 한다(D-99) */
const EXPECT_OVERLAP: Record<string, string[]> = {
  '#FE5C2B': ['danger', 'income'],
  '#1F56E2': ['expense', 'info', 'chart1'],
  '#0B7A5C': ['success'],
  '#E11D2A': ['danger', 'income'],
  '#FFD400': ['warning'],
};
const EXTREMES = [
  '#FFFF00',
  '#00FF00',
  '#FF0000',
  '#000000',
  '#FFFFFF',
  '#808080',
  '#FF69B4',
  '#00FFFF',
  '#FFA500',
  '#1E90FF',
  '#8B4513',
  '#F0E68C',
  '#2F4F4F',
  '#9400D3',
  '#DC143C',
  '#00CED1',
  '#ADFF2F',
  '#191970',
  '#E6E6FA',
  '#FF1493',
];
const TONES = ['cool', 'neutral', 'warm'] as const;
const failed = (t: ReturnType<typeof createTheme>) =>
  t.checks.filter((c) => !c.pass).map((c) => `${c.mode} ${c.name} ${c.ratio} < ${c.min}`);

describe('회사 테마 엔진 — 대비', () => {
  it.each(Object.entries(VERIFY))(
    '검증 색 %s(%s): 4모드 · 회색 톤 3 · 버튼 규칙 2 모두 못 넘는 쌍 0',
    (brand) => {
      for (const neutral of TONES)
        for (const buttonText of ['white', 'input'] as const)
          expect(
            failed(createTheme({ brand, neutral, buttonText })),
            `${neutral} ${buttonText}`,
          ).toEqual([]);
    },
  );

  it.each(TONES.flatMap((tone) => EXTREMES.map((brand) => ({ tone, brand }))))(
    '극단 색 $brand · $tone 도 대비를 전부 넘긴다',
    ({ tone, brand }) => {
      expect(failed(createTheme({ brand, neutral: tone }))).toEqual([]);
    },
  );

  it.each(THEME_PRESETS.map((p) => [p.id, p] as const))('컬러칩 %s 통과', (_, p) => {
    expect(createTheme(p).ok).toBe(true);
  });

  it('검사는 4모드마다 같은 목록이다(모드가 빠지지 않는다)', () => {
    const t = createTheme({});
    const by = (m: string) => t.checks.filter((c) => c.mode === m).map((c) => c.name);
    for (const m of MODES) expect(by(m)).toEqual(by('light'));
    expect(by('light').length).toBeGreaterThan(30);
  });
});

describe('회사 테마 엔진 — 규칙(D-97 정한 것)', () => {
  it('정한 것 1 A: 식자재 ERP 주황이면 주 버튼 바탕이 #C6370B ~ #CC3D0F 근처, 흰 글자 4.5 이상, 입력 색은 강조', () => {
    const t = createTheme({ brand: '#fe5c2b' });
    const bg = t.light['--tl-color-brand-default']!;
    expect(contrast('#FFFFFF', bg)).toBeGreaterThanOrEqual(4.5);
    expect(deltaE(bg, '#C6370B')).toBeLessThan(4);
    expect(deltaE(bg, '#CC3D0F')).toBeLessThan(4);
    expect(t.light['--tl-color-brand-accent']).toBe('#FE5C2B');
    expect(t.light['--tl-color-brand-on-brand']).toBe('#FFFFFF');
    // 다크 주 버튼은 라이트와 같다(D-89)
    expect(t.dark['--tl-color-brand-default']).toBe(bg);
  });

  it('정한 것 1 B: 입력 색 그대로 + 흰색 · 짙은 색 중 4.5를 넘는 쪽(주황이면 짙은 글자)', () => {
    const t = createTheme({ brand: '#FE5C2B', buttonText: 'input' });
    expect(t.light['--tl-color-brand-default']).toBe('#FE5C2B');
    expect(t.light['--tl-color-brand-on-brand']).not.toBe('#FFFFFF');
    expect(contrast(t.light['--tl-color-brand-on-brand']!, '#FE5C2B')).toBeGreaterThanOrEqual(4.5);
  });

  it('정한 것 2: 주황 사이드바는 식자재 ERP 코코아 #3A3330과 ΔE 2 이하(OKLab · CIEDE2000), 다크는 #2A2522', () => {
    const t = createTheme({ brand: '#FE5C2B' });
    const de00 = differenceCiede2000();
    for (const [mode, cocoa] of [
      ['light', '#3A3330'],
      ['dark', '#2A2522'],
    ] as const) {
      const nav = t[mode]['--tl-color-bg-nav']!;
      expect(deltaE(nav, cocoa), mode).toBeLessThanOrEqual(2);
      expect(de00(nav, cocoa), mode).toBeLessThanOrEqual(2);
    }
  });

  it('사이드바는 회사 색상(hue)을 따라가고 채도는 낮다', () => {
    for (const brand of ['#0B7A5C', '#6D28D9', '#1F56E2']) {
      const t = createTheme({ brand });
      const nav = t.light['--tl-color-bg-nav']!;
      expect(deltaE(nav, '#3A3330')).toBeGreaterThan(0.5);
      expect(contrast('#FFFFFF', nav)).toBeGreaterThan(10);
    }
    // 무채색 회사 색이면 사이드바도 무채색
    const gray = createTheme({ brand: '#111111' }).light['--tl-color-bg-nav']!;
    expect(gray.slice(1, 3)).toBe(gray.slice(3, 5));
  });

  it('회색 톤 cool은 식자재 ERP 회색 그대로, 다른 톤도 명도가 같아 본문 대비가 거의 같다', () => {
    expect(neutralScale('cool')).toEqual(BASE_NEUTRAL);
    expect(graphiteScale('cool')).toEqual(BASE_GRAPHITE);
    for (const tone of ['neutral', 'warm'] as const) {
      const n = neutralScale(tone);
      expect(
        Math.abs(contrast(n[600], '#FFFFFF') - contrast(BASE_NEUTRAL[600], '#FFFFFF')),
      ).toBeLessThan(0.3);
    }
  });

  it('500 = 입력 색(너무 밝으면 L만 내림), 600은 흰 글자 5:1을 넘는 가장 밝은 단계', () => {
    expect(brandScale('#FE5C2B').scale[500]).toBe('#FE5C2B');
    const s = brandScale('#FE5C2B');
    expect(s.anchored).toBe(true);
    expect(contrast('#FFFFFF', s.scale[600])).toBeGreaterThanOrEqual(5);
    expect(contrast('#FFFFFF', s.scale[600])).toBeLessThan(5.2);
    expect(brandScale('#FFD400').moved).toBe(true);
    expect(BASE_BRAND).toEqual(brandScale(DEFAULT_BRAND).scale);
  });

  it('같은 입력이면 같은 결과(결정적)', () => {
    for (const brand of Object.keys(VERIFY)) {
      const a = JSON.stringify(createTheme({ brand }));
      const b = JSON.stringify(createTheme({ brand: brand.toLowerCase() }));
      expect(a).toBe(b);
    }
  });
});

describe('회사 테마 엔진 — 겹침 경고(D-99)', () => {
  it.each(Object.entries(VERIFY))('%s(%s): 경고는 맞는 색에서만', (brand) => {
    const t = createTheme({ brand });
    expect(t.warnings.map((w) => w.id).sort(), brand).toEqual(
      [...(EXPECT_OVERLAP[brand] ?? [])].sort(),
    );
    for (const w of t.warnings) {
      expect(w.deltaE).toBeLessThan(OVERLAP_DE);
      expect(w.message).toContain(w.label);
    }
  });

  it('주황 경고는 색상을 돌린 대안을 준다. 입력 주황이 다크 위험 빨강과도 가까워 규칙 B는 대안이 아니다', () => {
    const [w] = createTheme({ brand: DEFAULT_BRAND }).warnings;
    expect(w?.buttonTextAlternative).toBeNull();
    expect(
      createTheme({ brand: DEFAULT_BRAND, buttonText: 'input' }).warnings.length,
    ).toBeGreaterThan(0);
    expect(w?.alternatives.length).toBeGreaterThan(0);
    for (const alt of w!.alternatives) expect(createTheme({ brand: alt }).warnings).toEqual([]);
  });

  it('아주 밝은 색(#FFD400)은 흰 글자 규칙이 회사 색을 지우면 입력 색 바탕 규칙을 제안한다(R-T52)', () => {
    const t = createTheme({ brand: '#FFD400' });
    expect(t.light['--tl-color-brand-default']).toBe('#856D00');
    expect(t.suggestions).toHaveLength(1);
    const [s] = t.suggestions;
    expect(s).toMatchObject({ buttonText: 'input', button: '#856D00', inputButton: '#F3CA00' });
    expect(s!.deltaE).toBeGreaterThanOrEqual(FAR_FROM_INPUT_DE);
    expect(s!.message).toContain('--button-text input');
    // 제안한 규칙은 대비 검사를 모두 넘고 겹침 경고를 늘리지 않는다
    const b = createTheme({ brand: '#FFD400', buttonText: 'input' });
    expect(failed(b)).toEqual([]);
    expect(b.warnings.map((w) => w.id)).toEqual(t.warnings.map((w) => w.id));
    expect(b.suggestions).toEqual([]);
  });

  it('입력 색이 주 버튼이나 강조에 남는 색에는 제안하지 않는다(기본 주황 · 검증 색 · 컬러칩)', () => {
    for (const brand of [DEFAULT_BRAND, '#1F56E2', '#0B7A5C', '#E11D2A', '#111111'])
      expect(createTheme({ brand }).suggestions, brand).toEqual([]);
    for (const p of THEME_PRESETS) expect(createTheme(p).suggestions, p.id).toEqual([]);
    // 제안이 있으면 언제나 그 규칙이 검사를 모두 넘는다
    for (const brand of [...Object.keys(VERIFY), ...EXTREMES]) {
      const t = createTheme({ brand });
      for (const s of t.suggestions)
        expect(createTheme({ brand, buttonText: s.buttonText }).ok, brand).toBe(true);
    }
  });

  it('고정 색 목록이 semantic 파일 값과 같다(status · finance · chart는 회사 색으로 바뀌지 않는다)', () => {
    const get = {
      light: resolver(MODE_SETS['light·compact']),
      dark: resolver(MODE_SETS['dark·comfortable']),
    };
    const prim = resolver(MODE_SETS['light·compact']);
    for (const fx of FIXED_COLORS)
      for (const mode of ['light', 'dark'] as const)
        expect(get[mode](`color.${fx.path}`), `${fx.id} ${mode}`).toBe(prim(`color.${fx[mode]}`));
  });
});

describe('회사 테마 엔진 — 바꾸는 변수 · CSS', () => {
  it('회사 색 토큰 21개 × 4모드, 허용 변수만(primitive · status · finance · approval · module · chart는 건드리지 않는다)', () => {
    for (const tone of TONES) {
      const t = createTheme({ brand: '#0B7A5C', neutral: tone });
      for (const mode of MODES) {
        const keys = Object.keys(t[mode]);
        for (const path of BRAND_TOKENS) expect(keys).toContain(cssVarOf(path));
        for (const k of keys) {
          expect(THEME_VARS).toContain(k);
          expect(k).not.toMatch(/-(\d+)$|finance|status|approval|module|chart/);
        }
      }
    }
  });

  it('cool 톤은 회색 변수를 덮지 않는다', () => {
    const t = createTheme({ brand: '#0B7A5C', neutral: 'cool' });
    expect(Object.keys(t.light).sort()).toEqual(BRAND_TOKENS.map(cssVarOf).sort());
  });

  it('theme.css는 tokens.css와 같은 선택자를 4모드로 쓴다', () => {
    const css = themeCss(createTheme({ brand: '#0B7A5C', neutral: 'warm' }));
    expect(css).toContain(':root,\n[data-theme="light"] {');
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain('[data-contrast="high"],');
    expect(css).toContain('[data-theme="dark"][data-contrast="high"],');
  });

  it('범위 지정 CSS는 모든 선택자가 범위를 거친다', () => {
    const scope = '[data-tl-theme="p1"]';
    const css = themeCss(createTheme({ brand: '#6D28D9' }), { scope });
    for (const list of Object.values(scopedSelectors(scope)))
      for (const sel of list) {
        expect(sel).toContain(scope);
        expect(css).toContain(sel);
      }
    expect(css).not.toMatch(/^:root/m);
  });

  it('theme.css 첫 줄에서 고른 값을 다시 읽는다', () => {
    const css = themeCss(createTheme({ brand: '#0b7a5c', neutral: 'warm' }), { header: '생성물' });
    expect(readThemeChoice(css)).toEqual({ brand: '#0B7A5C', neutral: 'warm' });
    const b = themeCss(createTheme({ brand: '#FE5C2B', buttonText: 'input' }));
    expect(readThemeChoice(b)).toEqual({ brand: '#FE5C2B', neutral: 'cool', buttonText: 'input' });
    expect(readThemeChoice('/* 비어 있음 */')).toBeNull();
  });
});
