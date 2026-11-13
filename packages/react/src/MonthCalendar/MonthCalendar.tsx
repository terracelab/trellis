import {
  calendarEventSpan,
  calendarMinutes,
  layoutCalendarDay,
  MonthCalendarContract,
  weekdayName,
  type CalendarView,
  type ChartColor,
  type Locale,
  type MonthCalendarEvent,
  type MonthCalendarProps,
} from '@terracelab/trellis-contracts';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { chartColor } from '../_internal/chart/colors.js';
import { cx } from '../_internal/cx.js';
import { useLocale, useMessages, type Translate } from '../_internal/locale.js';
import { useNarrowScreen } from '../_internal/sheet.js';
import { syncTruncatedTitle } from '../_internal/truncation.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl.js';

export type MonthCalendarWebProps = Omit<MonthCalendarProps, 'actions'> & {
  actions?: ReactNode;
  className?: string;
};

// ── 날짜 계산. 값은 늘 'YYYY-MM-DD' · 'YYYY-MM' 글자(시간대에 흔들리지 않게 지역 자정 Date로만 센다) ──
const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function dateOf(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
const monthOf = (iso: string) => iso.slice(0, 7);
function addDays(iso: string, n: number): string {
  const d = dateOf(iso);
  d.setDate(d.getDate() + n);
  return isoOf(d);
}
/** 같은 날짜의 n달 뒤(31일 → 그달 마지막 날) */
function addMonths(iso: string, n: number): string {
  const d = dateOf(iso);
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  t.setDate(Math.min(d.getDate(), last));
  return isoOf(t);
}
const shiftMonth = (ym: string, n: number) => monthOf(addMonths(`${ym}-01`, n));

/** 주는 일요일에 시작한다. 그달이 걸친 주만(5 · 6주) */
function weeksOf(ym: string): string[][] {
  const first = dateOf(`${ym}-01`);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const start = addDays(`${ym}-01`, -first.getDay());
  const count = Math.ceil((first.getDay() + days) / 7);
  return Array.from({ length: count }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)),
  );
}

/** 종일 일정이 먼저, 그다음 시작 시각 순 */
const byTime = (a: MonthCalendarEvent, b: MonthCalendarEvent) =>
  (a.start ? 1 : 0) - (b.start ? 1 : 0) || (a.start ?? '').localeCompare(b.start ?? '');

/** 보이는 날마다 걸친 일정(여러 날 일정은 사이의 날마다) */
function eventsByDay(events: readonly MonthCalendarEvent[], from: string, to: string) {
  const map = new Map<string, MonthCalendarEvent[]>();
  for (const e of events) {
    const last = e.endDate && e.endDate > e.date ? e.endDate : e.date;
    if (last < from || e.date > to) continue;
    let d = e.date < from ? from : e.date;
    const end = last > to ? to : last;
    while (d <= end) {
      const list = map.get(d);
      if (list) list.push(e);
      else map.set(d, [e]);
      d = addDays(d, 1);
    }
  }
  for (const list of map.values()) list.sort(byTime);
  return map;
}

function monthTitle(t: Translate, locale: Locale, ym: string) {
  const d = dateOf(`${ym}-01`);
  const month =
    locale === 'en'
      ? new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d)
      : String(d.getMonth() + 1);
  return t('monthCalendar.title', { year: d.getFullYear(), month });
}

function dayTitle(t: Translate, locale: Locale, iso: string) {
  const d = dateOf(iso);
  return t('monthCalendar.dayTitle', {
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: weekdayName(locale, d.getDay()),
    iso,
  });
}

/** 그 날이 든 주(일요일 시작) 7일 */
function weekOf(iso: string): string[] {
  const start = addDays(iso, -dateOf(iso).getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function weekTitle(t: Translate, days: readonly string[]) {
  const a = dateOf(days[0]!);
  const b = dateOf(days[days.length - 1]!);
  const vars = {
    year: a.getFullYear(),
    month: a.getMonth() + 1,
    from: a.getDate(),
    toMonth: b.getMonth() + 1,
    to: b.getDate(),
    fromIso: days[0]!,
    toIso: days[days.length - 1]!,
  };
  return t(
    a.getMonth() === b.getMonth() ? 'monthCalendar.weekTitle' : 'monthCalendar.weekTitleCross',
    vars,
  );
}

function dayViewTitle(t: Translate, locale: Locale, iso: string) {
  const d = dateOf(iso);
  return t('monthCalendar.dayViewTitle', {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: weekdayName(locale, d.getDay()),
    iso,
  });
}

/** 칩 하나에 보이는 점 수(R-37 8). 넘으면 "+n" */
const MAX_DOTS = 4;
const colorVar = (c: ChartColor | undefined) =>
  ({ '--tl-month-calendar-color': chartColor(c) }) as CSSProperties;

const hhmm = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
const DEFAULT_RANGE = { start: '08:00', end: '20:00' };

export function MonthCalendar({
  events,
  month,
  defaultMonth,
  onMonthChange,
  selected,
  defaultSelected = null,
  onSelectDay,
  onEventPress,
  today: todayProp,
  maxEvents = 3,
  actions,
  agenda = true,
  label,
  view,
  defaultView = 'month',
  onViewChange,
  views = ['month'],
  timeRange,
  now: nowProp,
  size = 'md',
  onDayPress,
  id,
  testID,
  className,
}: MonthCalendarWebProps) {
  const t = useMessages();
  const locale = useLocale();
  const narrow = useNarrowScreen();
  /** 칸 안에 칩 대신 점(좁은 화면 · sm) */
  const dotted = narrow || size === 'sm';
  const titleId = useId();
  const today = todayProp ?? isoOf(new Date());
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelected);
  const picked = selected !== undefined ? selected : innerSelected;
  const [innerMonth, setInnerMonth] = useState(() => defaultMonth ?? monthOf(picked ?? today));
  const shown = month ?? innerMonth;
  const [focusDate, setFocusDate] = useState<string | null>(null);
  const [innerView, setInnerView] = useState<CalendarView>(defaultView);
  const shownView = view ?? innerView;
  const grid = useRef<HTMLDivElement>(null);
  /** 키보드로 옮겼을 때만 새 칸에 포커스를 준다(달 단추 · 렌더로는 포커스를 뺏지 않는다) */
  const moveFocus = useRef(false);

  const weeks = useMemo(() => weeksOf(shown), [shown]);
  const first = weeks[0]![0]!;
  const last = weeks[weeks.length - 1]![6]!;
  const byDay = useMemo(() => eventsByDay(events, first, last), [events, first, last]);
  const monthStart = `${shown}-01`;
  const monthEnd = addDays(addMonths(monthStart, 1), -1);
  const monthCount = events.filter(
    (e) =>
      e.date <= monthEnd && (e.endDate && e.endDate > e.date ? e.endDate : e.date) >= monthStart,
  ).length;

  // 탭으로 들어오는 칸(로빙 tabindex): 옮겨 다닌 칸 → 고른 날 → 오늘 → 1일. 보이는 달 안에서만
  const inMonth = (iso: string | null): iso is string => iso != null && monthOf(iso) === shown;
  const tabStop = inMonth(focusDate)
    ? focusDate
    : inMonth(picked)
      ? picked
      : inMonth(today)
        ? today
        : monthStart;

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-date="${tabStop}"]`)?.focus();
  }, [tabStop]);

  // 주 · 일 보기: 보이는 날 = 탭 정류장 날(옮겨 다닌 날 → 고른 날 → 오늘 → 1일)
  const rangeDays = shownView === 'week' ? weekOf(tabStop) : shownView === 'day' ? [tabStop] : [];
  const changeView = (v: string) => {
    const next = v as CalendarView;
    if (view === undefined) setInnerView(next);
    onViewChange?.(next);
  };

  const setMonth = (ym: string) => {
    if (ym === shown) return;
    if (month === undefined) setInnerMonth(ym);
    onMonthChange?.(ym);
  };
  const goTo = (iso: string, focus: boolean) => {
    setMonth(monthOf(iso));
    setFocusDate(iso);
    moveFocus.current = focus;
  };
  /** refocus: 다른 달 칸을 눌러 달이 바뀌면 새 격자의 그 칸으로 포커스를 옮긴다 */
  const pick = (iso: string, refocus = false) => {
    goTo(iso, refocus);
    if (selected === undefined) setInnerSelected(iso);
    onSelectDay?.(iso);
    if (onDayPress) onDayPress(iso, eventsByDay(events, iso, iso).get(iso) ?? []);
  };

  const onDayKey = (e: KeyboardEvent<HTMLElement>, iso: string) => {
    const dow = dateOf(iso).getDay();
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(iso, -1),
      ArrowRight: () => addDays(iso, 1),
      ArrowUp: () => addDays(iso, -7),
      ArrowDown: () => addDays(iso, 7),
      Home: () => addDays(iso, -dow),
      End: () => addDays(iso, 6 - dow),
      PageUp: () => addMonths(iso, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(iso, e.shiftKey ? 12 : 1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    goTo(move(), true);
  };

  const dayLabel = (iso: string, count: number) =>
    [
      t('calendar.daySuffix', { weekday: weekdayName(locale, dateOf(iso).getDay(), 'long') }),
      iso === today ? t('calendar.today') : null,
      iso === picked ? t('calendar.selected') : null,
      count ? t('monthCalendar.count', { count }) : null,
    ]
      .filter(Boolean)
      .join(', ');

  const title =
    shownView === 'week'
      ? weekTitle(t, rangeDays)
      : shownView === 'day'
        ? dayViewTitle(t, locale, tabStop)
        : monthTitle(t, locale, shown);
  const rangeByDay =
    shownView === 'month' || rangeDays.length === 0
      ? byDay
      : eventsByDay(events, rangeDays[0]!, rangeDays[rangeDays.length - 1]!);
  const rangeCount = new Set(rangeDays.flatMap((d) => (rangeByDay.get(d) ?? []).map((e) => e.id)))
    .size;
  const dot = (e: MonthCalendarEvent) => colorVar(e.colors?.[0] ?? e.color);
  const stateText = (e: MonthCalendarEvent) =>
    e.state ? t(`monthCalendar.state.${e.state}`) : null;

  /** 칩 앞 표시(R-37 8): 점 하나 또는 여럿(+n), 그 뒤 유형 아이콘. 지연은 유형 아이콘 자리에 경고 아이콘 */
  const marks = (e: MonthCalendarEvent) => {
    const colors = e.colors?.length ? e.colors : [e.color];
    const icon = e.state === 'late' ? 'circle-alert' : e.icon;
    return (
      <span className="tl-month-calendar__marks" aria-hidden="true">
        {colors.slice(0, MAX_DOTS).map((c, i) => (
          <span key={i} className="tl-month-calendar__dot" style={colorVar(c)} />
        ))}
        {colors.length > MAX_DOTS && (
          <span className="tl-month-calendar__marks-more">+{colors.length - MAX_DOTS}</span>
        )}
        {icon && <Icon name={icon} size={16} className="tl-month-calendar__icon" />}
      </span>
    );
  };
  /** 잘린 칩만 가리키면 전체 제목(title) */
  const fullTitle = (ev: { currentTarget: HTMLElement }) => syncTruncatedTitle(ev.currentTarget);

  const renderChip = (e: MonthCalendarEvent, iso: string) => {
    const state = stateText(e);
    const body = (
      <>
        {marks(e)}
        {/* 칩 단추 이름은 보이는 글자 + 숨은 끝 시각 · 종일("09:00~10:00 주간 회의", WCAG 2.5.3) */}
        {e.start ? (
          <span className="tl-month-calendar__time">
            {e.start}
            {e.end && <span className="tl-sr-only">~{e.end}</span>}
          </span>
        ) : (
          <span className="tl-sr-only">{t('monthCalendar.allDay')}</span>
        )}{' '}
        <span className="tl-month-calendar__chip-title">{e.title}</span>
        {state && <span className="tl-sr-only">, {state}</span>}
      </>
    );
    if (!onEventPress)
      // 글자 칩은 화면 낭독기에 숨는다(날 단추가 건수를 읽는다). 가리키면 잘린 제목, 누르면 그 날
      return (
        <span
          key={e.id}
          className="tl-month-calendar__chip"
          data-state={e.state}
          aria-hidden="true"
          onPointerEnter={fullTitle}
          onClick={() => pick(iso, monthOf(iso) !== shown)}
        >
          {body}
        </span>
      );
    // 고른 칸(탭 정지)의 일정만 탭 순서에 든다. Esc는 그 날로 돌아간다
    return (
      <button
        key={e.id}
        type="button"
        className="tl-month-calendar__chip tl-focusable"
        data-state={e.state}
        tabIndex={iso === tabStop ? 0 : -1}
        onPointerEnter={fullTitle}
        onClick={(ev) => {
          ev.stopPropagation();
          onEventPress(e);
        }}
        onKeyDown={(ev) => {
          if (ev.key !== 'Escape') return;
          ev.preventDefault();
          grid.current?.querySelector<HTMLElement>(`[data-date="${iso}"]`)?.focus();
        }}
      >
        {body}
      </button>
    );
  };

  const renderDay = (iso: string) => {
    const list = byDay.get(iso) ?? [];
    const d = dateOf(iso);
    const dow = d.getDay();
    const flags = {
      'data-outside': monthOf(iso) !== shown || undefined,
      'data-today': iso === today || undefined,
      'data-weekend': dow === 0 || dow === 6 || undefined,
      'data-selected': iso === picked || undefined,
    };
    const button = (
      <button
        type="button"
        className="tl-month-calendar__date tl-focusable"
        data-date={iso}
        tabIndex={iso === tabStop ? 0 : -1}
        onClick={() => pick(iso, monthOf(iso) !== shown)}
        onFocus={() => setFocusDate(iso)}
        onKeyDown={(e) => onDayKey(e, iso)}
      >
        <span className="tl-month-calendar__num">{d.getDate()}</span>
        {/* 보이는 숫자 뒤에 숨은 글자를 붙여 "6일 금요일, 오늘, 일정 3건"으로 읽힌다(WCAG 2.5.3) */}
        <span className="tl-sr-only">{dayLabel(iso, list.length)}</span>
        {dotted && list.length > 0 && (
          <span className="tl-month-calendar__dots" aria-hidden="true">
            {list.slice(0, 3).map((e) => (
              <span
                key={e.id}
                className="tl-month-calendar__dot"
                data-state={e.state}
                style={dot(e)}
              />
            ))}
            {/* sm: 점 + 건수(R-43 5). 건수는 날 단추의 숨은 글자가 읽는다 */}
            {size === 'sm' && list.length > 1 && (
              <span className="tl-month-calendar__dot-count">{list.length}</span>
            )}
          </span>
        )}
      </button>
    );
    return (
      <div
        key={iso}
        role="gridcell"
        aria-selected={iso === picked}
        className="tl-month-calendar__day"
        {...flags}
      >
        {button}
        {!dotted && list.length > 0 && (
          <div className="tl-month-calendar__events">
            {list.slice(0, maxEvents).map((e) => renderChip(e, iso))}
            {list.length > maxEvents && (
              <span className="tl-month-calendar__more" aria-hidden="true">
                {t('monthCalendar.more', { count: list.length - maxEvents })}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  /** 일정 목록 한 줄(좁은 화면 아래 목록 · 좁은 화면 주 보기): 점 · 시각 · 제목 · meta */
  const agendaItem = (e: MonthCalendarEvent) => {
    const state = stateText(e);
    const body = (
      <>
        {marks(e)}
        <span className="tl-month-calendar__agenda-time">
          {e.start ? (
            <>
              <span>{e.start}</span>
              {e.end && (
                <span>
                  <span className="tl-sr-only">~</span>
                  {e.end}
                </span>
              )}
            </>
          ) : (
            <span>{t('monthCalendar.allDay')}</span>
          )}
        </span>{' '}
        <span className="tl-month-calendar__agenda-text">
          <span className="tl-month-calendar__agenda-title">{e.title}</span>
          {state && <span className="tl-sr-only">, {state}</span>}
          {e.meta && (
            <>
              {' '}
              <span>{e.meta}</span>
            </>
          )}
        </span>
      </>
    );
    return onEventPress ? (
      <button
        type="button"
        className="tl-month-calendar__agenda-item tl-focusable"
        data-state={e.state}
        onClick={() => onEventPress(e)}
      >
        {body}
      </button>
    ) : (
      <div className="tl-month-calendar__agenda-item" data-state={e.state}>
        {body}
      </div>
    );
  };

  /** 주 · 일 시간표: 날 머리(격자 한 줄) · 종일 줄 · 시각 눈금 · 날마다 시간 일정 칸 */
  const renderTimeline = (days: string[]) => {
    const range = timeRange ?? DEFAULT_RANGE;
    let from = calendarMinutes(range.start);
    let to = calendarMinutes(range.end);
    if (Number.isNaN(from)) from = calendarMinutes(DEFAULT_RANGE.start);
    if (Number.isNaN(to) || to <= from) to = from + 12 * 60;
    const timedByDay = days.map((d) =>
      (rangeByDay.get(d) ?? []).filter((e) => e.start && !Number.isNaN(calendarMinutes(e.start))),
    );
    // 범위 밖 일정이 있으면 그 일정까지 정시 단위로 늘린다
    for (const list of timedByDay)
      for (const e of list) {
        const [s, en] = calendarEventSpan(e);
        from = Math.min(from, Math.floor(s / 60) * 60);
        to = Math.max(to, Math.ceil(Math.min(en, 24 * 60) / 60) * 60);
      }
    const hours = (to - from) / 60;
    const clock = new Date();
    const nowText =
      nowProp ??
      (todayProp === undefined ? hhmm(clock.getHours() * 60 + clock.getMinutes()) : undefined);
    const nowMin = nowText ? calendarMinutes(nowText) : Number.NaN;
    const showNow = !Number.isNaN(nowMin) && nowMin >= from && nowMin <= to;
    const pressable = Boolean(onEventPress);
    const backToDay = (ev: KeyboardEvent<HTMLElement>, iso: string) => {
      if (ev.key !== 'Escape') return;
      ev.preventDefault();
      grid.current?.querySelector<HTMLElement>(`[data-date="${iso}"]`)?.focus();
    };
    return (
      <div
        className="tl-month-calendar__timeline"
        style={
          {
            '--tl-month-calendar-days': days.length,
            '--tl-month-calendar-hours': hours,
          } as CSSProperties
        }
      >
        <span className="tl-month-calendar__corner" aria-hidden="true" />
        <div
          ref={grid}
          role="grid"
          aria-label={label ? `${label} ${title}` : title}
          className="tl-month-calendar__heads"
        >
          <div role="row" className="tl-month-calendar__heads-row">
            {days.map((iso) => {
              const d = dateOf(iso);
              const dow = d.getDay();
              return (
                <div
                  key={iso}
                  role="gridcell"
                  aria-selected={iso === picked}
                  className="tl-month-calendar__head-cell"
                  data-today={iso === today || undefined}
                  data-weekend={dow === 0 || dow === 6 || undefined}
                  data-selected={iso === picked || undefined}
                >
                  <button
                    type="button"
                    className="tl-month-calendar__head-day tl-focusable"
                    data-date={iso}
                    tabIndex={iso === tabStop ? 0 : -1}
                    onClick={() => pick(iso)}
                    onFocus={() => setFocusDate(iso)}
                    onKeyDown={(e) => onDayKey(e, iso)}
                  >
                    <span className="tl-month-calendar__head-weekday" aria-hidden="true">
                      {weekdayName(locale, dow)}
                    </span>
                    <span className="tl-month-calendar__num">{d.getDate()}</span>
                    <span className="tl-sr-only">
                      {dayLabel(iso, (rangeByDay.get(iso) ?? []).length)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <span className="tl-month-calendar__allday-label" aria-hidden="true">
          {t('monthCalendar.allDay')}
        </span>
        <div className="tl-month-calendar__allday">
          {days.map((iso) => {
            const list = (rangeByDay.get(iso) ?? []).filter((e) => !e.start);
            return (
              <div
                key={iso}
                className="tl-month-calendar__allday-cell"
                data-selected={iso === picked || undefined}
              >
                {list.slice(0, maxEvents).map((e) => renderChip(e, iso))}
                {list.length > maxEvents && (
                  <span className="tl-month-calendar__more" aria-hidden="true">
                    {t('monthCalendar.more', { count: list.length - maxEvents })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="tl-month-calendar__hours" aria-hidden="true">
          {Array.from({ length: hours }, (_, i) => (
            <span
              key={i}
              className="tl-month-calendar__hour"
              style={{ '--tl-month-calendar-at': i } as CSSProperties}
            >
              {hhmm(from + i * 60)}
            </span>
          ))}
        </div>
        <div className="tl-month-calendar__columns">
          {days.map((iso, di) => {
            const list = timedByDay[di] ?? [];
            const slots = layoutCalendarDay(list);
            return (
              <div
                key={iso}
                className="tl-month-calendar__column"
                data-today={iso === today || undefined}
                data-selected={iso === picked || undefined}
              >
                {list.map((e) => {
                  const [s, en] = calendarEventSpan(e);
                  const slot = slots.get(e.id) ?? { col: 0, cols: 1 };
                  const style = {
                    ...dot(e),
                    '--tl-month-calendar-top': (s - from) / 60,
                    '--tl-month-calendar-len': (Math.min(en, to) - s) / 60,
                    '--tl-month-calendar-col': slot.col,
                    '--tl-month-calendar-cols': slot.cols,
                  } as CSSProperties;
                  const time = `${e.start}~${e.end ?? hhmm(en)}`;
                  // 한 시간 안 일정은 한 줄(점 · 시작 시각 · 제목)
                  const short = en - s < 60 || undefined;
                  const split = slot.cols > 1 || undefined;
                  // 단추 이름은 보이는 글자에서 나온다(aria-label을 두지 않는다, WCAG 2.5.3): 숨은 날짜 · 시각 +
                  // 보이는 제목(· 일 보기의 meta). 보이는 시각은 좁은 칸에서 숨겨지므로 이름의 시각은 숨은 글자가 맡는다
                  const body = (
                    <>
                      {/* 사이 띄어쓰기는 span 밖 글자 노드로(이름 계산이 span 끝 공백을 버리기도 한다) */}
                      {pressable && (
                        <>
                          <span className="tl-sr-only">{`${dayTitle(t, locale, iso)} ${time}`}</span>{' '}
                        </>
                      )}
                      <span className="tl-month-calendar__block-head" aria-hidden="true">
                        <span className="tl-month-calendar__dot" />
                        <span className="tl-month-calendar__block-time">
                          {short ? e.start : time}
                        </span>
                      </span>{' '}
                      <span className="tl-month-calendar__block-title">{e.title}</span>
                      {e.state && <span className="tl-sr-only">, {stateText(e)}</span>}
                      {e.meta &&
                        (shownView === 'day' ? (
                          <>
                            {' '}
                            <span className="tl-month-calendar__block-meta">{e.meta}</span>
                          </>
                        ) : (
                          pressable && (
                            <>
                              {' '}
                              <span className="tl-sr-only">{e.meta}</span>
                            </>
                          )
                        ))}
                    </>
                  );
                  return pressable ? (
                    <button
                      key={e.id}
                      type="button"
                      className="tl-month-calendar__block tl-focusable"
                      style={style}
                      data-short={short}
                      data-split={split}
                      data-state={e.state}
                      tabIndex={iso === tabStop ? 0 : -1}
                      onClick={() => onEventPress?.(e)}
                      onKeyDown={(ev) => backToDay(ev, iso)}
                    >
                      {body}
                    </button>
                  ) : (
                    <span
                      key={e.id}
                      className="tl-month-calendar__block"
                      style={style}
                      data-short={short}
                      data-split={split}
                      data-state={e.state}
                      aria-hidden="true"
                    >
                      {body}
                    </span>
                  );
                })}
                {showNow && iso === today && (
                  <span
                    className="tl-month-calendar__now"
                    style={{ '--tl-month-calendar-top': (nowMin - from) / 60 } as CSSProperties}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* 화면 읽기용 일정 목록: 시간표 칸이 글자일 때(누를 수 없을 때) 날마다 시각 · 제목을 읽는다 */}
        {!pressable && (
          <ul className="tl-sr-only" aria-label={t('monthCalendar.periodEvents', { title })}>
            {days.map((iso) => {
              const list = rangeByDay.get(iso) ?? [];
              return (
                <li key={iso}>
                  {dayTitle(t, locale, iso)}
                  {', '}
                  {list.length === 0
                    ? t('monthCalendar.noEvents')
                    : t('monthCalendar.count', { count: list.length })}
                  {list.length > 0 && (
                    <ul>
                      {list.map((e) => (
                        <li key={e.id}>
                          {e.start ? `${e.start}~${e.end ?? ''}` : t('monthCalendar.allDay')}{' '}
                          {e.title}
                          {e.state ? `, ${stateText(e)}` : ''}
                          {e.meta ? `, ${e.meta}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  /** 좁은 화면 주 보기: 7일을 날마다 일정 목록으로(칸이 좁아 시간표 대신) */
  const renderWeekList = (days: string[]) => (
    <ul className="tl-month-calendar__week-list" aria-label={label ? `${label} ${title}` : title}>
      {days.map((iso) => {
        const list = rangeByDay.get(iso) ?? [];
        const d = dateOf(iso);
        const dow = d.getDay();
        return (
          <li
            key={iso}
            className="tl-month-calendar__list-day"
            data-today={iso === today || undefined}
            data-selected={iso === picked || undefined}
            data-weekend={dow === 0 || dow === 6 || undefined}
          >
            <button
              type="button"
              className="tl-month-calendar__list-head tl-focusable"
              data-date={iso}
              aria-current={iso === today ? 'date' : undefined}
              onClick={() => pick(iso)}
            >
              <span className="tl-month-calendar__num">{d.getDate()}</span>
              <span className="tl-month-calendar__list-weekday" aria-hidden="true">
                {weekdayName(locale, dow)}
              </span>
              <span className="tl-sr-only">{dayLabel(iso, list.length)}</span>
              <span className="tl-month-calendar__count" aria-hidden="true">
                {list.length
                  ? t('monthCalendar.count', { count: list.length })
                  : t('monthCalendar.noEvents')}
              </span>
            </button>
            {list.length > 0 && (
              <ul className="tl-month-calendar__agenda-list">
                {list.map((e) => (
                  <li key={e.id}>{agendaItem(e)}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  const agendaDay = narrow && agenda && shownView === 'month' ? picked : null;
  const agendaList = agendaDay
    ? (byDay.get(agendaDay) ?? eventsByDay(events, agendaDay, agendaDay).get(agendaDay) ?? [])
    : [];

  return (
    <div
      className={cx('tl-month-calendar', className)}
      id={id}
      data-testid={testID}
      data-layout={narrow ? 'compact' : 'grid'}
      data-view={shownView}
      data-size={size}
    >
      <div className="tl-month-calendar__head">
        <div className="tl-month-calendar__nav">
          <IconButton
            icon="chevron-left"
            label={t(
              shownView === 'week'
                ? 'monthCalendar.prevWeek'
                : shownView === 'day'
                  ? 'monthCalendar.prevDay'
                  : 'monthCalendar.prev',
            )}
            onPress={() =>
              shownView === 'month'
                ? setMonth(shiftMonth(shown, -1))
                : goTo(addDays(tabStop, shownView === 'week' ? -7 : -1), false)
            }
          />
          <span id={titleId} className="tl-month-calendar__title" aria-live="polite">
            {title}
          </span>
          <IconButton
            icon="chevron-right"
            label={t(
              shownView === 'week'
                ? 'monthCalendar.nextWeek'
                : shownView === 'day'
                  ? 'monthCalendar.nextDay'
                  : 'monthCalendar.next',
            )}
            onPress={() =>
              shownView === 'month'
                ? setMonth(shiftMonth(shown, 1))
                : goTo(addDays(tabStop, shownView === 'week' ? 7 : 1), false)
            }
          />
          <Button size="sm" onPress={() => pick(today)}>
            {t('monthCalendar.today')}
          </Button>
          <span className="tl-month-calendar__count">
            {t('monthCalendar.count', { count: shownView === 'month' ? monthCount : rangeCount })}
          </span>
        </div>
        {(views.length > 1 || actions != null) && (
          <div className="tl-month-calendar__actions">
            {views.length > 1 && (
              <SegmentedControl
                size="sm"
                label={t('monthCalendar.views')}
                value={shownView}
                onChange={changeView}
                options={views.map((v) => ({ value: v, label: t(`monthCalendar.view.${v}`) }))}
              />
            )}
            {actions}
          </div>
        )}
      </div>
      {shownView !== 'month' &&
        (narrow && shownView === 'week' ? renderWeekList(rangeDays) : renderTimeline(rangeDays))}
      {shownView === 'month' && (
        <div
          ref={grid}
          role="grid"
          aria-label={label ? `${label} ${title}` : title}
          className="tl-month-calendar__grid"
        >
          <div role="row" className="tl-month-calendar__weekdays">
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                role="columnheader"
                aria-label={weekdayName(locale, i, 'long')}
                className="tl-month-calendar__weekday"
                data-weekend={i === 0 || i === 6 || undefined}
              >
                {weekdayName(locale, i)}
              </span>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={week[0]} role="row" className="tl-month-calendar__week">
              {week.map(renderDay)}
            </div>
          ))}
        </div>
      )}
      {agendaDay && (
        <section className="tl-month-calendar__agenda" aria-labelledby={`${titleId}-agenda`}>
          <h3 id={`${titleId}-agenda`} className="tl-month-calendar__agenda-title">
            {dayTitle(t, locale, agendaDay)}
            <span className="tl-month-calendar__count">
              {t('monthCalendar.count', { count: agendaList.length })}
            </span>
          </h3>
          {agendaList.length === 0 ? (
            <p className="tl-month-calendar__empty">{t('monthCalendar.empty')}</p>
          ) : (
            <ul className="tl-month-calendar__agenda-list">
              {agendaList.map((e) => (
                <li key={e.id}>{agendaItem(e)}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
MonthCalendar.displayName = MonthCalendarContract.name;
