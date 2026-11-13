import { defineContract, type ApprovalState, type ContractBase } from '../_base.js';

/** 결재선 안의 역할. 생략하면 첫 칸 기안 · 마지막 칸 승인 · 사이는 검토 */
export type ApprovalLineRole = '기안' | '검토' | '합의' | '승인' | '참조';

/** 결재 5상태 + 아직 차례가 오지 않은 대기 */
export type ApprovalLineState = ApprovalState | 'waiting';

export interface ApprovalLineApprover {
  id: string;
  name: string;
  /** 직함(대리 · 팀장 · 이사) */
  title: string;
  role?: ApprovalLineRole;
  state: ApprovalLineState;
  /** 처리 시각(11-03 09:12) */
  time?: string;
  /** 의견 · 반려 사유. 한 줄로 자르고 전체는 title 속성 */
  comment?: string;
}

export interface ApprovalLineProps extends ContractBase {
  approvers: readonly ApprovalLineApprover[];
  orientation?: 'horizontal' | 'vertical';
  /** default = 사람마다 칸, compact = 결재 5색 점 + "2/3 합의" 한 줄(표 칸 · 목록 행, R-T24) */
  variant?: 'default' | 'compact';
}

/** 결재선 요약(compact): 지금 단계 번호(1부터) · 전체 · 그 칸의 역할 · 상태 */
export interface ApprovalLineSummary {
  index: number;
  total: number;
  role: ApprovalLineRole;
  state: ApprovalLineState;
}

/**
 * 지금 단계: 진행(pending) 칸 → 반려 · 회수 칸 → 마지막으로 처리한 칸(승인 · 기안) → 첫 칸.
 * 결재가 끝난 문서는 끝낸 칸을 가리킨다
 */
export function approvalLineSummary(
  approvers: readonly ApprovalLineApprover[],
): ApprovalLineSummary | null {
  const total = approvers.length;
  if (total === 0) return null;
  let i = approvers.findIndex((a) => a.state === 'pending');
  if (i < 0) i = approvers.findIndex((a) => a.state === 'rejected' || a.state === 'withdrawn');
  if (i < 0) {
    i = 0;
    approvers.forEach((a, j) => {
      if (a.state !== 'waiting') i = j;
    });
  }
  const a = approvers[i]!;
  return { index: i + 1, total, role: a.role ?? defaultApprovalRole(i, total), state: a.state };
}

/** 역할을 생략한 칸의 기본값: 첫 칸 기안 · 마지막 칸 승인 · 사이 검토 */
export function defaultApprovalRole(index: number, count: number): ApprovalLineRole {
  if (index === 0) return '기안';
  return index === count - 1 ? '승인' : '검토';
}

export const ApprovalLineContract = defineContract<ApprovalLineProps>({
  name: 'ApprovalLine',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    approvers: {
      type: 'ApprovalLineApprover[]',
      required: true,
      description: '결재자(이름 · 직함 · 역할 · 상태 · 시각 · 의견)',
    },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      values: ['horizontal', 'vertical'],
      description: '방향(본문 위는 가로, 좁은 패널은 세로)',
    },
    variant: {
      type: "'default' | 'compact'",
      default: 'default',
      values: ['default', 'compact'],
      description: '사람마다 칸 · 점 + 단계 한 줄(표 칸)',
    },
  },
  states: ['default'],
  a11y: { role: 'list', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
