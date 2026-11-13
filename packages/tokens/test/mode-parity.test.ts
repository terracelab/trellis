import { describe, expect, it } from 'vitest';
import { fileLeaves } from './helpers';

function signature(file: string): string[] {
  return fileLeaves(file)
    .map((l) => `${l.path}:${l.$type}`)
    .sort();
}

describe('mode-parity', () => {
  it('color.light와 color.dark의 키 집합·타입이 같다', () => {
    expect(signature('semantic/color.dark.json')).toEqual(signature('semantic/color.light.json'));
  });

  it('고대비 라이트 · 다크, 색각 친화 라이트 · 다크의 키 집합이 같고 기본 모드에 있는 이름만 덮는다(D-97)', () => {
    expect(signature('semantic/color.hc-dark.json')).toEqual(
      signature('semantic/color.hc-light.json'),
    );
    expect(signature('semantic/chart.cvd-dark.json')).toEqual(
      signature('semantic/chart.cvd-light.json'),
    );
    const base = new Set(signature('semantic/color.light.json'));
    for (const f of ['semantic/color.hc-light.json', 'semantic/chart.cvd-light.json'])
      for (const k of signature(f)) expect(base, `${f} ${k}`).toContain(k);
  });

  it('compact · comfortable · touch의 키 집합·타입이 같다', () => {
    expect(signature('density/comfortable.json')).toEqual(signature('density/compact.json'));
    expect(signature('density/touch.json')).toEqual(signature('density/compact.json'));
  });
});
