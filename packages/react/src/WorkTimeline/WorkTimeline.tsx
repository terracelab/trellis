import {
  weekdayName,
  workMinutes,
  workSegments,
  workTicks,
  WorkTimelineContract,
  type WorkSegment,
  type WorkTimelineProps,
} from '@terracelab/trellis-contracts';
import { useId, type CSSProperties } from 'react';
import { cx } from '../_internal/cx.js';
import { useLocale, useMessages } from '../_internal/locale.js';
import { Legend } from '../Legend/Legend.js';
import { StatusDot } from '../StatusDot/StatusDot.js';
import { durationText, toMinutes } from '../TimeClock/time.js';

export type WorkTimelineWebProps = WorkTimelineProps & { className?: string };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 주간 출퇴근 막대(R-T23): 요일마다 출근 ~ 퇴근 막대를 07~23시 눈금 위에 놓는다.
 * 소정 근무는 점선 틀, 그 끝을 넘은 만큼은 연장, 퇴근 전인 오늘은 근무 중. 표(role=table)라 화면 읽기는 줄 · 칸으로 읽는다
 */
export function WorkTimeline({
  days,
  schedule,
  range,
  today,
  now,
  label,
  legend = true,
  id,
  testID,
  className,
}: WorkTimelineWebProps) {
  const t = useMessages();
  const locale = useLocale();
  const captionId = useId();
  const start = range?.start ?? '07:00';
  const end = range?.end ?? '23:00';
  const from = toMinutes(start);
  const span = Math.max(1, toMinutes(end) - from);
  const pos = (hhmm: string) => Math.min(100, Math.max(0, ((toMinutes(hhmm) - from) / span) * 100));
  const ticks = workTicks(start, end);
  const hasStatus = days.some((d) => d.status) || days.some((d) => d.clockIn && !d.clockOut);
  const kindLabel = (s: WorkSegment) =>
    s.kind === 'overtime'
      ? t('workTimeline.overtime')
      : s.kind === 'live'
        ? t('workTimeline.live')
        : t('workTimeline.regular');
  const hour = (hhmm: string) => hhmm.slice(0, 2);

  return (
    <div
      className={cx('tl-work-timeline', className)}
      id={id}
      data-testid={testID}
      data-status={hasStatus || undefined}
    >
      <div className="tl-work-timeline__table" role="table" aria-labelledby={captionId}>
        <span id={captionId} className="tl-sr-only">
          {label}
        </span>
        <div className="tl-work-timeline__row tl-work-timeline__head" role="row">
          <span role="columnheader" className="tl-work-timeline__day">
            {t('workTimeline.day')}
          </span>
          <span role="columnheader" className="tl-work-timeline__ruler">
            <span className="tl-sr-only">{t('workTimeline.bars')}</span>
            {ticks.map((tick, i) => (
              <span
                key={tick}
                className="tl-work-timeline__tick"
                aria-hidden="true"
                data-edge={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : undefined}
                style={{ '--tl-work-timeline-at': pos(tick) } as CSSProperties}
              >
                {hour(tick)}
              </span>
            ))}
          </span>
          <span role="columnheader" className="tl-work-timeline__in-out">
            {t('workTimeline.inOut')}
          </span>
          <span role="columnheader" className="tl-work-timeline__worked">
            {t('workTimeline.worked')}
          </span>
          {hasStatus && (
            <span role="columnheader" className="tl-work-timeline__status">
              {t('workTimeline.status')}
            </span>
          )}
        </div>
        {days.map((d) => {
          const live = Boolean(d.clockIn && !d.clockOut);
          const segments = workSegments(d, schedule, live ? now : undefined);
          const minutes = workMinutes(d, schedule, live ? now : undefined);
          const date = new Date(`${d.date}T00:00:00`);
          const status =
            d.status ?? (live ? { tone: 'info' as const, label: t('workTimeline.live') } : null);
          return (
            <div
              key={d.date}
              className="tl-work-timeline__row"
              role="row"
              data-today={d.date === today || undefined}
            >
              <span role="rowheader" className="tl-work-timeline__day">
                {weekdayName(locale, date.getDay())}{' '}
                <span className="tl-work-timeline__date">
                  {pad(date.getMonth() + 1)}/{pad(date.getDate())}
                </span>
              </span>
              <span role="cell" className="tl-work-timeline__bar">
                <span
                  className="tl-work-timeline__regular"
                  aria-hidden="true"
                  style={
                    {
                      '--tl-work-timeline-from': pos(schedule.start),
                      '--tl-work-timeline-to': pos(schedule.end),
                    } as CSSProperties
                  }
                />
                {segments.map((s) => (
                  <span
                    key={s.kind}
                    className="tl-work-timeline__segment"
                    data-kind={s.kind}
                    aria-hidden="true"
                    style={
                      {
                        '--tl-work-timeline-from': pos(s.from),
                        '--tl-work-timeline-to': pos(s.to),
                      } as CSSProperties
                    }
                  />
                ))}
                {!d.clockIn && (
                  <span className="tl-work-timeline__off">{d.off ?? t('workTimeline.none')}</span>
                )}
                {segments.length > 0 && (
                  <span className="tl-sr-only">
                    {segments
                      .map((s) =>
                        t('workTimeline.segment', { kind: kindLabel(s), from: s.from, to: s.to }),
                      )
                      .join(', ')}
                  </span>
                )}
              </span>
              <span role="cell" className="tl-work-timeline__in-out">
                {d.clockIn ? `${d.clockIn}~${d.clockOut ?? ''}` : '–'}
              </span>
              <span role="cell" className="tl-work-timeline__worked">
                {minutes ? durationText(t, minutes) : '–'}
              </span>
              {hasStatus && (
                <span role="cell" className="tl-work-timeline__status">
                  {status && <StatusDot tone={status.tone}>{status.label}</StatusDot>}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {legend && (
        <Legend
          className="tl-work-timeline__legend"
          items={[
            {
              label: t('workTimeline.regularRange', {
                start: hour(schedule.start),
                end: hour(schedule.end),
              }),
              color: 'series-1',
            },
            { label: t('workTimeline.overtime'), color: 'warning' },
            { label: t('workTimeline.live'), color: 'compare' },
          ]}
        />
      )}
    </div>
  );
}
WorkTimeline.displayName = WorkTimelineContract.name;
