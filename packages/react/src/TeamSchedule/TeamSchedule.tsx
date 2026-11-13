import {
  parseDate,
  SCHEDULE_KINDS,
  TeamScheduleContract,
  weekdayName,
  type ScheduleKind,
  type TeamScheduleEvent,
  type TeamScheduleMember,
  type TeamScheduleProps,
} from '@terracelab/trellis-contracts';
import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { Avatar } from '../Avatar/Avatar.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { isoOf, useWorktimeText } from '../TimeClock/time.js';

export type TeamScheduleWebProps = Omit<TeamScheduleProps, 'renderPerson' | 'empty'> & {
  renderPerson?: (person: TeamScheduleMember) => ReactNode;
  empty?: ReactNode;
  className?: string;
};

interface Placed {
  event: TeamScheduleEvent;
  /** 범위 안 첫 칸 · 마지막 칸(0부터) */
  from: number;
  to: number;
  /** 범위 밖으로 이어진다 */
  clipStart: boolean;
  clipEnd: boolean;
}

/** 사람마다 일정을 줄(lane)에 나눈다. 겹치는 일정만 아래 줄로 내린다 */
export function scheduleLanes(
  events: readonly TeamScheduleEvent[],
  start: string,
  days: number,
): Map<string, Placed[][]> {
  const base = parseDate(start).getTime();
  const index = (iso: string) => Math.round((parseDate(iso).getTime() - base) / 86_400_000);
  const byPerson = new Map<string, Placed[][]>();
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  for (const event of sorted) {
    const a = index(event.start);
    const b = index(event.end ?? event.start);
    if (b < 0 || a > days - 1) continue;
    const placed: Placed = {
      event,
      from: Math.max(0, a),
      to: Math.min(days - 1, b),
      clipStart: a < 0,
      clipEnd: b > days - 1,
    };
    const lanes = byPerson.get(event.personId) ?? [];
    const lane = lanes.find((l) => l[l.length - 1]!.to < placed.from);
    if (lane) lane.push(placed);
    else lanes.push([placed]);
    byPerson.set(event.personId, lanes);
  }
  return byPerson;
}

const dayWidth = (days: number) =>
  days <= 7
    ? 'calc(var(--tl-space-64) * 1.5)'
    : days <= 14
      ? 'var(--tl-space-64)'
      : 'var(--tl-space-40)';

export function TeamSchedule({
  people,
  events,
  start,
  days = 7,
  today,
  holidays,
  caption,
  onEventPress,
  renderPerson,
  legend = true,
  loading = false,
  empty,
  id,
  testID,
  className,
}: TeamScheduleWebProps) {
  const f = useWorktimeText();
  const { t, locale } = f;
  const count = Math.max(1, Math.min(42, Math.floor(days)));
  const dates = useMemo(() => {
    const first = parseDate(start);
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
      return { date: d, iso: isoOf(d) };
    });
  }, [start, count]);
  const holidayOf = useMemo(
    () => new Map((holidays ?? []).map((h) => [h.date, h.label])),
    [holidays],
  );
  const lanes = useMemo(() => scheduleLanes(events, start, count), [events, start, count]);
  const kinds = useMemo(() => {
    const used = new Set<ScheduleKind>();
    for (const rows of lanes.values())
      for (const lane of rows) for (const p of lane) used.add(p.event.kind);
    return (Object.keys(SCHEDULE_KINDS) as ScheduleKind[]).filter((k) => used.has(k));
  }, [lanes]);
  const nameOf = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people]);

  const cellAttrs = (i: number) => {
    const { date, iso } = dates[i]!;
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    return {
      'data-weekend': weekend || holidayOf.has(iso) || undefined,
      'data-today': iso === today || undefined,
    };
  };

  const periodText = (p: Placed) => {
    const s = p.event.start;
    const e = p.event.end ?? p.event.start;
    return s === e ? f.date(s) : `${f.date(s)}~${f.date(e)}`;
  };

  const eventNode = (p: Placed) => {
    const meta = SCHEDULE_KINDS[p.event.kind];
    const kindLabel = t(`worktime.kind.${p.event.kind}`);
    const label = p.event.label ?? kindLabel;
    const name = [
      t('teamSchedule.event', {
        name: nameOf.get(p.event.personId) ?? '',
        kind: label === kindLabel ? kindLabel : `${kindLabel} ${label}`,
        period: periodText(p),
      }),
      p.event.note,
    ]
      .filter(Boolean)
      .join(' · ');
    const common = {
      className: cx('tl-team-schedule__event', onEventPress && 'tl-focusable'),
      'data-tone': meta.tone,
      'data-part': p.from === p.to ? meta.part : undefined,
      'data-clip-start': p.clipStart || undefined,
      'data-clip-end': p.clipEnd || undefined,
      // 한 달 보기(15일 이상)에서 하루짜리 일정은 칸이 좁아 아이콘만 보인다(글자는 화면 낭독기에 남는다)
      'data-single': p.from === p.to || undefined,
    };
    const body = (
      <>
        <Icon name={meta.icon} className="tl-team-schedule__event-icon" />
        <span
          className="tl-team-schedule__event-label"
          aria-hidden={onEventPress ? true : undefined}
        >
          {label}
        </span>
      </>
    );
    return onEventPress ? (
      <button {...common} type="button" aria-label={name} onClick={() => onEventPress(p.event)}>
        {body}
      </button>
    ) : (
      <span {...common} title={name}>
        {body}
        <span className="tl-sr-only">
          {` ${periodText(p)}`}
          {p.event.note ? ` · ${p.event.note}` : ''}
        </span>
      </span>
    );
  };

  const laneCells = (lane: Placed[]) => {
    const cells: ReactNode[] = [];
    let i = 0;
    let k = 0;
    while (i < count) {
      const p = lane[k];
      if (p && p.from === i) {
        cells.push(
          <td
            key={i}
            colSpan={p.to - p.from + 1}
            className="tl-team-schedule__cell"
            {...cellAttrs(i)}
          >
            {eventNode(p)}
          </td>,
        );
        i = p.to + 1;
        k += 1;
      } else {
        cells.push(<td key={i} className="tl-team-schedule__cell" {...cellAttrs(i)} />);
        i += 1;
      }
    }
    return cells;
  };

  const person = (p: TeamScheduleMember) =>
    renderPerson ? (
      renderPerson(p)
    ) : (
      <span className="tl-team-schedule__person">
        <Avatar name={p.name} src={p.avatar} size={24} decorative />
        <span className="tl-team-schedule__person-text">
          <span className="tl-team-schedule__person-name">{p.name}</span>
          {p.meta && <span className="tl-team-schedule__person-meta">{p.meta}</span>}
        </span>
      </span>
    );

  if (!loading && people.length === 0)
    return (
      <div className={cx('tl-team-schedule', className)} id={id} data-testid={testID}>
        {empty ?? <p className="tl-team-schedule__empty">{t('teamSchedule.empty')}</p>}
      </div>
    );

  return (
    <div
      className={cx('tl-team-schedule', className)}
      id={id}
      data-testid={testID}
      data-state={loading ? 'loading' : undefined}
      data-dense={count > 14 || undefined}
      aria-busy={loading || undefined}
      style={
        {
          '--tl-team-schedule-days': String(count),
          '--tl-team-schedule-day': dayWidth(count),
        } as CSSProperties
      }
    >
      {legend && kinds.length > 0 && (
        <ul className="tl-team-schedule__legend" aria-label={t('teamSchedule.legend')}>
          {kinds.map((k) => (
            <li
              key={k}
              className="tl-team-schedule__legend-item"
              data-tone={SCHEDULE_KINDS[k].tone}
            >
              <Icon name={SCHEDULE_KINDS[k].icon} className="tl-team-schedule__event-icon" />
              {t(`worktime.kind.${k}`)}
            </li>
          ))}
        </ul>
      )}
      <div className="tl-team-schedule__scroll" tabIndex={0} role="region" aria-label={caption}>
        <table className="tl-team-schedule__table">
          <caption className="tl-sr-only">{caption}</caption>
          <colgroup>
            <col className="tl-team-schedule__name-col" />
            {dates.map((d) => (
              <col key={d.iso} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="tl-team-schedule__corner">
                {t('teamSchedule.person')}
              </th>
              {dates.map(({ date, iso }, i) => {
                const weekday = weekdayName(locale, date.getDay(), 'short');
                const holiday = holidayOf.get(iso);
                const label = [
                  t('teamSchedule.dayHeader', {
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    weekday: weekdayName(locale, date.getDay(), 'long'),
                    iso,
                  }),
                  iso === today ? t('teamSchedule.today') : null,
                  holiday ? `${t('teamSchedule.holiday')} ${holiday}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <th
                    key={iso}
                    scope="col"
                    className="tl-team-schedule__day"
                    title={holiday}
                    {...cellAttrs(i)}
                  >
                    {/* 머리 칸 이름은 숨은 글자로(aria-label만 두면 axe empty-table-header, R-37 9) */}
                    <span className="tl-sr-only">{label}</span>
                    <span className="tl-team-schedule__weekday" aria-hidden>
                      {weekday}
                    </span>
                    <span className="tl-team-schedule__date" aria-hidden>
                      {date.getDate()}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: Math.max(3, Math.min(people.length, 6)) }, (_, r) => (
                  <tr key={r}>
                    <th scope="row" className="tl-team-schedule__name">
                      <Skeleton width="70%" />
                    </th>
                    {dates.map((d, i) => (
                      <td key={d.iso} className="tl-team-schedule__cell" {...cellAttrs(i)}>
                        {(r + i) % 4 === 0 && <Skeleton shape="rect" height="var(--tl-space-20)" />}
                      </td>
                    ))}
                  </tr>
                ))
              : people.flatMap((p) => {
                  const rows = lanes.get(p.id) ?? [[]];
                  return rows.map((lane, li) => (
                    <tr key={`${p.id}-${li}`} data-lane={li > 0 ? li : undefined}>
                      {li === 0 && (
                        <th scope="row" rowSpan={rows.length} className="tl-team-schedule__name">
                          {person(p)}
                        </th>
                      )}
                      {laneCells(lane)}
                    </tr>
                  ));
                })}
          </tbody>
        </table>
      </div>
      {loading && <span className="tl-sr-only">{t('common.loading')}</span>}
    </div>
  );
}
TeamSchedule.displayName = TeamScheduleContract.name;
