// DataGrid의 행 모델: 받은 행 → 필터 → 정렬 → 트리 · 묶음 → 화면에 그릴 줄 목록. 화면과 무관한 순수 함수만 둔다.
import {
  formatAmount,
  formatCurrency,
  formatDate,
  formatPercent,
  type DataGridColumn,
  type DataGridColumnState,
  type DataGridEditor,
  type DataGridFilters,
  type DataGridSort,
} from '@terracelab/trellis-contracts';

export interface ModelColumn<T> extends Omit<DataGridColumn, 'render' | 'validate'> {
  /** 정렬 · 합계 · 필터에 쓸 값(없으면 row[key]) */
  value?: (row: T) => unknown;
}

const NUMERIC = new Set(['amount', 'number', 'quantity', 'percent', 'currency']);
const collator = new Intl.Collator('ko-KR', { numeric: true });

export const isNumericColumn = (c: Pick<DataGridColumn, 'format'>) =>
  NUMERIC.has(c.format ?? 'text');

export const alignOf = (c: Pick<DataGridColumn, 'format' | 'align'>) =>
  c.align ?? (isNumericColumn(c) ? 'right' : 'left');

export function raw<T>(row: T, col: ModelColumn<T>): unknown {
  return col.value ? col.value(row) : (row as Record<string, unknown>)[col.key];
}

export function formatValue(v: unknown, col: Omit<DataGridColumn, 'render' | 'validate'>): string {
  if (v == null || v === '') return '–';
  if (col.options) {
    const hit = col.options.find((o) => o.value === String(v));
    if (hit) return hit.label;
  }
  const n = Number(v);
  switch (col.format) {
    case 'amount':
      return formatAmount(n);
    case 'number':
    case 'quantity':
      return formatAmount(n, { digits: Number.isInteger(n) ? 0 : 1 });
    case 'percent':
      return formatPercent(n);
    case 'currency':
      return formatCurrency(n, col.currency ?? 'KRW');
    case 'date':
      return formatDate(String(v));
    default:
      return String(v);
  }
}

/** 편집기: 열이 정하지 않으면 서식에서 고른다 */
export function editorOf(col: Omit<DataGridColumn, 'render' | 'validate'>): DataGridEditor {
  if (col.editor) return col.editor;
  if (col.options) return 'select';
  if (col.format === 'amount' || col.format === 'currency') return 'amount';
  if (col.format === 'date') return 'date';
  if (isNumericColumn(col)) return 'number';
  return 'text';
}

// ── 필터 ────────────────────────────────────────────────

/** 필터가 실제로 걸려 있는지(빈 글자는 안 걸린 것, 빈 목록은 걸린 것 = 아무것도 안 보임) */
export const isActiveFilter = (v: DataGridFilters[string] | undefined) =>
  v !== undefined && (typeof v !== 'string' || v.trim() !== '');

export const activeFilterCount = (filters: DataGridFilters) =>
  Object.values(filters).filter(isActiveFilter).length;

/** 값 필터가 고르는 값: 빈 칸은 '' */
export const filterKey = (v: unknown) => (v == null ? '' : String(v));

export function matchesFilters<T>(
  row: T,
  columns: readonly ModelColumn<T>[],
  filters: DataGridFilters,
): boolean {
  for (const col of columns) {
    const f = filters[col.key];
    if (!isActiveFilter(f)) continue;
    const v = raw(row, col);
    if (typeof f === 'string') {
      const needle = f.trim().toLocaleLowerCase('ko-KR');
      const hay = `${filterKey(v)} ${formatValue(v, col)}`.toLocaleLowerCase('ko-KR');
      if (!hay.includes(needle)) return false;
    } else if (!(f as readonly string[]).includes(filterKey(v))) return false;
  }
  return true;
}

export interface ValueChoice {
  value: string;
  label: string;
  count: number;
}

/** 값 필터의 고를 거리: options가 있으면 그 순서, 없으면 행에 나온 값을 한국어 순으로 */
export function valueChoices<T>(rows: readonly T[], col: ModelColumn<T>): ValueChoice[] {
  const counts = new Map<string, { raw: unknown; count: number }>();
  for (const r of rows) {
    const v = raw(r, col);
    const k = filterKey(v);
    const hit = counts.get(k);
    if (hit) hit.count += 1;
    else counts.set(k, { raw: v, count: 1 });
  }
  if (col.options) {
    return col.options
      .filter((o) => counts.has(o.value))
      .map((o) => ({ value: o.value, label: o.label, count: counts.get(o.value)!.count }));
  }
  const list = [...counts].map(([value, { raw: v, count }]) => ({
    value,
    label: formatValue(v, col),
    count,
  }));
  const numeric = isNumericColumn(col);
  return list.sort((a, b) =>
    numeric ? Number(a.value) - Number(b.value) : collator.compare(a.label, b.label),
  );
}

// ── 트리 · 정렬 ─────────────────────────────────────────

export interface RowNode<T> {
  row: T;
  key: string;
  depth: number;
  children: RowNode<T>[];
}

export function buildNodes<T>(
  rows: readonly T[],
  keyOf: (row: T) => string,
  childrenKey?: string,
  depth = 0,
): RowNode<T>[] {
  return rows.map((row) => {
    const kids = childrenKey ? (row as Record<string, unknown>)[childrenKey] : undefined;
    return {
      row,
      key: keyOf(row),
      depth,
      children: Array.isArray(kids) ? buildNodes(kids as T[], keyOf, childrenKey, depth + 1) : [],
    };
  });
}

/** 자기가 맞거나 자손 중 하나가 맞으면 남긴다. 자식도 같은 조건으로 거른다 */
export function filterNodes<T>(nodes: RowNode<T>[], keep: (row: T) => boolean): RowNode<T>[] {
  const out: RowNode<T>[] = [];
  for (const n of nodes) {
    const children = filterNodes(n.children, keep);
    if (keep(n.row) || children.length > 0) out.push({ ...n, children });
  }
  return out;
}

export function compareBy<T>(col: ModelColumn<T>, direction: DataGridSort['direction']) {
  const dir = direction === 'asc' ? 1 : -1;
  return (a: T, b: T) => {
    const x = raw(a, col);
    const y = raw(b, col);
    // 빈 값은 방향과 관계없이 맨 뒤
    const ex = x == null || x === '';
    const ey = y == null || y === '';
    if (ex || ey) return ex === ey ? 0 : ex ? 1 : -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
    return collator.compare(String(x), String(y)) * dir;
  };
}

/** 형제끼리 정렬한다(트리는 단계마다) */
export function sortNodes<T>(nodes: RowNode<T>[], cmp: (a: T, b: T) => number): RowNode<T>[] {
  return [...nodes]
    .sort((a, b) => cmp(a.row, b.row))
    .map((n) => (n.children.length ? { ...n, children: sortNodes(n.children, cmp) } : n));
}

/** 잎 행(합계는 잎만 더한다. 부모가 자식 합을 들고 있어도 두 번 세지 않는다) */
export function leafRows<T>(nodes: RowNode<T>[], out: T[] = []): T[] {
  for (const n of nodes) {
    if (n.children.length) leafRows(n.children, out);
    else out.push(n.row);
  }
  return out;
}

export function nodeKeys<T>(nodes: RowNode<T>[], out: string[] = []): string[] {
  for (const n of nodes) {
    out.push(n.key);
    nodeKeys(n.children, out);
  }
  return out;
}

// ── 화면 줄 ────────────────────────────────────────────

export type DisplayRow<T> =
  | {
      kind: 'row';
      key: string;
      row: T;
      depth: number;
      hasChildren: boolean;
      expanded: boolean;
    }
  | {
      kind: 'group';
      key: string;
      value: unknown;
      rows: T[];
      expanded: boolean;
    };

export function flattenNodes<T>(
  nodes: RowNode<T>[],
  isExpanded: (key: string) => boolean,
  out: DisplayRow<T>[] = [],
): DisplayRow<T>[] {
  for (const n of nodes) {
    const hasChildren = n.children.length > 0;
    const expanded = hasChildren && isExpanded(n.key);
    out.push({ kind: 'row', key: n.key, row: n.row, depth: n.depth, hasChildren, expanded });
    if (expanded) flattenNodes(n.children, isExpanded, out);
  }
  return out;
}

/** 묶음은 정렬된 행에서 처음 나온 순서대로. 묶음 머리 key는 'group:<값>' */
export function groupNodes<T>(
  nodes: RowNode<T>[],
  col: ModelColumn<T>,
  isCollapsed: (groupKey: string) => boolean,
): DisplayRow<T>[] {
  const groups = new Map<string, { value: unknown; nodes: RowNode<T>[] }>();
  for (const n of nodes) {
    const v = raw(n.row, col);
    const k = `group:${filterKey(v)}`;
    const g = groups.get(k);
    if (g) g.nodes.push(n);
    else groups.set(k, { value: v, nodes: [n] });
  }
  const out: DisplayRow<T>[] = [];
  for (const [key, g] of groups) {
    const expanded = !isCollapsed(key);
    out.push({ kind: 'group', key, value: g.value, rows: g.nodes.map((n) => n.row), expanded });
    if (expanded)
      for (const n of g.nodes)
        out.push({
          kind: 'row',
          key: n.key,
          row: n.row,
          depth: 0,
          hasChildren: false,
          expanded: false,
        });
  }
  return out;
}

export function sumOf<T>(rows: readonly T[], col: ModelColumn<T>): number {
  return rows.reduce((acc, r) => acc + (Number(raw(r, col)) || 0), 0);
}

// ── 열 설정 ─────────────────────────────────────────────

/** 저장된 설정을 지금 열에 맞춘다: 없어진 열은 버리고, 새 열은 원래 자리 순서로 뒤에 붙인다 */
export function normalizeColumnState(
  columns: readonly Pick<DataGridColumn, 'key' | 'hidden' | 'hideable'>[],
  state?: DataGridColumnState | null,
): DataGridColumnState {
  const keys = columns.map((c) => c.key);
  if (!state) return { order: keys, hidden: columns.filter((c) => c.hidden).map((c) => c.key) };
  const known = new Set(keys);
  const order = state.order.filter((k) => known.has(k));
  for (const k of keys) if (!order.includes(k)) order.push(k);
  const locked = new Set(columns.filter((c) => c.hideable === false).map((c) => c.key));
  const hidden = state.hidden.filter((k) => known.has(k) && !locked.has(k));
  // 다 숨기면 표가 빈다. 첫 열은 남긴다
  if (hidden.length >= order.length) hidden.splice(hidden.indexOf(order[0]!), 1);
  return { order, hidden };
}

export function visibleColumns<C extends Pick<DataGridColumn, 'key'>>(
  columns: readonly C[],
  state: DataGridColumnState,
): C[] {
  const byKey = new Map(columns.map((c) => [c.key, c]));
  const hidden = new Set(state.hidden);
  return state.order
    .filter((k) => !hidden.has(k))
    .map((k) => byKey.get(k))
    .filter((c): c is C => c !== undefined);
}

export const sameColumnState = (a: DataGridColumnState, b: DataGridColumnState) =>
  a.order.join('\u0000') === b.order.join('\u0000') &&
  [...a.hidden].sort().join('\u0000') === [...b.hidden].sort().join('\u0000');

const STORAGE_PREFIX = 'trellis.dataGrid.';

export function readColumnState(storageKey: string | undefined): DataGridColumnState | null {
  if (!storageKey || typeof window === 'undefined') return null;
  try {
    const v = JSON.parse(window.localStorage.getItem(STORAGE_PREFIX + storageKey) ?? 'null');
    if (v && Array.isArray(v.order) && Array.isArray(v.hidden)) return v as DataGridColumnState;
  } catch {
    // 저장소를 못 쓰면(사생활 보호 창) 기본 열로 보인다
  }
  return null;
}

export function writeColumnState(
  storageKey: string | undefined,
  state: DataGridColumnState | null,
) {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    if (state) window.localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(state));
    else window.localStorage.removeItem(STORAGE_PREFIX + storageKey);
  } catch {
    // 저장 실패는 화면 동작에 영향을 주지 않는다
  }
}
