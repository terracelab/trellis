// paginateMoneyRows(R-35): 긴 금액 표를 쪽마다 나누고 앞 쪽 누계를 이월한다
import { describe, expect, it } from 'vitest';
import { paginateMoneyRows } from '../src/Paper/Paper.contract.js';

const rows = Array.from(
  { length: 44 },
  (_, i) => [`품목 ${i + 1}`, i + 1, 1000, (i + 1) * 1000, (i + 1) * 100] as const,
);

describe('paginateMoneyRows', () => {
  it('첫 쪽 first줄, 다음 쪽부터 rest줄씩 나누고 쪽 번호를 단다', () => {
    const pages = paginateMoneyRows(rows, { first: 16, rest: 22, sum: [3, 4] });
    expect(pages.map((p) => p.rows.length)).toEqual([16, 22, 6]);
    expect(pages.map((p) => [p.page, p.pages])).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    expect(pages.flatMap((p) => p.rows)).toEqual(rows);
  });

  it('둘째 쪽부터 앞 쪽까지의 누계(carryIn), 마지막 쪽 앞까지 이 쪽까지의 누계(carryOut)', () => {
    const [p1, p2, p3] = paginateMoneyRows(rows, { first: 16, rest: 22, sum: [3, 4] });
    const through = (n: number) => {
      const done = rows.slice(0, n);
      return [null, '', '', done.reduce((s, r) => s + r[3], 0), done.reduce((s, r) => s + r[4], 0)];
    };
    expect(p1!.carryIn).toBeUndefined();
    expect(p1!.carryOut).toEqual(through(16));
    expect(p2!.carryIn).toEqual(through(16));
    expect(p2!.carryOut).toEqual(through(38));
    expect(p3!.carryIn).toEqual(through(38));
    // 마지막 쪽은 앱의 합계 줄 자리
    expect(p3!.carryOut).toBeUndefined();
  });

  it('rest가 없으면 first, 1보다 작은 값 · NaN은 1, Infinity는 한 쪽, 줄이 없으면 이월 없는 한 쪽', () => {
    expect(
      paginateMoneyRows(rows.slice(0, 5), { first: 2, sum: [] }).map((p) => p.rows.length),
    ).toEqual([2, 2, 1]);
    expect(paginateMoneyRows(rows.slice(0, 2), { first: 0, rest: -3, sum: [] })).toHaveLength(2);
    expect(paginateMoneyRows(rows.slice(0, 3), { first: Number.NaN, sum: [] })).toHaveLength(3);
    expect(paginateMoneyRows(rows, { first: Infinity, sum: [] })).toHaveLength(1);
    const [only, ...more] = paginateMoneyRows([], { first: 10, sum: [1] });
    expect(more).toEqual([]);
    expect(only).toEqual({ page: 1, pages: 1, rows: [] });
  });

  it('0번 열(이름 칸) · 숫자가 아닌 칸은 더하지 않고, 소수는 들어온 자릿수에서 자른다', () => {
    const mixed = [
      ['가', 0.1, '3%'],
      ['나', 0.2, ''],
      ['다', '–', 7],
    ] as const;
    const [p1, p2] = paginateMoneyRows(mixed, { first: 2, sum: [0, 1, 2] });
    expect(p1!.carryOut).toEqual([null, 0.3, 0]);
    expect(p2!.carryIn).toEqual([null, 0.3, 0]);
  });
});
