import { CalendarHeatmap } from './CalendarHeatmap.js';

/** 월 — 날짜별 크기를 한 색 진하기 5단계로 */
export function Month() {
  const data = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const weekday = (new Date(Date.UTC(2026, 9, day)).getUTCDay() + 6) % 7;
    const value = weekday >= 5 ? 4 + (day % 4) : 22 + ((day * 7) % 14);
    return { date: `2026-10-${String(day).padStart(2, '0')}`, value };
  });
  return <CalendarHeatmap data={data} unit="건" ariaLabel="2026년 10월 일별 판매. 평일이 많다" />;
}
