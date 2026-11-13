import { ApprovalLine } from './ApprovalLine.js';

const PURCHASE_LINE = [
  { id: 'u1', name: '김지훈', title: '대리', state: 'draft', time: '11-03 09:12' },
  {
    id: 'u2',
    name: '이수민',
    title: '과장',
    state: 'approved',
    time: '11-03 13:40',
    comment: '단가 비교표 확인했습니다',
  },
  { id: 'u3', name: '박서연', title: '팀장', state: 'pending' },
  { id: 'u4', name: '정우성', title: '이사', state: 'waiting' },
] as const;

const REJECTED_LINE = [
  { id: 'u1', name: '최하늘', title: '사원', state: 'draft', time: '11-05 10:02' },
  {
    id: 'u2',
    name: '한도윤',
    title: '팀장',
    role: '합의',
    state: 'rejected',
    time: '11-05 16:18',
    comment: '수입 통관 비용이 견적에서 빠졌습니다. 관세 · 부가세 포함으로 다시 올려 주세요',
  },
  { id: 'u3', name: '정우성', title: '이사', state: 'waiting' },
] as const;

/** 구매 품의 — 기안부터 승인까지 가로 칸. 지금 결재할 칸이 강조된다 */
export function Purchase() {
  return <ApprovalLine approvers={PURCHASE_LINE} />;
}

/** 반려(세로) — 좁은 패널에서는 세로로. 사유는 한 줄로 자르고 전체는 마우스를 올리면 보인다 */
export function RejectedVertical() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <ApprovalLine approvers={REJECTED_LINE} orientation="vertical" />
    </div>
  );
}

/** 좁은 카드(344) — 긴 반려 의견도 한 줄로 자르고 카드 폭을 넓히지 않는다 */
export function Narrow() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        width: 'calc(var(--tl-space-64) * 5 + var(--tl-space-24))',
        padding: 'var(--tl-space-16)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
      }}
    >
      <strong>수입 통관 비용 품의</strong>
      <ApprovalLine approvers={REJECTED_LINE} orientation="vertical" />
    </div>
  );
}

const DONE_LINE = [
  { id: 'u1', name: '오세훈', title: '책임', state: 'draft' },
  { id: 'u2', name: '박서연', title: '팀장', state: 'approved' },
] as const;

/** 점 모양(compact) — 표 칸 · 목록 행에서 결재 5색 점과 "3/4 검토" 한 줄. 대기는 빈 원, 마우스를 올리면 칸마다 상태 */
export function Compact() {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--tl-space-8) var(--tl-space-24)',
        margin: 0,
      }}
    >
      <dt>구매 품의</dt>
      <dd style={{ margin: 0 }}>
        <ApprovalLine variant="compact" approvers={PURCHASE_LINE} />
      </dd>
      <dt>수입 통관 비용</dt>
      <dd style={{ margin: 0 }}>
        <ApprovalLine variant="compact" approvers={REJECTED_LINE} />
      </dd>
      <dt>출장비 정산</dt>
      <dd style={{ margin: 0 }}>
        <ApprovalLine variant="compact" approvers={DONE_LINE} />
      </dd>
    </dl>
  );
}
