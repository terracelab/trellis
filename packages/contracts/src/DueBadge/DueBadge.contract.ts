import { defineContract, type ContractBase } from '../_base.js';

export interface DueBadgeProps extends ContractBase {
  /** 기한(ISO 날짜 2026-11-12) */
  due: string;
  /** 기준일(ISO). 없으면 오늘. 스토리 · 테스트는 고정한다 */
  today?: string;
  /** 이 일수 안으로 들어오면 주의 색(D-3 ~ D-day) */
  warnDays?: number;
  /** 처리를 끝냈으면 true. 기한 대신 중립 "완료" */
  done?: boolean;
  /** done일 때 라벨(입고 완료 · 신고 완료) */
  doneLabel?: string;
  size?: 'sm' | 'md';
}

export const DueBadgeContract = defineContract<DueBadgeProps>({
  name: 'DueBadge',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    due: { type: 'string', required: true, description: '기한(ISO 날짜)' },
    today: { type: 'string', description: '기준일(ISO, 기본 오늘)' },
    warnDays: { type: 'number', default: 3, description: '주의 색으로 바뀌는 남은 일수' },
    done: { type: 'boolean', default: false, description: '처리 완료(중립 라벨)' },
    doneLabel: { type: 'string', default: '완료', description: '완료 라벨' },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '크기' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  platforms: { web: true, native: true },
});
