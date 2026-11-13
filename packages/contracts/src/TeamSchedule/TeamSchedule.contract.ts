import { defineContract, type ContractBase } from '../_base.js';
import type { ScheduleKind } from '../_shared/worktime.js';

export interface TeamScheduleMember {
  id: string;
  name: string;
  /** 이름 아래 작은 글자(직책 · 팀) */
  meta?: string;
  /** 사진 주소(Avatar) */
  avatar?: string;
}

export interface TeamScheduleEvent {
  id: string;
  personId: string;
  kind: ScheduleKind;
  /** 'YYYY-MM-DD' */
  start: string;
  /** 'YYYY-MM-DD'(포함). 없으면 하루 */
  end?: string;
  /** 칸 글자. 없으면 종류 이름 */
  label?: string;
  /** 사유 · 장소(접근성 이름 끝에 붙는다) */
  note?: string;
}

export interface TeamScheduleProps extends ContractBase {
  people: readonly TeamScheduleMember[];
  events: readonly TeamScheduleEvent[];
  /** 첫날 'YYYY-MM-DD' */
  start: string;
  /** 날 수(7 · 14 · 한 달 28~31). 기본 7 */
  days?: number;
  /** 오늘(열 강조) */
  today?: string;
  /** 공휴일(주말처럼 칠하고 머리에 이름) */
  holidays?: readonly { date: string; label: string }[];
  /** 표 이름(스크린리더). 보이는 제목과 같게 */
  caption: string;
  /** 있으면 일정이 단추(상세 · 결재 문서 열기) */
  onEventPress?: (event: TeamScheduleEvent) => void;
  /** 웹: (person) => ReactNode. 이름 칸을 바꾼다 */
  renderPerson?: unknown;
  /** 위 범례(쓰인 종류만). 기본 true */
  legend?: boolean;
  loading?: boolean;
  /** 사람이 없을 때 */
  empty?: unknown;
}

export const TeamScheduleContract = defineContract<TeamScheduleProps>({
  name: 'TeamSchedule',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    people: { type: 'TeamScheduleMember[]', required: true, description: '행(사람)' },
    events: {
      type: 'TeamScheduleEvent[]',
      required: true,
      description: '일정(휴가 · 근무 형태 · 교대)',
    },
    start: { type: 'string', required: true, description: "첫날 'YYYY-MM-DD'" },
    days: { type: 'number', default: 7, description: '날 수(7 · 14 · 28~31)' },
    today: { type: 'string', description: '오늘(열 강조)' },
    holidays: { type: '{ date: string; label: string }[]', description: '공휴일' },
    caption: { type: 'string', required: true, description: '표 이름(접근성)' },
    onEventPress: { type: '(event) => void', description: '일정을 누를 때(있으면 단추)' },
    renderPerson: { type: '(person) => ReactNode', description: '이름 칸 바꾸기' },
    legend: { type: 'boolean', default: true, description: '범례(쓰인 종류만)' },
    loading: { type: 'boolean', default: false, description: '불러오는 중(스켈레톤 행)' },
    empty: { type: 'ReactNode', description: '사람이 없을 때' },
  },
  states: ['default', 'hover', 'focus', 'loading'],
  a11y: { role: 'table', keyboard: ['Tab(일정)', 'Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
