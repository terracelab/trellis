import {
  DashboardGridContract,
  dashboardLayoutOf,
  moveDashboardWidget,
  setDashboardWidgetHidden,
  type DashboardGridProps,
  type DashboardLayout,
  type DashboardSpan,
  type DashboardWidget,
} from '@terracelab/trellis-contracts';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export type DashboardWidgetWeb = Omit<DashboardWidget, 'content'> & { content: ReactNode };

export type DashboardGridWebProps = Omit<DashboardGridProps, 'widgets' | 'children'> & {
  widgets?: readonly DashboardWidgetWeb[];
  children?: ReactNode;
  className?: string;
};

/** 고정 배치 칸(widgets 없이 children으로). 블록 `_ui`의 Col이 이것을 감싼다 */
export function DashboardGridItem({
  span = 12,
  rows,
  children,
  className,
}: {
  span?: DashboardSpan;
  rows?: 1 | 2;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('tl-dashboard-grid__item', className)} data-span={span} data-rows={rows}>
      {children}
    </div>
  );
}

/** 옮기거나 숨긴 뒤 포커스를 돌려줄 자리 */
type FocusPart = 'handle' | 'prev' | 'next' | 'hide' | 'show';

export function DashboardGrid({
  widgets,
  layout,
  defaultLayout,
  onLayoutChange,
  editing = false,
  gap = 'gutter',
  label,
  children,
  id,
  testID,
  className,
}: DashboardGridWebProps) {
  const t = useMessages();
  const hintId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState<DashboardLayout | undefined>(defaultLayout);
  const [live, setLive] = useState('');
  const pending = useRef<{ id: string; part: FocusPart } | null>(null);
  const list = widgets ?? [];
  const items = dashboardLayoutOf(list, layout === undefined ? inner : layout);
  const byId = new Map(list.map((w) => [w.id, w]));
  const edit = Boolean(widgets) && editing;

  // 옮긴 위젯의 같은 단추로 포커스를 돌려준다. 그 단추가 비활성이면 손잡이로
  useLayoutEffect(() => {
    const want = pending.current;
    if (!want || !root.current) return;
    pending.current = null;
    const item = [...root.current.querySelectorAll<HTMLElement>('[data-widget-id]')].find(
      (el) => el.dataset['widgetId'] === want.id,
    );
    const target = item?.querySelector<HTMLButtonElement>(`[data-part="${want.part}"]`);
    const el =
      target && !target.disabled
        ? target
        : item?.querySelector<HTMLButtonElement>('[data-part="handle"]');
    el?.focus();
  });

  const commit = (
    next: DashboardLayout,
    focus: { id: string; part: FocusPart },
    message: string,
  ) => {
    if (layout === undefined) setInner(next);
    onLayoutChange?.(next);
    pending.current = focus;
    setLive(message);
  };

  const move = (wid: string, to: number, part: FocusPart) => {
    const from = items.findIndex((i) => i.id === wid);
    const clamped = Math.max(0, Math.min(to, items.length - 1));
    if (from < 0 || clamped === from) return;
    const w = byId.get(wid)!;
    commit(
      moveDashboardWidget(items, wid, clamped),
      { id: wid, part },
      t('dashboard.moved', { title: w.title, position: clamped + 1, total: items.length }),
    );
  };

  const setHidden = (wid: string, hidden: boolean) => {
    const w = byId.get(wid)!;
    commit(
      setDashboardWidgetHidden(items, wid, hidden),
      { id: wid, part: hidden ? 'show' : 'hide' },
      t(hidden ? 'dashboard.hidden' : 'dashboard.shown', { title: w.title }),
    );
  };

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>, wid: string, index: number) => {
    const to =
      e.key === 'ArrowLeft' || e.key === 'ArrowUp'
        ? index - 1
        : e.key === 'ArrowRight' || e.key === 'ArrowDown'
          ? index + 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? items.length - 1
              : null;
    if (to === null) return;
    e.preventDefault();
    move(wid, to, 'handle');
  };

  const body = widgets
    ? items.map((item, index) => {
        const w = byId.get(item.id)!;
        if (item.hidden && !edit) return null;
        const span = w.span ?? 4;
        return (
          <div
            key={w.id}
            className="tl-dashboard-grid__item"
            data-span={span}
            data-rows={w.rows}
            data-widget-id={w.id}
            data-hidden={item.hidden || undefined}
            role={edit ? 'listitem' : undefined}
          >
            {edit && (
              <div className="tl-dashboard-grid__bar">
                <button
                  type="button"
                  className="tl-dashboard-grid__handle tl-focusable"
                  data-part="handle"
                  // 숨긴 칸은 보이는 글자("숨김")가 이름에도 들어가야 한다(label-content-name-mismatch)
                  aria-label={t('dashboard.move', {
                    title: item.hidden ? `${w.title} ${t('dashboard.hiddenItem')}` : w.title,
                  })}
                  aria-describedby={hintId}
                  onKeyDown={(e) => onHandleKey(e, w.id, index)}
                >
                  <Icon name="grip-vertical" className="tl-dashboard-grid__grip" />
                  <span className="tl-dashboard-grid__title">{w.title}</span>
                  {item.hidden && (
                    <>
                      {/* 글자 사이 띄어쓰기: 보이는 글자가 "재고 숨김"으로 읽혀 이름과 맞는다 */}{' '}
                      <span className="tl-dashboard-grid__hidden-label">
                        {t('dashboard.hiddenItem')}
                      </span>
                    </>
                  )}
                </button>
                <span className="tl-dashboard-grid__actions">
                  <IconButton
                    icon="arrow-left"
                    size="sm"
                    data-part="prev"
                    label={t('dashboard.earlier', { title: w.title })}
                    disabled={index === 0}
                    onPress={() => move(w.id, index - 1, 'prev')}
                  />
                  <IconButton
                    icon="arrow-right"
                    size="sm"
                    data-part="next"
                    label={t('dashboard.later', { title: w.title })}
                    disabled={index === items.length - 1}
                    onPress={() => move(w.id, index + 1, 'next')}
                  />
                  {item.hidden ? (
                    <Button
                      size="sm"
                      icon="eye"
                      data-part="show"
                      aria-label={t('dashboard.showNamed', { title: w.title })}
                      onPress={() => setHidden(w.id, false)}
                    >
                      {t('dashboard.show')}
                    </Button>
                  ) : (
                    w.hideable !== false && (
                      <IconButton
                        icon="eye-off"
                        size="sm"
                        data-part="hide"
                        label={t('dashboard.hide', { title: w.title })}
                        onPress={() => setHidden(w.id, true)}
                      />
                    )
                  )}
                </span>
              </div>
            )}
            {!item.hidden && (
              <div className="tl-dashboard-grid__content" inert={edit || undefined}>
                {w.content}
              </div>
            )}
          </div>
        );
      })
    : children;

  const grid = (
    <div
      ref={root}
      className={cx('tl-dashboard-grid', className)}
      id={id}
      data-testid={testID}
      data-gap={gap}
      data-editing={edit || undefined}
      role={edit ? 'list' : undefined}
      aria-label={edit ? (label ?? t('dashboard.label')) : undefined}
    >
      {body}
    </div>
  );
  if (!widgets) return grid;
  // 목록(role=list) 안에는 항목만 둔다. 안내 · 알림 글자는 격자 바깥 형제(화면에서는 숨김)
  return (
    <>
      {grid}
      <span id={hintId} className="tl-sr-only">
        {t('dashboard.moveHint')}
      </span>
      <span className="tl-sr-only" role="status" aria-live="polite">
        {live}
      </span>
    </>
  );
}
DashboardGrid.displayName = DashboardGridContract.name;
