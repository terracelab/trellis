import {
  OrgChartContract,
  type OrgChartNode,
  type OrgChartProps,
} from '@terracelab/trellis-contracts';
import { useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { PersonLabel } from '../PersonLabel/PersonLabel.js';

export type OrgChartWebProps = OrgChartProps & { className?: string };

/** 키보드 이동 순서: 펼친 조직만 따라 깊이 우선으로 편다 */
interface Visible {
  node: OrgChartNode;
  parent: string | null;
  branch: boolean;
  open: boolean;
}

function flatten(
  nodes: readonly OrgChartNode[],
  open: ReadonlySet<string>,
  parent: string | null = null,
  out: Visible[] = [],
): Visible[] {
  for (const node of nodes) {
    const branch = (node.children?.length ?? 0) > 0;
    const isOpen = branch && open.has(node.id);
    out.push({ node, parent, branch, open: isOpen });
    if (isOpen) flatten(node.children!, open, node.id, out);
  }
  return out;
}

function branchIds(nodes: readonly OrgChartNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children?.length) {
      out.push(node.id);
      branchIds(node.children, out);
    }
  }
  return out;
}

export function OrgChart({
  nodes,
  selected,
  defaultSelected = null,
  onSelect,
  expanded,
  defaultExpanded = 'all',
  onExpandedChange,
  label,
  id,
  testID,
  className,
}: OrgChartWebProps) {
  const t = useMessages();
  const uid = useId();
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelected);
  const [innerExpanded, setInnerExpanded] = useState<string[]>(() =>
    defaultExpanded === 'all' ? branchIds(nodes) : [...defaultExpanded],
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const current = selected !== undefined ? selected : innerSelected;
  const open = expanded !== undefined ? expanded : innerExpanded;
  const openSet = useMemo(() => new Set(open), [open]);
  const rows = useMemo(() => flatten(nodes, openSet), [nodes, openSet]);
  const items = useRef(new Map<string, HTMLDivElement>());

  // 로빙 tabindex: 포커스했던 조직 → 고른 조직 → 첫 조직(접혀 안 보이면 다음 후보)
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
  const select = (key: string) => {
    if (selected === undefined) setInnerSelected(key);
    onSelect?.(key);
  };
  const focusRow = (row: Visible | undefined) => {
    if (!row) return;
    setFocusId(row.node.id);
    items.current.get(row.node.id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, key: string) => {
    // 안쪽 조직의 키는 자기 자리에서만 처리한다(바깥 li로 거슬러 오르지 않게)
    if (e.target !== e.currentTarget) return;
    const index = rows.findIndex((r) => r.node.id === key);
    const row = rows[index];
    if (!row) return;
    let handled = true;
    if (e.key === 'ArrowDown') focusRow(rows[index + 1]);
    else if (e.key === 'ArrowUp') focusRow(rows[index - 1]);
    else if (e.key === 'Home') focusRow(rows[0]);
    else if (e.key === 'End') focusRow(rows[rows.length - 1]);
    else if (e.key === 'ArrowRight') {
      if (row.branch && !row.open) toggle(key, true);
      else if (row.open) focusRow(rows[index + 1]);
    } else if (e.key === 'ArrowLeft') {
      if (row.open) toggle(key, false);
      else if (row.parent) focusRow(rows.find((r) => r.node.id === row.parent));
    } else if (e.key === 'Enter' || e.key === ' ') select(key);
    else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderNode = (node: OrgChartNode, level: number, position: number, setSize: number) => {
    const branch = (node.children?.length ?? 0) > 0;
    const isOpen = branch && openSet.has(node.id);
    const isSelected = node.id === current;
    const nameId = `${uid}-${node.id}-name`;
    const metaId = `${uid}-${node.id}-meta`;
    const groupId = `${uid}-${node.id}-group`;
    const hasMeta = node.head != null || node.headcount != null;
    return (
      // 탐색 트리 패턴: 항목(treeitem)은 노드 칸, 하위 묶음은 형제 ul + aria-owns.
      // li 안에 하위 조직 글자까지 들어가면 접근성 이름과 보이는 글자가 어긋난다(axe label-content-name-mismatch)
      <li key={node.id} role="none" className="tl-org-chart__item">
        <div
          ref={(el) => {
            if (el) items.current.set(node.id, el);
            else items.current.delete(node.id);
          }}
          role="treeitem"
          tabIndex={node.id === tabStop ? 0 : -1}
          aria-level={level}
          aria-setsize={setSize}
          aria-posinset={position}
          aria-expanded={branch ? isOpen : undefined}
          aria-selected={isSelected}
          aria-owns={isOpen ? groupId : undefined}
          className="tl-org-chart__node tl-focusable"
          data-selected={isSelected || undefined}
          onFocus={(e) => {
            if (e.target === e.currentTarget) setFocusId(node.id);
          }}
          onKeyDown={(e) => onKeyDown(e, node.id)}
          onClick={() => {
            select(node.id);
            focusRow(rows.find((r) => r.node.id === node.id));
          }}
        >
          <span className="tl-org-chart__name" id={nameId}>
            {node.name}
          </span>
          {hasMeta && (
            <span className="tl-org-chart__meta" id={metaId}>
              {node.head && (
                <PersonLabel
                  size="sm"
                  name={node.head.name}
                  meta={node.head.title}
                  src={node.head.src}
                />
              )}
              {node.headcount != null && (
                <span className="tl-org-chart__count">
                  {t('orgChart.headcount', { count: node.headcount })}
                </span>
              )}
            </span>
          )}
          {branch && (
            // 펼침 단추는 마우스용. 키보드는 ← → 로 같은 일을 한다
            <span
              className="tl-org-chart__toggle"
              aria-hidden="true"
              data-open={isOpen || undefined}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                toggle(node.id, !isOpen);
              }}
            >
              <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
            </span>
          )}
        </div>
        {isOpen && (
          <ul role="group" id={groupId} className="tl-org-chart__group">
            {node.children!.map((child, i) =>
              renderNode(child, level + 1, i + 1, node.children!.length),
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className={cx('tl-org-chart', className)} id={id} data-testid={testID}>
      <ul role="tree" aria-label={label ?? t('orgChart.label')} className="tl-org-chart__tree">
        {nodes.map((node, i) => renderNode(node, 1, i + 1, nodes.length))}
      </ul>
    </div>
  );
}
OrgChart.displayName = OrgChartContract.name;
