import { defineContract, type ApprovalState, type ContractBase } from '../_base.js';
import type { StatusTone } from '../_shared/vocab.js';

export interface BadgeProps extends ContractBase {
  /** 상태 톤. 어휘(vocab.ts)의 tone을 그대로 넘긴다 */
  tone?: StatusTone;
  /** 결재 5상태. 있으면 tone 대신 결재 색과 라벨(기안 · 진행 · 승인 · 반려 · 회수) */
  approval?: ApprovalState;
  /** subtle = 연한 바탕 + 점(기본), solid = 진한 바탕(카운트 · 강조), outline = 테두리만 */
  variant?: 'subtle' | 'solid' | 'outline';
  /** 앞 점. subtle은 기본 표시 */
  dot?: boolean;
  size?: 'sm' | 'md';
  /** 라벨. approval이면 생략 가능 */
  children?: unknown;
}

export const BadgeContract = defineContract<BadgeProps>({
  name: 'Badge',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    tone: {
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: 'neutral',
      values: ['neutral', 'info', 'success', 'warning', 'danger'],
      description: '상태 톤',
    },
    approval: {
      type: 'ApprovalState',
      values: ['draft', 'pending', 'approved', 'rejected', 'withdrawn'],
      description: '결재 상태(전자결재 전용)',
    },
    variant: {
      type: "'subtle' | 'solid' | 'outline'",
      default: 'subtle',
      values: ['subtle', 'solid', 'outline'],
      description: '모양',
    },
    dot: { type: 'boolean', description: '앞 점(subtle · outline 기본 표시, neutral은 기본 없음)' },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '크기' },
    children: { type: 'ReactNode', description: '라벨' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  platforms: { web: true, native: true },
});
