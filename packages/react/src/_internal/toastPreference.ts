// 토스트 표시 시간 앱 설정(WCAG 2.2.1 시간 조절). 기본 · 길게 · 직접 닫기 셋이다.
// TrellisProvider가 이 컨텍스트를 채우고(toastDuration), ToastProvider가 읽어 show()의 시간 계산에 쓴다.
import { createContext } from 'react';

/** default = 규칙대로 · long = 0이 아닌 시간을 두 배로 · manual = 모든 토스트가 직접 닫을 때까지 */
export type ToastPreference = 'default' | 'long' | 'manual';

export const ToastPreferenceContext = createContext<ToastPreference>('default');

/** duration을 주지 않은 토스트의 기본 시간(ms) */
export const TOAST_DURATION = {
  default: 4000,
  /** 동작 단추(되돌리기)가 있으면 누를 시간을 더 준다 */
  action: 10000,
  /** 위험은 직접 닫을 때까지 */
  danger: 0,
} as const;

export interface ToastDurationInput {
  tone?: string;
  hasAction?: boolean;
  /** 호출자가 준 값(ms). 주면 기본 규칙보다 앞선다 */
  duration?: number;
}

/**
 * 실제로 쓸 자동 닫힘 시간(ms, 0 = 직접 닫을 때까지).
 * 1) 준 duration → 2) danger 0 → 3) action 10초 → 4) 4초. 그 위에 앱 설정을 얹는다.
 */
export function resolveToastDuration(
  { tone, hasAction = false, duration }: ToastDurationInput,
  preference: ToastPreference = 'default',
): number {
  const base =
    duration ??
    (tone === 'danger'
      ? TOAST_DURATION.danger
      : hasAction
        ? TOAST_DURATION.action
        : TOAST_DURATION.default);
  if (preference === 'manual' || base <= 0) return 0;
  return preference === 'long' ? base * 2 : base;
}
