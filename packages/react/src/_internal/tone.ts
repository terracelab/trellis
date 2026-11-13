import type { ApprovalState, StatusTone } from '@terracelab/trellis-contracts';

/** 톤 → CSS 변수 쌍. neutral은 status.neutral 승인 전까지 회색(fg.tertiary · bg.sunken)으로 그린다(D-48) */
export function toneVars(tone: StatusTone): { solid: string; subtle: string } {
  if (tone === 'neutral')
    return { solid: 'var(--tl-color-fg-tertiary)', subtle: 'var(--tl-color-bg-sunken)' };
  return {
    solid: `var(--tl-color-status-${tone}-default)`,
    subtle: `var(--tl-color-status-${tone}-subtle)`,
  };
}

export function approvalVars(state: ApprovalState): { solid: string; subtle: string } {
  return {
    solid: `var(--tl-color-approval-${state}-default)`,
    subtle: `var(--tl-color-approval-${state}-subtle)`,
  };
}
