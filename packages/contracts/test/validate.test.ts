// 번호 검증 · 주민등록번호 서식(PR-17). 사업자등록번호는 알고리즘으로 만든 가짜 번호만 쓴다(실제 회사 번호 아님).
import { describe, expect, it } from 'vitest';
import { applyMask, MASK_EXAMPLES, maskPattern } from '../src/MaskedInput/MaskedInput.contract.js';
import { formatRrn } from '../src/_shared/format.js';
import { isValidBizNo } from '../src/_shared/validate.js';

describe('isValidBizNo', () => {
  it('검증 숫자가 맞는 번호(1·3·7·1·3·7·1·3·5 + 9번째 × 5 ÷ 10)', () => {
    // 123456789 → 합 1+6+21+4+15+42+7+24+45 = 165, + ⌊9×5/10⌋ 4 = 169 → (10 − 9) % 10 = 1
    expect(isValidBizNo('1234567891')).toBe(true);
    expect(isValidBizNo('1111111119')).toBe(true);
    expect(isValidBizNo('9876543215')).toBe(true);
    expect(isValidBizNo('2468135797')).toBe(true);
    // 합이 10의 배수면 검증 숫자 0
    expect(isValidBizNo('0000000000')).toBe(true);
  });

  it('구분 글자 · 공백은 무시한다', () => {
    expect(isValidBizNo('123-45-67891')).toBe(true);
    expect(isValidBizNo(' 987 65 43215 ')).toBe(true);
  });

  it('검증 숫자가 틀리거나 10자리가 아니면 false', () => {
    expect(isValidBizNo('1234567890')).toBe(false);
    expect(isValidBizNo('1111111111')).toBe(false);
    expect(isValidBizNo('9876543210')).toBe(false);
    expect(isValidBizNo('123456789')).toBe(false);
    expect(isValidBizNo('12345678911')).toBe(false);
    expect(isValidBizNo('12345a7891')).toBe(false);
    expect(isValidBizNo('')).toBe(false);
  });
});

describe('formatRrn', () => {
  it('기본은 뒷자리 첫 숫자만 보이고 나머지를 가린다', () => {
    expect(formatRrn('9001011234567')).toBe('900101-1●●●●●●');
    expect(formatRrn('900101-1234567')).toBe('900101-1●●●●●●');
  });

  it('masked false면 6-7로 나눈다(13자리가 아니면 그대로)', () => {
    expect(formatRrn('9001011234567', { masked: false })).toBe('900101-1234567');
    expect(formatRrn('90010112', { masked: false })).toBe('90010112');
  });

  it('자리 수가 모자라도 가린 채로 보인다(숫자가 새지 않는다)', () => {
    expect(formatRrn('90010112')).toBe('900101-1●');
    expect(formatRrn('9001011')).toBe('900101-1');
    expect(formatRrn('900101')).toBe('900101');
    expect(formatRrn('')).toBe('');
  });

  it('외국인등록번호도 같은 형식(뒷자리 첫 숫자 5~8)', () => {
    expect(formatRrn('9001015234567')).toBe('900101-5●●●●●●');
  });
});

describe('MaskedInput rrn 프리셋', () => {
  it('6-7 패턴 · 예시 · 13자리면 다 채움', () => {
    expect(maskPattern('rrn')).toBe('######-#######');
    expect(MASK_EXAMPLES.rrn).toBe('900101-1234567');
    expect(applyMask('9001011234567', 'rrn')).toEqual({
      raw: '9001011234567',
      formatted: '900101-1234567',
      complete: true,
    });
    expect(applyMask('90010112', 'rrn').complete).toBe(false);
    // 자리 수만 본다(검증 숫자 공식은 2020-10 이후 번호에 맞지 않는다)
    expect(applyMask('9001011234560', 'rrn').complete).toBe(true);
  });
});
