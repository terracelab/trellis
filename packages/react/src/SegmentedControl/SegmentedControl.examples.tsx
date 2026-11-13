import { SegmentedControl } from './SegmentedControl.js';

/** 결재 상태 필터 — 칸마다 건수 */
export function ApprovalFilter() {
  return (
    <SegmentedControl
      label="결재 상태"
      defaultValue="pending"
      options={[
        { value: 'all', label: '전체', count: 48 },
        { value: 'pending', label: '진행', count: 12 },
        { value: 'approved', label: '승인', count: 31 },
        { value: 'rejected', label: '반려', count: 5 },
      ]}
    />
  );
}

/** 보기 전환 — 아이콘 · 작은 크기 · 부모 폭 */
export function Views() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <SegmentedControl
        label="보기"
        options={[
          { value: 'table', label: '표', icon: 'table' },
          { value: 'chart', label: '차트', icon: 'chart-bar' },
        ]}
      />
      <SegmentedControl
        label="집계 단위"
        size="sm"
        fullWidth
        defaultValue="month"
        options={[
          { value: 'day', label: '일' },
          { value: 'week', label: '주' },
          { value: 'month', label: '월' },
          { value: 'quarter', label: '분기' },
        ]}
      />
    </div>
  );
}
