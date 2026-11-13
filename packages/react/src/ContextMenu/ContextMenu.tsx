import {
  ContextMenuContract,
  type ContextMenuProps,
  type MenuActionItem,
  type MenuEntry,
} from '@terracelab/trellis-contracts';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { ContextMenu as CM } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Icon } from '../Icon/Icon.js';

export type ContextMenuWebProps = Omit<ContextMenuProps, 'children' | 'onOpenChange'> & {
  /** 메뉴를 받는 영역. 감싸는 요소는 상자를 만들지 않는다(display: contents) */
  children: ReactNode;
  /** 열리고 닫힐 때. target = 메뉴를 연 요소(누른 행 · 포커스한 행) */
  onOpenChange?: (open: boolean, target: HTMLElement | null) => void;
  className?: string;
};

/** 길게 누르기로 보는 시간(ms)과 손가락이 움직여도 되는 거리(화면 점) */
const LONG_PRESS_MS = 500;
const MOVE_SLOP = 10;

type Block =
  | { kind: 'separator'; key: string }
  | { kind: 'group'; key: string; label?: string; items: MenuActionItem[] };

/** label은 다음 구분선 · 다음 label 앞까지를 한 묶음으로 만든다(Menu와 같다) */
function toBlocks(entries: readonly MenuEntry[]): Block[] {
  const blocks: Block[] = [];
  let group: Extract<Block, { kind: 'group' }> | null = null;
  entries.forEach((entry, i) => {
    if (entry.type === 'separator') {
      blocks.push({ kind: 'separator', key: `separator-${i}` });
      group = null;
      return;
    }
    if (entry.type === 'label') {
      group = { kind: 'group', key: `group-${i}`, label: entry.label, items: [] };
      blocks.push(group);
      return;
    }
    if (!group) {
      group = { kind: 'group', key: `group-${i}`, items: [] };
      blocks.push(group);
    }
    group.items.push(entry);
  });
  return blocks;
}

/** 키보드로 여는 키: Shift+F10 · 메뉴 키 */
const isMenuKey = (e: KeyboardEvent) => (e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu';

const elementOf = (e: SyntheticEvent) => (e.target instanceof HTMLElement ? e.target : null);

/** 입력 칸 안에서는 브라우저 메뉴(붙여넣기 · 맞춤법)를 그대로 둔다 */
const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const editable = (e: SyntheticEvent) => Boolean(elementOf(e)?.closest(EDITABLE));

export function ContextMenu({
  children,
  items,
  onOpenChange,
  disabled = false,
  title,
  id,
  testID,
  className,
}: ContextMenuWebProps) {
  const t = useMessages();
  const sheet = useSheetMode();
  const [open, setOpen] = useState(false);
  // 키보드로 열면 포커스한 요소 왼쪽 아래에 연다. 포인터로 열면 Base UI가 누른 자리에 둔다
  const [anchor, setAnchor] = useState<{ getBoundingClientRect: () => DOMRect } | undefined>();
  const targetRef = useRef<HTMLElement | null>(null);
  const press = useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const swallowClick = useRef(false);
  const shown = open && items.length > 0;
  const blocks = toBlocks(items);
  const withIcons = items.some((e) => e.type !== 'separator' && e.type !== 'label' && e.icon);

  const change = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next, targetRef.current);
  };

  // 앱이 연 요소에서 고를 항목을 못 찾으면(빈 자리) 열린 상태를 되돌린다
  useEffect(() => {
    if (open && items.length === 0) setOpen(false);
  }, [open, items.length]);

  const cancelPress = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };
  useEffect(() => cancelPress, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || !isMenuKey(e) || editable(e)) return;
    e.preventDefault();
    const el = elementOf(e);
    targetRef.current = el;
    if (el) {
      const r = el.getBoundingClientRect();
      setAnchor({
        getBoundingClientRect: () =>
          DOMRect.fromRect({ x: r.left, y: r.bottom, width: 0, height: 0 }),
      });
    }
    change(true);
  };

  const renderItem = (item: MenuActionItem) => (
    <CM.Item
      key={item.id}
      className="tl-menu__item"
      label={item.label}
      disabled={item.disabled}
      data-danger={item.danger || undefined}
      onClick={() => item.onSelect?.()}
    >
      {item.icon ? (
        <Icon name={item.icon} className="tl-menu__icon" />
      ) : (
        withIcons && <span className="tl-menu__icon" aria-hidden />
      )}
      <span className="tl-menu__label">{item.label}</span>
      {item.shortcut && <kbd className="tl-menu__shortcut">{item.shortcut}</kbd>}
    </CM.Item>
  );

  // 좁은 화면: 길게 누르기 · 우클릭 · Shift+F10이 아래 시트를 연다(D-60). 고르면 시트를 닫고 실행한다
  if (sheet) {
    const sheetItem = (item: MenuActionItem) => (
      <button
        key={item.id}
        type="button"
        className="tl-sheet-option tl-menu-sheet__item tl-focusable"
        disabled={item.disabled}
        data-danger={item.danger || undefined}
        onClick={() => {
          change(false);
          item.onSelect?.();
        }}
      >
        {item.icon ? (
          <Icon name={item.icon} className="tl-menu-sheet__icon" />
        ) : (
          withIcons && <span className="tl-menu-sheet__icon" aria-hidden />
        )}
        <span className="tl-sheet-option__label">{item.label}</span>
      </button>
    );
    return (
      <>
        <div
          className={cx('tl-context-menu', className)}
          data-testid={testID}
          data-disabled={disabled || undefined}
          onContextMenu={(e) => {
            if (disabled || editable(e)) return;
            e.preventDefault();
            targetRef.current = elementOf(e);
            change(true);
          }}
          onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
            swallowClick.current = false;
            if (disabled || e.pointerType !== 'touch' || editable(e)) return;
            cancelPress();
            const el = elementOf(e);
            press.current = {
              x: e.clientX,
              y: e.clientY,
              timer: setTimeout(() => {
                press.current = null;
                // 손을 떼면 오는 click이 행을 열지 않게 한 번 삼킨다
                swallowClick.current = true;
                targetRef.current = el;
                change(true);
              }, LONG_PRESS_MS),
            };
          }}
          onPointerMove={(e) => {
            const p = press.current;
            if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_SLOP) cancelPress();
          }}
          onPointerUp={cancelPress}
          onPointerCancel={cancelPress}
          onClickCapture={(e) => {
            if (!swallowClick.current) return;
            swallowClick.current = false;
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={onKeyDown}
        >
          {children}
        </div>
        <Sheet
          open={shown}
          onOpenChange={change}
          title={title ?? t('menu.title')}
          className="tl-menu-sheet tl-context-menu-sheet"
        >
          <div className="tl-sheet-options" id={id}>
            {blocks.map((block) =>
              block.kind === 'separator' ? (
                <hr key={block.key} className="tl-menu-sheet__separator" />
              ) : block.label != null ? (
                <div
                  key={block.key}
                  role="group"
                  aria-labelledby={`${block.key}-label`}
                  className="tl-menu-sheet__group"
                >
                  <div id={`${block.key}-label`} className="tl-menu-sheet__label">
                    {block.label}
                  </div>
                  {block.items.map(sheetItem)}
                </div>
              ) : (
                block.items.map(sheetItem)
              ),
            )}
          </div>
        </Sheet>
      </>
    );
  }

  return (
    <CM.Root open={shown} onOpenChange={(next) => change(next)} disabled={disabled}>
      <CM.Trigger
        className={cx('tl-context-menu', className)}
        data-testid={testID}
        data-disabled={disabled || undefined}
        onContextMenuCapture={(e) => {
          // 입력 칸이면 Base UI까지 가지 않게 멈춰 브라우저 메뉴가 뜬다
          if (editable(e)) return e.stopPropagation();
          targetRef.current = elementOf(e);
          setAnchor(undefined);
        }}
        onTouchStartCapture={(e) => {
          if (editable(e)) return e.stopPropagation();
          targetRef.current = elementOf(e);
          setAnchor(undefined);
        }}
        onKeyDown={onKeyDown}
      >
        {children}
      </CM.Trigger>
      <CM.Portal>
        <CM.Positioner className="tl-menu__positioner" anchor={anchor}>
          <CM.Popup className="tl-menu tl-context-menu__popup" id={id}>
            {blocks.map((block) =>
              block.kind === 'separator' ? (
                <CM.Separator key={block.key} className="tl-menu__separator" />
              ) : block.label != null ? (
                <CM.Group key={block.key} className="tl-menu__group">
                  <CM.GroupLabel className="tl-menu__group-label">{block.label}</CM.GroupLabel>
                  {block.items.map(renderItem)}
                </CM.Group>
              ) : (
                block.items.map(renderItem)
              ),
            )}
          </CM.Popup>
        </CM.Positioner>
      </CM.Portal>
    </CM.Root>
  );
}
ContextMenu.displayName = ContextMenuContract.name;
