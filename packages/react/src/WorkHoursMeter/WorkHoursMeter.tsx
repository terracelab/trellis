import {
  formatPeriod,
  parseDate,
  weekdayName,
  WEEKLY_LIMIT_MINUTES,
  WEEKLY_REGULAR_MINUTES,
  WorkHoursMeterContract,
  type WorkDay,
  type WorkHoursMeterProps,
} from '@terracelab/trellis-contracts';
import type { CSSProperties } from 'react';
import { cx } from '../_internal/cx.js';
import { Card } from '../Card/Card.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { useWorktimeText } from '../TimeClock/time.js';

/** 요일 막대 위 글자: 8:10(칸이 좁아 시:분) */
const clock = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(Math.round(minutes % 60)).padStart(2, '0')}`;
const pct = (v: number) => `${Math.max(0, Math.min(100, v * 100))}%`;

export type WorkHoursTone = 'ok' | 'warning' | 'danger';

/** 요일 막대 한 칸의 정규 · 연장 분 */
export interface WorkDaySplit {
  regular: number;
  overtime: number;
}

/**
 * 요일마다 정규 · 연장을 나눈다. day = 근태 기록(regularMinutes · overtimeMinutes) 그대로,
 * week = 날짜 순으로 쌓아 주 누계가 regularLimit을 넘은 몫부터 연장. 요약 연장 = 나눈 연장의 합이라 둘이 어긋나지 않는다
 */
export function splitWorkDays(
  days: readonly WorkDay[],
  basis: 'week' | 'day',
  regularLimit: number,
): Map<string, WorkDaySplit> {
  const out = new Map<string, WorkDaySplit>();
  if (basis === 'day') {
    for (const d of days)
      out.set(d.date, { regular: d.regularMinutes, overtime: d.overtimeMinutes ?? 0 });
    return out;
  }
  let sum = 0;
  for (const d of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    const worked = d.regularMinutes + (d.overtimeMinutes ?? 0);
    const regular = Math.max(0, Math.min(worked, regularLimit - sum));
    out.set(d.date, { regular, overtime: worked - regular });
    sum += worked;
  }
  return out;
}

/** 상태: 경고 시작 전 ok, 경고 ~ 한도 warning, 한도 이상 danger */
export function workHoursTone(total: number, warnAt: number, limit: number): WorkHoursTone {
  if (total >= limit) return 'danger';
  if (total >= warnAt) return 'warning';
  return 'ok';
}

export function WorkHoursMeter({
  totalMinutes,
  days,
  regularLimit = WEEKLY_REGULAR_MINUTES,
  overtimeBasis = 'week',
  limit = WEEKLY_LIMIT_MINUTES,
  warnAt,
  period,
  today,
  title,
  loading = false,
  id,
  testID,
  className,
}: WorkHoursMeterProps & { className?: string }) {
  const f = useWorktimeText();
  const { t } = f;
  const total =
    days?.reduce((s, d) => s + d.regularMinutes + (d.overtimeMinutes ?? 0), 0) ?? totalMinutes ?? 0;
  const warn = warnAt ?? limit - 240;
  const tone = workHoursTone(total, warn, limit);
  const scale = Math.max(limit, total) || 1;
  // 요일 기록이 없으면 하루 기준을 셀 수 없어 주 기준으로 센다
  const basis = days && days.length > 0 ? overtimeBasis : 'week';
  const split = days ? splitWorkDays(days, basis, regularLimit) : undefined;
  const overtimeAll = Math.min(
    total,
    basis === 'day' && split
      ? [...split.values()].reduce((s, d) => s + d.overtime, 0)
      : Math.max(0, total - regularLimit),
  );
  // 막대: 정규 → 연장 → 한도(limit)를 넘은 몫. 한도를 넘은 몫도 연장이라 범례 연장 = overtime + over
  const over = Math.max(0, total - limit);
  const overtime = Math.max(0, overtimeAll - over);
  const regular = total - overtime - over;
  const limitText = f.duration(limit);
  const status =
    tone === 'danger' && over > 0
      ? t('workHours.over', { limit: limitText, time: f.duration(over) })
      : t('workHours.left', { limit: limitText, time: f.duration(limit - total) });
  const heading = title ?? t('workHours.title');

  return (
    <Card
      id={id}
      testID={testID}
      className={cx('tl-work-hours', className)}
      title={heading}
      subtitle={period ? formatPeriod(period.from, period.to) : undefined}
    >
      {loading ? (
        <div className="tl-work-hours__body" aria-busy>
          <Skeleton shape="rect" width="50%" height="var(--tl-type-display-line-height)" />
          <Skeleton shape="rect" height="var(--tl-space-12)" />
          <Skeleton lines={2} />
          <span className="tl-sr-only">{t('common.loading')}</span>
        </div>
      ) : (
        <div className="tl-work-hours__body" data-tone={tone} data-overtime-basis={basis}>
          <p className="tl-work-hours__summary">
            <span className="tl-work-hours__total">{f.duration(total)}</span>
            <span className="tl-work-hours__limit">/ {limitText}</span>
          </p>
          <div
            className="tl-work-hours__meter"
            role="meter"
            aria-label={heading}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(total, limit)}
            aria-valuetext={t('workHours.meter', { total: f.duration(total), limit: limitText })}
          >
            <div className="tl-work-hours__track" aria-hidden>
              <span
                className="tl-work-hours__seg"
                data-kind="regular"
                style={{ '--tl-work-hours-size': pct(regular / scale) } as CSSProperties}
              />
              {overtime > 0 && (
                <span
                  className="tl-work-hours__seg"
                  data-kind="overtime"
                  style={{ '--tl-work-hours-size': pct(overtime / scale) } as CSSProperties}
                />
              )}
              {over > 0 && (
                <span
                  className="tl-work-hours__seg"
                  data-kind="over"
                  style={{ '--tl-work-hours-size': pct(over / scale) } as CSSProperties}
                />
              )}
            </div>
            <div className="tl-work-hours__ticks" aria-hidden>
              <span
                className="tl-work-hours__tick"
                style={{ '--tl-work-hours-at': pct(regularLimit / scale) } as CSSProperties}
              >
                {t('workHours.tickRegular', { time: f.duration(regularLimit) })}
              </span>
              <span
                className="tl-work-hours__tick"
                data-limit=""
                style={{ '--tl-work-hours-at': pct(limit / scale) } as CSSProperties}
              >
                {t('workHours.tickLimit', { time: limitText })}
              </span>
            </div>
          </div>
          <p className="tl-work-hours__status">
            {tone !== 'ok' && <Icon name="triangle-alert" className="tl-work-hours__alert" />}
            <span>{status}</span>
          </p>
          <ul className="tl-work-hours__legend">
            <li data-kind="regular">
              {t('workHours.regular')} {f.duration(regular)}
            </li>
            <li data-kind="overtime">
              {t('workHours.overtime')} {f.duration(overtimeAll)}
            </li>
            {over > 0 && <li data-kind="over">{t('workHours.overLimit')}</li>}
          </ul>
          {days && days.length > 0 && split && (
            <>
              <Days days={days} split={split} today={today} />
              {/* 요일 막대와 요약이 같은 기준인지 글자로 밝힌다(R-T33) */}
              <p className="tl-work-hours__basis">
                {basis === 'day'
                  ? t('workHours.basisDay')
                  : t('workHours.basisWeek', { time: f.duration(regularLimit) })}
              </p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
WorkHoursMeter.displayName = WorkHoursMeterContract.name;

function Days({
  days,
  split,
  today,
}: {
  days: readonly WorkDay[];
  split: Map<string, WorkDaySplit>;
  today?: string;
}) {
  const f = useWorktimeText();
  const { t, locale } = f;
  const max = Math.max(12 * 60, ...days.map((d) => d.regularMinutes + (d.overtimeMinutes ?? 0)));
  return (
    <ol className="tl-work-hours__days" aria-label={t('workHours.daily')}>
      {days.map((d) => {
        const date = parseDate(d.date);
        const weekday = weekdayName(locale, date.getDay(), 'short');
        const { regular, overtime: ot } = split.get(d.date) ?? {
          regular: d.regularMinutes,
          overtime: d.overtimeMinutes ?? 0,
        };
        const sum = regular + ot;
        const off = d.leave
          ? t(`worktime.kind.${d.leave}`)
          : d.holiday
            ? t('workHours.holiday')
            : null;
        return (
          <li
            key={d.date}
            className="tl-work-hours__day"
            data-today={d.date === today || undefined}
            data-off={off && !sum ? '' : undefined}
          >
            <span className="tl-sr-only">
              {off && !sum
                ? `${f.date(date)} ${off}`
                : t('workHours.daySr', {
                    day: f.date(date),
                    regular: f.duration(regular),
                    overtime: f.duration(ot),
                  })}
            </span>
            <span className="tl-work-hours__day-value" aria-hidden>
              {sum ? clock(sum) : (off ?? '–')}
            </span>
            <span className="tl-work-hours__bar" aria-hidden>
              {ot > 0 && (
                <span
                  className="tl-work-hours__bar-seg"
                  data-kind="overtime"
                  style={{ '--tl-work-hours-size': pct(ot / max) } as CSSProperties}
                />
              )}
              {regular > 0 && (
                <span
                  className="tl-work-hours__bar-seg"
                  data-kind="regular"
                  style={{ '--tl-work-hours-size': pct(regular / max) } as CSSProperties}
                />
              )}
            </span>
            <span className="tl-work-hours__weekday" aria-hidden>
              {weekday}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
