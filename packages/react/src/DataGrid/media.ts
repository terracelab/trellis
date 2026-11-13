// column.priority 'low'를 숨기는 폭(breakpoint.lg 이상 · breakpoint.xl 미만 = 1024~1279, PR-30).
// CSS로 칸만 숨기면 묶음 머리 · 묶음 줄의 colSpan이 어긋난다. 열 목록에서 빼려고 폭을 JS로 읽는다.
import { primitives } from '@terracelab/trellis-tokens';
import { useSyncExternalStore } from 'react';

const FROM = `(min-width: ${primitives.breakpoint.lg})`;
const UNTIL = `(min-width: ${primitives.breakpoint.xl})`;

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const queries = [window.matchMedia(FROM), window.matchMedia(UNTIL)];
  for (const q of queries) q.addEventListener('change', onChange);
  return () => {
    for (const q of queries) q.removeEventListener('change', onChange);
  };
}

const isMid = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(FROM).matches &&
  !window.matchMedia(UNTIL).matches;

/** 폭이 1024~1279면 true. 서버 렌더 · matchMedia가 없는 환경(jsdom)은 false */
export function useMidWidth() {
  return useSyncExternalStore(subscribe, isMid, () => false);
}
