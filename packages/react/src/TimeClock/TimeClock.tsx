import {
  TimeClockContract,
  type TimeClockProps,
  type WorkStatus,
} from '@terracelab/trellis-contracts';
import type { StatusTone } from '@terracelab/trellis-contracts';
import { useEffect, useState, type CSSProperties } from 'react';
import { cx } from '../_internal/cx.js';
import { Button } from '../Button/Button.js';
import { Card } from '../Card/Card.js';
import { StatusDot } from '../StatusDot/StatusDot.js';
import { isoOf, parseDateTime, toHhmm, toMinutes, useWorktimeText } from './time.js';

const DEFAULT_SCHEDULE = { start: '09:00', end: '18:00', breakMinutes: 60 };
const TONE: Record<WorkStatus, StatusTone> = {
  before: 'neutral',
  working: 'success',
  break: 'warning',
  done: 'neutral',
};

/** now가 없으면 기기 시각을 30초마다 다시 읽는다 */
function useNow(fixed?: string): Date {
  const [live, setLive] = useState(() => new Date());
  useEffect(() => {
    if (fixed) return;
    const timer = setInterval(() => setLive(new Date()), 30_000);
    return () => clearInterval(timer);
  }, [fixed]);
  return fixed ? parseDateTime(fixed) : live;
}

/** 오늘 근무한 분: 출근 → 퇴근(없으면 지금). 4시간을 넘으면 넘은 만큼(휴게 분까지) 휴게로 뺀다 */
export function workedToday(
  clockIn: string | undefined,
  end: number,
  breakMinutes: number,
): number {
  if (!clockIn) return 0;
  const start = toMinutes(clockIn);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  const elapsed = end >= start ? end - start : end + 1440 - start;
  return elapsed > 240 ? elapsed - Math.min(breakMinutes, elapsed - 240) : elapsed;
}

export function TimeClock({
  status,
  now,
  clockIn,
  clockOut,
  schedule = DEFAULT_SCHEDULE,
  place,
  workType,
  workedMinutes,
  title,
  loading = false,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
  id,
  testID,
  className,
}: TimeClockProps & { className?: string }) {
  const f = useWorktimeText();
  const { t } = f;
  const current = useNow(now);
  const nowMinutes = current.getHours() * 60 + current.getMinutes();
  const rest = schedule.breakMinutes ?? 0;
  const startMin = toMinutes(schedule.start);
  const endMin = toMinutes(schedule.end);
  const scheduled = Math.max(0, endMin - startMin - rest);

  const until = clockOut ? toMinutes(clockOut) : status === 'before' ? Number.NaN : nowMinutes;
  const worked = workedMinutes ?? workedToday(clockIn, until, rest);
  const ratio = scheduled ? Math.min(1, worked / scheduled) : 0;
  const late = !!clockIn && toMinutes(clockIn) > startMin;
  const early = status === 'done' && !!clockOut && toMinutes(clockOut) < endMin;
  const overtime = worked - scheduled;

  const progress = t('timeClock.progress', {
    total: f.duration(scheduled),
    done: f.duration(worked),
  });
  let remark: string | null = null;
  if (overtime > 0) remark = t('timeClock.overtime', { time: f.duration(overtime) });
  else if (status === 'working' || status === 'break')
    remark = t('timeClock.left', { time: f.duration(scheduled - worked) });

  const meta = [
    place ? t(`worktime.place.${place}`) : null,
    workType ?? null,
    t('timeClock.schedule', {
      start: schedule.start,
      end: schedule.end,
      rest: f.duration(rest),
    }),
  ].filter(Boolean);

  const actions = (() => {
    switch (status) {
      case 'before':
        return onClockIn ? (
          <Button variant="primary" icon="log-in" fullWidth loading={loading} onPress={onClockIn}>
            {t('timeClock.clockIn')}
          </Button>
        ) : null;
      case 'working':
        return (
          <>
            {onBreakStart && (
              <Button icon="pause" fullWidth disabled={loading} onPress={onBreakStart}>
                {t('timeClock.breakStart')}
              </Button>
            )}
            {onClockOut && (
              <Button
                variant="primary"
                icon="log-out"
                fullWidth
                loading={loading}
                onPress={onClockOut}
              >
                {t('timeClock.clockOut')}
              </Button>
            )}
          </>
        );
      case 'break':
        return onBreakEnd ? (
          <Button variant="primary" icon="play" fullWidth loading={loading} onPress={onBreakEnd}>
            {t('timeClock.breakEnd')}
          </Button>
        ) : null;
      default:
        return null;
    }
  })();

  return (
    <Card
      id={id}
      testID={testID}
      className={cx('tl-time-clock', className)}
      title={title ?? t('timeClock.title')}
      subtitle={f.date(current)}
      action={
        <StatusDot tone={TONE[status]} pulse={status === 'working'}>
          {t(`worktime.status.${status}`)}
        </StatusDot>
      }
    >
      <div
        className="tl-time-clock__body"
        data-status={status}
        data-state={loading ? 'loading' : undefined}
        aria-busy={loading || undefined}
      >
        <div className="tl-time-clock__now">
          <span className="tl-sr-only">{t('timeClock.now')}</span>
          <time className="tl-time-clock__time" dateTime={`${isoOf(current)}T${toHhmm(current)}`}>
            {toHhmm(current)}
          </time>
          <p className="tl-time-clock__meta">{meta.join(' · ')}</p>
        </div>
        <dl className="tl-time-clock__figures">
          <div className="tl-time-clock__figure">
            <dt>{t('timeClock.in')}</dt>
            <dd>
              <span className="tl-time-clock__value">{clockIn ?? '–'}</span>
              {late && (
                <StatusDot tone="warning" size="sm">
                  {t('timeClock.late')}
                </StatusDot>
              )}
            </dd>
          </div>
          <div className="tl-time-clock__figure">
            <dt>{t('timeClock.out')}</dt>
            <dd>
              <span className="tl-time-clock__value">{clockOut ?? '–'}</span>
              {early && (
                <StatusDot tone="warning" size="sm">
                  {t('timeClock.early')}
                </StatusDot>
              )}
            </dd>
          </div>
          <div className="tl-time-clock__figure">
            <dt>{t('timeClock.worked')}</dt>
            <dd>
              <span className="tl-time-clock__value">
                {status === 'before' ? '–' : f.duration(worked)}
              </span>
            </dd>
          </div>
        </dl>
        <div className="tl-time-clock__progress">
          <div
            className="tl-time-clock__track"
            role="progressbar"
            aria-label={t('timeClock.worked')}
            aria-valuemin={0}
            aria-valuemax={scheduled}
            aria-valuenow={Math.min(worked, scheduled)}
            aria-valuetext={progress}
            data-over={overtime > 0 || undefined}
            style={{ '--tl-time-clock-ratio': String(ratio) } as CSSProperties}
          >
            <span className="tl-time-clock__fill" />
          </div>
          <div className="tl-time-clock__progress-text">
            <span>{progress}</span>
            {remark && <span className="tl-time-clock__remark">{remark}</span>}
          </div>
        </div>
        {actions && <div className="tl-time-clock__actions">{actions}</div>}
      </div>
    </Card>
  );
}
TimeClock.displayName = TimeClockContract.name;
