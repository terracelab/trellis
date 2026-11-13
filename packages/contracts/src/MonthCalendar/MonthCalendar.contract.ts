import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { ChartColor } from '../charts/_shared.js';

/** 일정 상태: done = 끝남(흐림 + 취소선), late = 지연(위험 색 아이콘). 색만으로 말하지 않는다(숨은 글자) */
export const CALENDAR_EVENT_STATES = ['done', 'late'] as const;
export type CalendarEventState = (typeof CALENDAR_EVENT_STATES)[number];

/** 달력 크기: md = 칸에 일정 칩, sm = 낮은 칸에 점 + 건수(옆 목록과 나란히 두는 보조 달력) */
export const CALENDAR_SIZES = ['md', 'sm'] as const;
export type CalendarSize = (typeof CALENDAR_SIZES)[number];

/** 달력에 놓는 일정 하나 */
export interface MonthCalendarEvent {
  id: string;
  /** 시작일(ISO 2026-11-06) */
  date: string;
  /** 여러 날 일정의 마지막 날(ISO, 포함). 사이의 날마다 보인다 */
  endDate?: string;
  /** 일정 이름 */
  title: string;
  /** 시작 시각(HH:MM). 없으면 종일 */
  start?: string;
  /** 끝 시각(HH:MM). 일정 목록 · 주 · 일 보기 시간표에 보인다. 없으면 시간표에서 30분 칸 */
  end?: string;
  /** 점 색(토큰 슬롯). 캘린더 · 범주는 series-1~5, 상태는 success · warning · danger */
  color?: ChartColor;
  /**
   * 점 여러 개(R-37 8): 같은 날 · 같은 일정이 여러 범주(법인 3곳의 급여일)에 걸칠 때 칩 하나에 점을 늘어놓는다.
   * 있으면 color 대신 쓴다. 4개까지 보이고 넘으면 "+n"
   */
  colors?: readonly ChartColor[];
  /** 유형 아이콘(세무 · 급여 · 계약 · 공고 · 인증). 칩의 점 뒤, 글자 앞 */
  icon?: IconName;
  /** done = 끝남(흐림 + 취소선) · late = 지연(위험 색 아이콘). 이름 끝에 숨은 글자로도 읽는다 */
  state?: CalendarEventState;
  /** 보조 글자(장소 · 담당). 일정 목록 · 일 보기에 보인다 */
  meta?: string;
}

/** 보기: 월(날짜 칸) · 주(7일 시간표) · 일(하루 시간표) */
export const CALENDAR_VIEWS = ['month', 'week', 'day'] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

/** 주 · 일 보기 시간표의 시각 범위(HH:MM). 일정이 넘으면 그 일정까지 늘어난다 */
export interface CalendarTimeRange {
  start: string;
  end: string;
}

export interface MonthCalendarProps extends ContractBase {
  events: readonly MonthCalendarEvent[];
  /** 보이는 달(YYYY-MM, 제어). 주 · 일 보기에서는 보이는 날이 든 달 */
  month?: string;
  /** 처음 보이는 달(YYYY-MM). 없으면 고른 날 · 오늘의 달 */
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
  /** 고른 날(ISO, 제어). null이면 고른 날 없음 */
  selected?: string | null;
  /** 처음 고른 날(ISO) */
  defaultSelected?: string | null;
  onSelectDay?: (date: string) => void;
  /** 일정을 누를 때. 있으면 일정 칩이 버튼이 된다 */
  onEventPress?: (event: MonthCalendarEvent) => void;
  /** 오늘로 볼 날(ISO). 데모 · 테스트는 고정한다. 없으면 기기 날짜 */
  today?: string;
  /** 칸 하나에 보이는 일정 수. 넘치면 "N건 더". 주 · 일 보기의 종일 줄도 같다 */
  maxEvents?: number;
  /** 머리 오른쪽 자리(캘린더 고르기). 웹: ReactNode */
  actions?: unknown;
  /** 좁은 화면에서 달력 아래 고른 날의 일정 목록. 화면이 일정 칸을 따로 그리면 false */
  agenda?: boolean;
  /** 달력 이름 앞말(팀 일정). 접근성 이름은 "앞말 + 달" */
  label?: string;
  /** 보기(제어). 기본 month */
  view?: CalendarView;
  /** 처음 보기 */
  defaultView?: CalendarView;
  /** 보기가 바뀔 때(머리 보기 바꾸기) */
  onViewChange?: (view: CalendarView) => void;
  /** 머리 보기 바꾸기에 놓는 보기. 하나뿐이면 바꾸기가 없다(기본 ['month'] = 지금까지와 같은 월 달력) */
  views?: readonly CalendarView[];
  /** 주 · 일 보기 시간표 범위. 기본 08:00~20:00, 일정이 넘으면 늘어난다 */
  timeRange?: CalendarTimeRange;
  /** 지금 시각(HH:MM). 주 · 일 보기의 오늘 칸에 지금 선. 없으면 today를 주지 않았을 때만 기기 시각 */
  now?: string;
  /**
   * 크기(R-43 5). sm은 칸 높이를 줄이고 칸 안 일정을 점 + 건수로만 보인다(주 · 일 보기는 md와 같다).
   * 날을 누르면 onDayPress로 그날 일정을 받아 옆 목록에 보인다
   */
  size?: CalendarSize;
  /** 날을 누를 때 그날 일정(여러 날 일정 포함, 종일 먼저 · 시각 순). onSelectDay와 함께 불린다 */
  onDayPress?: (date: string, events: MonthCalendarEvent[]) => void;
}

/** 'HH:MM' → 자정부터의 분. 형식이 틀리면 NaN */
export function calendarMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
}

/** 시간표에서 끝 시각이 없거나 시작보다 앞이면 30분 칸으로 본다 */
export const CALENDAR_MIN_SLOT = 30;

/** 시간 일정의 [시작, 끝) 분. 끝이 없거나 틀리면 시작 + 30분 */
export function calendarEventSpan(e: Pick<MonthCalendarEvent, 'start' | 'end'>): [number, number] {
  const s = calendarMinutes(e.start ?? '');
  const raw = e.end ? calendarMinutes(e.end) : Number.NaN;
  const end = Number.isNaN(raw) || raw <= s ? s + CALENDAR_MIN_SLOT : raw;
  return [s, end];
}

/** 겹치는 시간 일정을 나란히 놓을 자리: col번째 칸(0부터) / 칸 수 cols */
export interface CalendarSlot {
  col: number;
  cols: number;
}

/**
 * 하루의 시간 일정을 겹치지 않게 칸으로 나눈다. 서로 이어서 겹치는 일정 묶음마다 칸 수를 정하고,
 * 일정은 비어 있는 가장 왼쪽 칸에 들어간다(시작 · 긴 일정 순). 반환은 일정 id → 자리
 */
export function layoutCalendarDay(
  events: readonly Pick<MonthCalendarEvent, 'id' | 'start' | 'end'>[],
): Map<string, CalendarSlot> {
  const items = events
    .filter((e) => e.start && !Number.isNaN(calendarMinutes(e.start)))
    .map((e) => ({ id: e.id, span: calendarEventSpan(e) }))
    .sort((a, b) => a.span[0] - b.span[0] || b.span[1] - a.span[1]);
  const out = new Map<string, CalendarSlot>();
  let group: { id: string; col: number }[] = [];
  let columns: number[] = [];
  let groupEnd = -1;
  const flush = () => {
    for (const g of group) out.set(g.id, { col: g.col, cols: columns.length });
    group = [];
    columns = [];
  };
  for (const it of items) {
    if (it.span[0] >= groupEnd) {
      flush();
      groupEnd = -1;
    }
    let col = columns.findIndex((end) => end <= it.span[0]);
    if (col < 0) {
      col = columns.length;
      columns.push(it.span[1]);
    } else columns[col] = it.span[1];
    group.push({ id: it.id, col });
    groupEnd = Math.max(groupEnd, it.span[1]);
  }
  flush();
  return out;
}

export const MonthCalendarContract = defineContract<MonthCalendarProps>({
  name: 'MonthCalendar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    events: { type: 'MonthCalendarEvent[]', required: true, description: '일정' },
    month: { type: 'string', description: '보이는 달(YYYY-MM, 제어)' },
    defaultMonth: { type: 'string', description: '처음 보이는 달(없으면 고른 날 · 오늘의 달)' },
    onMonthChange: { type: '(month: string) => void', description: '달이 바뀔 때' },
    selected: { type: 'string | null', description: '고른 날(ISO, 제어)' },
    defaultSelected: { type: 'string | null', description: '처음 고른 날(ISO)' },
    onSelectDay: { type: '(date: string) => void', description: '날을 고를 때' },
    onEventPress: {
      type: '(event: MonthCalendarEvent) => void',
      description: '일정을 누를 때(있으면 칩이 버튼)',
    },
    today: { type: 'string', description: '오늘로 볼 날(ISO, 기본 기기 날짜)' },
    maxEvents: { type: 'number', default: 3, description: '칸 하나에 보이는 일정 수' },
    actions: { type: 'ReactNode', description: '머리 오른쪽 자리' },
    agenda: { type: 'boolean', default: true, description: '좁은 화면에서 고른 날 일정 목록' },
    label: { type: 'string', description: '달력 이름 앞말' },
    view: {
      type: "'month' | 'week' | 'day'",
      default: 'month',
      values: CALENDAR_VIEWS,
      description: '보기(제어). 월 · 주 시간표 · 일 시간표',
    },
    defaultView: { type: "'month' | 'week' | 'day'", description: '처음 보기' },
    onViewChange: { type: '(view: CalendarView) => void', description: '보기가 바뀔 때' },
    views: {
      type: 'CalendarView[]',
      default: ['month'],
      description: '머리 보기 바꾸기에 놓는 보기(하나면 바꾸기 없음)',
    },
    timeRange: {
      type: '{ start: string; end: string }',
      description: '주 · 일 시간표 범위(기본 08:00~20:00, 일정이 넘으면 늘어난다)',
    },
    now: { type: 'string', description: '지금 시각(HH:MM). 주 · 일 보기 지금 선' },
    size: {
      type: "'md' | 'sm'",
      default: 'md',
      values: CALENDAR_SIZES,
      description: '크기. sm = 낮은 칸에 점 + 건수(보조 달력)',
    },
    onDayPress: {
      type: '(date: string, events: MonthCalendarEvent[]) => void',
      description: '날을 누를 때 그날 일정',
    },
  },
  states: ['default', 'hover', 'focus'],
  a11y: {
    role: 'grid',
    keyboard: [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'Enter',
      'Space',
      'Tab',
      'Escape',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
