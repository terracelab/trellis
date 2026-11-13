// 층 순서(D-63): 팝업은 그것을 연 층(덮개 · 대화상자 · 시트) 위, 알림(토스트) 아래
import { describe, expect, it } from 'vitest';
import { tokenMap } from './helpers';

const z = (name: string) => Number(tokenMap(['primitive/z.json']).get(`z.${name}`)!.$value);

describe('z 순서', () => {
  it('base < sticky < overlay < modal < dropdown < toast', () => {
    const order = ['base', 'sticky', 'overlay', 'modal', 'dropdown', 'toast'].map(z);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(new Set(order).size).toBe(order.length);
  });
});
