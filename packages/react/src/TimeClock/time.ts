// 근무 · 휴가 컴포넌트가 함께 쓰는 시간 · 일수 글자(TimeClock · WorkHoursMeter · LeaveBalance · TeamSchedule · Payslip).
import { parseDate, weekdayName, type Locale } from '@terracelab/trellis-contracts';
import { useMemo } from 'react';
import { useLocale, useMessages, type Translate } from '../_internal/locale.js';

/** 'HH:mm' → 자정부터의 분. 형식이 틀리면 NaN */
export function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
}

/** Date → 'HH:mm' */
export function toHhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** 'YYYY-MM-DDTHH:mm' → Date(현지 시각). 날짜만 있으면 자정 */
export function parseDateTime(value: string): Date {
  const d = parseDate(value);
  const t = /T(\d{2}):(\d{2})/.exec(value);
  if (t) d.setHours(Number(t[1]), Number(t[2]), 0, 0);
  return d;
}

/** 일수: 정수는 그대로, 반차 · 반반차는 소수 둘째 자리까지(11.5 · 0.25) */
export function daysNumber(value: number): string {
  return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

export function isoOf(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** 분 → 5시간 30분 · 45분 · 8시간. 음수는 0 */
export function durationText(t: Translate, minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return t('worktime.duration.hm', { h, m });
  if (h) return t('worktime.duration.h', { h });
  return t('worktime.duration.m', { m });
}

/** 11월 9일(월) · Mon 2026-11-09 */
export function dateText(t: Translate, locale: Locale, value: string | Date): string {
  const d = typeof value === 'string' ? parseDate(value) : value;
  return t('worktime.date', {
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: weekdayName(locale, d.getDay(), 'short'),
    iso: isoOf(d),
  });
}

/** 컴포넌트에서: const f = useWorktimeText(); f.duration(330) */
export function useWorktimeText() {
  const t = useMessages();
  const locale = useLocale();
  return useMemo(
    () => ({
      t,
      locale,
      duration: (minutes: number) => durationText(t, minutes),
      days: (n: number) => t('worktime.days', { n: daysNumber(n) }),
      date: (value: string | Date) => dateText(t, locale, value),
    }),
    [t, locale],
  );
}
