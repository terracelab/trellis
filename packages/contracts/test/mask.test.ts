// 개인정보 가림 함수(PR-30): maskPhone · maskName · maskAddress. 가림 글자는 formatRrn · maskAccount와 같은 ●
import { describe, expect, it } from 'vitest';
import { maskAddress, maskName, maskPhone, RRN_MASK_CHAR } from '../src/_shared/format.js';

describe('maskPhone', () => {
  it('가운데 묶음만 가린다(휴대전화 · 서울 · 지역 번호)', () => {
    expect(maskPhone('010-1234-5678')).toBe('010-●●●●-5678');
    expect(maskPhone('02-123-4567')).toBe('02-●●●-4567');
    expect(maskPhone('031-123-4567')).toBe('031-●●●-4567');
  });

  it('구분자 없는 번호는 한국 번호로 나눠 하이픈을 넣는다', () => {
    expect(maskPhone('01012345678')).toBe('010-●●●●-5678');
    expect(maskPhone('0212345678')).toBe('02-●●●●-5678');
    expect(maskPhone('0311234567')).toBe('031-●●●-4567');
  });

  it('국가 번호가 있으면 모양을 두고 끝에서 두 번째 묶음, 그 밖에는 끝 네 자리만', () => {
    expect(maskPhone('+82 10-1234-5678')).toBe('+82 10-●●●●-5678');
    expect(maskPhone('1588-1234')).toBe('●●●●-1234');
    expect(maskPhone('1234')).toBe('1234');
  });

  it('가림 글자를 바꿀 수 있다', () => {
    expect(maskPhone('010-1234-5678', { char: '*' })).toBe('010-****-5678');
  });
});

describe('maskName', () => {
  it('두 글자는 성만, 세 글자는 가운데, 네 글자는 두 글자 성 + 끝 글자', () => {
    expect(maskName('홍길')).toBe('홍●');
    expect(maskName('김민수')).toBe('김●수');
    expect(maskName('남궁민수')).toBe('남궁●수');
    expect(maskName('김')).toBe('김');
    expect(maskName('김민수', { char: '*' })).toBe('김*수');
  });

  it('성 길이를 알면 surnameLength로 정한다', () => {
    expect(maskName('김수한무', { surnameLength: 1 })).toBe('김●●무');
    expect(maskName('남궁민', { surnameLength: 2 })).toBe('남궁●');
  });

  it('로마자 · 띄어 쓴 이름은 낱말마다 첫 글자만', () => {
    expect(maskName('Seoyeon Han')).toBe('S●●●●●● H●●');
    expect(maskName(' John ')).toBe('J●●●');
  });
});

describe('maskAddress', () => {
  it('도로명 주소는 로 · 길까지', () => {
    expect(maskAddress('서울특별시 강남구 테헤란로 152 강남파이낸스센터 4층')).toBe(
      '서울특별시 강남구 테헤란로 ●●● ●●●●●●●● ●●',
    );
    expect(maskAddress('서울 강남구 봉은사로86길 12')).toBe('서울 강남구 봉은사로86길 ●●');
    expect(maskAddress('경기도 성남시 분당구 판교역로 235 에이치스퀘어 N동')).toBe(
      '경기도 성남시 분당구 판교역로 ●●● ●●●●●● ●●',
    );
  });

  it('지번 주소는 동 · 리 · 가까지', () => {
    expect(maskAddress('서울 강남구 역삼1동 123-45')).toBe('서울 강남구 역삼1동 ●●●●●●');
    expect(maskAddress('강원도 평창군 대관령면 횡계리 123')).toBe(
      '강원도 평창군 대관령면 횡계리 ●●●',
    );
    expect(maskAddress('서울 중구 을지로2가 1')).toBe('서울 중구 을지로2가 ●');
  });

  it('동 · 로를 찾지 못하면 앞 두 낱말만, 숫자만 붙은 동(101동)은 단계로 보지 않는다', () => {
    expect(maskAddress('서울 강남구 래미안 101동 1203호')).toBe('서울 강남구 ●●● ●●●● ●●●●●');
    expect(maskAddress('서울 강남구 역삼동')).toBe('서울 강남구 역삼동');
  });

  it('가림 글자는 ●(RRN_MASK_CHAR), 바꿀 수 있다', () => {
    expect(maskAddress('서울 종로구 종로 1', { char: '*' })).toBe('서울 종로구 종로 *');
    expect(RRN_MASK_CHAR).toBe('●');
  });
});
