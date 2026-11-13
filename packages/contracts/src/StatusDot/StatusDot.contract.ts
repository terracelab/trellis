import { defineContract, type ContractBase } from '../_base.js';
import type { StatusTone } from '../_shared/vocab.js';

export interface StatusDotProps extends ContractBase {
  /** 어휘(vocab.ts)의 tone을 그대로 넘긴다 */
  tone?: StatusTone;
  size?: 'sm' | 'md';
  /** 실행 중 · 가동처럼 지금 진행 중인 상태만. reduced-motion이면 멈춘다 */
  pulse?: boolean;
  /** 상태 라벨(어휘의 label) */
  children?: unknown;
}

export const StatusDotContract = defineContract<StatusDotProps>({
  name: 'StatusDot',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    tone: {
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: 'neutral',
      values: ['neutral', 'info', 'success', 'warning', 'danger'],
      description: '상태 톤(점 색)',
    },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '크기' },
    pulse: { type: 'boolean', default: false, description: '진행 중 상태의 맥박 표시' },
    children: { type: 'ReactNode', description: '상태 라벨' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  platforms: { web: true, native: true },
});
