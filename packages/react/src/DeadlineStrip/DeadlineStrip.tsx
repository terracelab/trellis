import {
  addIsoDays,
  deadlineItemText,
  deadlineStripDays,
  DeadlineStripContract,
  dueDays,
  formatDate,
  formatDueDays,
  groupDeadlines,
  type DeadlineStripGroup,
  type DeadlineStripItem,
  type DeadlineStripProps,
} from '@terracelab/trellis-contracts';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { chartColor } from '../_internal/chart/colors.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { useNarrowScreen } from '../_internal/sheet.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';

export type DeadlineStripWebProps = DeadlineStripProps & { className?: string };

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateOf = (iso: string) => {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const colorVar = (item: DeadlineStripItem) =>
  ({ '--tl-deadline-strip-color': chartColor(item.color) }) as CSSProperties;

/**
 * 기한 띠(R-40, D-138): 첫날부터 N일의 기한을 가로 날짜 축에 점으로 놓는다. 구조는 날짜순 목록(ol)이고
 * 가로 배치는 CSS다. 폭이 breakpoint.sm보다 좁으면 같은 목록을 세로(날짜마다 줄)로 보인다
 */
export function DeadlineStrip({
  items,
  caption,
  start: startProp,
  days: daysProp = 30,
  today: todayProp,
  onItemPress,
  id,
  testID,
  className,
}: DeadlineStripWebProps) {
  const t = useMessages();
  const narrow = useNarrowScreen();
  const panelId = useId();
  const today = todayProp ?? isoOf(new Date());
  const start = startProp ?? today;
  const days = deadlineStripDays(daysProp);
  const groups = useMemo(() => groupDeadlines(items, start, days), [items, start, days]);
  const hasOverdue = groups[0]?.key === 'overdue';
  const pressable = Boolean(onItemPress);

  const [openKey, setOpenKey] = useState<string | null>(null);
  const openGroup = groups.find((g) => g.key === openKey) ?? null;
  const [stop, setStop] = useState<string | null>(null);
  const tabStop = groups.some((g) => g.key === stop) ? stop : (groups[0]?.key ?? null);
  const pointsRef = useRef<HTMLOListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** 묶음을 연 단추 · 패널 첫 단추로 옮길 초점(열기 · 닫기 뒤 한 번) */
  const focusNext = useRef<'panel' | string | null>(null);

  useEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    if (target === 'panel')
      panelRef.current?.querySelector<HTMLElement>('.tl-deadline-strip__row')?.focus();
    else pointsRef.current?.querySelector<HTMLElement>(`[data-key="${target}"]`)?.focus();
  }, [openKey]);

  const dueText = (item: DeadlineStripItem) =>
    item.done ? t('deadlineStrip.done') : formatDueDays(item.date, today);
  const itemName = (item: DeadlineStripItem) => `${deadlineItemText(item)} · ${dueText(item)}`;
  const groupName = (g: DeadlineStripGroup) =>
    g.key === 'overdue'
      ? t('deadlineStrip.overdueLabel', { count: g.items.length })
      : t('deadlineStrip.group', { date: formatDate(g.date, 'mdw'), count: g.items.length });

  const pressGroup = (g: DeadlineStripGroup) => {
    const only = g.items.length === 1 && g.key !== 'overdue' ? g.items[0] : undefined;
    if (only && onItemPress) {
      onItemPress(only);
      return;
    }
    const next = openKey === g.key ? null : g.key;
    focusNext.current = next && pressable ? 'panel' : null;
    setOpenKey(next);
  };
  const closePanel = () => {
    focusNext.current = openKey;
    setOpenKey(null);
  };

  /** 점 사이 이동(로빙 tabindex): ← → Home End */
  const onPointsKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const keys = groups.map((g) => g.key);
    const at = keys.indexOf(tabStop ?? '');
    const to =
      e.key === 'ArrowRight'
        ? Math.min(keys.length - 1, at + 1)
        : e.key === 'ArrowLeft'
          ? Math.max(0, at - 1)
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? keys.length - 1
              : -1;
    if (to < 0) return;
    e.preventDefault();
    const key = keys[to]!;
    setStop(key);
    pointsRef.current?.querySelector<HTMLElement>(`[data-key="${key}"]`)?.focus();
  };

  /** 기한 한 줄(세로 목록 · 묶음 패널): 점 · 이름 · 범주 · 남은 날 */
  const row = (item: DeadlineStripItem) => {
    const late = !item.done && item.date < today;
    const body = (
      <>
        <span className="tl-deadline-strip__dot" style={colorVar(item)} aria-hidden="true" />
        <span className="tl-deadline-strip__row-text">
          <span className="tl-deadline-strip__row-title">{item.title}</span>
          {item.category && (
            <>
              {/* 사이 띄어쓰기는 span 밖 글자 노드로(이름 계산이 span 끝 공백을 버리기도 한다) */}{' '}
              <span className="tl-sr-only">·</span>{' '}
              <span className="tl-deadline-strip__row-meta">{item.category}</span>
            </>
          )}
        </span>{' '}
        <span className="tl-sr-only">·</span>{' '}
        <span className="tl-deadline-strip__due">
          {late && <Icon name="circle-alert" size={16} className="tl-deadline-strip__late" />}
          {dueText(item)}
        </span>
      </>
    );
    const attrs = {
      className: 'tl-deadline-strip__row',
      'data-done': item.done || undefined,
      'data-late': late || undefined,
    };
    return pressable ? (
      <button
        type="button"
        {...attrs}
        className={cx(attrs.className, 'tl-focusable')}
        onClick={() => onItemPress?.(item)}
        onKeyDown={(e) => {
          if (e.key !== 'Escape' || narrow) return;
          e.preventDefault();
          closePanel();
        }}
      >
        <span className="tl-sr-only">{`${formatDate(item.date, 'mdw')} ·`}</span> {body}
      </button>
    ) : (
      <div {...attrs}>
        <span className="tl-sr-only">{`${formatDate(item.date, 'mdw')} ·`}</span> {body}
      </div>
    );
  };

  // ── 좁은 화면: 날짜순 세로 목록. 지난 기한이 맨 위, 오늘은 기한이 없어도 한 줄 ──
  if (narrow) {
    const dated = groups.filter((g) => g.key !== 'overdue');
    const inRange = today >= start && today <= addIsoDays(start, days - 1);
    const rows: DeadlineStripGroup[] =
      inRange && !dated.some((g) => g.date === today)
        ? [...dated, { key: today, date: today, index: dueDays(today, start), items: [] }].sort(
            (a, b) => (a.date < b.date ? -1 : 1),
          )
        : dated;
    if (hasOverdue) rows.unshift(groups[0]!);
    return (
      <div
        className={cx('tl-deadline-strip', className)}
        id={id}
        data-testid={testID}
        data-layout="list"
      >
        <ol className="tl-deadline-strip__list" aria-label={caption}>
          {rows.map((g) => (
            <li
              key={g.key}
              className="tl-deadline-strip__list-day"
              data-overdue={g.key === 'overdue' || undefined}
              data-today={g.date === today || undefined}
            >
              <p className="tl-deadline-strip__list-date">
                {g.key === 'overdue' ? (
                  <>
                    <Icon name="circle-alert" size={16} className="tl-deadline-strip__late" />
                    {groupName(g)}
                  </>
                ) : (
                  <>
                    <span>{formatDate(g.date, 'mdw')}</span>
                    {g.date === today && (
                      <span className="tl-deadline-strip__today-tag">
                        {t('deadlineStrip.today')}
                      </span>
                    )}
                  </>
                )}
              </p>
              {g.items.length > 0 && (
                <ul className="tl-deadline-strip__rows">
                  {g.items.map((item) => (
                    <li key={item.id}>{row(item)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        {groups.length === 0 && (
          <p className="tl-deadline-strip__empty">{t('deadlineStrip.empty')}</p>
        )}
      </div>
    );
  }

  // ── 넓은 화면: 날짜 축(꾸밈) 위에 같은 칸 격자로 놓은 점 목록 ──
  const col = (g: DeadlineStripGroup) =>
    g.key === 'overdue' ? 1 : g.index + 1 + (hasOverdue ? 1 : 0);
  const point = (g: DeadlineStripGroup) => {
    const overdue = g.key === 'overdue';
    const single = !overdue && g.items.length === 1 ? g.items[0]! : undefined;
    const allDone = g.items.every((i) => i.done);
    const open = openKey === g.key;
    // 하나면 그 기한 이름, 여럿 · 지난 기한이면 묶음 이름 + 펼침
    const name = single ? itemName(single) : groupName(g);
    const expands = !(single && pressable);
    return (
      <button
        type="button"
        className="tl-deadline-strip__point tl-focusable"
        data-key={g.key}
        data-kind={overdue ? 'overdue' : single ? 'single' : 'group'}
        data-done={allDone || undefined}
        data-open={open || undefined}
        tabIndex={g.key === tabStop ? 0 : -1}
        aria-expanded={expands ? open : undefined}
        aria-controls={expands && open ? panelId : undefined}
        onFocus={() => setStop(g.key)}
        onClick={() => pressGroup(g)}
      >
        <span className="tl-sr-only">{name}</span>
        {overdue ? (
          <span className="tl-deadline-strip__overdue" aria-hidden="true">
            <Icon name="circle-alert" size={16} className="tl-deadline-strip__late" />
            {t('deadlineStrip.overdue', { count: g.items.length })}
          </span>
        ) : single ? (
          <span className="tl-deadline-strip__dot" style={colorVar(single)} aria-hidden="true" />
        ) : (
          <span className="tl-deadline-strip__count" aria-hidden="true">
            {g.items.length}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className={cx('tl-deadline-strip', className)}
      id={id}
      data-testid={testID}
      data-layout="strip"
      data-overdue={hasOverdue || undefined}
      style={{ '--tl-deadline-strip-days': days } as CSSProperties}
    >
      <div className="tl-deadline-strip__track">
        <div className="tl-deadline-strip__axis" aria-hidden="true">
          {hasOverdue && <span className="tl-deadline-strip__axis-overdue" />}
          {Array.from({ length: days }, (_, i) => {
            const iso = addIsoDays(start, i);
            const d = dateOf(iso);
            const isToday = iso === today;
            // 큰 눈금: 첫날 · 달의 1일 · 월요일. 칸이 좁으면 큰 눈금만 글자를 둔다
            const monthMark = i === 0 || d.getDate() === 1;
            const major = monthMark || d.getDay() === 1;
            return (
              <span
                key={iso}
                className="tl-deadline-strip__day"
                data-today={isToday || undefined}
                data-major={major || undefined}
              >
                <span className="tl-deadline-strip__label">
                  {isToday
                    ? t('deadlineStrip.today')
                    : monthMark
                      ? `${d.getMonth() + 1}/${d.getDate()}`
                      : d.getDate()}
                </span>
              </span>
            );
          })}
        </div>
        <ol
          ref={pointsRef}
          className="tl-deadline-strip__points"
          aria-label={caption}
          onKeyDown={onPointsKey}
        >
          {groups.map((g) => (
            <li
              key={g.key}
              className="tl-deadline-strip__cell"
              style={{ gridColumn: col(g) }}
              data-overdue={g.key === 'overdue' || undefined}
            >
              {point(g)}
            </li>
          ))}
        </ol>
      </div>
      {groups.length === 0 && (
        <p className="tl-deadline-strip__empty">{t('deadlineStrip.empty')}</p>
      )}
      {openGroup && (
        <div
          ref={panelRef}
          id={panelId}
          className="tl-deadline-strip__panel"
          role="group"
          aria-label={groupName(openGroup)}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            closePanel();
          }}
        >
          <div className="tl-deadline-strip__panel-head">
            <span className="tl-deadline-strip__panel-title" aria-hidden="true">
              {groupName(openGroup)}
            </span>
            <IconButton icon="x" size="sm" label={t('deadlineStrip.close')} onPress={closePanel} />
          </div>
          <ul className="tl-deadline-strip__rows">
            {openGroup.items.map((item) => (
              <li key={item.id}>{row(item)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
DeadlineStrip.displayName = DeadlineStripContract.name;
