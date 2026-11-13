// 회계 · 재고 보강(PG-37 · PG-38): 계좌번호 프리셋 · 단위 환산 · 점검 목록 요약
import { describe, expect, it } from 'vitest';
import { checklistProgress } from '../src/Checklist/Checklist.contract.js';
import {
  applyMask,
  BANK_ACCOUNT_FORMATS,
  bankAccountFormat,
  formatBankAccount,
  MASK_EXAMPLES,
  maskPattern,
} from '../src/MaskedInput/MaskedInput.contract.js';
import {
  baseUnitOf,
  toBaseQuantity,
  unitName,
} from '../src/QuantityInput/QuantityInput.contract.js';
import { maskAccount } from '../src/_shared/hr.js';

describe('bankAccount 프리셋', () => {
  it('은행 코드의 형식으로 나눈다', () => {
    expect(formatBankAccount('02411842001011', '003')).toBe('024-118420-01-011');
    expect(formatBankAccount('421701012845190', '004')).toBe('421701-01-284519');
    expect(formatBankAccount('110123456789', '088')).toBe('110-123-456789');
    expect(formatBankAccount('3333011234567', '090')).toBe('3333-01-1234567');
    expect(maskPattern('bankAccount', '', { bank: '020' })).toBe('####-###-######');
  });

  it('형식마다 예시가 패턴과 맞고 코드가 겹치지 않는다', () => {
    for (const b of BANK_ACCOUNT_FORMATS) {
      expect(b.code).toMatch(/^\d{3}$/);
      expect(formatBankAccount(b.example, b.code)).toBe(b.example);
      expect(b.example.replace(/\d/g, '#')).toBe(b.pattern);
    }
    expect(new Set(BANK_ACCOUNT_FORMATS.map((b) => b.code)).size).toBe(BANK_ACCOUNT_FORMATS.length);
  });

  it('모든 자리를 채워야 complete(은행이 있으면)', () => {
    expect(applyMask('11012345678', 'bankAccount', { bank: '088' }).complete).toBe(false);
    expect(applyMask('110123456789', 'bankAccount', { bank: '088' }).complete).toBe(true);
  });

  it('은행을 모르면 구분 글자 없이 숫자만 16자리까지, 10자리부터 complete', () => {
    expect(applyMask('110-123-456789', 'bankAccount')).toEqual({
      raw: '110123456789',
      formatted: '110123456789',
      complete: true,
    });
    expect(applyMask('123456789', 'bankAccount').complete).toBe(false);
    expect(applyMask('12345678901234567890', 'bankAccount').raw).toHaveLength(16);
    expect(bankAccountFormat('999')).toBeUndefined();
    expect(formatBankAccount('110123456789', '999')).toBe('110123456789');
    expect(MASK_EXAMPLES.bankAccount).toMatch(/^\d+$/);
  });

  it('가림은 maskAccount와 짝을 이룬다(끝 네 자리)', () => {
    expect(maskAccount(formatBankAccount('02411842001011', '003'))).toBe('●●●-●●●●●●-●1-011');
  });
});

describe('단위 환산', () => {
  const UNITS = [{ unit: 'EA', factor: 1 }, { unit: 'BOX', factor: 24 }, 'PLT'] as const;

  it('기준 단위는 factor 1인 단위', () => {
    expect(baseUnitOf(UNITS)?.unit).toBe('EA');
    expect(baseUnitOf(['EA', 'BOX'])).toBeUndefined();
    expect(unitName('BOX')).toBe('BOX');
    expect(unitName({ unit: 'KG', factor: 1 })).toBe('KG');
  });

  it('기준 수량 = 수량 × factor. factor가 없으면 null', () => {
    expect(toBaseQuantity(10, 'BOX', UNITS)).toBe(240);
    expect(toBaseQuantity(3, 'EA', UNITS)).toBe(3);
    expect(toBaseQuantity(1, 'PLT', UNITS)).toBeNull();
    expect(toBaseQuantity(null, 'BOX', UNITS)).toBeNull();
    expect(toBaseQuantity(10, 'BOX', ['EA', 'BOX'])).toBeNull();
    expect(
      toBaseQuantity(2.5, 'BOX', [
        { unit: 'KG', factor: 1 },
        { unit: 'BOX', factor: 0.3 },
      ]),
    ).toBe(0.75);
  });
});

describe('checklistProgress', () => {
  it('상태별 수와 끝나지 않았는데 기한이 지난 수', () => {
    expect(
      checklistProgress(
        [
          { state: 'done', due: '2026-11-01' },
          { state: 'doing', due: '2026-11-30' },
          { state: 'pending', due: '2026-11-04' },
          { state: 'blocked' },
          { state: 'pending', due: '2026-11-06' },
        ],
        '2026-11-06',
      ),
    ).toEqual({ total: 5, done: 1, doing: 1, pending: 2, blocked: 1, overdue: 1 });
  });
});
