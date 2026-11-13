import {
  CalendarHeatmapContract,
  type CalendarHeatmapProps,
  type HeatDatum,
  weekdayName,
} from '@terracelab/trellis-contracts';
import { num } from '../_internal/chart/format.js';
import { cx } from '../_internal/cx.js';
import { useLocale, useMessages } from '../_internal/locale.js';

/** 월요일 시작(0 = 일요일) */
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const toDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
};
const iso = (d: Date) => d.toISOString().slice(0, 10);
/** 월요일 = 0 */
const weekday = (d: Date) => (d.getUTCDay() + 6) % 7;

export interface HeatCellModel {
  date: string;
  value: number | null;
  level: number;
  dayOfMonth: number;
  monthStart: boolean;
}

/** 단계: 최댓값을 5등분(선형). 0·없음은 0 */
export function heatLevel(value: number | null | undefined, max: number): number {
  if (!value || value <= 0 || max <= 0) return 0;
  return Math.min(5, Math.max(1, Math.ceil((value / max) * 5)));
}

/** 연속된 날짜 칸(시작 주 월요일 ~ 끝 주 일요일) */
export function buildHeatCells(data: readonly HeatDatum[]): {
  cells: HeatCellModel[];
  weeks: number;
  max: number;
} {
  if (data.length === 0) return { cells: [], weeks: 0, max: 0 };
  const byDate = new Map(data.map((d) => [d.date, d.value]));
  const dates = data.map((d) => toDate(d.date).getTime());
  const start = new Date(Math.min(...dates));
  const end = new Date(Math.max(...dates));
  start.setUTCDate(start.getUTCDate() - weekday(start));
  end.setUTCDate(end.getUTCDate() + (6 - weekday(end)));
  const max = Math.max(...data.map((d) => d.value));
  const cells: HeatCellModel[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += 86_400_000) {
    const d = new Date(t);
    const key = iso(d);
    const value = byDate.has(key) ? (byDate.get(key) ?? null) : null;
    cells.push({
      date: key,
      value,
      level: heatLevel(value, max),
      dayOfMonth: d.getUTCDate(),
      monthStart: d.getUTCDate() === 1,
    });
  }
  return { cells, weeks: cells.length / 7, max };
}

export function CalendarHeatmap({
  data,
  unit,
  format = num,
  layout = 'auto',
  ariaLabel,
  id,
  testID,
  className,
}: CalendarHeatmapProps & { className?: string }) {
  const t = useMessages();
  const locale = useLocale();
  const { cells, weeks } = buildHeatCells(data);
  const mode = layout === 'auto' ? (weeks <= 6 ? 'month' : 'year') : layout;
  const label = (c: HeatCellModel) =>
    c.value === null
      ? t('chart.none', { date: c.date })
      : `${c.date} ${format(c.value)}${unit ?? ''}`;
  return (
    <div
      className={cx('tl-calendar-heatmap', className)}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-layout={mode}
      style={{ ['--tl-heat-weeks' as string]: weeks }}
    >
      <div className="tl-calendar-heatmap__weekdays" aria-hidden="true">
        {WEEK.map((d) => (
          <span key={d}>{weekdayName(locale, d)}</span>
        ))}
      </div>
      <div className="tl-calendar-heatmap__grid">
        {cells.map((c) => (
          <span
            key={c.date}
            className="tl-calendar-heatmap__cell"
            data-level={c.level}
            data-empty={c.value === null || undefined}
            data-month-start={c.monthStart || undefined}
            title={label(c)}
          >
            {mode === 'month' && <span className="tl-calendar-heatmap__day">{c.dayOfMonth}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
CalendarHeatmap.displayName = CalendarHeatmapContract.name;
