// docs/spec/tokens.md §7 contrast. 실패하면 값을 고치지 말고 docs/plan/notes/contrast-<date>.md에 제안서를 쓴다.
import { differenceEuclidean, wcagContrast } from 'culori';
import { describe, expect, it } from 'vitest';
import { MODE_SETS, OVERRIDE_SETS, composite, resolver } from './helpers';

const MODES = {
  light: resolver(MODE_SETS['light·compact']),
  dark: resolver(MODE_SETS['dark·comfortable']),
  // 고대비(D-97): 글자 7:1 · 선 4.5:1로 기준을 올린다(아래 HC)
  hcLight: resolver(MODE_SETS['light·compact'], [OVERRIDE_SETS.hcLight.file]),
  hcDark: resolver(MODE_SETS['dark·comfortable'], [OVERRIDE_SETS.hcDark.file]),
} as const;
type Mode = keyof typeof MODES;
const BASE_MODES: Mode[] = ['light', 'dark'];

const S = 'color.bg.surface';
const C = 'color.bg.canvas';
/** 고대비에서 올리는 기준: 글자 4.5 → 7, 그래픽 3 → 4.5. 상태 · 결재 · 아바타 · 본문(12)은 그대로 */
const HC: Record<number, number> = { 4.5: 7, 3: 4.5 };
const KEEP_IN_HC = /status|approval|avatar|fg\.tertiary|fg\.primary|fg\.strong|onBrand/;
const PAIRS: [fg: string, bg: string, min: number][] = [
  ['color.fg.strong', S, 12],
  ['color.fg.primary', S, 12],
  ['color.fg.secondary', S, 4.5],
  ['color.fg.tertiary', S, 4.5],
  // 회색 canvas(D-97 정한 것 3) · 팝업 면 위 글자
  ['color.fg.secondary', C, 4.5],
  ['color.fg.tertiary', C, 4.5],
  ['color.fg.secondary', 'color.bg.elevated', 4.5],
  ['color.fg.tertiary', 'color.bg.elevated', 4.5],
  ['color.fg.link', S, 4.5],
  // 회사 색(D-97): 링크는 바탕 · 선택 바탕 · 선택 행 위에서도, 본문은 옅은 강조 면 위에서도
  ['color.fg.link', C, 4.5],
  ['color.fg.link', 'color.brand.subtle', 4.5],
  ['color.fg.link', 'color.bg.rowSelected', 4.5],
  ['color.fg.primary', 'color.brand.tint', 4.5],
  ['color.brand.onBrand', 'color.brand.hover', 4.5],
  ['color.brand.onBrand', 'color.brand.active', 4.5],
  ['color.brand.accent', S, 3],
  ['color.border.focus', S, 3],
  ['color.border.focus', C, 3],
  ['color.border.focusStrong', S, 4.5],
  ['color.border.focusStrong', C, 4.5],
  ['color.nav.fgMuted', 'color.nav.sub', 4.5],
  // 사이드바(PR-27): 브랜드 짙은 면 위 항목 글자 · 묶음 이름 · 아이콘 · 지금 화면, 가리킴 · 선택 면 위 글자
  ['color.nav.fg', 'color.bg.nav', 4.5],
  ['color.nav.fgMuted', 'color.bg.nav', 4.5],
  ['color.nav.fgActive', 'color.bg.nav', 4.5],
  ['color.nav.fg', 'color.nav.hover', 4.5],
  ['color.nav.fgActive', 'color.nav.hover', 4.5],
  ['color.nav.fgActive', 'color.nav.selected', 4.5],
  ['color.nav.fgMuted', 'color.nav.hover', 3],
  ['color.nav.focus', 'color.bg.nav', 3],
  ['color.nav.focus', 'color.nav.selected', 3],
  // 아바타 글자(PR-27)
  ...(['1', '2', '3', '4', '5', '6'] as const).map(
    (k) => [`color.avatar.${k}.fg`, `color.avatar.${k}.bg`, 4.5] as [string, string, number],
  ),
  // 선택 · 현재 표시 선은 그래픽(WCAG 1.4.11)
  ['color.border.selected', S, 3],
  ['color.border.selected', 'color.bg.canvas', 3],
  ...(['info', 'success', 'warning', 'danger'] as const).map(
    (k) => [`color.status.${k}.on`, `color.status.${k}.default`, 4.5] as [string, string, number],
  ),
  ['color.brand.onBrand', 'color.brand.default', 4.5],
  ...(['draft', 'pending', 'approved', 'rejected', 'withdrawn'] as const).map(
    (k) =>
      [`color.approval.${k}.text`, `color.approval.${k}.subtle`, 4.5] as [string, string, number],
  ),
];

/** WCAG 2.x 대비. 알파 색은 바탕(없으면 surface) 위에 합성한 뒤 잰다. */
export function contrast(mode: Mode, fg: string, bg: string): number {
  const get = MODES[mode];
  const surface = get(S);
  const back = composite(get(bg), surface);
  return wcagContrast(composite(get(fg), back), back);
}

const CASES = (Object.keys(MODES) as Mode[]).flatMap((mode) =>
  PAIRS.map(([fg, bg, base]) => {
    const hc = mode.startsWith('hc') && !KEEP_IN_HC.test(fg) ? (HC[base] ?? base) : base;
    // 고대비 강조 포커스는 7
    const min = mode.startsWith('hc') && fg.endsWith('focusStrong') ? 7 : hc;
    return { mode, fg, bg, min, name: `${mode}: ${fg.slice(6)} / ${bg.slice(6)} ≥ ${min}` };
  }),
);

describe('contrast (WCAG 2.x)', () => {
  it.each(CASES)('$name', ({ mode, fg, bg, min }) => {
    const ratio = contrast(mode, fg, bg);
    expect(
      Math.floor(ratio * 1000) / 1000,
      `${MODES[mode](fg)} on ${MODES[mode](bg)}`,
    ).toBeGreaterThanOrEqual(min);
  });
});

// 종이(D-77)는 테마와 무관하다. 두 모드에서 같은 값이 나오는지와 종이 바탕 위 대비를 같이 본다
const PAPER_PAIRS: [fg: string, bg: string, min: number][] = [
  ['paper.fg', 'paper.bg', 4.5],
  ['paper.muted', 'paper.bg', 4.5],
  ['paper.fg', 'paper.fill', 4.5],
  ['paper.muted', 'paper.fill', 4.5],
  // 칸 선은 글자가 아니라 그래픽(WCAG 1.4.11, 3:1)
  ['paper.line', 'paper.bg', 3],
  ['paper.lineStrong', 'paper.bg', 3],
];

describe('paper 대비(테마와 무관)', () => {
  it.each(PAPER_PAIRS)('%s / %s ≥ %d', (fg, bg, min) => {
    const ratios = BASE_MODES.map((mode) => wcagContrast(MODES[mode](fg), MODES[mode](bg)));
    expect(ratios[0], 'light · dark 같은 값').toBe(ratios[1]);
    expect(Math.floor(ratios[0]! * 1000) / 1000).toBeGreaterThanOrEqual(min);
  });
});

describe('finance 색차', () => {
  const deltaEOK = differenceEuclidean('oklab');
  it.each(Object.keys(MODES) as Mode[])(
    '%s: income(빨강) vs expense(파랑) ΔEOK ×100 ≥ 20',
    (mode) => {
      const get = MODES[mode];
      expect(
        deltaEOK(get('color.finance.income'), get('color.finance.expense')) * 100,
      ).toBeGreaterThanOrEqual(20);
    },
  );
});
