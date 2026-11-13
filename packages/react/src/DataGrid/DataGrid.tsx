import {
  DataGridContract,
  formatAmount,
  type DataGridColumn,
  type DataGridColumnState,
  type DataGridFilters,
  type DataGridFilterValue,
  type DataGridProps,
  type DataGridSort,
  type StatusTone,
} from '@terracelab/trellis-contracts';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx, warnDev } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { useNarrowScreen } from '../_internal/sheet.js';
import { syncTruncatedTitle } from '../_internal/truncation.js';
import { Button } from '../Button/Button.js';
import { EmptyState } from '../EmptyState/EmptyState.js';
import { Icon } from '../Icon/Icon.js';
import { cardRoles } from './cards.js';
import { ColumnsMenu } from './ColumnsMenu.js';
import { EditCell } from './EditCell.js';
import { useGridEdges } from './edges.js';
import { HeaderFilter } from './HeaderFilter.js';
import { useGridNavigation } from './keyboard.js';
import { useMidWidth } from './media.js';
import {
  activeFilterCount,
  alignOf,
  buildNodes,
  compareBy,
  filterNodes,
  flattenNodes,
  formatValue,
  groupNodes,
  isNumericColumn,
  leafRows,
  matchesFilters,
  nodeKeys,
  normalizeColumnState,
  raw,
  readColumnState,
  sortNodes,
  sumOf,
  valueChoices,
  visibleColumns,
  writeColumnState,
  type DisplayRow,
} from './model.js';

export type DataGridWebColumn<T> = Omit<DataGridColumn, 'render' | 'validate'> & {
  render?: (row: T) => ReactNode;
  /** 정렬 · 합계 · 필터에 쓸 값(없으면 row[key]) */
  value?: (row: T) => unknown;
  /** 편집한 값 검사. 글자를 돌려주면 저장하지 않고 칸 아래에 보인다 */
  validate?: (value: unknown, row: T) => string | null | undefined;
};

export type DataGridWebProps<T extends object> = Omit<
  DataGridProps,
  | 'columns'
  | 'rows'
  | 'onRowPress'
  | 'empty'
  | 'rowTone'
  | 'rowKey'
  | 'onCellChange'
  | 'groupLabel'
  | 'rowActions'
  | 'isDirty'
> & {
  columns: readonly DataGridWebColumn<T>[];
  rows: readonly T[];
  rowKey: keyof T & string;
  onRowPress?: (row: T) => void;
  empty?: ReactNode;
  rowTone?: (row: T) => StatusTone | undefined;
  onCellChange?: (row: T, key: string, value: unknown) => void;
  groupLabel?: (value: unknown, rows: T[]) => ReactNode;
  /** 행 끝 행동 칸(기본 행동 단추 1개 + 더보기 Menu). 이 칸을 눌러도 onRowPress는 일어나지 않는다 */
  rowActions?: (row: T) => ReactNode;
  /** 저장 전 칸이면 true. 칸 오른쪽 위 점 + 숨은 글자(dirtyHint) */
  isDirty?: (row: T, key: string) => boolean;
  /** 합계 행 첫 칸 글자 */
  summaryLabel?: string;
  className?: string;
};

/** virtualize="auto"가 켜지는 행 수 */
const VIRTUAL_FROM = 200;
/**
 * 행 높이 어림값. 화면에 그리는 값이 아니라 가상 스크롤이 처음 범위를 잡는 데만 쓴다.
 * 문서의 --tl-density-row-height를 먼저 읽고, 못 읽으면(서버 · jsdom) 이 값. 실제 높이는 그린 행에서 잰다
 */
const ROW_ESTIMATE = 32;
const rowHeightOf = (el: Element | null): number => {
  if (!el || typeof getComputedStyle !== 'function') return Number.NaN;
  return Number.parseFloat(getComputedStyle(el).getPropertyValue('--tl-density-row-height'));
};
// 고정 폭 열의 합 + 자동 열 최소 폭(160)만큼 표가 최소 폭을 가진다. 좁은 화면에서 자동 열이 0으로 줄지 않고 가로 스크롤된다
const WIDTH_UNITS: Record<string, number> = { xs: 1, sm: 1.75, md: 2, lg: 3, xl: 4, auto: 2.5 };
const CHECK_UNITS = 0.625;
const ACTION_UNITS = 1.5;
/** 머리 단위를 저절로 붙이는 열 수 한도(넘으면 표 제목 · 부제에 한 번) */
const AUTO_UNIT_MAX = 4;
/** flashKey 행이 선택 바탕을 갖는 시간(ms). 바탕이 들고 나는 것은 행 transition(duration.fast) */
const FLASH_MS = 1000;

/**
 * 고정 열 칸 속성(R-37 4): data-sticky="start" | "end"와 앞 고정 열 폭만큼 민 자리(useGridEdges가 잰
 * `--tl-data-grid-sticky-<열>`). sticky true는 start다. 고정이 아니면 style만 넘긴다
 */
function stickyAttrs(
  c: { sticky?: boolean | 'start' | 'end' } | undefined,
  col: number,
  style?: CSSProperties,
): { 'data-sticky'?: 'start' | 'end'; style?: CSSProperties } {
  const side = c?.sticky === 'end' ? 'end' : c?.sticky ? 'start' : undefined;
  if (!side) return style ? { style } : {};
  return {
    'data-sticky': side,
    style: {
      ...style,
      '--tl-data-grid-offset': `var(--tl-data-grid-sticky-${col}, 0)`,
    } as CSSProperties,
  };
}
/** 가상 스크롤 줄로 스크롤하는 함수(키보드 이동 · scrollToKey가 쓴다) */
type ScrollToRow = (row: number) => void;

type RowItem<T> = Extract<DisplayRow<T>, { kind: 'row' }>;

/** 빈 상태 글자 "이번 달 전표가 없습니다. 전표 입력에서 추가하세요" → [제목, 설명]. 문장이 하나면 제목만 */
function splitSentence(text: string): [string, string | undefined] {
  const m = /^(.+?)\.\s+(\S[\s\S]*)$/.exec(text.trim());
  return m ? [m[1]!, m[2]!.replace(/\.$/, '')] : [text.trim().replace(/\.$/, ''), undefined];
}

/**
 * 두 줄 칸: 이름(primary) + 보조 줄(secondary, caption · fg.secondary). 이 칸이 든 행은
 * density.row.heightTall로 높이가 고정된다(PR-26). 거래처 + 사업자번호, 품목 + 규격 같은 칸에 쓴다
 */
export function DataGridLines({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <span className="tl-data-grid__lines">
      <span className="tl-data-grid__line">{primary}</span>
      {secondary != null && secondary !== '' && secondary !== false && (
        <span className="tl-data-grid__line" data-secondary>
          {secondary}
        </span>
      )}
    </span>
  );
}
type Extra = {
  'data-index'?: number;
  'aria-rowindex'?: number;
  ref?: (el: Element | null) => void;
};

interface VirtualRowsProps<T> {
  display: readonly DisplayRow<T>[];
  colCount: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  headRef: RefObject<HTMLTableSectionElement | null>;
  render: (d: DisplayRow<T>, extra: Extra) => ReactNode;
  /** 머리 줄 수(열 묶음이 있으면 2). aria-rowindex가 그 뒤부터 센다 */
  headRows: number;
  /** 바깥에서 줄로 스크롤할 때 쓰는 함수를 여기에 건다 */
  controlRef: RefObject<ScrollToRow | null>;
  /** 줄을 그린 뒤마다(키보드 이동의 tabindex) */
  onRendered?: () => void;
}

/** 스크롤 상자(표 바깥 div) 안에서 보이는 줄 + 위아래 빈 줄만 그린다. 줄 높이는 그린 뒤 잰다(wrap 열) */
function VirtualRows<T>({
  display,
  colCount,
  scrollRef,
  headRef,
  render,
  headRows,
  controlRef,
  onRendered,
}: VirtualRowsProps<T>) {
  const estimate = useRef(0);
  if (estimate.current === 0) {
    const v = typeof document === 'undefined' ? Number.NaN : rowHeightOf(document.documentElement);
    estimate.current = v > 0 ? v : ROW_ESTIMATE;
  }
  const [headHeight, setHeadHeight] = useState(0);
  useLayoutEffect(() => {
    // 밀도는 표를 감싼 요소에서 바뀔 수 있다(data-density). 표 자리에서 다시 읽는다
    const v = rowHeightOf(scrollRef.current);
    if (v > 0) estimate.current = v;
    setHeadHeight(headRef.current?.offsetHeight ?? 0);
  }, [scrollRef, headRef]);
  const virtualizer = useVirtualizer({
    count: display.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimate.current,
    getItemKey: (i) => display[i]?.key ?? i,
    scrollMargin: headHeight,
    overscan: 12,
  });
  useEffect(() => {
    controlRef.current = (row) => virtualizer.scrollToIndex(row, { align: 'auto' });
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, virtualizer]);
  useLayoutEffect(() => {
    onRendered?.();
  });
  const items = virtualizer.getVirtualItems();
  const first = items[0];
  const last = items[items.length - 1];
  const padTop = first ? first.start - headHeight : 0;
  const padBottom = last ? virtualizer.getTotalSize() - (last.end - headHeight) : 0;
  const spacer = (h: number, k: string) =>
    h > 0 ? (
      <tr key={k} className="tl-data-grid__spacer" aria-hidden="true">
        <td colSpan={colCount} style={{ height: h }} />
      </tr>
    ) : null;
  return (
    <>
      {spacer(padTop, 'pad-top')}
      {items.map((it) => {
        const d = display[it.index];
        return d
          ? render(d, {
              'data-index': it.index,
              'aria-rowindex': it.index + 1 + headRows,
              ref: virtualizer.measureElement,
            })
          : null;
      })}
      {spacer(padBottom, 'pad-bottom')}
    </>
  );
}
type GroupItem<T> = Extract<DisplayRow<T>, { kind: 'group' }>;

export function DataGrid<T extends object>({
  columns,
  rows,
  rowKey,
  caption,
  selectable = false,
  selected,
  onSelectedChange,
  onRowPress,
  activeRowKey,
  sort,
  defaultSort = null,
  onSortChange,
  loading = false,
  empty,
  summary = false,
  summaryLabel: summaryLabelProp,
  height = 'auto',
  rowTone,
  mobile = 'cards',
  onCellChange,
  filters,
  defaultFilters,
  onFiltersChange,
  columnSettings = false,
  columnState,
  onColumnStateChange,
  groupBy,
  groupLabel,
  childrenKey,
  defaultExpanded,
  virtualize = 'auto',
  rowActions,
  dividers = 'auto',
  error,
  filtered: outerFiltered = false,
  groups,
  isDirty,
  dirtyHint: dirtyHintProp,
  scrollToKey,
  flashKey,
  id,
  testID,
  className,
}: DataGridWebProps<T>) {
  const t = useMessages();
  const summaryLabel = summaryLabelProp ?? t('dataGrid.total');
  const dirtyHint = dirtyHintProp ?? t('dataGrid.dirty');
  const narrow = useNarrowScreen();
  const midWidth = useMidWidth();
  const cards = narrow && mobile === 'cards';
  const keyOf = useCallback((row: T) => String((row as Record<string, unknown>)[rowKey]), [rowKey]);

  // ── 정렬 · 선택 ──
  const [innerSort, setInnerSort] = useState<DataGridSort | null>(defaultSort);
  const [innerSelected, setInnerSelected] = useState<string[]>([]);
  const currentSort = sort !== undefined ? sort : innerSort;
  const currentSelected = selected ? [...selected] : innerSelected;
  const setSort = (key: string) => {
    const next: DataGridSort | null =
      currentSort?.key !== key
        ? { key, direction: 'asc' }
        : currentSort.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
    if (sort === undefined) setInnerSort(next);
    onSortChange?.(next);
  };
  const setSelected = (keys: string[]) => {
    if (!selected) setInnerSelected(keys);
    onSelectedChange?.(keys);
  };

  // ── 열 필터 ──
  const [innerFilters, setInnerFilters] = useState<DataGridFilters>(defaultFilters ?? {});
  const currentFilters = filters ?? innerFilters;
  const commitFilters = (next: DataGridFilters) => {
    if (filters === undefined) setInnerFilters(next);
    onFiltersChange?.(next);
  };
  const setFilter = (key: string, v: DataGridFilterValue | undefined) => {
    const next: Record<string, DataGridFilterValue> = { ...currentFilters };
    if (v === undefined) delete next[key];
    else next[key] = v;
    commitFilters(next);
  };

  // ── 열 설정(숨김 · 순서). storageKey가 있으면 이 기기에 저장 ──
  const settingsOn = columnSettings !== false;
  const storageKey = typeof columnSettings === 'object' ? columnSettings.storageKey : undefined;
  const [innerColumnState, setInnerColumnState] = useState<DataGridColumnState | null>(null);
  useEffect(() => {
    // 서버 렌더와 첫 화면을 맞추려고 저장된 설정은 마운트 뒤에 읽는다
    if (columnState === undefined) setInnerColumnState(readColumnState(storageKey));
    // 저장 키가 바뀔 때만 다시 읽는다(columnState는 일부러 뺐다)
  }, [storageKey]);
  const colState = useMemo(
    () => normalizeColumnState(columns, columnState ?? innerColumnState),
    [columns, columnState, innerColumnState],
  );
  const setColState = (next: DataGridColumnState | null) => {
    if (columnState === undefined) {
      setInnerColumnState(next);
      writeColumnState(storageKey, next);
    }
    onColumnStateChange?.(normalizeColumnState(columns, next));
  };
  // 열 설정이 보이는 열(필터는 이 목록으로 건다). 화면에 그리는 열은 그중 폭 1024~1279에서 priority low를 뺀 것
  const visible = useMemo(() => visibleColumns(columns, colState), [columns, colState]);
  const shown = useMemo(
    () => (midWidth ? visible.filter((c) => c.priority !== 'low') : visible),
    [visible, midWidth],
  );

  // ── 트리 · 묶음 펼침 ──
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<string>>(new Set());
  const isExpanded = useCallback(
    (key: string) =>
      openRows[key] ?? (defaultExpanded === 'all' || (defaultExpanded?.includes(key) ?? false)),
    [openRows, defaultExpanded],
  );
  const toggleRow = (key: string) => setOpenRows((o) => ({ ...o, [key]: !isExpanded(key) }));
  const toggleGroup = (key: string) =>
    setCollapsedGroups((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  if (groupBy && childrenKey)
    warnDev(
      'DataGrid: groupBy와 childrenKey는 함께 쓰지 않습니다. 묶음만 그리고 자식 행은 무시합니다.',
    );

  // ── 행 모델: 필터 → 정렬 → 묶음 · 트리 → 화면 줄 ──
  const treeOn = !!childrenKey && !groupBy;
  const nodes = useMemo(
    () => buildNodes(rows, keyOf, treeOn ? childrenKey : undefined),
    [rows, keyOf, treeOn, childrenKey],
  );
  const filterCount = activeFilterCount(currentFilters);
  const filtered = useMemo(
    () =>
      filterCount > 0
        ? filterNodes(nodes, (r) => matchesFilters(r, visible, currentFilters))
        : nodes,
    [nodes, visible, currentFilters, filterCount],
  );
  const sortCol =
    currentSort && !onSortChange ? columns.find((c) => c.key === currentSort.key) : undefined;
  const sorted = useMemo(
    () =>
      sortCol && currentSort
        ? sortNodes(filtered, compareBy(sortCol, currentSort.direction))
        : filtered,
    [filtered, sortCol, currentSort],
  );
  const groupCol = groupBy ? columns.find((c) => c.key === groupBy) : undefined;
  const display = useMemo(
    () =>
      groupCol
        ? groupNodes(sorted, groupCol, (k) => collapsedGroups.has(k))
        : flattenNodes(sorted, isExpanded),
    [sorted, groupCol, collapsedGroups, isExpanded],
  );
  const leaves = useMemo(() => leafRows(sorted), [sorted]);
  const allKeys = useMemo(() => nodeKeys(sorted), [sorted]);
  const allChecked = allKeys.length > 0 && allKeys.every((k) => currentSelected.includes(k));
  const someChecked = !allChecked && allKeys.some((k) => currentSelected.includes(k));
  const isEmpty = sorted.length === 0;
  const noMatch = isEmpty && rows.length > 0 && filterCount > 0;

  // ── 가상 스크롤: 보이는 줄만 그린다(VirtualRows가 스크롤마다 다시 그리고, 이 컴포넌트는 그대로) ──
  const wrapRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const virtualOn =
    !cards &&
    !loading &&
    (virtualize === true ||
      (virtualize === 'auto' && height === 'fill' && display.length > VIRTUAL_FROM));
  const scrollToRow = useRef<ScrollToRow | null>(null);

  // ── 키보드 칸 이동(PR-30): 편집 칸이 있는 표는 role="grid" + roving tabindex ──
  const gridMode = !cards && !!onCellChange && shown.some((c) => c.editable);
  const colBase = selectable ? 2 : 1;
  const editableCols = useMemo(
    () => shown.flatMap((c, i) => (c.editable && onCellChange ? [colBase + i] : [])),
    [shown, onCellChange, colBase],
  );
  const isDataRow = useCallback((i: number) => display[i]?.kind === 'row', [display]);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const nav = useGridNavigation({
    enabled: gridMode && !loading && !error,
    bodyRef,
    scrollRef: wrapRef,
    rowCount: display.length,
    isDataRow,
    editableCols,
    scrollToRow,
  });
  useLayoutEffect(() => {
    nav.afterRender();
  });
  // 가로 넘침 그림자 · 고정 열 자리(R-37 4). 좁은 화면 카드에는 없다
  useGridEdges(wrapRef, !cards);

  // ── 행 찾아가기(PR-30): scrollToKey가 바뀌면 그 행을 화면에 들이고, flashKey 행은 1초 동안 선택 바탕 ──
  useEffect(() => {
    if (scrollToKey == null) return;
    const el = Array.from(wrapRef.current?.querySelectorAll<HTMLElement>('[data-key]') ?? []).find(
      (n) => n.dataset.key === scrollToKey,
    );
    if (el) {
      el.scrollIntoView?.({ block: 'nearest' });
      return;
    }
    const i = display.findIndex((d) => d.kind === 'row' && d.key === scrollToKey);
    if (i >= 0) scrollToRow.current?.(i);
    // key가 바뀔 때만 움직인다(행이 바뀔 때마다 다시 스크롤하지 않게 display는 일부러 뺐다)
  }, [scrollToKey]);
  const [flashing, setFlashing] = useState<string | null>(null);
  useEffect(() => {
    if (flashKey == null) return;
    setFlashing(flashKey);
    const timer = setTimeout(() => setFlashing(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashKey]);

  // ── 공통 조각 ──
  const press = (row: T) => (e: MouseEvent | KeyboardEvent) => {
    if (!onRowPress) return;
    // 행 행동 칸의 Menu 팝업처럼 포털로 그린 것은 DOM 밖이라 React 이벤트만 올라온다
    if (!(e.currentTarget as HTMLElement).contains(e.target as Node)) return;
    if ((e.target as HTMLElement).closest('button, a, input, label, select, textarea')) return;
    if ('key' in e && e.key !== 'Enter') return;
    onRowPress(row);
  };
  const totalText = (c: DataGridWebColumn<T>, list: readonly T[]): string | null => {
    if (c.total === 'count') return t('common.items', { count: formatAmount(list.length) });
    if (c.total === 'sum') return formatValue(sumOf(list, c), c);
    return null;
  };
  const totals = summary ? shown.map((c) => totalText(c, leaves)) : [];
  const labelCol = shown.find((c) => !isNumericColumn(c)) ?? shown[0] ?? columns[0];
  /**
   * 머리 칸 단위: amount = 원, currency = 통화 코드(PR-26). 머리 글자에 이미 괄호가 있으면 붙이지 않는다.
   * 저절로 붙는 열이 4개를 넘으면(5개 이상, 급여표) 좁은 머리가 잘리므로 붙이지 않고, 표 제목 · 부제에 "단위 원"을 한 번 쓴다
   */
  const autoUnit = (c: DataGridWebColumn<T>) =>
    c.headerUnit === undefined &&
    !/[(（]/.test(c.header) &&
    (c.format === 'amount' || c.format === 'currency');
  const autoUnitsOn = shown.filter(autoUnit).length <= AUTO_UNIT_MAX;
  const headUnitOf = (c: DataGridWebColumn<T>): string | null => {
    if (typeof c.headerUnit === 'string') return c.headerUnit;
    if (!autoUnit(c) || !autoUnitsOn) return null;
    return c.format === 'currency' ? (c.currency ?? 'KRW') : t('common.unitWon');
  };
  const headLabel = (c: DataGridWebColumn<T>) => {
    const unit = headUnitOf(c);
    return (
      <span className="tl-data-grid__head-label">
        {c.header}
        {unit && (
          <span className="tl-data-grid__head-unit">
            <span aria-hidden="true">({unit})</span>
            <span className="tl-sr-only">{t('dataGrid.unit', { unit })}</span>
          </span>
        )}
      </span>
    );
  };
  const rowLabel = (row: T) => String((labelCol ? raw(row, labelCol) : null) ?? keyOf(row));
  const content = (row: T, c: DataGridWebColumn<T>): ReactNode => {
    const v = raw(row, c);
    return (
      <>
        {c.render ? c.render(row) : formatValue(v, c)}
        {c.unit && !c.render && v != null && <span className="tl-data-grid__unit">{c.unit}</span>}
      </>
    );
  };
  const financeOf = (row: T, c: DataGridWebColumn<T>) => {
    const n = Number(raw(row, c));
    return c.finance && Number.isFinite(n) && n !== 0 ? (n > 0 ? 'income' : 'expense') : undefined;
  };
  /**
   * 소계 0을 데이터 행처럼 그린다. render가 0에 빈칸을 돌려주는 열(시산표 차변 · 대변처럼 0을 비우는 열)이면
   * 소계 0도 빈칸이고, 그 밖에는 서식대로 "0"이다. 0인 데이터 행이 없으면 서식대로 둔다
   */
  const blankZero = (c: DataGridWebColumn<T>): boolean => {
    if (!c.render) return false;
    const zero = leaves.find((r) => {
      const v = raw(r, c);
      return v !== null && v !== undefined && v !== '' && Number(v) === 0;
    });
    if (!zero) return false;
    const out = c.render(zero);
    return out === null || out === undefined || out === false || out === '';
  };
  const subtotal = (rows: readonly T[], c: DataGridWebColumn<T>): ReactNode => {
    const sum = sumOf(rows, c);
    if (sum === 0 && blankZero(c)) return null;
    return (
      <>
        <span className="tl-sr-only">{t('dataGrid.subtotal')} </span>
        {formatValue(sum, c)}
        {c.unit && <span className="tl-data-grid__unit">{c.unit}</span>}
      </>
    );
  };
  const groupText = (g: GroupItem<T>): ReactNode =>
    groupLabel
      ? groupLabel(g.value, g.rows)
      : g.value == null || g.value === '' || !groupCol
        ? '–'
        : formatValue(g.value, groupCol);
  const toggleChecked = (key: string, checked: boolean) =>
    setSelected(checked ? currentSelected.filter((k) => k !== key) : [...currentSelected, key]);
  const selectAllBox = (labelled: boolean) => (
    <input
      type="checkbox"
      className="tl-data-grid__check tl-focusable"
      aria-label={labelled ? t('common.selectAll') : undefined}
      checked={allChecked}
      ref={(el) => {
        if (el) el.indeterminate = someChecked;
      }}
      onChange={() => setSelected(allChecked ? [] : allKeys)}
    />
  );
  /**
   * 행 대신 서는 블록(PR-30): 오류 → EmptyState error(다시 시도 · 요청 ID), 열 필터 결과 없음 → noResult(필터 모두 지우기),
   * 바깥 조건(filtered) → noResult, 나머지 → empty. empty 글자는 첫 문장이 제목, 나머지가 설명이다
   */
  const emptyBlock = (): ReactNode => {
    if (error)
      return (
        <EmptyState
          size="sm"
          kind="error"
          title={error.message ?? t('dataGrid.error')}
          description={t('emptyState.error.description')}
          requestId={error.requestId}
          action={
            error.onRetry ? (
              <Button size="sm" variant="secondary" icon="refresh-cw" onPress={error.onRetry}>
                {t('common.retry')}
              </Button>
            ) : undefined
          }
        />
      );
    if (noMatch)
      return (
        <EmptyState
          size="sm"
          kind="noResult"
          title={t('dataGrid.noMatch')}
          description={t('emptyState.noResult.description')}
          action={
            <Button size="sm" variant="secondary" onPress={() => commitFilters({})}>
              {t('dataGrid.clearFilters')}
            </Button>
          }
        />
      );
    if (empty != null && typeof empty !== 'string') return empty;
    const kind = outerFiltered ? 'noResult' : 'empty';
    const [title, description] =
      typeof empty === 'string'
        ? splitSentence(empty)
        : [
            outerFiltered ? t('dataGrid.noMatch') : t('dataGrid.empty'),
            t(`emptyState.${kind}.description`),
          ];
    return <EmptyState size="sm" kind={kind} title={title} description={description} />;
  };
  const blocked = !loading && (!!error || isEmpty);
  const treeToggle = (d: RowItem<T>, label: string) =>
    d.hasChildren ? (
      <button
        type="button"
        className="tl-data-grid__tree-toggle tl-focusable"
        aria-expanded={d.expanded}
        aria-label={t(d.expanded ? 'dataGrid.collapse' : 'dataGrid.expand', { label })}
        onClick={() => toggleRow(d.key)}
      >
        <Icon name="chevron-right" size={16} className="tl-data-grid__toggle-icon" />
      </button>
    ) : (
      <span className="tl-data-grid__tree-spacer" aria-hidden="true" />
    );
  const depthStyle = (depth: number) => ({ '--tl-data-grid-depth': depth }) as CSSProperties;

  // ── 좁은 화면: 행마다 카드(D-61). 제목 · 오른쪽 금액 · 상태 · 보조 정보 세 줄 안에서 끝낸다 ──
  if (cards) {
    const roles = cardRoles(shown);
    const trailingIndex = roles.trailing ? shown.indexOf(roles.trailing) : -1;
    const trailingTotal = trailingIndex >= 0 ? totals[trailingIndex] : null;
    const countTotal = totals.find((x, i) => x && shown[i]?.total === 'count') ?? null;
    const card = (d: RowItem<T>) => {
      const { row, key } = d;
      const checked = currentSelected.includes(key);
      const label = rowLabel(row);
      return (
        <li
          key={key}
          className="tl-data-grid__card"
          data-key={key}
          data-flash={flashing === key || undefined}
          data-clickable={onRowPress ? true : undefined}
          data-active={activeRowKey === key || undefined}
          data-selected={checked || undefined}
          data-tone={rowTone?.(row)}
          data-depth={treeOn && d.depth > 0 ? d.depth : undefined}
          style={treeOn && d.depth > 0 ? depthStyle(d.depth) : undefined}
          tabIndex={onRowPress ? 0 : undefined}
          onClick={press(row)}
          onKeyDown={press(row)}
        >
          {selectable && (
            <input
              type="checkbox"
              className="tl-data-grid__check tl-focusable"
              aria-label={t('common.selectRow', { label })}
              checked={checked}
              onChange={() => toggleChecked(key, checked)}
            />
          )}
          {treeOn && treeToggle(d, label)}
          <span className="tl-data-grid__card-body">
            <span className="tl-data-grid__card-top">
              {roles.title && (
                <span className="tl-data-grid__card-title">{content(row, roles.title)}</span>
              )}
              {roles.trailing && (
                <span
                  className="tl-data-grid__card-trailing"
                  data-finance={financeOf(row, roles.trailing)}
                >
                  {content(row, roles.trailing)}
                </span>
              )}
            </span>
            {roles.status.length > 0 && (
              <span className="tl-data-grid__card-status">
                {roles.status.map((c) => (
                  <span key={c.key}>{content(row, c)}</span>
                ))}
              </span>
            )}
            {roles.meta.length > 0 && (
              <span className="tl-data-grid__card-meta">
                {roles.meta.map((c) => (
                  <span key={c.key} className="tl-data-grid__meta">
                    {/* 숫자는 이름이 있어야 뜻이 보인다. 글자 · 날짜는 값만 */}
                    {isNumericColumn(c) && (
                      <span className="tl-data-grid__meta-label">{c.header}</span>
                    )}
                    <span className="tl-data-grid__meta-value" data-finance={financeOf(row, c)}>
                      {content(row, c)}
                    </span>
                  </span>
                ))}
              </span>
            )}
          </span>
          {rowActions && <span className="tl-data-grid__card-actions">{rowActions(row)}</span>}
          {onRowPress && <Icon name="chevron-right" className="tl-data-grid__card-chevron" />}
        </li>
      );
    };
    const groupHead = (g: GroupItem<T>) => (
      <li
        key={g.key}
        className="tl-data-grid__card-group"
        data-collapsed={!g.expanded || undefined}
      >
        <button
          type="button"
          className="tl-data-grid__group-toggle tl-focusable"
          aria-expanded={g.expanded}
          onClick={() => toggleGroup(g.key)}
        >
          <Icon name="chevron-right" size={16} className="tl-data-grid__toggle-icon" />
          <span className="tl-data-grid__group-label">{groupText(g)}</span>
          <span className="tl-data-grid__group-count">
            {t('common.items', { count: formatAmount(g.rows.length) })}
          </span>
        </button>
        {roles.trailing?.total === 'sum' && (
          <span className="tl-data-grid__card-group-total">{subtotal(g.rows, roles.trailing)}</span>
        )}
      </li>
    );
    return (
      <div
        className={cx('tl-data-grid', className)}
        id={id}
        data-testid={testID}
        data-mode="cards"
        data-height={height}
        aria-busy={loading || undefined}
        role="region"
        aria-label={caption}
      >
        {filterCount > 0 && !loading && !error && (
          <div className="tl-data-grid__cards-filters">
            <span>{t('dataGrid.filtersActive', { count: filterCount })}</span>
            <button
              type="button"
              className="tl-data-grid__popover-link tl-focusable"
              onClick={() => commitFilters({})}
            >
              {t('dataGrid.clearFilters')}
            </button>
          </div>
        )}
        {selectable && !blocked && !loading && (
          <label className="tl-data-grid__cards-head">
            {selectAllBox(false)}
            {t('common.selectAll')}
          </label>
        )}
        {loading && (
          <ul className="tl-data-grid__cards" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <li key={`sk-${i}`} className="tl-data-grid__card">
                <span className="tl-data-grid__card-body">
                  <span className="tl-data-grid__skeleton" />
                  <span className="tl-data-grid__skeleton" data-short />
                </span>
              </li>
            ))}
          </ul>
        )}
        {blocked && (
          <div className="tl-data-grid__empty" data-mode="cards">
            {emptyBlock()}
          </div>
        )}
        {!loading && !blocked && (
          <ul className="tl-data-grid__cards">
            {display.map((d) => (d.kind === 'group' ? groupHead(d) : card(d)))}
          </ul>
        )}
        {summary && !loading && !blocked && (trailingTotal || countTotal) && (
          <div className="tl-data-grid__cards-foot">
            <span>{summaryLabel}</span>
            {countTotal && !trailingTotal && <span>{countTotal}</span>}
            {trailingTotal && (
              <span className="tl-data-grid__card-trailing">
                {trailingTotal}
                {roles.trailing?.unit && (
                  <span className="tl-data-grid__unit">{roles.trailing.unit}</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── 표 ──
  const actionsOn = !!rowActions;
  const colCount = shown.length + (selectable ? 1 : 0) + (actionsOn ? 1 : 0) + (settingsOn ? 1 : 0);
  const minUnits = shown.reduce(
    (a, c) => a + (WIDTH_UNITS[c.width ?? 'auto'] ?? 2.5),
    (selectable ? CHECK_UNITS : 0) +
      (settingsOn ? CHECK_UNITS : 0) +
      (actionsOn ? ACTION_UNITS : 0),
  );
  // 숫자 열이 많으면 세로선까지(PR-26): 금액 열이 이어질 때 열 경계가 흐려지지 않게
  const dividerMode =
    dividers === 'auto'
      ? shown.filter((c) => alignOf(c) === 'right').length >= 4
        ? 'all'
        : 'rows'
      : dividers;
  // 열 번호(aria-colindex)와 칸 역할은 grid일 때만 단다. 선택 칸 1, 열은 colBase부터, 그다음 행동 · 열 설정
  const actionsCol = colBase + shown.length;
  const settingsCol = actionsCol + (actionsOn ? 1 : 0);
  const cellRole = gridMode ? 'gridcell' : undefined;
  const colAt = (n: number) => (gridMode ? n : undefined);
  const actionsCell = actionsOn ? (
    <td
      className="tl-data-grid__cell"
      data-kind="actions"
      role={cellRole}
      aria-colindex={colAt(actionsCol)}
    />
  ) : null;
  const firstSum = shown.findIndex((c) => c.total === 'sum');
  // 묶음 머리 글자는 첫 소계 열 앞까지 칸을 합쳐 쓴다
  const groupSpan = firstSum > 0 ? firstSum : firstSum === 0 ? 1 : shown.length;
  const settingsCell = settingsOn ? (
    <td
      className="tl-data-grid__cell"
      data-kind="settings"
      role={cellRole}
      aria-colindex={colAt(settingsCol)}
    />
  ) : null;

  // 열 묶음 머리(PR-30): 묶음이 있으면 머리가 두 줄. 묶음 없는 열은 두 줄을 합쳐 쓴다
  const groupDefs = new Map((groups ?? []).map((g) => [g.key, g]));
  const groupKeyOf = (c: DataGridWebColumn<T>) =>
    c.group && groupDefs.has(c.group) ? c.group : undefined;
  const headRows = shown.some((c) => groupKeyOf(c)) ? 2 : 1;
  const rowCount = display.length + headRows + (summary ? 1 : 0);
  const indexed = virtualOn || gridMode;

  const groupRow = (g: GroupItem<T>, extra: Extra) => (
    <tr
      key={g.key}
      className="tl-data-grid__group"
      data-collapsed={!g.expanded || undefined}
      {...extra}
    >
      {selectable && (
        <td
          className="tl-data-grid__cell"
          data-kind="check"
          role={cellRole}
          aria-colindex={colAt(1)}
        />
      )}
      <td
        className="tl-data-grid__cell"
        colSpan={groupSpan}
        {...stickyAttrs(shown[0], 0)}
        role={cellRole}
        aria-colindex={colAt(colBase)}
      >
        <button
          type="button"
          className="tl-data-grid__group-toggle tl-focusable"
          aria-expanded={g.expanded}
          onClick={() => toggleGroup(g.key)}
        >
          <Icon name="chevron-right" size={16} className="tl-data-grid__toggle-icon" />
          <span className="tl-data-grid__group-label">{groupText(g)}</span>
          <span className="tl-data-grid__group-count">
            {t('common.items', { count: formatAmount(g.rows.length) })}
          </span>
        </button>
      </td>
      {shown.slice(groupSpan).map((c, j) => (
        <td
          key={c.key}
          className="tl-data-grid__cell"
          data-align={alignOf(c)}
          role={cellRole}
          aria-colindex={colAt(colBase + groupSpan + j)}
        >
          {c.total === 'sum' && subtotal(g.rows, c)}
        </td>
      ))}
      {actionsCell}
      {settingsCell}
    </tr>
  );
  const bodyRow = (d: RowItem<T>, extra: Extra) => {
    const { row, key } = d;
    const checked = currentSelected.includes(key);
    const label = rowLabel(row);
    return (
      <tr
        key={key}
        className="tl-data-grid__row"
        data-key={key}
        data-flash={flashing === key || undefined}
        data-clickable={onRowPress ? true : undefined}
        data-active={activeRowKey === key || undefined}
        data-selected={checked || undefined}
        data-tone={rowTone?.(row)}
        data-grouped={groupCol ? true : undefined}
        // grid는 칸이 Tab 정류장이다(roving). 행 열기는 행 안 칸에서 Enter
        tabIndex={onRowPress && !gridMode ? 0 : undefined}
        onClick={press(row)}
        onKeyDown={press(row)}
        {...extra}
      >
        {selectable && (
          <td
            className="tl-data-grid__cell"
            data-kind="check"
            role={cellRole}
            aria-colindex={colAt(1)}
          >
            <input
              type="checkbox"
              className="tl-data-grid__check tl-focusable"
              aria-label={t('common.selectRow', { label })}
              checked={checked}
              onChange={() => toggleChecked(key, checked)}
            />
          </td>
        )}
        {shown.map((c, ci) => {
          const v = raw(row, c);
          const tree = treeOn && ci === 0;
          const editing = !!(c.editable && onCellChange);
          const dirty = isDirty?.(row, c.key) ?? false;
          return (
            <td
              key={c.key}
              className="tl-data-grid__cell"
              data-align={alignOf(c)}
              {...stickyAttrs(c, ci, tree ? depthStyle(d.depth) : undefined)}
              data-wrap={c.wrap || undefined}
              data-finance={financeOf(row, c)}
              data-link={c.link || undefined}
              data-emphasis={c.emphasis || undefined}
              data-editable={editing || undefined}
              data-dirty={dirty || undefined}
              data-tree={tree || undefined}
              role={cellRole}
              aria-colindex={colAt(colBase + ci)}
            >
              {tree && treeToggle(d, label)}
              {editing ? (
                <EditCell
                  row={row}
                  column={c}
                  value={v}
                  display={content(row, c)}
                  hint={dirty ? dirtyHint : undefined}
                  tabIndex={gridMode ? -1 : undefined}
                  onCommit={(next) => onCellChange?.(row, c.key, next)}
                />
              ) : (
                content(row, c)
              )}
              {dirty && !editing && <span className="tl-sr-only">, {dirtyHint}</span>}
            </td>
          );
        })}
        {actionsOn && (
          <td
            className="tl-data-grid__cell"
            data-kind="actions"
            role={cellRole}
            aria-colindex={colAt(actionsCol)}
          >
            <span className="tl-data-grid__actions">{rowActions(row)}</span>
          </td>
        )}
        {settingsCell}
      </tr>
    );
  };
  const renderItem = (d: DisplayRow<T>, extra: Extra = {}) =>
    d.kind === 'group' ? groupRow(d, extra) : bodyRow(d, extra);

  const body = virtualOn ? (
    <VirtualRows
      display={display}
      colCount={colCount}
      scrollRef={wrapRef}
      headRef={headRef}
      render={renderItem}
      headRows={headRows}
      controlRef={scrollToRow}
      onRendered={gridMode ? nav.afterRender : undefined}
    />
  ) : (
    display.map((d, i) =>
      renderItem(d, gridMode ? { 'data-index': i, 'aria-rowindex': i + 1 + headRows } : {}),
    )
  );

  /** 열 머리 칸. 묶음 머리가 있으면 묶음 없는 열은 rowSpan 2 */
  const headCell = (c: DataGridWebColumn<T>, i: number, rowSpan?: number) => {
    const active = currentSort?.key === c.key;
    return (
      <th
        key={c.key}
        scope="col"
        rowSpan={rowSpan}
        {...(rowSpan ? {} : groupEdges(i))}
        className="tl-data-grid__cell"
        data-align={alignOf(c)}
        {...stickyAttrs(c, i)}
        data-col={i}
        data-emphasis={c.emphasis || undefined}
        aria-colindex={colAt(colBase + i)}
        aria-sort={
          active ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined
        }
      >
        <span className="tl-data-grid__head-cell">
          {c.sortable ? (
            <button
              type="button"
              className="tl-data-grid__sort tl-focusable"
              data-sorted={active || undefined}
              onClick={() => setSort(c.key)}
            >
              {headLabel(c)}
              <Icon
                name={
                  active
                    ? currentSort.direction === 'asc'
                      ? 'arrow-up'
                      : 'arrow-down'
                    : 'arrow-up-down'
                }
                className="tl-data-grid__sort-icon"
              />
            </button>
          ) : (
            headLabel(c)
          )}
          {c.filter && (
            <HeaderFilter
              header={c.header}
              kind={c.filter}
              value={currentFilters[c.key]}
              choices={() => valueChoices(leafRows(nodes), c)}
              onChange={(v) => setFilter(c.key, v)}
            />
          )}
        </span>
      </th>
    );
  };
  const span = headRows === 2 ? 2 : undefined;
  /** 묶음 양 끝 표시: 묶음 첫 열은 왼쪽 선, 끝 열은 다음 열이 묶음 밖일 때만 오른쪽 선(묶음끼리 붙으면 겹선이 된다) */
  const groupEdges = (i: number): { 'data-group-start'?: true; 'data-group-end'?: true } => {
    const g = groupKeyOf(shown[i]!);
    if (!g) return {};
    const prev = i > 0 ? groupKeyOf(shown[i - 1]!) : undefined;
    const next = shown[i + 1] ? groupKeyOf(shown[i + 1]!) : undefined;
    return {
      'data-group-start': prev !== g || undefined,
      'data-group-end': next === undefined || undefined,
    };
  };
  /** 첫 머리 줄: 묶음이 있으면 이어진 같은 묶음 열을 한 칸(colSpan)으로 */
  const firstHeadCells = shown.map((c, i) => {
    const g = groupKeyOf(c);
    if (!g) return headCell(c, i, span);
    if (i > 0 && groupKeyOf(shown[i - 1]!) === g) return null;
    let n = 1;
    while (shown[i + n] && groupKeyOf(shown[i + n]!) === g) n += 1;
    const def = groupDefs.get(g)!;
    return (
      <th
        key={`group-${g}-${i}`}
        scope="colgroup"
        colSpan={n}
        className="tl-data-grid__cell"
        data-kind="group-head"
        data-group-start
        data-group-end={groupEdges(i + n - 1)['data-group-end']}
        {...(def.sticky ? stickyAttrs({ sticky: 'start' }, i) : {})}
        aria-colindex={colAt(colBase + i)}
      >
        {def.header}
      </th>
    );
  });

  return (
    <div
      ref={wrapRef}
      className={cx('tl-data-grid', className)}
      id={id}
      data-testid={testID}
      data-height={height}
      data-dividers={dividerMode}
      data-virtual={virtualOn || undefined}
      data-grid={gridMode || undefined}
      data-head-rows={headRows === 2 ? 2 : undefined}
      aria-busy={loading || undefined}
      // 가로로 스크롤되는 표를 키보드로도 움직일 수 있게(axe scrollable-region-focusable)
      tabIndex={0}
      role="region"
      aria-label={caption}
      // 말줄임으로 잘린 칸만 가리키면 전체 글자(title, R-37 4)
      onPointerOver={(e) => {
        const cell = (e.target as Element).closest?.('.tl-data-grid__cell');
        if (cell instanceof HTMLElement && !cell.hasAttribute('data-wrap'))
          syncTruncatedTitle(cell);
      }}
    >
      {/* 가장자리 그림자 자리: 높이 0, 스크롤해도 보이는 면 왼쪽 위에 붙어 있다 */}
      <div className="tl-data-grid__edges" aria-hidden="true" />
      <table
        className="tl-data-grid__table"
        style={{ minWidth: `calc(var(--tl-space-64) * ${minUnits})` }}
        role={gridMode ? 'grid' : undefined}
        aria-rowcount={indexed ? rowCount : undefined}
        aria-colcount={gridMode ? colCount : undefined}
      >
        <caption className="tl-sr-only">{caption}</caption>
        <colgroup>
          {selectable && <col className="tl-data-grid__col" data-width="check" />}
          {shown.map((c) => (
            <col key={c.key} className="tl-data-grid__col" data-width={c.width ?? 'auto'} />
          ))}
          {actionsOn && <col className="tl-data-grid__col" data-width="actions" />}
          {settingsOn && <col className="tl-data-grid__col" data-width="check" />}
        </colgroup>
        <thead ref={headRef} className="tl-data-grid__head">
          <tr aria-rowindex={indexed ? 1 : undefined}>
            {selectable && (
              <th
                scope="col"
                rowSpan={span}
                className="tl-data-grid__cell"
                data-kind="check"
                aria-colindex={colAt(1)}
              >
                {selectAllBox(true)}
              </th>
            )}
            {firstHeadCells}
            {actionsOn && (
              <th
                scope="col"
                rowSpan={span}
                className="tl-data-grid__cell"
                data-kind="actions"
                aria-colindex={colAt(actionsCol)}
              >
                <span className="tl-sr-only">{t('dataGrid.actions')}</span>
              </th>
            )}
            {settingsOn && (
              <th
                scope="col"
                rowSpan={span}
                className="tl-data-grid__cell"
                data-kind="settings"
                aria-colindex={colAt(settingsCol)}
              >
                <ColumnsMenu
                  columns={columns}
                  state={colState}
                  onChange={setColState}
                  onReset={() => setColState(null)}
                />
              </th>
            )}
          </tr>
          {headRows === 2 && (
            <tr aria-rowindex={indexed ? 2 : undefined}>
              {shown.map((c, i) => (groupKeyOf(c) ? headCell(c, i) : null))}
            </tr>
          )}
        </thead>
        <tbody
          ref={bodyRef}
          onKeyDown={gridMode ? nav.onKeyDown : undefined}
          onFocus={gridMode ? nav.onFocus : undefined}
        >
          {loading &&
            Array.from({ length: 6 }, (_, i) => (
              <tr key={`sk-${i}`} className="tl-data-grid__row" aria-hidden>
                {Array.from({ length: colCount }, (__, j) => (
                  <td key={j} className="tl-data-grid__cell">
                    <span className="tl-data-grid__skeleton" />
                  </td>
                ))}
              </tr>
            ))}
          {blocked && (
            <tr>
              <td className="tl-data-grid__empty" colSpan={colCount}>
                {emptyBlock()}
              </td>
            </tr>
          )}
          {!loading && !blocked && body}
        </tbody>
        {summary && !loading && !blocked && (
          <tfoot className="tl-data-grid__foot">
            <tr aria-rowindex={indexed ? rowCount : undefined}>
              {selectable && <td className="tl-data-grid__cell" aria-colindex={colAt(1)} />}
              {shown.map((c, i) => (
                <td
                  key={c.key}
                  className="tl-data-grid__cell"
                  data-align={alignOf(c)}
                  {...stickyAttrs(c, i)}
                  data-emphasis={c.emphasis || undefined}
                  aria-colindex={colAt(colBase + i)}
                >
                  {totals[i] ??
                    (c === labelCol || (i === 0 && !totals.some(Boolean)) ? summaryLabel : '')}
                  {totals[i] && c.unit && c.total === 'sum' && (
                    <span className="tl-data-grid__unit">{c.unit}</span>
                  )}
                </td>
              ))}
              {actionsCell}
              {settingsCell}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
DataGrid.displayName = DataGridContract.name;
