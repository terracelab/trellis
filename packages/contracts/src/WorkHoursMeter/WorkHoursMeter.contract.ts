import { defineContract, type ContractBase } from '../_base.js';
import type { LeaveKind } from '../_shared/worktime.js';

/** 하루 근무(요일별 막대) */
export interface WorkDay {
  /** 'YYYY-MM-DD' */
  date: string;
  /** 소정 근로 분 */
  regularMinutes: number;
  /** 연장 근로 분 */
  overtimeMinutes?: number;
  /** 휴가 날(막대 대신 휴가 이름) */
  leave?: LeaveKind;
  /** 휴일(주말 · 공휴일) */
  holiday?: boolean;
}

export interface WorkHoursMeterProps extends ContractBase {
  /** 이번 주 근무한 분(정규 + 연장). days가 있으면 days의 합 */
  totalMinutes?: number;
  /** 요일별 근무. 있으면 아래에 요일 막대 */
  days?: readonly WorkDay[];
  /** 주 소정 근로(분). 기본 2400(40시간) */
  regularLimit?: number;
  /**
   * 연장을 세는 기준. week = 주 누계가 regularLimit을 넘은 시간(요일 막대도 넘은 날부터 연장 색),
   * day = days[].overtimeMinutes의 합(하루 소정을 넘은 시간, 근태 기록 그대로). 요약 · 범례 · 요일 막대가 같은 기준을 쓴다
   */
  overtimeBasis?: 'week' | 'day';
  /** 주 최대 근로(분). 기본 3120(52시간) */
  limit?: number;
  /** 경고를 시작하는 분. 기본 limit − 240(48시간) */
  warnAt?: number;
  /** 기간(이번 주 월~일) */
  period?: { from: string; to: string };
  /** 오늘(요일 막대 강조) */
  today?: string;
  /** 카드 제목. 기본 사전 workHours.title */
  title?: string;
  loading?: boolean;
}

export const WorkHoursMeterContract = defineContract<WorkHoursMeterProps>({
  name: 'WorkHoursMeter',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    totalMinutes: { type: 'number', description: '이번 주 근무한 분(days가 있으면 합)' },
    days: { type: 'WorkDay[]', description: '요일별 근무(정규 · 연장 · 휴가 · 휴일)' },
    regularLimit: { type: 'number', default: 2400, description: '주 소정 근로 분(40시간)' },
    overtimeBasis: {
      type: "'week' | 'day'",
      default: 'week',
      values: ['week', 'day'],
      description: '연장 기준(week = 주 누계가 소정을 넘은 시간, day = 날마다 기록한 연장의 합)',
    },
    limit: { type: 'number', default: 3120, description: '주 최대 근로 분(52시간)' },
    warnAt: { type: 'number', description: '경고 시작 분(기본 최대 − 4시간)' },
    period: { type: '{ from: string; to: string }', description: '기간' },
    today: { type: 'string', description: "오늘 'YYYY-MM-DD'(요일 막대 강조)" },
    title: { type: 'string', description: '카드 제목' },
    loading: { type: 'boolean', default: false, description: '불러오는 중(스켈레톤)' },
  },
  states: ['default', 'loading'],
  a11y: { role: 'meter', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
