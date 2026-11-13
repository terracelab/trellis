import { defineContract, type ContractBase } from '../_base.js';
import type { WorkPlace, WorkSchedule, WorkStatus } from '../_shared/worktime.js';

export interface TimeClockProps extends ContractBase {
  /** 근무 전 · 근무 중 · 휴게 중 · 퇴근 */
  status: WorkStatus;
  /** 지금 시각 'YYYY-MM-DDTHH:mm'. 없으면 기기 시각을 30초마다 다시 읽는다(스토리 · 테스트는 넘긴다) */
  now?: string;
  /** 출근 시각 'HH:mm' */
  clockIn?: string;
  /** 퇴근 시각 'HH:mm' */
  clockOut?: string;
  /** 소정 근무. 기본 09:00~18:00, 휴게 60분 */
  schedule?: WorkSchedule;
  /** 근무지 */
  place?: WorkPlace;
  /** 근무 유형 이름(고정 근무 · 시차 출퇴근 · 선택 근무) */
  workType?: string;
  /** 오늘 근무한 분. 없으면 출근 → 퇴근(없으면 지금)에서 4시간 넘으면 휴게를 뺀다 */
  workedMinutes?: number;
  /** 카드 제목. 기본 사전 timeClock.title */
  title?: string;
  /** 기록 요청 중(주 동작 단추가 처리 중) */
  loading?: boolean;
  onClockIn?: () => void;
  onClockOut?: () => void;
  /** 있으면 근무 중에 휴게 시작 단추 */
  onBreakStart?: () => void;
  /** 있으면 휴게 중에 휴게 끝 단추 */
  onBreakEnd?: () => void;
}

export const TimeClockContract = defineContract<TimeClockProps>({
  name: 'TimeClock',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    status: {
      type: "'before' | 'working' | 'break' | 'done'",
      required: true,
      values: ['before', 'working', 'break', 'done'],
      description: '출퇴근 상태',
    },
    now: { type: 'string', description: "지금 시각 'YYYY-MM-DDTHH:mm'(없으면 기기 시각)" },
    clockIn: { type: 'string', description: "출근 시각 'HH:mm'" },
    clockOut: { type: 'string', description: "퇴근 시각 'HH:mm'" },
    schedule: {
      type: 'WorkSchedule',
      default: "{ start: '09:00', end: '18:00', breakMinutes: 60 }",
      description: '소정 근무 시각 · 휴게',
    },
    place: {
      type: "'office' | 'remote' | 'field'",
      values: ['office', 'remote', 'field'],
      description: '근무지',
    },
    workType: { type: 'string', description: '근무 유형 이름' },
    workedMinutes: { type: 'number', description: '오늘 근무한 분(없으면 계산)' },
    title: { type: 'string', description: '카드 제목' },
    loading: { type: 'boolean', default: false, description: '기록 요청 중' },
    onClockIn: { type: '() => void', description: '출근하기' },
    onClockOut: { type: '() => void', description: '퇴근하기' },
    onBreakStart: { type: '() => void', description: '휴게 시작(있을 때만 단추)' },
    onBreakEnd: { type: '() => void', description: '휴게 끝(있을 때만 단추)' },
  },
  states: ['default', 'loading'],
  a11y: { keyboard: ['Tab', 'Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
