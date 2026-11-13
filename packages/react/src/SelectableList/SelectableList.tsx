import {
  formatCount,
  PRESENCE_TONES,
  SelectableListContract,
  type SelectableListItem,
  type SelectableListProps,
} from '@terracelab/trellis-contracts';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { StatusDot } from '../StatusDot/StatusDot.js';

export type SelectableListWebProps = SelectableListProps & { className?: string };

/** 같은 group이 이어지는 행 묶음(group이 없으면 이름 없는 묶음 하나) */
interface Segment {
  key: string;
  group?: string;
  items: SelectableListItem[];
}

function segmentsOf(items: readonly SelectableListItem[]): Segment[] {
  const out: Segment[] = [];
  for (const item of items) {
    const last = out[out.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else
      out.push({
        key: `${out.length}-${item.group ?? ''}`,
        ...(item.group !== undefined ? { group: item.group } : {}),
        items: [item],
      });
  }
  return out;
}

/**
 * 고르는 세로 목록(master-detail, R-T22): 방 목록 · 사원 목록 · 지급 달 목록.
 * 행 = 앞(아바타 · 아이콘) + 제목 · 보조 + 뒤(시각 · 값 · 안 읽음 수). 고른 행은 aria-current와 바탕 한 단계(또는 1px 테두리).
 * 탭 정류장은 하나(roving): 화살표 · Home · End는 초점만 옮기고 Enter · Space · 누름이 고른다
 */
export function SelectableList({
  items,
  selected,
  defaultSelected = null,
  onSelect,
  label,
  variant = 'background',
  size = 'md',
  countLabel,
  emptyText,
  loading = false,
  id,
  testID,
  className,
}: SelectableListWebProps) {
  const t = useMessages();
  const baseId = useId();
  const [inner, setInner] = useState<string | null>(defaultSelected);
  const current = selected !== undefined ? selected : inner;
  const [focusId, setFocusId] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter((i) => !i.disabled);
  const isEnabled = (key: string | null) => key != null && enabled.some((i) => i.id === key);
  // 탭으로 들어오는 행: 초점이 있던 행 → 고른 행 → 첫 행
  const tabStop = isEnabled(focusId)
    ? focusId
    : isEnabled(current)
      ? current
      : (enabled[0]?.id ?? null);

  const choose = (item: SelectableListItem) => {
    if (item.disabled) return;
    if (selected === undefined) setInner(item.id);
    onSelect?.(item.id);
  };
  const focusItem = (item: SelectableListItem | undefined) => {
    if (!item) return;
    setFocusId(item.id);
    buttons.current.get(item.id)?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, item: SelectableListItem) => {
    const i = enabled.findIndex((x) => x.id === item.id);
    let next: SelectableListItem | undefined;
    if (e.key === 'ArrowDown') next = enabled[i + 1];
    else if (e.key === 'ArrowUp') next = enabled[i - 1];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    else return;
    e.preventDefault();
    focusItem(next);
  };

  const countName = countLabel ?? t('common.unread');
  const avatarSize = size === 'sm' ? 24 : 32;

  const row = (item: SelectableListItem) => {
    const isCurrent = item.id === current;
    const unread = (item.count ?? 0) > 0;
    const presenceText = item.presence ? t(`hr.presence.${item.presence}`) : undefined;
    const hasEnd = item.meta || item.value || unread;
    return (
      <li key={item.id} className="tl-selectable-list__row">
        <button
          ref={(el) => {
            if (el) buttons.current.set(item.id, el);
            else buttons.current.delete(item.id);
          }}
          type="button"
          className="tl-selectable-list__item tl-focusable"
          aria-current={isCurrent ? 'true' : undefined}
          data-selected={isCurrent || undefined}
          data-unread={unread || undefined}
          data-state={item.disabled ? 'disabled' : undefined}
          disabled={item.disabled}
          tabIndex={item.id === tabStop ? 0 : -1}
          onFocus={() => setFocusId(item.id)}
          onKeyDown={(e) => onKeyDown(e, item)}
          onClick={() => choose(item)}
        >
          {item.avatar ? (
            <Avatar
              name={item.avatar.name}
              {...(item.avatar.src ? { src: item.avatar.src } : {})}
              {...(item.avatar.status ? { status: item.avatar.status } : {})}
              size={avatarSize}
              decorative
            />
          ) : (
            item.icon && (
              <span className="tl-selectable-list__icon">
                <Icon name={item.icon} />
              </span>
            )
          )}
          <span className="tl-selectable-list__text">
            <span className="tl-selectable-list__title">
              <span className="tl-selectable-list__title-text">{item.title}</span>
              {item.muted && (
                <Icon
                  name="bell-off"
                  className="tl-selectable-list__muted"
                  label={t('selectableList.muted')}
                />
              )}
              {item.avatar?.status && (
                <span className="tl-sr-only">{t(`avatar.${item.avatar.status}`)}</span>
              )}
            </span>
            {(item.secondary || item.presence) && (
              <span className="tl-selectable-list__secondary">
                {item.secondary && (
                  <span className="tl-selectable-list__secondary-text">{item.secondary}</span>
                )}
                {item.presence &&
                  (size === 'sm' ? (
                    // 한 줄(sm)은 점만. 글자는 화면 읽기 · 툴팁으로(PersonLabel sm과 같다)
                    <span className="tl-selectable-list__presence" title={presenceText}>
                      <StatusDot tone={PRESENCE_TONES[item.presence]} size="sm" />
                      <span className="tl-sr-only">{presenceText}</span>
                    </span>
                  ) : (
                    <StatusDot
                      className="tl-selectable-list__presence"
                      tone={PRESENCE_TONES[item.presence]}
                      size="sm"
                    >
                      {presenceText}
                    </StatusDot>
                  ))}
              </span>
            )}
          </span>
          {hasEnd && (
            <span className="tl-selectable-list__end">
              {item.meta && <span className="tl-selectable-list__meta">{item.meta}</span>}
              {item.value && <span className="tl-selectable-list__value">{item.value}</span>}
              {unread && (
                <span className="tl-selectable-list__count" data-muted={item.muted || undefined}>
                  <span aria-hidden="true">{formatCount(item.count ?? 0)}</span>
                  <span className="tl-sr-only">
                    {t('selectableList.count', {
                      label: countName,
                      count: formatCount(item.count ?? 0),
                    })}
                  </span>
                </span>
              )}
            </span>
          )}
        </button>
      </li>
    );
  };

  const common = {
    id,
    'data-testid': testID,
    'data-variant': variant,
    'data-size': size,
  };

  if (loading)
    return (
      <div
        {...common}
        className={cx('tl-selectable-list', className)}
        role="group"
        aria-label={label}
        aria-busy="true"
        data-state="loading"
      >
        <Skeleton shape="list" lines={5} />
      </div>
    );

  if (items.length === 0)
    return (
      <div
        {...common}
        className={cx('tl-selectable-list', className)}
        role="group"
        aria-label={label}
      >
        <p className="tl-selectable-list__empty">{emptyText ?? t('selectableList.empty')}</p>
      </div>
    );

  return (
    <div
      {...common}
      className={cx('tl-selectable-list', className)}
      role="group"
      aria-label={label}
    >
      {segmentsOf(items).map((seg, s) => {
        const headId = `${baseId}-g${s}`;
        return (
          <div key={seg.key} className="tl-selectable-list__group">
            {seg.group !== undefined && (
              <span id={headId} className="tl-selectable-list__group-label">
                {seg.group}
              </span>
            )}
            <ul
              className="tl-selectable-list__list"
              {...(seg.group !== undefined ? { 'aria-labelledby': headId } : {})}
            >
              {seg.items.map(row)}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
SelectableList.displayName = SelectableListContract.name;
