import { useLayoutEffect, type RefObject } from 'react';

/**
 * 가로 넘침 단서 · 고정 열 자리(R-37 4).
 * - 고정 열(sticky start · end)이 여럿이면 앞 열 폭만큼 밀어 앉힌다: 열마다 `--tl-data-grid-sticky-<열 번호>`.
 * - 고정 열 묶음의 폭(`--tl-data-grid-start-edge` · `--tl-data-grid-end-edge`)과 보이는 높이
 *   (`--tl-data-grid-view-height`)를 재어 가장자리 그림자 자리를 정한다.
 * - 스크롤 위치에 따라 `data-overflow-start`(왼쪽에 가린 것이 있다) · `data-overflow-end`(오른쪽에 있다).
 * 값은 다시 그리지 않고 요소에 바로 단다(스크롤마다 React를 돌리지 않는다)
 */
export function useGridEdges(wrapRef: RefObject<HTMLDivElement | null>, enabled: boolean): void {
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!enabled || !wrap) return;
    const flag = (name: string, on: boolean) => {
      if (on) wrap.setAttribute(name, '');
      else wrap.removeAttribute(name);
    };
    const onScroll = () => {
      const max = wrap.scrollWidth - wrap.clientWidth;
      const at = Math.abs(wrap.scrollLeft);
      flag('data-overflow-start', max > 1 && at > 1);
      flag('data-overflow-end', max > 1 && at < max - 1);
    };
    const measure = () => {
      const heads = Array.from(
        wrap.querySelectorAll<HTMLElement>('thead th[data-sticky][data-col]'),
      ).sort((a, b) => Number(a.dataset.col) - Number(b.dataset.col));
      let left = 0;
      for (const th of heads.filter((h) => h.dataset.sticky === 'start')) {
        wrap.style.setProperty(`--tl-data-grid-sticky-${th.dataset.col}`, `${left}px`);
        left += th.getBoundingClientRect().width;
      }
      let right = 0;
      for (const th of heads.filter((h) => h.dataset.sticky === 'end').reverse()) {
        wrap.style.setProperty(`--tl-data-grid-sticky-${th.dataset.col}`, `${right}px`);
        right += th.getBoundingClientRect().width;
      }
      wrap.style.setProperty('--tl-data-grid-start-edge', `${left}px`);
      wrap.style.setProperty('--tl-data-grid-end-edge', `${right}px`);
      wrap.style.setProperty('--tl-data-grid-view-height', `${wrap.clientHeight}px`);
      onScroll();
    };
    measure();
    wrap.addEventListener('scroll', onScroll, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    ro?.observe(wrap);
    const table = wrap.querySelector('table');
    if (table) ro?.observe(table);
    return () => {
      wrap.removeEventListener('scroll', onScroll);
      ro?.disconnect();
    };
  });
}
