// 지금 화면 폭이 든 토큰 단계(breakpoint.sm · md · lg · xl · 2xl). CSS 변수는 @media에 못 쓰므로
// JS에서 폭으로 모양을 바꿔야 할 때(AppShell user 칸 · 블록) 이 훅 하나로 읽는다(R-T12 · R-T13).
import { primitives } from '@terracelab/trellis-tokens';
import { useSyncExternalStore } from 'react';

/** 폭 단계. base = breakpoint.sm 미만(휴대폰), sm = sm 이상 md 미만 … 2xl = 2xl 이상 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 작은 단계부터 큰 단계 순서. 비교할 때 쓴다(BREAKPOINTS.indexOf(bp) >= BREAKPOINTS.indexOf('lg')) */
export const BREAKPOINTS: readonly Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

const STEPS = (['sm', 'md', 'lg', 'xl', '2xl'] as const).map(
  (name) => [name, `(min-width: ${primitives.breakpoint[name]})`] as const,
);

const supported = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

function subscribe(onChange: () => void) {
  if (!supported()) return () => {};
  const queries = STEPS.map(([, q]) => window.matchMedia(q));
  for (const q of queries) q.addEventListener('change', onChange);
  return () => {
    for (const q of queries) q.removeEventListener('change', onChange);
  };
}

/** 서버 렌더 · matchMedia가 없는 환경(jsdom)은 넓은 화면(xl)으로 본다. 좁은 화면 시트(D-60)와 같은 기준 */
const SERVER: Breakpoint = 'xl';

function current(): Breakpoint {
  if (!supported()) return SERVER;
  let step: Breakpoint = 'base';
  for (const [name, q] of STEPS) if (window.matchMedia(q).matches) step = name;
  return step;
}

/**
 * 지금 폭 단계. 폭이 바뀌면 다시 그린다.
 *
 * ```tsx
 * const phone = useBreakpoint() === 'base'; // breakpoint.sm(640) 미만
 * ```
 */
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, current, () => SERVER);
}
