// 근무 · 휴가 · 급여 어휘 · 타입(PR-27). 라벨은 사전(messages.ts worktime.*)에서 꺼낸다.
// 근로기준법 기준: 주 소정 40시간(제50조) + 연장 12시간(제53조) = 52시간, 연차(제60조) · 사용 촉진(제61조),
// 임금명세서 기재 사항(제48조 제2항, 시행령 제27조의2).
import type { IconName } from '@terracelab/trellis-icons';
import type { ModuleGroup } from '../_base.js';

/** 출퇴근 상태: 근무 전 · 근무 중 · 휴게 중 · 퇴근 */
export const WORK_STATUSES = ['before', 'working', 'break', 'done'] as const;
export type WorkStatus = (typeof WORK_STATUSES)[number];

/** 근무지: 사무실 · 재택 · 외근 */
export const WORK_PLACES = ['office', 'remote', 'field'] as const;
export type WorkPlace = (typeof WORK_PLACES)[number];

/** 소정 근무 시각(회사 · 근무 유형 설정). 시각은 'HH:mm' */
export interface WorkSchedule {
  start: string;
  end: string;
  /** 휴게 분(4시간에 30분, 8시간에 60분 이상, 제54조) */
  breakMinutes?: number;
}

/** 주 소정 근로 · 주 최대 근로(분) */
export const WEEKLY_REGULAR_MINUTES = 40 * 60;
export const WEEKLY_LIMIT_MINUTES = 52 * 60;

/** 휴가 종류. 연차 차감 일수는 SCHEDULE_KINDS.deduct */
export const LEAVE_KINDS = [
  'annual',
  'halfAm',
  'halfPm',
  'quarter',
  'compensatory',
  'family',
  'sick',
  'other',
] as const;
export type LeaveKind = (typeof LEAVE_KINDS)[number];

/** 근무 형태 일정: 재택 · 출장 · 외근 · 교육 */
export const WORK_KINDS = ['remote', 'trip', 'field', 'education'] as const;
export type WorkKind = (typeof WORK_KINDS)[number];

/** 교대 근무: 주간 · 야간 · 휴무 */
export const SHIFT_KINDS = ['shiftDay', 'shiftNight', 'shiftOff'] as const;
export type ShiftKind = (typeof SHIFT_KINDS)[number];

export type ScheduleKind = LeaveKind | WorkKind | ShiftKind;

export interface ScheduleKindMeta {
  group: 'leave' | 'work' | 'shift';
  /** 칠하는 색(color.module.<tone>.subtle 바탕 + default 점). neutral = bg.sunken */
  tone: ModuleGroup | 'neutral';
  icon: IconName;
  /** 반차: 하루 칸의 앞(오전) · 뒤(오후) 반만 칠한다 */
  part?: 'am' | 'pm';
  /** 연차에서 빼는 일수(반차 0.5, 반반차 0.25). 없으면 0 */
  deduct?: number;
}

/** 일정 종류마다 묶음 · 색 · 아이콘. 색이 겹치는 종류는 아이콘 · 글자로 가른다 */
export const SCHEDULE_KINDS: Record<ScheduleKind, ScheduleKindMeta> = {
  annual: { group: 'leave', tone: 'erp', icon: 'calendar-days', deduct: 1 },
  halfAm: { group: 'leave', tone: 'erp', icon: 'calendar-days', part: 'am', deduct: 0.5 },
  halfPm: { group: 'leave', tone: 'erp', icon: 'calendar-days', part: 'pm', deduct: 0.5 },
  quarter: { group: 'leave', tone: 'erp', icon: 'calendar-days', deduct: 0.25 },
  compensatory: { group: 'leave', tone: 'erp', icon: 'calendar-plus' },
  family: { group: 'leave', tone: 'ecm', icon: 'calendar-days' },
  sick: { group: 'leave', tone: 'commerce', icon: 'activity' },
  other: { group: 'leave', tone: 'neutral', icon: 'calendar' },
  remote: { group: 'work', tone: 'crm', icon: 'house' },
  trip: { group: 'work', tone: 'ecm', icon: 'plane' },
  field: { group: 'work', tone: 'groupware', icon: 'map-pin' },
  education: { group: 'work', tone: 'scm', icon: 'clipboard-check' },
  shiftDay: { group: 'shift', tone: 'scm', icon: 'sun' },
  shiftNight: { group: 'shift', tone: 'ecm', icon: 'moon' },
  shiftOff: { group: 'shift', tone: 'neutral', icon: 'minus' },
};

/** 연차 부여 기준: 회계연도(1월 1일 일괄) · 입사일 */
export type LeaveBasis = 'fiscal' | 'hire';

/** 급여 항목 코드. 있으면 라벨을 사전에서 꺼낸다(label이 이긴다) */
export const PAY_CODES = [
  // 지급
  'basePay',
  'overtimePay',
  'nightPay',
  'holidayPay',
  'annualLeavePay',
  'bonus',
  'mealAllowance',
  'carAllowance',
  // 공제(4대보험 근로자 부담 · 원천징수)
  'nationalPension',
  'healthInsurance',
  'longTermCare',
  'employmentInsurance',
  'incomeTax',
  'localIncomeTax',
] as const;
export type PayCode = (typeof PAY_CODES)[number];

/** 임금명세서 한 줄 */
export interface PayItem {
  code?: PayCode;
  /** 항목 이름(명사). code가 없으면 필수 */
  label?: string;
  amount: number;
  /** 계산 방법(출근 일수 · 시간에 따라 달라지는 항목은 법정 기재 사항): 6시간 × 15,311원 × 1.5 */
  basis?: string;
  /** 비과세(식대 월 20만 원 · 자가운전보조금) */
  taxFree?: boolean;
}
