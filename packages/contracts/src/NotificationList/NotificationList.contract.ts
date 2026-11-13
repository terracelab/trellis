import { defineContract, type ContractBase, type ModuleId } from '../_base.js';

/** 알림 한 건(NotificationItem props + id) */
export interface NotificationListItem {
  id: string;
  title: string;
  body?: string;
  /** 발생 시각(ISO) */
  time: string;
  unread?: boolean;
  module?: ModuleId;
  tone?: 'neutral' | 'warning' | 'danger';
  toneLabel?: string;
  href?: string;
}

export interface NotificationListProps extends ContractBase {
  /** 알림. 순서는 상관없다(묶음 안에서 읽지 않은 것 먼저, 그다음 최근 순) */
  items: readonly NotificationListItem[];
  /** 알림을 누를 때(읽음 처리 + 이동) */
  onItemPress?: (id: string) => void;
  /** 있으면 머리에 "모두 읽음" 단추(읽지 않은 것이 있을 때만) */
  onMarkAllRead?: () => void;
  /** 날짜 묶음(오늘 · 어제 · 이번 주 · 이전). none이면 한 목록 */
  groupBy?: 'day' | 'none';
  /** 상대 시각 · 묶음 기준(없으면 지금) */
  now?: string;
  /** 알림이 없을 때 글(기본 "새 알림이 없습니다") */
  emptyText?: string;
  /** 목록 이름(기본 "알림") */
  label?: string;
  /** 묶음 제목 단계(기본 3: 서랍 제목 h2 아래) */
  headingLevel?: 2 | 3 | 4;
}

export const NotificationListContract = defineContract<NotificationListProps>({
  name: 'NotificationList',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: { type: 'NotificationListItem[]', required: true, description: '알림' },
    onItemPress: { type: '(id: string) => void', description: '알림을 누를 때' },
    onMarkAllRead: { type: '() => void', description: '"모두 읽음" 단추' },
    groupBy: {
      type: "'day' | 'none'",
      default: 'day',
      values: ['day', 'none'],
      description: '날짜 묶음',
    },
    now: { type: 'string', description: '상대 시각 · 묶음 기준(없으면 지금)' },
    emptyText: { type: 'string', description: '빈 목록 글' },
    label: { type: 'string', description: '목록 이름(기본 "알림")' },
    headingLevel: {
      type: '2 | 3 | 4',
      default: 3,
      values: ['2', '3', '4'],
      description: '묶음 제목 단계',
    },
  },
  states: ['default'],
  a11y: { role: 'list', keyboard: ['Tab', 'Enter'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
