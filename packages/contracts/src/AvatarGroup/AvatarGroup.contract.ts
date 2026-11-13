import { defineContract, type ContractBase } from '../_base.js';

/** 겹쳐 보일 사람 하나(Avatar 규칙) */
export interface AvatarGroupPerson {
  name: string;
  src?: string;
}

export interface AvatarGroupProps extends ContractBase {
  /** 사람(앞에서부터 보인다) */
  people: readonly AvatarGroupPerson[];
  /** 보이는 아바타 수. 넘치면 마지막 자리에 "+N". 기본 4 */
  max?: number;
  /** 지름(size.avatar 토큰). 기본 24 */
  size?: 24 | 32 | 40;
  /** square = 둥근 사각형(기본, Avatar와 같다), circle = 원 */
  shape?: 'square' | 'circle';
  /** 접근성 이름(참석자 6명). 없으면 "앞 이름들 외 N명" */
  label?: string;
}

/** 보일 사람과 넘친 수. max가 전체 이상이면 넘침 0, 아니면 max - 1명 + "+N"(자리 수를 지킨다) */
export function avatarGroupSlots<T>(
  people: readonly T[],
  max = 4,
): { shown: readonly T[]; rest: number } {
  const cap = Math.max(1, Math.floor(max));
  if (people.length <= cap) return { shown: people, rest: 0 };
  const shown = people.slice(0, cap - 1);
  return { shown, rest: people.length - shown.length };
}

export const AvatarGroupContract = defineContract<AvatarGroupProps>({
  name: 'AvatarGroup',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    people: { type: 'AvatarGroupPerson[]', required: true, description: '사람(name · src)' },
    max: { type: 'number', default: 4, description: '보이는 자리 수(넘치면 마지막이 +N)' },
    size: {
      type: '24 | 32 | 40',
      default: 24,
      values: ['24', '32', '40'],
      description: '지름(size.avatar 토큰)',
    },
    shape: {
      type: "'square' | 'circle'",
      default: 'square',
      values: ['square', 'circle'],
      description: '모양(둥근 사각형 · 원)',
    },
    label: { type: 'string', description: '접근성 이름(없으면 "이름들 외 N명")' },
  },
  states: ['default'],
  a11y: { role: 'img', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
