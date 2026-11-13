import {
  MenuContract,
  type MenuActionItem,
  type MenuEntry,
  type MenuProps,
} from '@terracelab/trellis-contracts';
import { cloneElement, useId, useState, type MouseEvent, type ReactElement } from 'react';
import { Menu as M } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Icon } from '../Icon/Icon.js';
import { Tooltip } from '../Tooltip/Tooltip.js';

export type MenuWebProps = Omit<MenuProps, 'trigger'> & {
  /** 여는 요소 하나. props와 ref를 그대로 받는 버튼이어야 한다(Button · IconButton) */
  trigger: ReactElement<Record<string, unknown>>;
  className?: string;
};

type Block =
  | { kind: 'separator'; key: string }
  | { kind: 'group'; key: string; label?: string; items: MenuActionItem[] };

/** label은 다음 구분선 · 다음 label 앞까지를 한 묶음으로 만든다 */
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

export function Menu({
  trigger,
  items,
  align = 'end',
  disabled = false,
  title,
  id,
  testID,
  className,
}: MenuWebProps) {
  const t = useMessages();
  const sheet = useSheetMode();
  const base = useId();
  const [open, setOpen] = useState(false);
  const blocks = toBlocks(items);
  // 아이콘이 하나라도 있으면 아이콘 칸을 비워 두어 라벨 시작선을 맞춘다
  const withIcons = items.some((e) => e.type !== 'separator' && e.type !== 'label' && e.icon);

  /** 비활성 이유. disabled와 함께일 때만 쓴다 */
  const reasonOf = (item: MenuActionItem) =>
    item.disabled && item.disabledReason ? item.disabledReason : undefined;
  const reasonId = (item: MenuActionItem) => `${base}-${item.id}-reason`;

  const renderItem = (item: MenuActionItem) => {
    const reason = reasonOf(item);
    // Base UI 메뉴 항목은 비활성이어도 aria-disabled로 포커스가 닿는다. 이유는 설명으로 잇고 툴팁으로 보인다
    const node = (
      <M.Item
        key={item.id}
        className="tl-menu__item"
        label={item.label}
        disabled={item.disabled}
        data-danger={item.danger || undefined}
        aria-describedby={reason ? reasonId(item) : undefined}
        onClick={() => item.onSelect?.()}
      >
        {item.icon ? (
          <Icon name={item.icon} className="tl-menu__icon" />
        ) : (
          withIcons && <span className="tl-menu__icon" aria-hidden />
        )}
        <span className="tl-menu__label">{item.label}</span>
        {item.shortcut && <kbd className="tl-menu__shortcut">{item.shortcut}</kbd>}
        {reason && (
          <span id={reasonId(item)} hidden>
            {reason}
          </span>
        )}
      </M.Item>
    );
    return reason ? (
      <Tooltip key={item.id} content={reason} side="right">
        {node}
      </Tooltip>
    ) : (
      node
    );
  };

  // 좁은 화면: 같은 트리거가 아래 시트를 연다(D-60). 항목은 손가락 높이 행, 고르면 시트를 닫고 실행한다
  if (sheet) {
    const tp = trigger.props;
    const sheetTitle =
      title ??
      (typeof tp['label'] === 'string'
        ? tp['label']
        : typeof tp['aria-label'] === 'string'
          ? tp['aria-label']
          : typeof tp['children'] === 'string'
            ? tp['children']
            : t('menu.title'));
    const sheetItem = (item: MenuActionItem) => {
      const reason = reasonOf(item);
      // 시트(손가락)에는 툴팁이 없다. 이유를 행 끝 글자로 보이고 aria-describedby로 잇는다
      return (
        <button
          key={item.id}
          type="button"
          className="tl-sheet-option tl-menu-sheet__item tl-focusable"
          disabled={item.disabled && !reason}
          aria-disabled={reason ? true : undefined}
          aria-describedby={reason ? reasonId(item) : undefined}
          data-disabled={item.disabled || undefined}
          data-danger={item.danger || undefined}
          onClick={() => {
            if (item.disabled) return;
            setOpen(false);
            item.onSelect?.();
          }}
        >
          {item.icon ? (
            <Icon name={item.icon} className="tl-menu-sheet__icon" />
          ) : (
            withIcons && <span className="tl-menu-sheet__icon" aria-hidden />
          )}
          <span className="tl-sheet-option__label">{item.label}</span>
          {reason && (
            // 이름에 섞이지 않게 숨기고(aria-hidden) aria-describedby로만 읽는다
            <span id={reasonId(item)} className="tl-menu-sheet__reason" aria-hidden="true">
              {reason}
            </span>
          )}
        </button>
      );
    };
    return (
      <>
        {cloneElement(trigger, {
          disabled: disabled || tp['disabled'] || undefined,
          'aria-haspopup': 'dialog',
          'aria-expanded': open,
          onClick: (e: MouseEvent) => {
            (tp['onClick'] as ((e: MouseEvent) => void) | undefined)?.(e);
            setOpen(true);
          },
        })}
        <Sheet
          open={open}
          onOpenChange={setOpen}
          title={sheetTitle}
          testID={testID}
          className={cx('tl-menu-sheet', className)}
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
    <M.Root disabled={disabled}>
      <M.Trigger render={trigger} />
      <M.Portal>
        <M.Positioner className="tl-menu__positioner" align={align} sideOffset={4}>
          <M.Popup className={cx('tl-menu', className)} id={id} data-testid={testID}>
            {blocks.map((block) =>
              block.kind === 'separator' ? (
                <M.Separator key={block.key} className="tl-menu__separator" />
              ) : block.label != null ? (
                <M.Group key={block.key} className="tl-menu__group">
                  <M.GroupLabel className="tl-menu__group-label">{block.label}</M.GroupLabel>
                  {block.items.map(renderItem)}
                </M.Group>
              ) : (
                block.items.map(renderItem)
              ),
            )}
          </M.Popup>
        </M.Positioner>
      </M.Portal>
    </M.Root>
  );
}
Menu.displayName = MenuContract.name;
