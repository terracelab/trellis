import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatCompactWon,
  formatCount,
  formatPercent,
} from '../src/_shared/format.js';

describe('formatAmount', () => {
  it('천 단위 구분', () => {
    expect(formatAmount(1234567)).toBe('1,234,567');
  });
  it('음수는 U+2212', () => {
    expect(formatAmount(-1234)).toBe('−1,234');
  });
  it('단위·부호 옵션', () => {
    expect(formatAmount(1234567, { unit: '원' })).toBe('1,234,567원');
    expect(formatAmount(50, { sign: 'always' })).toBe('+50');
    expect(formatAmount(0, { sign: 'always' })).toBe('0');
    expect(formatAmount(12.345, { digits: 1 })).toBe('12.3');
  });
});

describe('formatCount', () => {
  it('99+', () => {
    expect(formatCount(7)).toBe('7');
    expect(formatCount(99)).toBe('99');
    expect(formatCount(120)).toBe('99+');
    expect(formatCount(0)).toBe('0');
  });
});

describe('formatCompactWon · formatPercent', () => {
  it('억·만', () => {
    expect(formatCompactWon(874_479_500)).toBe('8.7억');
    expect(formatCompactWon(1_250_000_000)).toBe('13억');
    expect(formatCompactWon(34_000_000)).toBe('3,400만');
    expect(formatCompactWon(0)).toBe('0');
  });
  it('퍼센트', () => {
    expect(formatPercent(12.34)).toBe('12.3%');
    expect(formatPercent(-1.5, 1, true)).toBe('−1.5%p');
  });
});

describe('업종 확장 서식', () => {
  it('수량 · 통화 · 사업자번호', async () => {
    const f = await import('../src/_shared/format.js');
    expect(f.formatQuantity(1240, 'EA')).toBe('1,240EA');
    expect(f.formatQuantity(3.5, 'kg', 1)).toBe('3.5kg');
    expect(f.formatCurrency(12345)).toBe('12,345원');
    expect(f.formatCurrency(12345.5, 'USD')).toBe('USD 12,345.50');
    expect(f.formatCurrency(-800, 'JPY')).toBe('JPY −800');
    expect(f.formatBizNo('1234567890')).toBe('123-45-67890');
    expect(f.formatBizNo('12-3')).toBe('12-3');
  });
  it('날짜 · 기간 · 기한', async () => {
    const f = await import('../src/_shared/format.js');
    expect(f.formatDate('2026-11-07')).toBe('2026-11-07');
    expect(f.formatDate('2026-11-07', 'md')).toBe('11월 7일');
    expect(f.formatDate('2026-11-07', 'mdw')).toBe('11월 7일(토)');
    expect(f.formatPeriod('2026-11-01', '2026-11-30')).toBe('2026-11-01~11-30');
    expect(f.formatPeriod('2026-12-20', '2027-01-10')).toBe('2026-12-20~2027-01-10');
    expect(f.formatDueDays('2026-11-10', '2026-11-07')).toBe('D-3');
    expect(f.formatDueDays('2026-11-07', '2026-11-07')).toBe('D-day');
    expect(f.formatDueDays('2026-11-04', '2026-11-07')).toBe('3일 경과');
  });
  it('한글 금액', async () => {
    const f = await import('../src/_shared/format.js');
    expect(f.formatKoreanAmount(874_479_500)).toBe('일금 팔억칠천사백사십칠만구천오백원정');
    expect(f.formatKoreanAmount(10_000)).toBe('일금 일만원정');
    expect(f.formatKoreanAmount(1_100_000)).toBe('일금 일백일십만원정');
    expect(f.formatKoreanAmount(0)).toBe('일금 영원정');
  });
});

describe('업종 어휘', () => {
  it('모든 값이 라벨과 톤을 가진다', async () => {
    const v = await import('../src/_shared/vocab.js');
    const sets = [
      v.PROGRESS_STATES,
      v.MACHINE_STATES,
      v.QUALITY_RESULTS,
      v.STOCK_LEVELS,
      v.ORDER_STAGES,
      v.FILING_STATES,
      v.INVOICE_STATES,
      v.RECEIVING_STATES,
      v.SHIPMENT_STATES,
      v.JOB_STATES,
    ];
    for (const set of sets)
      for (const [k, e] of Object.entries(set)) {
        expect(e.label, k).toMatch(/\S/);
        expect(['neutral', 'info', 'success', 'warning', 'danger']).toContain(e.tone);
      }
  });
});
