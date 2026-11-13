import {
  formatCount,
  FolderTreeContract,
  type FolderTreeNode,
  type FolderTreeProps,
} from '@terracelab/trellis-contracts';
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

export type FolderTreeWebProps = FolderTreeProps & { className?: string };

/** 보이는 행 하나(펼친 폴더의 자식까지) */
interface Row {
  node: FolderTreeNode;
  level: number;
  parent: string | null;
  setSize: number;
  position: number;
  branch: boolean;
  open: boolean;
}

/** 펼친 폴더만 따라 내려가며 보이는 행을 한 줄로 편다(평평한 treeitem + aria-level) */
function visibleRows(
  nodes: readonly FolderTreeNode[],
  open: ReadonlySet<string>,
  level = 1,
  parent: string | null = null,
  out: Row[] = [],
): Row[] {
  nodes.forEach((node, i) => {
    const branch = (node.children?.length ?? 0) > 0;
    const isOpen = branch && open.has(node.id);
    out.push({
      node,
      level,
      parent,
      setSize: nodes.length,
      position: i + 1,
      branch,
      open: isOpen,
    });
    if (isOpen) visibleRows(node.children!, open, level + 1, node.id, out);
  });
  return out;
}

/** 글자 찾기: 이 시간 안에 친 글자는 이어 붙인다 */
const TYPEAHEAD_MS = 700;

export function FolderTree({
  nodes,
  selected,
  defaultSelected = null,
  onSelect,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  label,
  id,
  testID,
  className,
}: FolderTreeWebProps) {
  const t = useMessages();
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelected);
  const [innerExpanded, setInnerExpanded] = useState<string[]>(() => [...defaultExpanded]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const current = selected !== undefined ? selected : innerSelected;
  const open = expanded !== undefined ? expanded : innerExpanded;
  const openSet = useMemo(() => new Set(open), [open]);
  const rows = useMemo(() => visibleRows(nodes, openSet), [nodes, openSet]);
  const items = useRef(new Map<string, HTMLDivElement>());
  // 하위가 하나도 없는 한 단계 목록(메일함)은 펼침 칸을 비워 두지 않는다
  const flat = !nodes.some((n) => (n.children?.length ?? 0) > 0);
  const typed = useRef({ text: '', at: 0 });

  // 탭으로 들어오는 행 하나(로빙 tabindex): 포커스했던 행 → 고른 행 → 첫 행. 접혀 안 보이면 다음 후보
  const visible = (key: string | null) => key != null && rows.some((r) => r.node.id === key);
  const tabStop = visible(focusId)
    ? focusId
    : visible(current)
      ? current
      : (rows[0]?.node.id ?? null);

  const setOpen = (next: string[]) => {
    if (expanded === undefined) setInnerExpanded(next);
    onExpandedChange?.(next);
  };
  const toggle = (key: string, want: boolean) => {
    if (openSet.has(key) === want) return;
    setOpen(want ? [...open, key] : open.filter((x) => x !== key));
  };
  const select = (row: Row) => {
    if (row.node.disabled) return;
    if (selected === undefined) setInnerSelected(row.node.id);
    onSelect?.(row.node.id);
  };
  const focusRow = (row: Row | undefined) => {
    if (!row) return;
    setFocusId(row.node.id);
    items.current.get(row.node.id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, row: Row, index: number) => {
    const key = e.key;
    let handled = true;
    if (key === 'ArrowDown') focusRow(rows[index + 1]);
    else if (key === 'ArrowUp') focusRow(rows[index - 1]);
    else if (key === 'Home') focusRow(rows[0]);
    else if (key === 'End') focusRow(rows[rows.length - 1]);
    else if (key === 'ArrowRight') {
      if (row.branch && !row.open && !row.node.disabled) toggle(row.node.id, true);
      else if (row.open) focusRow(rows[index + 1]);
    } else if (key === 'ArrowLeft') {
      if (row.open) toggle(row.node.id, false);
      else if (row.parent) focusRow(rows.find((r) => r.node.id === row.parent));
    } else if (key === 'Enter' || key === ' ') select(row);
    else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // 글자 찾기: 지금 행 다음부터 그 글자로 시작하는 행으로(끝에서 처음으로)
      const now = Date.now();
      const text = now - typed.current.at < TYPEAHEAD_MS ? typed.current.text + key : key;
      typed.current = { text, at: now };
      const lower = text.toLocaleLowerCase();
      const start = text.length > 1 ? index : index + 1;
      const order = [...rows.slice(start), ...rows.slice(0, start)];
      focusRow(order.find((r) => r.node.label.toLocaleLowerCase().startsWith(lower)));
    } else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      role="tree"
      aria-label={label ?? t('folderTree.label')}
      className={cx('tl-folder-tree', className)}
      id={id}
      data-testid={testID}
      data-flat={flat || undefined}
    >
      {rows.map((row, index) => {
        const { node } = row;
        const isSelected = node.id === current;
        return (
          <div
            key={node.id}
            ref={(el) => {
              if (el) items.current.set(node.id, el);
              else items.current.delete(node.id);
            }}
            role="treeitem"
            tabIndex={node.id === tabStop ? 0 : -1}
            aria-level={row.level}
            aria-setsize={row.setSize}
            aria-posinset={row.position}
            aria-expanded={row.branch ? row.open : undefined}
            aria-selected={isSelected}
            aria-disabled={node.disabled || undefined}
            className="tl-folder-tree__item tl-focusable"
            data-state={node.disabled ? 'disabled' : undefined}
            style={{ '--tl-folder-tree-level': row.level - 1 } as CSSProperties}
            onFocus={() => setFocusId(node.id)}
            onKeyDown={(e) => onKeyDown(e, row, index)}
            onClick={() => select(row)}
            onDoubleClick={() => row.branch && !node.disabled && toggle(node.id, !row.open)}
          >
            {!flat && (
              <span
                className="tl-folder-tree__toggle"
                aria-hidden="true"
                data-open={row.open || undefined}
                onClick={(e: MouseEvent) => {
                  if (!row.branch || node.disabled) return;
                  // 펼침만 바꾸고 고르지 않는다. 포커스는 행으로
                  e.stopPropagation();
                  toggle(node.id, !row.open);
                  focusRow(row);
                }}
              >
                {row.branch && <Icon name="chevron-right" className="tl-folder-tree__chevron" />}
              </span>
            )}
            <Icon name={node.icon ?? 'folder'} className="tl-folder-tree__icon" />
            <span className="tl-folder-tree__label" title={node.label}>
              {node.label}
            </span>
            {node.count != null && (
              <>
                {/* 행 이름을 "회의록 2건"으로 읽게 띄어 쓴다 */}{' '}
                <span className="tl-folder-tree__count">
                  {formatCount(node.count, 999)}
                  <span className="tl-sr-only">{t('common.itemsSuffix')}</span>
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
FolderTree.displayName = FolderTreeContract.name;
