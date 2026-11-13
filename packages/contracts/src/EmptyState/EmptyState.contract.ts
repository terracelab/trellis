import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

/**
 * 빈 상태 종류(PR-30). 종류마다 기본 아이콘 · 제목 · 설명이 있다(문구는 messages `emptyState.<kind>.*`).
 * empty = 아직 항목 없음, noResult = 검색 · 필터 결과 없음, error = 불러오기 실패,
 * forbidden = 볼 권한 없음, offline = 연결 끊김,
 * notFound = 주소에 화면이 없음, expired = 로그인 만료(PG-44)
 */
export const EMPTY_STATE_KINDS = [
  'empty',
  'noResult',
  'error',
  'forbidden',
  'offline',
  'notFound',
  'expired',
] as const;
export type EmptyStateKind = (typeof EMPTY_STATE_KINDS)[number];

/** 종류마다 기본 아이콘(icon prop이 있으면 그것) */
export const EMPTY_STATE_ICONS: Readonly<Record<EmptyStateKind, IconName>> = {
  empty: 'inbox',
  noResult: 'search',
  error: 'circle-alert',
  forbidden: 'lock',
  offline: 'globe',
  notFound: 'map-pin-off',
  expired: 'timer-off',
};

export interface EmptyStateProps extends ContractBase {
  /** 빈 상태 종류. 기본 아이콘 · 제목 · 설명을 고른다. error는 role="alert"(PR-30) */
  kind?: EmptyStateKind;
  /** 무엇이 없는지 보여 주는 아이콘(inbox · file-text · package). 없으면 종류의 기본 아이콘 */
  icon?: IconName;
  /** 무엇이 없는지 한 문장: 이번 달 전표가 없습니다. 없으면 종류의 기본 제목 · 설명 */
  title?: string;
  /** 다음 행동 한 문장: 전표 입력에서 추가하세요 */
  description?: string;
  /** 요청 ID(kind="error" · "forbidden"). 문의할 때 옮겨 적는 한 줄로 보인다 */
  requestId?: string;
  /** 다음 행동 버튼(Button 하나. 전체 화면 오류는 주 동작 + 이전 화면 둘까지) */
  action?: unknown;
  /** 제목 단계. 없으면 문단(p). 화면 하나를 차지하는 오류(주소 없음 · 권한 없음 · 만료)는 1 */
  headingLevel?: 1 | 2 | 3 | 4;
  /** sm = 표 · 작은 카드 안 */
  size?: 'sm' | 'md';
}

export const EmptyStateContract = defineContract<EmptyStateProps>({
  name: 'EmptyState',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    kind: {
      type: "'empty' | 'noResult' | 'error' | 'forbidden' | 'offline' | 'notFound' | 'expired'",
      default: 'empty',
      values: EMPTY_STATE_KINDS,
      description: '종류(기본 아이콘 · 제목 · 설명, error는 알림)',
    },
    icon: { type: 'IconName', description: '아이콘(원 안, 없으면 종류의 기본)' },
    title: { type: 'string', description: '무엇이 없는지(없으면 종류의 기본 제목 · 설명)' },
    description: { type: 'string', description: '다음 행동 안내' },
    requestId: { type: 'string', description: '요청 ID 한 줄(kind="error" · "forbidden")' },
    action: { type: 'ReactNode', description: '다음 행동 버튼' },
    headingLevel: {
      type: '1 | 2 | 3 | 4',
      description: '제목 단계(없으면 문단, 전체 화면 오류는 1)',
    },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '크기' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'label-prop' },
  slots: ['action'],
  platforms: { web: true, native: true },
});
