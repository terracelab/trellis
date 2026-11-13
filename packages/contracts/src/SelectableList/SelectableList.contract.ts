import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { AvatarStatus } from '../Avatar/Avatar.contract.js';
import type { PresenceState } from '../_shared/hr.js';

/** 행 하나: 앞(아바타 · 아이콘) + 제목 · 보조 + 뒤(시각 · 값 · 안 읽음 수) */
export interface SelectableListItem {
  id: string;
  /** 제목(방 이름 · 사람 이름 · 지급 달) */
  title: string;
  /** 보조 한 줄(마지막 메시지 · 직책 · 지급일). 넘치면 말줄임 */
  secondary?: string;
  /** 앞 사람 아바타(Avatar 규칙). status는 접속 상태 점 */
  avatar?: { name: string; src?: string; status?: AvatarStatus };
  /** 앞 아이콘(채널 · 폴더). avatar가 있으면 쓰지 않는다 */
  icon?: IconName;
  /** 근무 상태(인사 목록): 보조 줄 끝에 점 + 글자(PersonLabel과 같은 모양) */
  presence?: PresenceState;
  /** 뒤 위 작은 글자(시각 · 날짜) */
  meta?: string;
  /** 뒤 값(실지급액 · 건수). 서식은 부르는 쪽(formatAmount) */
  value?: string;
  /** 안 읽음 수. 0이면 없음. 회색 알약이 아니라 caption 숫자(99+) */
  count?: number;
  /** 알림 끔: 제목 뒤 bell-off, 안 읽음 수는 흐리게 */
  muted?: boolean;
  /** 묶음 이름(채널 · 대화). 바뀌는 자리마다 묶음 머리가 생긴다 */
  group?: string;
  disabled?: boolean;
}

export interface SelectableListProps extends ContractBase {
  items: readonly SelectableListItem[];
  /** 고른 행 id(제어). 상세 칸에 보이는 행 */
  selected?: string | null;
  /** 처음 고른 행 */
  defaultSelected?: string | null;
  /** 행을 고를 때(누름 · Enter · Space). 화살표는 초점만 옮긴다 */
  onSelect?: (id: string) => void;
  /** 목록 이름(접근성) */
  label: string;
  /** 고른 행 표시: background = 바탕 한 단계(기본), ring = 1px 테두리 전체. 왼쪽 굵은 띠는 없다(D-57) */
  variant?: 'background' | 'ring';
  /** sm = 한 줄(아바타 24 · 제목 + 뒤 값), md = 두 줄(아바타 32 · 제목 + 보조) */
  size?: 'sm' | 'md';
  /** 안 읽음 수를 읽는 이름(화면 읽기). 기본 "읽지 않음" */
  countLabel?: string;
  /** 빈 목록 글자(무엇이 없는지 + 다음 행동) */
  emptyText?: string;
  /** 불러오는 중: 같은 모양의 Skeleton 행 */
  loading?: boolean;
}

export const SelectableListContract = defineContract<SelectableListProps>({
  name: 'SelectableList',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: {
      type: 'SelectableListItem[]',
      required: true,
      description:
        '행(id · title · secondary · avatar · icon · presence · meta · value · count · muted · group · disabled)',
    },
    selected: { type: 'string | null', description: '고른 행(제어)' },
    defaultSelected: { type: 'string | null', description: '처음 고른 행' },
    onSelect: { type: '(id: string) => void', description: '행을 고를 때(누름 · Enter · Space)' },
    label: { type: 'string', required: true, description: '목록 이름(접근성)' },
    variant: {
      type: "'background' | 'ring'",
      default: 'background',
      values: ['background', 'ring'],
      description: '고른 행 표시(바탕 한 단계 · 1px 테두리 전체)',
    },
    size: {
      type: "'sm' | 'md'",
      default: 'md',
      values: ['sm', 'md'],
      description: 'sm 한 줄(아바타 24) · md 두 줄(아바타 32)',
    },
    countLabel: { type: 'string', description: '안 읽음 수를 읽는 이름(기본 "읽지 않음")' },
    emptyText: { type: 'string', description: '빈 목록 글자' },
    loading: { type: 'boolean', default: false, description: '불러오는 중(Skeleton 행)' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled', 'loading'],
  a11y: {
    keyboard: ['Tab', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
