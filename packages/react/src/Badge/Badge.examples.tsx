import { INVOICE_STATES } from '@terracelab/trellis-contracts';
import { Badge } from './Badge.js';

/** 업종 어휘 — 어휘의 tone을 그대로 넘긴다(세금계산서 상태) */
export function Vocabulary() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      {Object.entries(INVOICE_STATES).map(([key, s]) => (
        <Badge key={key} tone={s.tone}>
          {s.label}
        </Badge>
      ))}
    </div>
  );
}

/** 결재 — 전자결재에만 쓰는 5상태 */
export function Approval() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <Badge approval="draft" />
      <Badge approval="pending" />
      <Badge approval="approved" />
      <Badge approval="rejected" />
      <Badge approval="withdrawn" />
    </div>
  );
}

/** 강조 — 지연 · 오류는 solid 위험 색 */
export function Solid() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
      <Badge variant="solid" tone="danger">
        3일 경과
      </Badge>
      <Badge variant="solid" tone="warning">
        D-2
      </Badge>
      <Badge variant="outline">수입</Badge>
    </div>
  );
}
