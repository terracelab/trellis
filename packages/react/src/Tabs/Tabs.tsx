import {
  formatCount,
  TabsContract,
  type TabItem,
  type TabsProps,
} from '@terracelab/trellis-contracts';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Tabs as T } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';

export type TabWebItem = Omit<TabItem, 'content'> & { content?: ReactNode };

/** 탭 줄이 넘치는 쪽: 그쪽 끝을 흐리게 해 더 있음을 보인다(좁은 화면) */
function useOverflowEdges(ref: React.RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState('');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const start = el.scrollLeft > 1;
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setEdges(start && end ? 'start end' : start ? 'start' : end ? 'end' : '');
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [ref]);
  return edges;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  size = 'md',
  label,
  id,
  testID,
  className,
}: Omit<TabsProps, 'items'> & { items: readonly TabWebItem[]; className?: string }) {
  const hasPanels = items.some((i) => i.content != null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const edges = useOverflowEdges(listRef);
  // 고른 탭이 가려져 있으면 보이게 민다(휴대폰에서 탭이 넘칠 때)
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [value]);
  return (
    <T.Root
      className={cx('tl-tabs', className)}
      id={id}
      data-testid={testID}
      data-size={size}
      data-overflow={edges || undefined}
      {...(value !== undefined ? { value } : {})}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(v) => onChange?.(String(v))}
    >
      <T.List ref={listRef} className="tl-tabs__list" aria-label={label}>
        {items.map((item) => (
          <T.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="tl-tabs__tab tl-focusable"
          >
            {item.label}
            {item.count != null && (
              <span className="tl-tabs__count">{formatCount(item.count, 999)}</span>
            )}
          </T.Tab>
        ))}
        <T.Indicator className="tl-tabs__indicator" />
      </T.List>
      {hasPanels &&
        items.map((item) => (
          <T.Panel key={item.value} value={item.value} className="tl-tabs__panel">
            {item.content}
          </T.Panel>
        ))}
    </T.Root>
  );
}
Tabs.displayName = TabsContract.name;
