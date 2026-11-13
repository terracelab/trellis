// 화면 아래를 차지한 것(아래 시트 · 서랍 footer · 휴대폰 탭바 · 고정 ActionBar)의 높이를 모아
// --tl-toast-offset-bottom으로 둔다. 토스트는 그 위에 쌓여 손가락이 있는 단추를 가리지 않는다(PR-19 · R-29).
// 층 순서(z.toast 500)는 그대로이고 위치만 올린다.
import { useCallback, useEffect, useRef } from 'react';

const VAR = '--tl-toast-offset-bottom';
const sources = new Map<symbol, () => number>();
let frame = 0;

/** 요소가 화면 아래쪽(아래 절반)에 걸쳐 있으면 그 윗변부터 화면 바닥까지, 아니면 0 */
function occupied(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (r.height === 0 || r.top >= vh || r.bottom <= vh / 2) return 0;
  return Math.max(0, Math.round(vh - r.top));
}

function apply() {
  frame = 0;
  if (typeof document === 'undefined') return;
  const max = Math.max(0, ...[...sources.values()].map((measure) => measure()));
  const root = document.documentElement;
  if (max > 0) root.style.setProperty(VAR, `${max}px`);
  else root.style.removeProperty(VAR);
}

/** 다음 프레임에 다시 잰다(스크롤 · 크기 바뀜이 몰려도 한 번) */
function schedule() {
  if (typeof window === 'undefined' || frame) return;
  frame = window.requestAnimationFrame(apply);
}

let listening = false;
function listen() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('resize', schedule, { passive: true });
  // 고정 ActionBar는 안쪽 스크롤 상자에서 움직인다. 모든 스크롤을 잡는다
  document.addEventListener('scroll', schedule, { capture: true, passive: true });
}

/**
 * 화면 아래를 차지하는 요소에 붙이는 ref. active인 동안 그 높이만큼 토스트를 올린다.
 * 요소가 사라지거나(시트가 닫힘) active가 꺼지면 빠진다.
 */
export function useBottomInset<T extends HTMLElement>(active: boolean) {
  const id = useRef(Symbol('bottom-inset'));
  const observer = useRef<ResizeObserver | null>(null);
  const detach = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
    if (sources.delete(id.current)) apply();
  }, []);
  useEffect(() => detach, [detach]);
  return useCallback(
    (el: T | null) => {
      detach();
      if (!el || !active) return;
      listen();
      sources.set(id.current, () => occupied(el));
      if (typeof ResizeObserver !== 'undefined') {
        observer.current = new ResizeObserver(schedule);
        observer.current.observe(el);
      }
      apply();
    },
    [active, detach],
  );
}
