// 범용 기본 부품 · 목록(PG-41 · PG-35)의 순수 함수: 링크 주소 · 태그 거르기 · 겹친 아바타 자리 · 사람 상태 어휘 관계
import { describe, expect, it } from 'vitest';
import { avatarGroupSlots } from '../src/AvatarGroup/AvatarGroup.contract.js';
import { isAppHref, isExternalHref } from '../src/Link/Link.contract.js';
import { filterTagSuggestions, splitTagText } from '../src/TagInput/TagInput.contract.js';
import { PRESENCE_STATES } from '../src/_shared/hr.js';
import {
  AVATAR_STATUS_TONES,
  avatarStatusLabel,
  presenceLabel,
  presenceToStatus,
  PRESENCE_TO_STATUS,
} from '../src/_shared/presence.js';

describe('링크 주소', () => {
  it('isExternalHref: http(s) · // 만 바깥', () => {
    expect(isExternalHref('https://www.law.go.kr')).toBe(true);
    expect(isExternalHref('HTTP://example.com/a')).toBe(true);
    expect(isExternalHref('//cdn.example.com/a.js')).toBe(true);
    expect(isExternalHref('/erp/sales')).toBe(false);
    expect(isExternalHref('mailto:hr@example.com')).toBe(false);
    expect(isExternalHref('#section')).toBe(false);
  });

  it('isAppHref: 스킴 없는 주소만 앱 안. #id · mailto · tel · 바깥 · 빈 글자는 아니다', () => {
    expect(isAppHref('/erp/hr-payroll/hr-master?id=E-0012')).toBe(true);
    expect(isAppHref('orders/SO-1')).toBe(true);
    expect(isAppHref('?tab=2')).toBe(true);
    expect(isAppHref('#member-E-0012')).toBe(false);
    expect(isAppHref('mailto:hr@example.com')).toBe(false);
    expect(isAppHref('tel:0212345678')).toBe(false);
    expect(isAppHref('https://www.law.go.kr')).toBe(false);
    expect(isAppHref('//cdn.example.com')).toBe(false);
    expect(isAppHref('  ')).toBe(false);
  });
});

describe('태그 입력', () => {
  const S = [
    { value: 'E-0012', label: '한서연', meta: '인사팀 · 매니저' },
    { value: 'E-0031', label: '정민호', meta: '영업팀 · 책임' },
    { value: 'E-0044', label: '박서연', meta: '재무팀 · 선임' },
  ];

  it('filterTagSuggestions: 이름 · 값 · 보조 글자에서 찾고 넣은 값은 뺀다', () => {
    expect(filterTagSuggestions(S, '서연').map((s) => s.value)).toEqual(['E-0012', 'E-0044']);
    expect(filterTagSuggestions(S, '영업').map((s) => s.value)).toEqual(['E-0031']);
    expect(filterTagSuggestions(S, 'e-0044').map((s) => s.value)).toEqual(['E-0044']);
    expect(filterTagSuggestions(S, '', ['E-0031']).map((s) => s.value)).toEqual([
      'E-0012',
      'E-0044',
    ]);
    expect(filterTagSuggestions(S, '없는 이름')).toEqual([]);
  });

  it('splitTagText: 쉼표 · 줄바꿈 · 탭으로 나누고 빈 칸 · 겹친 값은 뺀다', () => {
    expect(splitTagText('냉장, 냉동\n행사 상품\t냉장,, ')).toEqual(['냉장', '냉동', '행사 상품']);
    expect(splitTagText('   ')).toEqual([]);
  });
});

describe('겹친 아바타 자리', () => {
  const six = ['a', 'b', 'c', 'd', 'e', 'f'];

  it('max 이하면 전부, 넘치면 max − 1명 + 나머지 수(자리 수는 max)', () => {
    expect(avatarGroupSlots(six.slice(0, 4), 4)).toEqual({ shown: six.slice(0, 4), rest: 0 });
    expect(avatarGroupSlots(six, 4)).toEqual({ shown: ['a', 'b', 'c'], rest: 3 });
    expect(avatarGroupSlots(six, 1)).toEqual({ shown: [], rest: 6 });
    expect(avatarGroupSlots(six, 0)).toEqual({ shown: [], rest: 6 });
  });
});

describe('사람 상태 어휘 관계(R-T26)', () => {
  it('근무 상태 5개가 모두 접속 상태로 바뀐다', () => {
    for (const p of PRESENCE_STATES) expect(PRESENCE_TO_STATUS[p]).toBeDefined();
    expect(presenceToStatus('working')).toBe('online');
    expect(presenceToStatus('remote')).toBe('online');
    expect(presenceToStatus('fieldwork')).toBe('away');
    expect(presenceToStatus('leave')).toBe('offline');
    expect(presenceToStatus('off')).toBe('offline');
  });

  it('접속 상태 톤은 Avatar 점 색과 같다', () => {
    expect(AVATAR_STATUS_TONES).toEqual({
      online: 'success',
      away: 'warning',
      busy: 'danger',
      offline: 'neutral',
    });
  });

  it('라벨은 문구 사전에서(ko · en)', () => {
    expect(presenceLabel('remote')).toBe('재택');
    expect(presenceLabel('remote', 'en')).toBe('Remote');
    expect(avatarStatusLabel('busy')).toBe('다른 용무 중');
    expect(avatarStatusLabel('away', 'en')).toBe('Away');
  });
});
