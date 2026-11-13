import { defineContract, type ContractBase, type StatusKind } from '../_base.js';
import type { WorkSchedule } from '../_shared/worktime.js';

/** 요일 한 줄: 출근 ~ 퇴근 */
export interface WorkTimelineDay {
  /** 날짜(ISO) */
  date: string;
  /** 출근 시각 'HH:MM'. 없으면 막대 대신 off 글자 */
  clockIn?: string;
  /** 퇴근 시각 'HH:MM'. 출근만 있고 오늘이면 지금(now)까지 근무 중 막대 */
  clockOut?: string;
  /** 근무 분(휴게 뺀 값). 없으면 출근 ~ 퇴근(근무 중이면 지금)에서 schedule.breakMinutes를 뺀다 */
  minutes?: number;
  /** 막대 대신 보이는 글자(연차 · 휴일 · 공휴일). 출근이 없을 때 */
  off?: string;
  /** 상태 칸(정상 · 지각 · 외근 · 휴가): 점 + 글자. 없으면 상태 칸이 비고, 근무 중은 자동 */
  status?: { tone: StatusKind | 'neutral'; label: string };
}

export interface WorkTimelineProps extends ContractBase {
  /** 줄마다 하루(보통 월~금 또는 월~일) */
  days: readonly WorkTimelineDay[];
  /** 소정 근무 시각. 막대 위 점선 틀이고, end를 넘은 만큼이 연장이다 */
  schedule: WorkSchedule;
  /** 눈금 범위(HH:MM). 기본 07:00~23:00, 3시간마다 눈금 */
  range?: { start: string; end: string };
  /** 오늘(ISO). 그 줄은 바탕 한 단계 */
  today?: string;
  /** 지금 시각(HH:MM). 퇴근 전인 오늘 줄의 근무 중 막대 끝 */
  now?: string;
  /** 표 이름(접근성 · 숨은 caption) */
  label: string;
  /** 범례(정규 · 연장 · 근무 중). 기본 true */
  legend?: boolean;
}

/** 막대 조각: 정규 · 연장 · 근무 중 */
export const WORK_SEGMENT_KINDS = ['regular', 'overtime', 'live'] as const;
export type WorkSegmentKind = (typeof WORK_SEGMENT_KINDS)[number];

export interface WorkSegment {
  kind: WorkSegmentKind;
  /** 'HH:MM' */
  from: string;
  to: string;
}

const toMin = (hhmm: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
};

/** 하루의 막대 조각. 출근 ~ 소정 끝은 정규(근무 중이면 live), 소정 끝을 넘은 만큼은 연장. 출근이 없으면 [] */
export function workSegments(
  day: Pick<WorkTimelineDay, 'clockIn' | 'clockOut'>,
  schedule: Pick<WorkSchedule, 'end'>,
  now?: string,
): WorkSegment[] {
  if (!day.clockIn) return [];
  const live = !day.clockOut;
  const end = day.clockOut ?? now;
  if (!end || toMin(end) <= toMin(day.clockIn)) return [];
  const out: WorkSegment[] = [];
  const cut = schedule.end;
  const inMin = toMin(day.clockIn);
  const endMin = toMin(end);
  const cutMin = toMin(cut);
  if (inMin < cutMin)
    out.push({
      kind: live ? 'live' : 'regular',
      from: day.clockIn,
      to: endMin > cutMin ? cut : end,
    });
  if (endMin > cutMin)
    out.push({ kind: 'overtime', from: inMin > cutMin ? day.clockIn : cut, to: end });
  return out;
}

/** 근무 분: minutes가 있으면 그것, 없으면 출근 ~ 퇴근(근무 중이면 지금) − 휴게. 출근이 없으면 0 */
export function workMinutes(
  day: Pick<WorkTimelineDay, 'clockIn' | 'clockOut' | 'minutes'>,
  schedule: Pick<WorkSchedule, 'breakMinutes'>,
  now?: string,
): number {
  if (day.minutes != null) return day.minutes;
  const end = day.clockOut ?? now;
  if (!day.clockIn || !end) return 0;
  const span = toMin(end) - toMin(day.clockIn);
  if (Number.isNaN(span) || span <= 0) return 0;
  return Math.max(0, span - (span > 4 * 60 ? (schedule.breakMinutes ?? 0) : 0));
}

/** 눈금: 범위 양 끝 + 3시간마다(09 · 12 · 15 · 18 · 21) */
export function workTicks(start = '07:00', end = '23:00'): string[] {
  const s = toMin(start);
  const e = toMin(end);
  const out = [start];
  for (let h = Math.floor(s / 60) + 1; h * 60 < e; h++)
    if (h % 3 === 0) out.push(`${String(h).padStart(2, '0')}:00`);
  out.push(end);
  return out;
}

export const WorkTimelineContract = defineContract<WorkTimelineProps>({
  name: 'WorkTimeline',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    days: {
      type: 'WorkTimelineDay[]',
      required: true,
      description: '줄마다 하루(date · clockIn · clockOut · minutes · off · status)',
    },
    schedule: {
      type: 'WorkSchedule',
      required: true,
      description: '소정 근무 시각(start · end · breakMinutes). end를 넘으면 연장',
    },
    range: {
      type: '{ start: string; end: string }',
      description: '눈금 범위(기본 07:00~23:00)',
    },
    today: { type: 'string', description: '오늘(ISO). 그 줄은 바탕 한 단계' },
    now: { type: 'string', description: '지금 시각(HH:MM). 근무 중 막대의 끝' },
    label: { type: 'string', required: true, description: '표 이름(접근성)' },
    legend: { type: 'boolean', default: true, description: '범례(정규 · 연장 · 근무 중)' },
  },
  states: ['default'],
  a11y: { role: 'table', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
