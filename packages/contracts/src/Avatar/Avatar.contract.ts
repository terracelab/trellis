import { defineContract, type ContractBase } from '../_base.js';

export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

/** 근무 상태 라벨(메신저 · 조직도 공용) */
export const AVATAR_STATUS_LABELS: Record<AvatarStatus, string> = {
  online: '온라인',
  away: '자리 비움',
  busy: '다른 용무 중',
  offline: '오프라인',
};

export type AvatarTone = 1 | 2 | 3 | 4 | 5 | 6;

/** 이름 → 글자 바탕 색(1~6). 같은 이름은 어디서나 같은 색 */
export function avatarTone(name: string): AvatarTone {
  let h = 0;
  for (const ch of name.trim()) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return ((h % 6) + 1) as AvatarTone;
}

export interface AvatarProps extends ContractBase {
  /** 사람 이름(김테라). 사진이 없으면 한글 이름은 성을 뺀 두 글자(테라), 영문은 머리글자 둘. 크기와 관계없이 같다. 공석(vacant)이면 없어도 된다 */
  name?: string;
  /** 사진 주소. 불러오지 못하면 글자로 돌아간다 */
  src?: string;
  size?: 24 | 32 | 40 | 48;
  /** 우하단 근무 상태 점 */
  status?: AvatarStatus;
  /** 옆에 이름 글자가 이미 있으면 true(스크린리더가 두 번 읽지 않게) */
  decorative?: boolean;
  /** square = 둥근 사각형(사람 · 기본), circle = 원(PR-27) */
  shape?: 'square' | 'circle';
  /** 글자 바탕 색. 없으면 이름으로 고른다(avatarTone) */
  tone?: AvatarTone;
  /** 공석(담당자 없음, PR-34): 점선 테두리 + 사람 아이콘. 이름은 "담당자 없음"으로 읽는다 */
  vacant?: boolean;
}

export const AvatarContract = defineContract<AvatarProps>({
  name: 'Avatar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    name: { type: 'string', description: '사람 이름(접근성 이름 · 이니셜). 공석이면 없어도 된다' },
    src: { type: 'string', description: '사진 주소' },
    size: {
      type: '24 | 32 | 40 | 48',
      default: 32,
      values: ['24', '32', '40', '48'],
      description: '지름(size.avatar 토큰)',
    },
    status: {
      type: "'online' | 'away' | 'busy' | 'offline'",
      values: ['online', 'away', 'busy', 'offline'],
      description: '근무 상태 점',
    },
    decorative: { type: 'boolean', default: false, description: '장식(옆에 이름이 있을 때)' },
    shape: {
      type: "'square' | 'circle'",
      default: 'square',
      values: ['square', 'circle'],
      description: '모양(둥근 사각형 · 원)',
    },
    tone: { type: '1 | 2 | 3 | 4 | 5 | 6', description: '글자 바탕 색(없으면 이름으로)' },
    vacant: { type: 'boolean', default: false, description: '공석(점선 테두리 + 사람 아이콘)' },
  },
  states: ['default'],
  a11y: { role: 'img', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
