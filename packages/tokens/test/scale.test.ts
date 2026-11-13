import { readFileSync } from 'node:fs';
import { converter } from 'culori';
import { describe, expect, it } from 'vitest';
import {
  OUTPUT_PATH,
  generateColorScale,
  readConfig,
  serialize,
  type ColorToken,
} from '../scripts/gen-color-scale.mjs';

const config = readConfig();
const raw = readFileSync(OUTPUT_PATH, 'utf8');
const color = (JSON.parse(raw) as { color: Record<string, unknown> }).color;
const toOklch = converter('oklch');

// 회사 색 brand는 테마 엔진 생성물(primitive/color-brand.json, test/default-theme.test.ts가 본다, D-98)
const HUES = ['blue', 'neutral', 'graphite', 'red', 'green', 'amber', 'violet', 'teal'] as const;
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

function group(name: string): Record<string, ColorToken> {
  return color[name] as Record<string, ColorToken>;
}

function leaves(node: unknown): ColorToken[] {
  if (typeof node !== 'object' || node === null) return [];
  if ('$value' in node) return [node as ColorToken];
  return Object.values(node).flatMap(leaves);
}

function oklch(hex: string) {
  const value = toOklch(hex);
  if (!value) throw new Error(`해석할 수 없는 색: ${hex}`);
  return value;
}

function hueDistance(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

describe('primitive color scale', () => {
  it('8 hue × 11단계 + base 2색 = 90색', () => {
    expect(leaves(color)).toHaveLength(8 * 11 + 2);
    expect(Object.keys(color).filter((k) => !k.startsWith('$'))).toEqual(['base', ...HUES]);
  });

  it('모든 리프는 $type color, 대문자 6자리 hex', () => {
    for (const token of leaves(color)) {
      expect(token.$type).toBe('color');
      expect(token.$value).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('base.white/black (D-14)', () => {
    const base = group('base');
    expect(base.white?.$value).toBe('#FFFFFF');
    expect(base.black?.$value).toBe('#000000');
  });

  it.each(HUES)('%s: 키 순서 50→950', (name) => {
    expect(Object.keys(group(name))).toEqual(STEPS);
  });

  it.each(HUES)('%s: 500 = 기준값 그대로', (name) => {
    expect(group(name)['500']?.$value).toBe(config.hues[name]?.base);
  });

  it('neutral · graphite: 식자재 ERP 회색 앵커 그대로(D-97)', () => {
    for (const name of ['neutral', 'graphite'] as const)
      for (const [step, hex] of Object.entries(config.hues[name]!.anchors ?? {}))
        expect(group(name)[step]?.$value, `${name}.${step}`).toBe(hex);
    expect(group('neutral')['100']?.$value).toBe('#F3F4F6');
    expect(group('graphite')['900']?.$value).toBe('#1C1C1E');
  });

  it('blue: PR-28 전 brand 단계 그대로(지출 · 정보 · 차트 첫 계열이 바뀌지 않는다, D-97)', () => {
    expect(group('blue')['600']?.$value).toBe('#1F56E2');
    expect(group('blue')['500']?.$value).toBe('#2F6BFF');
  });

  it.each(HUES)('%s: OKLCH L이 50→950 단조 감소', (name) => {
    const ls = STEPS.map((s) => oklch(group(name)[s]!.$value).l);
    for (let i = 1; i < ls.length; i += 1) {
      expect(ls[i], `${name}.${STEPS[i]}`).toBeLessThan(ls[i - 1]!);
    }
  });

  it.each(HUES.filter((h) => h !== 'neutral' && h !== 'graphite'))(
    '%s: 색상각(H)을 유지한다(C ≥ 0.03에서 ±2°)',
    (name) => {
      const baseHue = oklch(config.hues[name]!.base).h!;
      for (const s of STEPS) {
        const { c, h } = oklch(group(name)[s]!.$value);
        if (c >= 0.03) expect(hueDistance(h!, baseHue), `${name}.${s}`).toBeLessThanOrEqual(2);
      }
    },
  );

  it('neutral: 쿨톤 유지(H 250~275, 색기가 거의 없는 50은 제외)', () => {
    for (const s of STEPS) {
      const { c, h } = oklch(group('neutral')[s]!.$value);
      if (c! < 0.002) continue;
      expect(h, `neutral.${s}`).toBeGreaterThanOrEqual(250);
      expect(h, `neutral.${s}`).toBeLessThanOrEqual(275);
    }
  });

  it('graphite: 무채색(C < 0.01)', () => {
    for (const s of STEPS)
      expect(oklch(group('graphite')[s]!.$value).c, `graphite.${s}`).toBeLessThan(0.01);
  });

  it('커밋된 color.json = 생성기 출력(결정적, 최신)', () => {
    const first = serialize(generateColorScale(config));
    const second = serialize(generateColorScale(readConfig()));
    expect(second).toBe(first);
    expect(raw).toBe(first);
  });

  it('잘못된 설정은 거부한다', () => {
    const broken = structuredClone(config);
    broken.hues['blue'] = { base: '#2f6bff' };
    expect(() => generateColorScale(broken)).toThrow(/대문자 6자리 hex/);
  });
});
