// 편집 칸이 있는 표의 키보드 칸 이동(PR-30). role="grid" + roving tabindex.
// 표 안에서 Tab 정류장은 하나(지금 칸)이고, 방향키 · Home · End · PageUp · PageDown으로 옮긴다.
// Enter · F2는 편집 칸을 열고, Tab · Shift+Tab은 다음 · 이전 편집 칸으로 간다(없으면 표 밖으로).
// 한 글자 단축키는 두지 않는다. 칸 안 단추가 여럿이면(행 행동) 좌우 방향키가 단추를 하나씩 지난다.
//
// tabindex는 React가 아니라 그린 뒤 DOM에 건다. 칸 안 내용(render · rowActions)은 앱이 그리므로
// 그 안의 단추까지 한 곳에서 -1로 내리려면 DOM이 가장 확실하다. 지금 칸은 ref에 두어 방향키마다
// 표 전체를 다시 그리지 않는다.
import { useCallback, useRef, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';

/** 칸 안에서 포커스를 받는 것 */
const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';
/** 글자를 치는 칸: 방향키 · Home · End는 그 칸의 몫 */
const TYPING =
  'input:not([type="checkbox"]):not([type="radio"]), select, textarea, [contenteditable]';
/** PageUp · PageDown 한 번에 옮기는 행 수(화면 높이를 못 잴 때) */
const PAGE_FALLBACK = 10;

export interface GridPosition {
  /** 화면 줄 번호(display 순서, data-index) */
  row: number;
  /** 열 번호(aria-colindex, 1부터) */
  col: number;
  /** 칸 안 포커스 대상 순서(단추가 여럿일 때) */
  sub: number;
}

export interface GridNavigationOptions {
  enabled: boolean;
  bodyRef: RefObject<HTMLTableSectionElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  /** 화면 줄 수 */
  rowCount: number;
  /** 행(묶음 머리가 아닌 줄)인지 */
  isDataRow: (row: number) => boolean;
  /** 편집 칸 열 번호(aria-colindex, 오름차순) */
  editableCols: readonly number[];
  /** 그리지 않은 줄(가상 스크롤)로 갈 때 그 줄을 화면에 들인다 */
  scrollToRow?: RefObject<((row: number) => void) | null>;
}

const rowsOf = (body: HTMLElement): HTMLElement[] =>
  Array.from(body.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute('data-index'),
  );

const indexOf = (tr: Element): number => Number(tr.getAttribute('data-index'));
const colOf = (td: Element): number => Number(td.getAttribute('aria-colindex'));

/** 줄의 칸(열 설정 자리는 비어 있어 건너뛴다) */
const cellsOf = (tr: Element): HTMLElement[] =>
  Array.from(tr.children).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement &&
      el.hasAttribute('aria-colindex') &&
      el.getAttribute('data-kind') !== 'settings',
  );

/** 칸 안 포커스 대상. 단추 · 입력이 없으면 칸 자신 */
function innerOf(td: HTMLElement): HTMLElement[] {
  return Array.from(td.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest('[aria-hidden="true"]'),
  );
}
const targetsOf = (td: HTMLElement): HTMLElement[] => {
  const inner = innerOf(td);
  return inner.length ? inner : [td];
};

/** 포커스 대상이 선 자리 */
function posOf(el: HTMLElement): GridPosition | null {
  const td = el.closest('td');
  const tr = td?.parentElement;
  if (!td || !tr || !tr.hasAttribute('data-index') || !td.hasAttribute('aria-colindex'))
    return null;
  return { row: indexOf(tr), col: colOf(td), sub: Math.max(0, targetsOf(td).indexOf(el)) };
}

/** col을 덮는 칸(colSpan을 센다). 없으면 마지막 칸 */
function cellAt(tr: Element, col: number): HTMLElement | undefined {
  const cells = cellsOf(tr);
  return (
    cells.find((td) => {
      const start = colOf(td);
      const span = (td as HTMLTableCellElement).colSpan || 1;
      return col >= start && col < start + span;
    }) ?? cells[cells.length - 1]
  );
}

export function useGridNavigation({
  enabled,
  bodyRef,
  scrollRef,
  rowCount,
  isDataRow,
  editableCols,
  scrollToRow,
}: GridNavigationOptions) {
  const active = useRef<GridPosition | null>(null);
  const pending = useRef<GridPosition | null>(null);
  const applied = useRef(false);

  const rowEl = useCallback(
    (row: number) => {
      const body = bodyRef.current;
      return body ? rowsOf(body).find((tr) => indexOf(tr) === row) : undefined;
    },
    [bodyRef],
  );

  const resolve = useCallback(
    (pos: GridPosition | null): HTMLElement | undefined => {
      if (!pos) return undefined;
      const tr = rowEl(pos.row);
      const td = tr && cellAt(tr, pos.col);
      if (!td) return undefined;
      const targets = targetsOf(td);
      return targets[Math.min(pos.sub, targets.length - 1)];
    },
    [rowEl],
  );

  /** 처음 Tab으로 들어올 칸: 첫 행의 첫 편집 칸, 없으면 첫 칸 */
  const initial = useCallback((): GridPosition | null => {
    const body = bodyRef.current;
    const first = body ? rowsOf(body)[0] : undefined;
    if (!first) return null;
    const row = indexOf(first);
    const col =
      isDataRow(row) && editableCols.length ? editableCols[0]! : colOf(cellsOf(first)[0]!);
    return { row, col, sub: 0 };
  }, [bodyRef, isDataRow, editableCols]);

  /** 그린 뒤: 칸 안 포커스 대상을 모두 -1로, 지금 칸만 0으로. 기다리던 이동이 있으면 포커스 */
  const afterRender = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    if (!enabled) {
      // 편집 칸이 사라지면 건 tabindex를 거둔다
      if (applied.current) {
        body.querySelectorAll<HTMLElement>('[data-tl-roving]').forEach((el) => {
          el.removeAttribute('tabindex');
          el.removeAttribute('data-tl-roving');
        });
        applied.current = false;
      }
      return;
    }
    applied.current = true;
    for (const tr of rowsOf(body))
      for (const td of cellsOf(tr)) {
        const inner = innerOf(td);
        if (inner.length) {
          if (td.hasAttribute('data-tl-roving')) {
            td.removeAttribute('tabindex');
            td.removeAttribute('data-tl-roving');
          }
          for (const el of inner) {
            el.tabIndex = -1;
            el.setAttribute('data-tl-roving', '');
          }
        } else {
          td.tabIndex = -1;
          td.setAttribute('data-tl-roving', '');
        }
      }
    if (pending.current) {
      const el = resolve(pending.current);
      if (el) {
        active.current = posOf(el) ?? pending.current;
        pending.current = null;
        el.tabIndex = 0;
        el.focus();
        return;
      }
    }
    let el = resolve(active.current);
    if (!el) {
      active.current = initial();
      el = resolve(active.current);
    }
    if (el) el.tabIndex = 0;
  }, [bodyRef, enabled, resolve, initial]);

  const moveTo = useCallback(
    (pos: GridPosition) => {
      const prev = resolve(active.current);
      const el = resolve(pos);
      if (el) {
        if (prev && prev !== el) prev.tabIndex = -1;
        active.current = posOf(el) ?? pos;
        el.tabIndex = 0;
        el.focus();
        el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
        return;
      }
      // 가상 스크롤로 아직 그리지 않은 줄: 화면에 들인 뒤 afterRender가 포커스한다
      if (scrollToRow?.current) {
        pending.current = pos;
        scrollToRow.current(pos.row);
      }
    },
    [resolve, scrollToRow],
  );

  const pageSize = () => {
    const box = scrollRef.current;
    const tr = bodyRef.current ? rowsOf(bodyRef.current)[0] : undefined;
    const h = tr?.offsetHeight ?? 0;
    return box && h > 0 ? Math.max(1, Math.floor(box.clientHeight / h) - 1) : PAGE_FALLBACK;
  };

  /** 다음(dir 1) · 이전(dir -1) 편집 칸. 줄 순서 → 열 순서 */
  const nextEditable = (from: GridPosition, dir: 1 | -1): GridPosition | null => {
    if (!editableCols.length) return null;
    for (let row = from.row; row >= 0 && row < rowCount; row += dir) {
      if (!isDataRow(row)) continue;
      const cols = dir === 1 ? editableCols : [...editableCols].reverse();
      for (const col of cols) {
        if (row === from.row && (dir === 1 ? col <= from.col : col >= from.col)) continue;
        return { row, col, sub: 0 };
      }
    }
    return null;
  };

  const onFocus = useCallback(
    (e: FocusEvent<HTMLElement>) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      const pos = posOf(target);
      if (!pos) return;
      const prev = resolve(active.current);
      active.current = pos;
      const el = resolve(pos);
      if (prev && prev !== el) prev.tabIndex = -1;
      if (el) el.tabIndex = 0;
    },
    [enabled, resolve],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!enabled || e.defaultPrevented) return;
    // 행 행동 Menu처럼 포털로 그린 것은 DOM 밖이라 React 이벤트만 올라온다
    if (!e.currentTarget.contains(e.target as Node)) return;
    const target = e.target as HTMLElement;
    const here = posOf(target);
    const td = target.closest('td');
    const tr = td?.parentElement;
    if (!here || !td || !tr) return;
    const typing = target.matches(TYPING);

    // Tab: 다음 · 이전 편집 칸(편집 중이어도). 없으면 표 밖으로 나간다(기본 동작)
    if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const next = nextEditable(here, e.shiftKey ? -1 : 1);
      if (!next) return;
      e.preventDefault();
      moveTo(next);
      return;
    }
    if (typing || e.altKey) return;

    // Enter · F2: 편집 칸이면 편집을 연다. 아니면 Enter는 행 열기(tr이 받는다).
    // 같은 칸의 다른 단추(트리 펼침)에서 Enter는 그 단추의 몫이다
    if (e.key === 'Enter' || e.key === 'F2') {
      const edit = td.hasAttribute('data-editable')
        ? td.querySelector<HTMLElement>('.tl-data-grid__edit')
        : null;
      if (!edit || (e.key === 'Enter' && target !== edit && target !== td)) return;
      e.preventDefault();
      edit.click();
      return;
    }

    // Shift + 방향키는 고르기 범위가 없는 표라 쓰지 않는다(브라우저 기본에 맡긴다)
    if (e.shiftKey) return;
    const cells = cellsOf(tr);
    const at = cells.indexOf(td);
    const last = rowCount - 1;
    let next: GridPosition | null = null;
    switch (e.key) {
      case 'ArrowRight': {
        const targets = targetsOf(td);
        if (here.sub < targets.length - 1) next = { ...here, sub: here.sub + 1 };
        else if (cells[at + 1]) next = { row: here.row, col: colOf(cells[at + 1]!), sub: 0 };
        break;
      }
      case 'ArrowLeft': {
        if (here.sub > 0) next = { ...here, sub: here.sub - 1 };
        else if (cells[at - 1]) {
          const prev = cells[at - 1]!;
          next = { row: here.row, col: colOf(prev), sub: targetsOf(prev).length - 1 };
        }
        break;
      }
      case 'ArrowDown':
        if (here.row < last) next = { row: here.row + 1, col: here.col, sub: 0 };
        break;
      case 'ArrowUp':
        if (here.row > 0) next = { row: here.row - 1, col: here.col, sub: 0 };
        break;
      case 'PageDown':
        next = { row: Math.min(last, here.row + pageSize()), col: here.col, sub: 0 };
        break;
      case 'PageUp':
        next = { row: Math.max(0, here.row - pageSize()), col: here.col, sub: 0 };
        break;
      case 'Home':
        next =
          e.ctrlKey || e.metaKey
            ? { row: 0, col: 1, sub: 0 }
            : { row: here.row, col: colOf(cells[0]!), sub: 0 };
        break;
      case 'End': {
        const end = cells[cells.length - 1]!;
        next =
          e.ctrlKey || e.metaKey
            ? { row: last, col: Number.MAX_SAFE_INTEGER, sub: Number.MAX_SAFE_INTEGER }
            : { row: here.row, col: colOf(end), sub: targetsOf(end).length - 1 };
        break;
      }
      default:
        return;
    }
    // 끝에 닿아도 키는 표가 먹는다(페이지가 스크롤되지 않게)
    e.preventDefault();
    if (next && (next.row !== here.row || next.col !== here.col || next.sub !== here.sub))
      moveTo(next);
  };

  return { onKeyDown, onFocus, afterRender };
}
