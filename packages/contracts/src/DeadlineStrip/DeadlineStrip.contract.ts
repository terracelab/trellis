import { defineContract, type ContractBase } from '../_base.js';
import type { ChartColor } from '../charts/_shared.js';
import { dueDays, formatDate } from '../_shared/format.js';

/** 띠에 놓는 기한 하나 */
export interface DeadlineStripItem {
  id: string;
  /** 기한(ISO 2026-11-06) */
  date: string;
  /** 일의 이름("이서연 4대보험 취득신고") */
  title: string;
  /**
   * 점 색(토큰 슬롯). 지금은 차트 슬롯(series-1~) · 상태색. 범주 식별색(R-38)이 들어오면 그 슬롯도 받는다.
   * 색은 범주만 말하고 뜻은 category 글자가 말한다
   */
  color?: ChartColor;
  /** 범주 이름(축 · 법인 · 모듈). 읽는 이름에 붙는다("Employees") */
  category?: string;
  /** 끝난 기한: 속 빈 점 + 흐린 글자 + 숨은 "끝남". 지난 기한 묶음에 들지 않는다 */
  done?: boolean;
}

export interface DeadlineStripProps extends ContractBase {
  items: readonly DeadlineStripItem[];
  /** 띠 이름(목록의 접근성 이름). 보이는 제목은 감싼 Card가 단다. 예: "30일 기한" */
  caption: string;
  /** 첫날(ISO). 없으면 today */
  start?: string;
  /** 날 수. 기본 30, 7~60 */
  days?: number;
  /** 오늘로 볼 날(ISO). 데모 · 테스트는 고정한다. 없으면 기기 날짜 */
  today?: string;
  /** 기한을 누를 때. 있으면 점이 단추가 된다(같은 날 여러 건이면 묶음 단추가 그날 목록을 연다) */
  onItemPress?: (item: DeadlineStripItem) => void;
}

/** 띠의 한 날짜 묶음(같은 날 기한). overdue는 첫날 전의 끝나지 않은 기한 */
export interface DeadlineStripGroup {
  key: string;
  /** 'overdue' 또는 날짜(ISO) */
  date: string;
  /** 첫날 기준 0부터. overdue는 -1 */
  index: number;
  items: DeadlineStripItem[];
}

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** ISO + n일 */
export function addIsoDays(iso: string, n: number): string {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return isoOf(new Date(y, m - 1, d + n));
}

/** 띠 날 수: 7~60으로 자른 정수 */
export const deadlineStripDays = (days = 30) =>
  Math.max(7, Math.min(60, Math.floor(Number.isFinite(days) ? days : 30)));

/**
 * 기한을 띠 묶음으로 나눈다: 첫날 전 끝나지 않은 것은 overdue 하나로, 범위 안은 날짜마다(날짜순, 같은 날은
 * 끝나지 않은 것 먼저 · 받은 순서). 범위 밖(끝 다음 · 첫날 전에 끝난 것)은 뺀다
 */
export function groupDeadlines(
  items: readonly DeadlineStripItem[],
  start: string,
  days: number,
): DeadlineStripGroup[] {
  const end = addIsoDays(start, days - 1);
  const overdue = items
    .filter((i) => i.date < start && !i.done)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const byDate = new Map<string, DeadlineStripItem[]>();
  for (const it of items) {
    if (it.date < start || it.date > end) continue;
    const list = byDate.get(it.date);
    if (list) list.push(it);
    else byDate.set(it.date, [it]);
  }
  const groups: DeadlineStripGroup[] = overdue.length
    ? [{ key: 'overdue', date: 'overdue', index: -1, items: overdue }]
    : [];
  for (const date of [...byDate.keys()].sort()) {
    const list = byDate.get(date)!;
    list.sort((a, b) => Number(!!a.done) - Number(!!b.done));
    groups.push({ key: date, date, index: Math.round(dueDays(date, start)), items: list });
  }
  return groups;
}

/** 읽는 이름 조각: "11월 15일(일) · 이서연 4대보험 취득신고 · Employees" (기한 글자 · 끝남은 화면 쪽이 붙인다) */
export function deadlineItemText(item: DeadlineStripItem): string {
  return [formatDate(item.date, 'mdw'), item.title, item.category].filter(Boolean).join(' · ');
}

export const DeadlineStripContract = defineContract<DeadlineStripProps>({
  name: 'DeadlineStrip',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: {
      type: 'DeadlineStripItem[]',
      required: true,
      description: '기한(id · date · title · color · category · done)',
    },
    caption: { type: 'string', required: true, description: '띠 이름(접근성)' },
    start: { type: 'string', description: '첫날(ISO, 기본 today)' },
    days: { type: 'number', default: 30, description: '날 수(7~60)' },
    today: { type: 'string', description: '오늘로 볼 날(ISO, 기본 기기 날짜)' },
    onItemPress: {
      type: '(item: DeadlineStripItem) => void',
      description: '기한을 누를 때(있으면 점이 단추)',
    },
  },
  states: ['default', 'hover', 'focus'],
  a11y: {
    role: 'list',
    keyboard: ['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space', 'Escape'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: false },
});
