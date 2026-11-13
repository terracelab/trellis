import {
  NotificationListContract,
  RELATIVE_DAY_GROUPS,
  relativeDayGroup,
  type NotificationListItem,
  type NotificationListProps,
  type RelativeDayGroup,
} from '@terracelab/trellis-contracts';
import { useId, useMemo } from 'react';
import { Button } from '../Button/Button.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { NotificationItem } from '../NotificationItem/NotificationItem.js';

export type NotificationListWebProps = NotificationListProps & { className?: string };

const timeOf = (item: NotificationListItem) => {
  const v = new Date(item.time).getTime();
  return Number.isNaN(v) ? 0 : v;
};

/** 묶음 안 순서: 읽지 않은 것 먼저, 그다음 최근 순 */
function byUnreadThenRecent(a: NotificationListItem, b: NotificationListItem): number {
  if (Boolean(a.unread) !== Boolean(b.unread)) return a.unread ? -1 : 1;
  return timeOf(b) - timeOf(a);
}

/**
 * 알림 목록(PR-32): 날짜 묶음(오늘 · 어제 · 이번 주 · 이전) · 묶음 안 읽지 않은 것 먼저 · 빈 상태 · "모두 읽음".
 * 상단 알림 서랍(Drawer) 안에 그대로 넣는다
 */
export function NotificationList({
  items,
  onItemPress,
  onMarkAllRead,
  groupBy = 'day',
  now,
  emptyText,
  label,
  headingLevel = 3,
  id,
  testID,
  className,
}: NotificationListWebProps) {
  const t = useMessages();
  const baseId = useId();
  const base = now ?? new Date().toISOString();
  const unread = items.filter((i) => i.unread).length;
  const name = label ?? t('common.notifications');
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  const groups = useMemo(() => {
    if (groupBy === 'none')
      return [{ key: 'all' as const, items: [...items].sort(byUnreadThenRecent) }];
    const map = new Map<RelativeDayGroup, NotificationListItem[]>();
    for (const item of items) {
      const g = relativeDayGroup(item.time, base);
      map.set(g, [...(map.get(g) ?? []), item]);
    }
    return RELATIVE_DAY_GROUPS.filter((g) => map.has(g)).map((g) => ({
      key: g,
      items: map.get(g)!.sort(byUnreadThenRecent),
    }));
  }, [items, groupBy, base]);

  const row = (item: NotificationListItem) => (
    <li key={item.id} className="tl-notification-list__row">
      <NotificationItem
        title={item.title}
        time={item.time}
        now={base}
        {...(item.body !== undefined ? { body: item.body } : {})}
        {...(item.unread !== undefined ? { unread: item.unread } : {})}
        {...(item.module !== undefined ? { module: item.module } : {})}
        {...(item.tone !== undefined ? { tone: item.tone } : {})}
        {...(item.toneLabel !== undefined ? { toneLabel: item.toneLabel } : {})}
        {...(item.href !== undefined ? { href: item.href } : {})}
        {...(onItemPress ? { onPress: () => onItemPress(item.id) } : {})}
      />
    </li>
  );

  return (
    <div className={cx('tl-notification-list', className)} id={id} data-testid={testID}>
      {onMarkAllRead && unread > 0 && (
        <div className="tl-notification-list__bar">
          <span className="tl-notification-list__unread">
            {t('notificationList.unread', { count: unread })}
          </span>
          <Button size="sm" variant="ghost" icon="check" onPress={onMarkAllRead}>
            {t('notificationList.markAllRead')}
          </Button>
        </div>
      )}
      {items.length === 0 ? (
        <p className="tl-notification-list__empty" role="status">
          {emptyText ?? t('notificationList.empty')}
        </p>
      ) : (
        groups.map((g) =>
          g.key === 'all' ? (
            <ul key={g.key} className="tl-notification-list__items" aria-label={name}>
              {g.items.map(row)}
            </ul>
          ) : (
            <div key={g.key} className="tl-notification-list__group">
              <Heading className="tl-notification-list__heading" id={`${baseId}-${g.key}`}>
                {t(`notificationList.group.${g.key}`)}
              </Heading>
              <ul className="tl-notification-list__items" aria-labelledby={`${baseId}-${g.key}`}>
                {g.items.map(row)}
              </ul>
            </div>
          ),
        )
      )}
    </div>
  );
}
NotificationList.displayName = NotificationListContract.name;
