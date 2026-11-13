// 검토 · 확인 묶음(PR-30)의 순수 함수: formatDelta · deltaDirection · diffFields
import { describe, expect, it } from 'vitest';
import { diffFields } from '../src/_shared/diff.js';
import { deltaDirection, formatDelta } from '../src/_shared/format.js';

describe('formatDelta', () => {
  it('부호는 항상, 감소는 U+2212', () => {
    expect(formatDelta(12.4)).toBe('+12.4%');
    expect(formatDelta(-3.1)).toBe('−3.1%');
    expect(formatDelta(0.3, 'point')).toBe('+0.3%p');
    expect(formatDelta(-0.25, 'point')).toBe('−0.3%p');
    expect(formatDelta(12400000, 'amount')).toBe('+12,400,000원');
    expect(formatDelta(-1200, 'amount', { unit: 'KRW' })).toBe('−1,200KRW');
    expect(formatDelta(4, 'number', { unit: '건' })).toBe('+4건');
  });

  it('보이는 자릿수에서 0이면 부호 없이 0', () => {
    expect(formatDelta(0.04)).toBe('0.0%');
    expect(formatDelta(-0.04)).toBe('0.0%');
    expect(formatDelta(0, 'amount')).toBe('0원');
    expect(formatDelta(Number.NaN)).toBe('–');
  });

  it('digits로 자릿수를 바꾼다', () => {
    expect(formatDelta(1.234, 'percent', { digits: 2 })).toBe('+1.23%');
    expect(formatDelta(2.5, 'number', { digits: 1, unit: 'kg' })).toBe('+2.5kg');
  });
});

describe('deltaDirection', () => {
  it('반올림한 값으로 방향을 정한다', () => {
    expect(deltaDirection(12.4)).toBe('up');
    expect(deltaDirection(-3.1)).toBe('down');
    expect(deltaDirection(0.04)).toBe('flat');
    expect(deltaDirection(0.4, 'number')).toBe('flat');
    expect(deltaDirection(0.5, 'number')).toBe('up');
    expect(deltaDirection(Number.POSITIVE_INFINITY)).toBe('flat');
  });
});

describe('diffFields', () => {
  interface Order {
    price: number;
    qty: number;
    memo?: string | null;
    due?: Date;
    approvers?: string[];
  }

  it('바뀐 필드만 fields 순서대로, 숫자는 천 단위', () => {
    const rows = diffFields<Order>(
      { price: 1200, qty: 10, memo: '오전 입고' },
      { price: 1350, qty: 10, memo: '오후 입고' },
      [{ key: 'price', label: '단가' }, { key: 'qty', label: '수량' }, 'memo'],
      { target: 'PO-2611-0042' },
    );
    expect(rows).toEqual([
      { target: 'PO-2611-0042', field: '단가', before: '1,200', after: '1,350' },
      { target: 'PO-2611-0042', field: 'memo', before: '오전 입고', after: '오후 입고' },
    ]);
  });

  it('빈 값끼리는 같고, 새로 넣거나 지우면 빈 쪽이 null', () => {
    const rows = diffFields<Order>(
      { price: 1000, qty: 1, memo: null },
      { price: 1000, qty: 1, memo: '' },
      ['memo'],
    );
    expect(rows).toEqual([]);
    expect(
      diffFields<Order>({ price: 1, qty: 1 }, { price: 1, qty: 1, memo: '긴급' }, ['memo']),
    ).toEqual([{ field: 'memo', before: null, after: '긴급' }]);
    expect(diffFields<Order>({ price: 1, qty: 1, memo: '긴급' }, null, ['memo'])).toEqual([
      { field: 'memo', before: '긴급', after: null },
    ]);
  });

  it('소수 · 음수 · 날짜 · 배열과 format 함수', () => {
    const rows = diffFields<Order>(
      {
        price: 1234.5,
        qty: -3,
        due: new Date(2026, 10, 7),
        approvers: ['김', '이'],
      },
      {
        price: 1234.75,
        qty: 2,
        due: new Date(2026, 10, 9),
        approvers: ['김', '박'],
      },
      [
        { key: 'price', label: '단가' },
        { key: 'qty', label: '수량', format: (v) => `${v}EA` },
        { key: 'due', label: '납기' },
        { key: 'approvers', label: '결재선', format: (v) => v.join(' → ') },
      ],
    );
    expect(rows.map((r) => [r.field, r.before, r.after])).toEqual([
      ['단가', '1,234.5', '1,234.75'],
      ['수량', '-3EA', '2EA'],
      ['납기', '2026-11-07', '2026-11-09'],
      ['결재선', '김 → 이', '김 → 박'],
    ]);
    expect(
      diffFields<Order>(
        { price: 1, qty: 1, due: new Date(2026, 0, 1) },
        { price: 1, qty: 1, due: new Date(2026, 0, 1) },
        ['due'],
      ),
    ).toEqual([]);
  });
});
