// 기본 테마 = createTheme(DEFAULT_BRAND)(D-98). 토큰 원본에서 푼 값이 엔진 결과와 한 값이라도 다르면 실패한다.
import { describe, expect, it } from 'vitest';
import { generate } from '../scripts/gen-default-theme.mjs';
import { readFileSync } from 'node:fs';
import {
  BASE_BRAND,
  BRAND_TOKENS,
  DEFAULT_BRAND,
  MODES,
  NEUTRAL_MAP,
  createTheme,
  cssVarOf,
} from '../theme/index.mjs';
import { MODE_SETS, OVERRIDE_SETS, resolver } from './helpers';

const RESOLVE = {
  light: resolver(MODE_SETS['light·compact']),
  dark: resolver(MODE_SETS['dark·comfortable']),
  hcLight: resolver(MODE_SETS['light·compact'], [OVERRIDE_SETS.hcLight.file]),
  hcDark: resolver(MODE_SETS['dark·comfortable'], [OVERRIDE_SETS.hcDark.file]),
} as const;

const theme = createTheme({ brand: DEFAULT_BRAND });

describe('기본 테마 = createTheme(DEFAULT_BRAND)', () => {
  it('기본 회사 색은 식자재 ERP 주황이고 대비를 전부 넘긴다', () => {
    expect(DEFAULT_BRAND).toBe('#FE5C2B');
    expect(theme.ok).toBe(true);
  });

  it.each(MODES)('%s: 회사 색 토큰 21개가 엔진 값과 같다', (mode) => {
    const get = RESOLVE[mode as keyof typeof RESOLVE];
    const diff = BRAND_TOKENS.filter(
      (path) => get(`color.${path}`).toUpperCase() !== theme[mode][cssVarOf(path)]!.toUpperCase(),
    ).map((path) => `${path}: 토큰 ${get(`color.${path}`)} ≠ 엔진 ${theme[mode][cssVarOf(path)]}`);
    expect(diff).toEqual([]);
  });

  it.each(MODES)('%s: 회색 톤 토큰이 엔진 표(NEUTRAL_MAP)와 같다', (mode) => {
    const get = RESOLVE[mode as keyof typeof RESOLVE];
    const prim = RESOLVE.light;
    for (const [path, ref] of Object.entries(NEUTRAL_MAP[mode as keyof typeof NEUTRAL_MAP]))
      expect(get(`color.${path}`), path).toBe(prim(`color.${ref}`));
  });

  it('primitive brand 50~950 = 엔진 brandScale(DEFAULT_BRAND)', () => {
    for (const [step, hex] of Object.entries(BASE_BRAND))
      expect(RESOLVE.light(`color.brand.${step}`)).toBe(hex);
  });

  it('생성물(color-brand.json · semantic alias)이 최신이다(pnpm --filter @terracelab/trellis-tokens gen:theme)', () => {
    for (const [file, text] of Object.entries(generate()))
      expect(readFileSync(file, 'utf8'), file).toBe(text);
  });
});
