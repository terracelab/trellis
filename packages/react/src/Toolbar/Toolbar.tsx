import {
  ToolbarContract,
  type ToolbarGroup,
  type ToolbarItem,
  type ToolbarProps,
} from '@terracelab/trellis-contracts';
import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../_internal/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Tooltip } from '../Tooltip/Tooltip.js';

export type ToolbarWebGroup = Omit<ToolbarGroup, 'content'> & { content?: ReactNode };
export type ToolbarWebProps = Omit<ToolbarProps, 'groups' | 'end'> & {
  groups: readonly ToolbarWebGroup[];
  end?: ReactNode;
  className?: string;
};

/** 화살표가 옮겨 다니는 자리: 우리 단추 + content 안의 첫 초점 요소 */
const STOP = '[data-tl-toolbar-item]';
const FOCUSABLE =
  'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"]), [role="combobox"]';

function stopsOf(root: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const el of root.querySelectorAll<HTMLElement>(`${STOP}, [data-tl-toolbar-content]`)) {
    if (el.matches(STOP)) out.push(el);
    else {
      const inner =
        el.querySelector<HTMLElement>('[data-tl-toolbar-stop]') ??
        el.querySelector<HTMLElement>(FOCUSABLE);
      if (inner && !(inner as HTMLButtonElement).disabled) {
        inner.setAttribute('data-tl-toolbar-stop', '');
        out.push(inner);
      }
    }
  }
  return out;
}

/** 글자 입력 칸 안에서는 화살표 · Home · End가 글자 커서를 옮긴다 */
const typing = (el: EventTarget | null) =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement && !['checkbox', 'radio', 'button'].includes(el.type));

/**
 * 도구 줄(role=toolbar): 묶음마다 단추 · 켜고 끄는 단추 · 부품(Select), 묶음 사이 구분선.
 * 탭 정류장은 하나(roving). 화살표로 옮기고 Home · End로 끝, 잠긴 단추도 화살표 이동에 남는다(aria-disabled)
 */
export function Toolbar({
  label,
  groups,
  onPress,
  end,
  size = 'sm',
  orientation = 'horizontal',
  disabled = false,
  id,
  testID,
  className,
}: ToolbarWebProps) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // 탭 정류장 하나: 지금 자리만 tabindex 0, 나머지 -1(content 안 요소도 같이)
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const stops = stopsOf(el);
    const at = Math.min(active, stops.length - 1);
    stops.forEach((s, i) => s.setAttribute('tabindex', i === at ? '0' : '-1'));
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el || typing(e.target)) return;
    const stops = stopsOf(el);
    const i = stops.findIndex((s) => s === e.target || s.contains(e.target as Node));
    if (i < 0) return;
    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    let to = -1;
    if (e.key === next) to = (i + 1) % stops.length;
    else if (e.key === prev) to = (i - 1 + stops.length) % stops.length;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = stops.length - 1;
    if (to < 0) return;
    e.preventDefault();
    setActive(to);
    stops[to]?.focus();
  };

  const button = (item: ToolbarItem) => {
    const locked = disabled || Boolean(item.disabled);
    const iconOnly = !item.showLabel;
    const tip = item.shortcut ? `${item.label} (${item.shortcut})` : item.label;
    const node = (
      <button
        key={item.id}
        type="button"
        className="tl-toolbar__button tl-focusable"
        data-tl-toolbar-item=""
        data-text={!item.icon || undefined}
        data-text-style={!item.icon ? item.textStyle : undefined}
        data-label={item.showLabel || undefined}
        data-state={locked ? 'disabled' : undefined}
        aria-label={iconOnly ? item.label : undefined}
        aria-pressed={item.pressed}
        aria-disabled={locked || undefined}
        aria-keyshortcuts={item.shortcut}
        onClick={() => {
          if (!locked) onPress?.(item.id);
        }}
      >
        {item.icon ? (
          <Icon name={item.icon} size={16} />
        ) : (
          <span className="tl-toolbar__text" aria-hidden={iconOnly || undefined}>
            {item.text}
          </span>
        )}
        {item.showLabel && <span className="tl-toolbar__label">{item.label}</span>}
      </button>
    );
    return iconOnly ? (
      <Tooltip key={item.id} content={tip}>
        {node}
      </Tooltip>
    ) : (
      node
    );
  };

  return (
    <div
      ref={root}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      aria-disabled={disabled || undefined}
      className={cx('tl-toolbar', className)}
      id={id}
      data-testid={testID}
      data-size={size}
      data-orientation={orientation}
      data-state={disabled ? 'disabled' : undefined}
      onKeyDown={onKeyDown}
      onFocus={(e) => {
        const el = root.current;
        if (!el) return;
        const i = stopsOf(el).findIndex((s) => s === e.target || s.contains(e.target as Node));
        if (i >= 0 && i !== active) setActive(i);
      }}
    >
      {groups.map((g, gi) => (
        <Fragment key={g.id}>
          {gi > 0 && (
            <span
              className="tl-toolbar__separator"
              role="separator"
              aria-orientation={orientation === 'vertical' ? 'horizontal' : 'vertical'}
            />
          )}
          <div className="tl-toolbar__group" role="group" aria-label={g.label}>
            {g.content != null && (
              <div className="tl-toolbar__content" data-tl-toolbar-content="">
                {g.content}
              </div>
            )}
            {g.items?.map(button)}
          </div>
        </Fragment>
      ))}
      {end != null && <div className="tl-toolbar__end">{end}</div>}
    </div>
  );
}
Toolbar.displayName = ToolbarContract.name;
