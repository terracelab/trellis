// 차트 색은 토큰 슬롯 → CSS 변수. hex는 어디에도 없다.
import type { ChartColor } from '@terracelab/trellis-contracts';
import { isDev } from '../cx.js';

export const SERIES: readonly ChartColor[] = [
  'series-1',
  'series-2',
  'series-3',
  'series-4',
  'series-5',
];

export function chartColor(slot: ChartColor = 'series-1'): string {
  if (slot.startsWith('series-')) return `var(--tl-color-chart-${slot})`;
  if (slot === 'compare') return 'var(--tl-color-chart-compare)';
  if (slot === 'income' || slot === 'expense') return `var(--tl-color-finance-${slot})`;
  return `var(--tl-color-status-${slot}-default)`;
}

/** i번째 계열의 슬롯. 5개를 넘으면 순환하지 않고 compare로 접고 개발 모드 경고 */
export function slotAt(i: number, explicit?: ChartColor): ChartColor {
  if (explicit) return explicit;
  const slot = SERIES[i];
  if (slot) return slot;
  if (isDev)
    console.warn(`[trellis] 계열이 6개 이상입니다(${i + 1}). "기타"로 접거나 소표로 나누세요.`);
  return 'compare';
}

export const GRID = 'var(--tl-color-chart-grid)';
export const AXIS = 'var(--tl-color-chart-axis)';
export const TRACK = 'var(--tl-color-chart-track)';
export const SURFACE = 'var(--tl-color-bg-surface)';
export const FG = 'var(--tl-color-fg-primary)';
export const FG_SECONDARY = 'var(--tl-color-fg-secondary)';
export const CURSOR = 'var(--tl-color-border-strong)';
export const heat = (level: number) => (level <= 0 ? TRACK : `var(--tl-color-chart-heat-${level})`);
